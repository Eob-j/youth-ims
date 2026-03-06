import { ImportConfig } from "./types";

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
  return processed;
}
