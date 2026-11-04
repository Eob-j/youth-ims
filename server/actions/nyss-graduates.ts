"use server";

import { db } from "@/db";
import { nyssGraduates } from "@/db/schema";
import { fail, ok } from "@/lib/action-result-helper";
import { getEditorSession } from "@/lib/auth-helper";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  invalidInput,
  recordRefSchema,
  recordRefsSchema,
  type RecordRef,
  requiredText,
  wholeNumber,
} from "@/lib/validations/action-input";
import z from "zod";
import { matchRecords } from "@/lib/db/match-records";

const createNyssGraduateSchema = z.object({
  name: requiredText,
  age: wholeNumber,
  gender: requiredText,
  region: requiredText,
  trainingProgram: requiredText,
  graduationYear: requiredText,
  employmentStatus: requiredText,
  sector: requiredText,
});
type CreateNyssGraduateInput = z.infer<typeof createNyssGraduateSchema>;

export async function createNyssGraduate(input: CreateNyssGraduateInput) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  const parsed = createNyssGraduateSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const [row] = await db.insert(nyssGraduates).values(data).returning();
    revalidatePath("/nyss");
    return ok(row);
  } catch (error) {
    console.error(error);
    return fail("An error occurred while creating the record.");
  }
}

const updateNyssGraduateSchema = createNyssGraduateSchema.extend(recordRefSchema.shape);
type UpdateNyssGraduateInput = z.infer<typeof updateNyssGraduateSchema>;

export async function updateNyssGraduate(input: UpdateNyssGraduateInput) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  const parsed = updateNyssGraduateSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const result = await db
      .update(nyssGraduates)
      .set({
        name: data.name,
        age: data.age,
        gender: data.gender,
        region: data.region,
        trainingProgram: data.trainingProgram,
        graduationYear: data.graduationYear,
        employmentStatus: data.employmentStatus,
        sector: data.sector,
        version: sql`${nyssGraduates.version} + 1`, // Increment version
      })
      .where(
        and(
          eq(nyssGraduates.id, data.id),
          eq(nyssGraduates.version, data.version),
        ),
      )
      .returning();

    if (result.length === 0) {
      return fail("Record modified by another user.");
    }

    revalidatePath("/nyss");
    return ok(result[0]);
  } catch (error) {
    console.error(error);
    return fail("An error occurred while updating the record.");
  }
}

export async function deleteNyssGraduate(input: RecordRef) {
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
      .delete(nyssGraduates)
      .where(
        and(
          eq(nyssGraduates.id, data.id),
          eq(nyssGraduates.version, data.version),
        ),
      )
      .returning();

    if (result.length === 0) {
      return fail("Record not found.");
    }

    revalidatePath("/nyss");
    return ok("Record deleted successfully.");
  } catch (error) {
    console.error(error);
    return fail("An error occurred while deleting the record.");
  }
}

type BulkDeleteNyssGraduatesInput = RecordRef[];

export async function bulkDeleteNyssGraduates(input: BulkDeleteNyssGraduatesInput) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  const parsed = recordRefsSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const records = parsed.data;

  try {
    if (!records || records.length === 0) {
      return fail("No records provided for deletion.");
    }

    // One query for all selected records, matched on id and version.
    const result = (
      await db
        .delete(nyssGraduates)
        .where(matchRecords(nyssGraduates, records))
        .returning({ id: nyssGraduates.id })
    ).length;

    revalidatePath("/nyss");
    return ok({
      message: "Records deleted successfully.",
      requested: records.length,
      deleted: result,
    });
  } catch (error) {
    console.error(error);
    return fail("An unexpected error occurred while deleting records.");
  }
}
