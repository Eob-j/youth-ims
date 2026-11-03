import { ImportConfig } from "./types";

// Lower-case and drop spaces, underscores and punctuation, so "Total Population",
// "total_population" and "totalPopulation" all match the same column.
function normalizeHeader(header: string) {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Renames a row's headers to the config's column keys, accepting either the
// key or the column's UI label. Unknown headers are kept as they are.
export function mapHeaders(
  row: Record<string, any>,
  config: ImportConfig<any>,
) {
  const lookup = new Map<string, string>();
  for (const [key, column] of Object.entries(config.columns)) {
    lookup.set(normalizeHeader(key), key);
    if (column.header) lookup.set(normalizeHeader(column.header), key);
  }

  return Object.fromEntries(
    Object.entries(row).map(([header, value]) => [
      lookup.get(normalizeHeader(header)) ?? header,
      value,
    ]),
  );
}

export function processColumns(
  row: any,
  config: ImportConfig<any>,
  context?: any,
) {
  const processed = { ...row };

  for (const [key, column] of Object.entries(config.columns)) {
    switch (column.type) {
      case "computed":
        // Always compute and override
        if (column.compute) {
          processed[key] = column.compute(processed, context);
        } else {
          delete processed[key];
        }
        break;

      case "computed-if-missing":
        if (!processed[key] && column.compute) {
          processed[key] = column.compute(processed, context);
        }
        break;

      default:
        break;
    }
  }

  // Apply per-column transforms to incoming CSV values (or computed values)
  for (const [key, column] of Object.entries(config.columns)) {
    if (column.transform && processed[key] !== undefined) {
      processed[key] = column.transform(processed[key]);
    }
  }

  // Remove computed-only columns from raw input
  for (const [key, column] of Object.entries(config.columns)) {
    if (column.type === "computed") {
      delete processed[key];
    }
  }

  console.log(processed);
  return processed;
}
