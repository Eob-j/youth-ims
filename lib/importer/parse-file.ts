import * as XLSX from "xlsx";

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
