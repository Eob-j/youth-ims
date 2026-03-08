"use server";

import { db } from "@/db";
import { indicatorData, type IndicatorDataType } from "@/db/schema";
import { fail, ok } from "@/lib/action-result-helper";
import { getServerSideSession } from "@/lib/auth-helper";
import { parseSpreadsheet } from "@/lib/importer/parse-file";
import { indicatorDataImportRowSchema } from "@/lib/validations/indicator-data";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import z from "zod";

type IndicatorPayload = {
  organization: IndicatorDataType["organization"];
  indicator: string;
  year: number;
  region: string;
  male: number;
  female: number;
  referenceSource: string;
  category: IndicatorDataType["category"];
};

export async function createIndicatorData(data: IndicatorPayload) {
  const session = await getServerSideSession();
  if (!session) {
    return fail("Unauthorized");
  }

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

type UpdateIndicatorDataInput = IndicatorPayload & {
  id: number;
  version: number;
};

export async function updateIndicatorData(data: UpdateIndicatorDataInput) {
  const session = await getServerSideSession();
  if (!session) {
    return fail("Unauthorized");
  }

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

export async function deleteIndicatorData(data: {
  id: number;
  version: number;
}) {
  const session = await getServerSideSession();
  if (!session) {
    return fail("Unauthorized");
  }

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

export async function bulkDeleteIndicatorData(
  records: { id: number; version: number }[],
) {
  const session = await getServerSideSession();
  if (!session) {
    return fail("Unauthorized");
  }

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
  const session = await getServerSideSession();
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
