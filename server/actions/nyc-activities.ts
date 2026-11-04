"use server";

import { db } from "@/db";
import { nycActivities } from "@/db/schema";
import { fail, ok } from "@/lib/action-result-helper";
import { getEditorSession } from "@/lib/auth-helper";
import { readImportFile } from "@/lib/importer/parse-file";
import { nycActivityImportSchema } from "@/lib/validations/nyc-activities";
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
import { NYC_ACTIVITY_STATUSES } from "@/lib/schema/nyc-activities";

const createNycActivitySchema = z.object({
  activityName: requiredText,
  category: requiredText,
  region: requiredText,
  year: yearNumber,
  beneficiaries: wholeNumber,
  male: wholeNumber,
  female: wholeNumber,
  fundingPartner: requiredText,
  description: requiredText,
  status: z.enum(NYC_ACTIVITY_STATUSES),
});
type CreateNycActivityInput = z.infer<typeof createNycActivitySchema>;

export async function createNycActivity(input: CreateNycActivityInput) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  const parsed = createNycActivitySchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const [row] = await db.insert(nycActivities).values(data).returning();
    revalidatePath("/nyc-activities");
    return ok(row);
  } catch (error) {
    console.error(error);
    return fail("An error occurred while creating the record.");
  }
}

const updateNycActivitySchema = createNycActivitySchema.extend(recordRefSchema.shape);
type UpdateNycActivityInput = z.infer<typeof updateNycActivitySchema>;

export async function updateNycActivity(input: UpdateNycActivityInput) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  const parsed = updateNycActivitySchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const result = await db
      .update(nycActivities)
      .set({
        activityName: data.activityName,
        category: data.category,
        region: data.region,
        year: data.year,
        beneficiaries: data.beneficiaries,
        male: data.male,
        female: data.female,
        fundingPartner: data.fundingPartner,
        description: data.description,
        status: data.status,
        version: sql`${nycActivities.version} + 1`, // Increment version
      })
      .where(
        and(
          eq(nycActivities.id, data.id),
          eq(nycActivities.version, data.version),
        ),
      )
      .returning();

    if (result.length === 0) {
      return fail("Record modified by another user.");
    }

    revalidatePath("/nyc-activities");
    return ok(result[0]);
  } catch (error) {
    console.error(error);
    return fail("An error occurred while updating the record.");
  }
}

export async function deleteNycActivity(input: RecordRef) {
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
      .delete(nycActivities)
      .where(
        and(
          eq(nycActivities.id, data.id),
          eq(nycActivities.version, data.version),
        ),
      )
      .returning();

    if (result.length === 0) {
      return fail("Record modified by another user.");
    }

    revalidatePath("/nyc-activities");
    return ok("Record deleted successfully.");
  } catch (error) {
    console.error(error);
    return fail("An error occurred while deleting the record.");
  }
}

export async function bulkDeleteNycActivities(input: RecordRef[]) {
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
          .delete(nycActivities)
          .where(
            and(
              eq(nycActivities.id, record.id),
              eq(nycActivities.version, record.version),
            ),
          )
          .returning({ id: nycActivities.id });
        if (result.length > 0) deletedCount++;
      }
      return deletedCount;
    });

    revalidatePath("/nyc-activities");
    return ok({ requested: records.length, deleted });
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

export async function importNycActivitiesData(formData: FormData) {
  const session = await getEditorSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  const read = await readImportFile(formData.get("file"));
  if ("error" in read) {
    return { success: false, error: read.error };
  }
  const rawRows = read.rows;
  const validRows: z.infer<typeof nycActivityImportSchema>[] = [];
  const errors: unknown[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];

    const prepared = {
      activityName: String(
        getValue(row, ["activity_name", "activityName", "activity"] ) ?? "",
      ).trim(),
      category: String(getValue(row, ["category"]) ?? "").trim(),
      region: String(getValue(row, ["region", "coverage"]) ?? "").trim(),
      year: normalizeNumber(getValue(row, ["year"])),
      beneficiaries: normalizeNumber(getValue(row, ["beneficiaries", "output"])),
      male: normalizeNumber(getValue(row, ["male", "male_participants"])),
      female: normalizeNumber(getValue(row, ["female", "female_participants"])),
      fundingPartner: String(
        getValue(row, ["funding_partner", "fundingPartner", "funder"]) ?? "",
      ).trim(),
      description: String(getValue(row, ["description"]) ?? "").trim(),
      status: String(getValue(row, ["status"]) ?? "Planned").trim(),
    };

    const parsed = nycActivityImportSchema.safeParse(prepared);
    if (!parsed.success) {
      errors.push({ row: i + 2, issues: z.treeifyError(parsed.error) });
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
    await db.insert(nycActivities).values(validRows);
  } catch (error) {
    console.error(error);
    return {
      success: false,
      inserted: 0,
      failed: validRows.length,
      error: "An unexpected database error occurred while importing data.",
    };
  }

  revalidatePath("/nyc-activities");
  return {
    success: true,
    inserted: validRows.length,
    failed: errors.length,
    errors,
  };
}
