"use server";

import { db } from "@/db";
import { nyssPrograms } from "@/db/schema";
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
  yearNumber,
  decimalText,
} from "@/lib/validations/action-input";
import z from "zod";

const createNyssProgramSchema = z.object({
  programName: requiredText,
  institution: requiredText,
  year: yearNumber,
  region: requiredText,
  sector: requiredText,
  totalGraduates: wholeNumber,
  maleGraduates: wholeNumber,
  femaleGraduates: wholeNumber,
  employmentRate: decimalText,
});
type CreateNyssProgramInput = z.infer<typeof createNyssProgramSchema>;

export async function createNyssProgram(input: CreateNyssProgramInput) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  const parsed = createNyssProgramSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const [row] = await db.insert(nyssPrograms).values(data).returning();
    revalidatePath("/nyss");
    return ok(row);
  } catch (error) {
    console.error(error);
    return fail("An error occurred while creating the record.");
  }
}

const updateNyssProgramSchema = createNyssProgramSchema.extend(recordRefSchema.shape);
type UpdateNyssProgramInput = z.infer<typeof updateNyssProgramSchema>;

export async function updateNyssProgram(input: UpdateNyssProgramInput) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  const parsed = updateNyssProgramSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const result = await db
      .update(nyssPrograms)
      .set({
        programName: data.programName,
        institution: data.institution,
        year: data.year,
        region: data.region,
        sector: data.sector,
        totalGraduates: data.totalGraduates,
        maleGraduates: data.maleGraduates,
        femaleGraduates: data.femaleGraduates,
        employmentRate: data.employmentRate,
        version: sql`${nyssPrograms.version} + 1`, // Increment version
      })
      .where(
        and(
          eq(nyssPrograms.id, data.id),
          eq(nyssPrograms.version, data.version),
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

export async function deleteNyssProgram(input: RecordRef) {
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
      .delete(nyssPrograms)
      .where(
        and(
          eq(nyssPrograms.id, data.id),
          eq(nyssPrograms.version, data.version),
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

type BulkDeleteNyssProgramsInput = RecordRef[];

export async function bulkDeleteNyssPrograms(input: BulkDeleteNyssProgramsInput) {
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

    const result = await db.transaction(async (tx) => {
      let deletedCount = 0;

      for (const record of records) {
        const deleted = await tx
          .delete(nyssPrograms)
          .where(
            and(
              eq(nyssPrograms.id, record.id),
              eq(nyssPrograms.version, record.version),
            ),
          )
          .returning({ id: nyssPrograms.id });

        if (deleted.length > 0) {
          deletedCount++;
        }
      }

      return deletedCount;
    });

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
