"use server";

import { db } from "@/db";
import { nscParticipants } from "@/db/schema";
import { fail, ok } from "@/lib/action-result-helper";
import { getEditorSession } from "@/lib/auth-helper";
import { parseSpreadsheet, toIsoDate } from "@/lib/importer/parse-file";
import { nscParticipantImportSchema } from "@/lib/validations/nsc-participants";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import z from "zod";
import {
  invalidInput,
  recordRefSchema,
  recordRefsSchema,
  type RecordRef,
  requiredText,
  wholeNumber,
  isoDate,
} from "@/lib/validations/action-input";
import { NSC_GENDERS, NSC_STATUSES } from "@/lib/schema/nsc-participants";

const createNscParticipantSchema = z.object({
  name: requiredText,
  age: wholeNumber,
  gender: z.enum(NSC_GENDERS),
  region: requiredText,
  category: requiredText,
  sport: requiredText,
  level: requiredText,
  status: z.enum(NSC_STATUSES),
  achievements: z.string().optional(),
  dateRegistered: isoDate,
  contact: z.string().optional(),
});
type CreateNscParticipantInput = z.infer<typeof createNscParticipantSchema>;

export async function createNscParticipant(input: CreateNscParticipantInput) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  const parsed = createNscParticipantSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const [row] = await db.insert(nscParticipants).values(data).returning();
    revalidatePath("/nsc");
    return ok(row);
  } catch (error) {
    console.error(error);
    return fail("An error occurred while creating the record.");
  }
}

const updateNscParticipantSchema = createNscParticipantSchema.extend(recordRefSchema.shape);
type UpdateNscParticipantInput = z.infer<typeof updateNscParticipantSchema>;

export async function updateNscParticipant(input: UpdateNscParticipantInput) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  const parsed = updateNscParticipantSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const result = await db
      .update(nscParticipants)
      .set({
        name: data.name,
        age: data.age,
        gender: data.gender,
        region: data.region,
        category: data.category,
        sport: data.sport,
        level: data.level,
        status: data.status,
        achievements: data.achievements ?? null,
        dateRegistered: data.dateRegistered,
        contact: data.contact ?? null,
        version: sql`${nscParticipants.version} + 1`, // Increment version
      })
      .where(
        and(
          eq(nscParticipants.id, data.id),
          eq(nscParticipants.version, data.version),
        ),
      )
      .returning();

    if (result.length === 0) {
      return fail("Record modified by another user.");
    }

    revalidatePath("/nsc");
    return ok(result[0]);
  } catch (error) {
    console.error(error);
    return fail("An error occurred while updating the record.");
  }
}

export async function deleteNscParticipant(input: RecordRef) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  const parsed = recordRefSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const result = await db
      .delete(nscParticipants)
      .where(
        and(
          eq(nscParticipants.id, data.id),
          eq(nscParticipants.version, data.version),
        ),
      )
      .returning();

    if (result.length === 0) {
      return fail("Record modified by another user.");
    }

    revalidatePath("/nsc");
    return ok("Record deleted successfully.");
  } catch (error) {
    console.error(error);
    return fail("An error occurred while deleting the record.");
  }
}

export async function bulkDeleteNscParticipants(input: RecordRef[]) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  const parsed = recordRefsSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const records = parsed.data;

  if (!records || records.length === 0) {
    return fail("No records provided for deletion.");
  }

  try {
    const deleted = await db.transaction(async (tx) => {
      let deletedCount = 0;
      for (const record of records) {
        const result = await tx
          .delete(nscParticipants)
          .where(
            and(
              eq(nscParticipants.id, record.id),
              eq(nscParticipants.version, record.version),
            ),
          )
          .returning({ id: nscParticipants.id });
        if (result.length > 0) deletedCount++;
      }
      return deletedCount;
    });

    revalidatePath("/nsc");
    return ok({
      requested: records.length,
      deleted,
    });
  } catch (error) {
    console.error(error);
    return fail("An unexpected error occurred while deleting records.");
  }
}

function normalizeKey(key: string) {
  return key
    .toLowerCase()
    .replace(/[\s_-]/g, "")
    .replace(/[()]/g, "");
}

function getValue(row: Record<string, unknown>, candidates: string[]) {
  const keyed = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [normalizeKey(key), value]),
  );
  for (const key of candidates) {
    const value = keyed[normalizeKey(key)];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return null;
}

function normalizeNumber(value: unknown) {
  const parsed = Number(String(value ?? "").replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}

export async function importNscParticipantsData(formData: FormData) {
  const session = await getEditorSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return { success: false, error: "No file provided" };
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  const allowed = ["xlsx", "xls", "xlsm", "csv"];
  if (!ext || !allowed.includes(ext)) {
    return { success: false, error: "Unsupported file type" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const rawRows = parseSpreadsheet(buffer, file.name);
  const validRows: z.infer<typeof nscParticipantImportSchema>[] = [];
  const errors: unknown[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    const prepared = {
      name: String(getValue(row, ["name"]) ?? "").trim(),
      age: normalizeNumber(getValue(row, ["age"])),
      gender: String(getValue(row, ["gender"]) ?? "").trim(),
      region: String(getValue(row, ["region"]) ?? "").trim(),
      category: String(getValue(row, ["category"]) ?? "").trim(),
      sport: String(getValue(row, ["sport"]) ?? "").trim(),
      level: String(getValue(row, ["level"]) ?? "").trim(),
      status: String(getValue(row, ["status"]) ?? "Active").trim(),
      achievements: String(getValue(row, ["achievements"]) ?? "").trim() || null,
      dateRegistered:
        toIsoDate(getValue(row, ["date_registered", "dateRegistered"])) ?? "",
      contact: String(getValue(row, ["contact"]) ?? "").trim() || null,
    };

    const parsed = nscParticipantImportSchema.safeParse(prepared);
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
    return {
      success: false,
      error: "No valid rows found",
      errors,
    };
  }

  try {
    await db.insert(nscParticipants).values(validRows);
  } catch (error) {
    console.error(error);
    return {
      success: false,
      inserted: 0,
      failed: validRows.length,
      error: "An unexpected database error occurred while importing data.",
    };
  }

  revalidatePath("/nsc");
  return {
    success: true,
    inserted: validRows.length,
    failed: errors.length,
    errors,
  };
}
