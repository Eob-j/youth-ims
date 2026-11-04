// Import limits, shared by the import dialog (to refuse a file straight away)
// and the server (to enforce them). The server action body limit in
// next.config.mjs is set a little above the file size to allow for upload
// overhead.
export const MAX_IMPORT_FILE_MB = 5;
export const MAX_IMPORT_FILE_BYTES = MAX_IMPORT_FILE_MB * 1024 * 1024;
export const MAX_IMPORT_ROWS = 10_000;
export const IMPORT_FILE_TYPES = ["csv", "xlsx", "xls", "xlsm"];
