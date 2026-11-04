import * as XLSX from "xlsx";
import {
  IMPORT_FILE_TYPES,
  MAX_IMPORT_FILE_BYTES,
  MAX_IMPORT_FILE_MB,
  MAX_IMPORT_ROWS,
} from "./limits";

// Checks an uploaded import file and parses its first sheet, enforcing the
// limits in ./limits.ts. Used by every import action.
export async function readImportFile(
  file: unknown,
): Promise<{ rows: Record<string, any>[] } | { error: string }> {
  if (!(file instanceof File)) {
    return { error: "No file provided" };
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !IMPORT_FILE_TYPES.includes(extension)) {
    return { error: "Unsupported file type" };
  }

  if (file.size > MAX_IMPORT_FILE_BYTES) {
    return {
      error: `The file is too large. The maximum is ${MAX_IMPORT_FILE_MB} MB.`,
    };
  }

  const rows = parseSpreadsheet(Buffer.from(await file.arrayBuffer()), file.name);
  if (rows.length > MAX_IMPORT_ROWS) {
    return {
      error: `The file has ${rows.length.toLocaleString()} rows. The maximum is ${MAX_IMPORT_ROWS.toLocaleString()} per import; split it into smaller files.`,
    };
  }

  return { rows };
}

export function parseSpreadsheet(buffer: Buffer, fileName: string) {
  const workbook = XLSX.read(buffer, {
    type: "buffer",
    raw: false,
  });

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  return XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
    defval: null,
  });
}

// Converts an imported date cell to "YYYY-MM-DD", or null if it is blank or
// not a clear date. The parser turns dates like 2024-01-15 (and dates in
// .xlsx files) into spreadsheet serial numbers, which the database rejects.
// Other text such as 15/01/2024 is ambiguous (day or month first), so it is
// not guessed at; the row fails validation instead.
export function toIsoDate(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    const date = XLSX.SSF.parse_date_code(value);
    if (!date) return null;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.y}-${pad(date.m)}-${pad(date.d)}`;
  }

  const text = String(value ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}
