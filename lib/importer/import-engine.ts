"use server";

import { db } from "@/db";
import { parseSpreadsheet } from "./parse-file";
import { processColumns } from "./column-processing";
import { ImportConfig } from "./types";
import { revalidatePath } from "next/cache";
import { DrizzleQueryError } from "drizzle-orm";
import z from "zod";

export async function importSpreadsheet<T>({
  file,
  config,
  context,
  path,
}: {
  file: File;
  config: ImportConfig<T>;
  context?: any;
  path: string;
}) {
  if (!file) {
    return { success: false, error: "No file provided" };
  }

  const allowed = ["xlsx", "xls", "xlsm", "csv"];

  const extension = file.name.split(".").pop()?.toLowerCase();

  if (!extension || !allowed.includes(extension)) {
    return { success: false, error: "Unsupported file type" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const rawRows = parseSpreadsheet(buffer, file.name);

  const validRows: any[] = [];
  const errors: any[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const rawRow = rawRows[i];

    // 1️⃣ Process computed columns
    const processedRow = processColumns(rawRow, config, context);

    // 2️⃣ Normalize headers (trim keys)
    const normalized = Object.fromEntries(
      Object.entries(processedRow).map(([k, v]) => [k.trim(), v]),
    );

    // 3️⃣ Validate
    const parsed = config.schema.safeParse(normalized);
    if (!parsed.success) {
      errors.push({
        row: i + 2,
        issues: z.treeifyError(parsed.error),
      });
      continue;
    }

    validRows.push(parsed.data);
  }

  if (!validRows.length) {
    console.error("No valid rows found", errors);
    return {
      success: false,
      error: "No valid rows found",
      errors,
    };
  }
  try {
    await db.transaction(async (tx) => {
      const query = tx.insert(config.table).values(validRows);

      if (config.conflictStrategy === "ignore") {
        await query.onConflictDoNothing();
      } else {
        await query;
      }
    });
  } catch (error) {
    console.error("Import DB error:", error);
    let err = "An unexpected database error occurred while importing data.";
    if (
      error instanceof DrizzleQueryError &&
      error.cause?.message.includes("duplicate")
    ) {
      err = "Duplicate entries found. Please check the data and try again.";
    }
    return {
      success: false,
      inserted: 0,
      failed: validRows.length,
      error: err,
    };
  }

  revalidatePath(path);

  return {
    success: true,
    inserted: validRows.length,
    failed: errors.length,
    errors,
  };
}

// todo: add robust error handling
