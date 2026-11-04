"use server";

import { db } from "@/db";
import { indicatorData, type IndicatorDataType } from "@/db/schema";
import { fail, ok } from "@/lib/action-result-helper";
import { getEditorSession } from "@/lib/auth-helper";
import { readImportFile } from "@/lib/importer/parse-file";
import { indicatorDataImportRowSchema } from "@/lib/validations/indicator-data";
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
  yearNumber,
} from "@/lib/validations/action-input";
import { INDICATOR_CATEGORIES, INDICATOR_ORGANIZATIONS } from "@/lib/schema/indicator-data";

const indicatorPayloadSchema = z.object({
  organization: z.enum(INDICATOR_ORGANIZATIONS),
  indicator: requiredText,
  year: yearNumber,
  region: requiredText,
  male: wholeNumber,
  female: wholeNumber,
  referenceSource: requiredText,
  category: z.enum(INDICATOR_CATEGORIES),
});
type IndicatorPayload = z.infer<typeof indicatorPayloadSchema>;

export async function createIndicatorData(input: IndicatorPayload) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  const parsed = indicatorPayloadSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const [row] = await db
      .insert(indicatorData)
      .values({
        ...data,
        total: data.male + data.female,
      })
      .returning();

    revalidatePath("/indicator-data");
    return ok(row);
  } catch (error) {
    console.error(error);
    return fail("An error occurred while creating the record.");
  }
}

const updateIndicatorDataSchema = indicatorPayloadSchema.extend(recordRefSchema.shape);
type UpdateIndicatorDataInput = z.infer<typeof updateIndicatorDataSchema>;

export async function updateIndicatorData(input: UpdateIndicatorDataInput) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  const parsed = updateIndicatorDataSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const result = await db
      .update(indicatorData)
      .set({
        organization: data.organization,
        indicator: data.indicator,
        year: data.year,
        region: data.region,
        male: data.male,
        female: data.female,
        total: data.male + data.female,
        referenceSource: data.referenceSource,
        category: data.category,
        version: sql`${indicatorData.version} + 1`, // Increment version
      })
      .where(
        and(
          eq(indicatorData.id, data.id),
          eq(indicatorData.version, data.version),
        ),
      )
      .returning();

    if (result.length === 0) {
      return fail("Record modified by another user.");
    }

    revalidatePath("/indicator-data");
    return ok(result[0]);
  } catch (error) {
    console.error(error);
    return fail("An error occurred while updating the record.");
  }
}

export async function deleteIndicatorData(input: RecordRef) {
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
      .delete(indicatorData)
      .where(
        and(
          eq(indicatorData.id, data.id),
          eq(indicatorData.version, data.version),
        ),
      )
      .returning();

    if (result.length === 0) {
      return fail("Record modified by another user.");
    }

    revalidatePath("/indicator-data");
    return ok("Record deleted successfully.");
  } catch (error) {
    console.error(error);
    return fail("An error occurred while deleting the record.");
  }
}

export async function bulkDeleteIndicatorData(input: RecordRef[]) {
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
          .delete(indicatorData)
          .where(
            and(
              eq(indicatorData.id, record.id),
              eq(indicatorData.version, record.version),
            ),
          )
          .returning({ id: indicatorData.id });

        if (result.length > 0) {
          deletedCount++;
        }
      }
      return deletedCount;
    });

    revalidatePath("/indicator-data");
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

function normalizeCategory(value: unknown): IndicatorDataType["category"] {
  const v = String(value ?? "")
    .trim()
    .toLowerCase();

  if (v.includes("sport")) return "sport_financing";
  if (v.includes("finance")) return "finance";
  return "training";
}

function normalizeNumber(value: unknown) {
  const parsed = Number(
    String(value ?? "")
      .replace(/,/g, "")
      .trim(),
  );
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
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

export async function importIndicatorData(formData: FormData) {
  const session = await getEditorSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  const read = await readImportFile(formData.get("file"));
  if ("error" in read) {
    return { success: false, error: read.error };
  }
  const rawRows = read.rows;
  const validRows: z.infer<typeof indicatorDataImportRowSchema>[] = [];
  const errors: unknown[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    const male = normalizeNumber(
      getValue(row, ["male", "maleparticipants", "male_participants"]),
    );
    const female = normalizeNumber(
      getValue(row, ["female", "femaleparticipants", "female_participants"]),
    );
    const total =
      normalizeNumber(getValue(row, ["total", "totalparticipants"])) ||
      male + female;

    const prepared = {
      organization: String(getValue(row, ["organization", "org"]) ?? "")
        .trim()
        .toUpperCase(),
      indicator: String(
        getValue(row, ["indicator", "indicatordescription"]) ?? "",
      ).trim(),
      year: normalizeNumber(getValue(row, ["year"])),
      region: String(getValue(row, ["region"]) ?? "").trim(),
      male,
      female,
      total,
      referenceSource: String(
        getValue(row, [
          "reference_source",
          "reference",
          "referencesource",
          "source",
        ]) ?? "",
      ).trim(),
      category: normalizeCategory(getValue(row, ["category"])),
    };

    const parsed = indicatorDataImportRowSchema.safeParse(prepared);
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
    await db.insert(indicatorData).values(validRows);
  } catch (error) {
    console.error(error);
    return {
      success: false,
      inserted: 0,
      failed: validRows.length,
      error: "An unexpected database error occurred while importing data.",
    };
  }

  revalidatePath("/indicator-data");
  return {
    success: true,
    inserted: validRows.length,
    failed: errors.length,
    errors,
  };
}
