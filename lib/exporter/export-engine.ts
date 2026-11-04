import { processExportData } from "./data-processor";
import { buildCsv, buildXlsx } from "./excel-builder";
import { buildPdf } from "./pdf-builder";
import { ExportConfig } from "./types";

export const EXPORT_FORMATS = ["csv", "xlsx", "pdf"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export function isExportFormat(value: unknown): value is ExportFormat {
  return EXPORT_FORMATS.includes(value as ExportFormat);
}

export async function exportData<T extends Record<string, any>>({
  queryFn,
  config,
  format,
  name,
}: {
  queryFn: () => Promise<T[]>;
  config: ExportConfig<T>;
  format: ExportFormat;
  // Used in the file name, e.g. "youth-population-2026-11-04.csv".
  name: string;
}): Promise<{ data: Buffer | string; mime: string; filename: string }> {
  try {
    // An empty table exports a file with just the column headers.
    const rawData = await queryFn();
    const { headers, rows } = processExportData(rawData, config);
    const filename = `${name}-${new Date().toISOString().slice(0, 10)}.${format}`;

    switch (format) {
      case "csv":
        return {
          data: buildCsv(headers, rows),
          mime: "text/csv",
          filename,
        };

      case "xlsx":
        return {
          data: buildXlsx(headers, rows),
          mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          filename,
        };

      case "pdf":
        return {
          data: await buildPdf(headers, rows),
          mime: "application/pdf",
          filename,
        };
    }
  } catch (error) {
    console.error("Export error:", error);
    throw new Error("Failed to export data.");
  }
}
