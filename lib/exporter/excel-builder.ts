// excel-builder.ts
import * as XLSX from "xlsx";

// Spreadsheet apps run a CSV cell that starts with one of these as a formula
// when the file is opened, so text such as =HYPERLINK(...) typed into a field
// or imported would execute on the viewer's machine.
const FORMULA_TRIGGER = /^[=+\-@\t\r]/;

// Prefixes such text with ' so it is shown as plain text. Numbers (including
// negative ones) are not text and are left alone.
function neutralizeFormula(value: unknown) {
  return typeof value === "string" && FORMULA_TRIGGER.test(value)
    ? `'${value}`
    : value;
}

export function buildCsv(headers: string[], rows: any[][]): string {
  const safeRows = rows.map((row) => row.map(neutralizeFormula));
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...safeRows]);
  return XLSX.utils.sheet_to_csv(worksheet);
}

// XLSX needs no prefix: values are written as text cells, never as formulas.

export function buildXlsx(headers: string[], rows: any[][]): Buffer {
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Export");

  return XLSX.write(workbook, {
    bookType: "xlsx",
    type: "buffer",
  });
}
