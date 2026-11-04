"use server";

import { db } from "@/db";
import { piaStudents } from "@/db/schema";
import { fail, ok } from "@/lib/action-result-helper";
import { getEditorSession } from "@/lib/auth-helper";
import { and, DrizzleQueryError, eq, sql, TransactionRollbackError } from "drizzle-orm";
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

const createPiaStudentsSchema = z.object({
  department: requiredText,
  year: requiredText,
  male: wholeNumber,
  female: wholeNumber,
  enrolled: wholeNumber,
  graduated: wholeNumber,
});
type CreatePiaStudentsInput = z.infer<typeof createPiaStudentsSchema>;

export async function createPiaStudents(input: CreatePiaStudentsInput) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  const parsed = createPiaStudentsSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const [row] = await db.insert(piaStudents).values(data).returning();

    revalidatePath("/pia-students");
    return ok(row);
  } catch (error: any) {
    console.error(error);

    if (
      error instanceof DrizzleQueryError &&
      error.cause?.message.includes("duplicate")
    ) {
      return fail("Duplicate department and academic year entry.");
    }

    return fail("An error occurred while creating the record.");
  }
}

const updatePiaStudentsSchema = createPiaStudentsSchema.extend(recordRefSchema.shape);
type UpdatePiaStudentsInput = z.infer<typeof updatePiaStudentsSchema>;

export async function updatePiaStudents(input: UpdatePiaStudentsInput) {
  const session = await getEditorSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const parsed = updatePiaStudentsSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const result = await db
      .update(piaStudents)
      .set({
        department: data.department,
        year: data.year,
        male: data.male,
        female: data.female,
        enrolled: data.enrolled,
        graduated: data.graduated,
        version: sql`${piaStudents.version} + 1`, // Increment version
      })
      .where(
        and(eq(piaStudents.id, data.id), eq(piaStudents.version, data.version)),
      )
      .returning();

    if (result.length === 0) {
      return fail("Record modified by another user.");
    }
    revalidatePath("/pia-students");
    return ok(result[0]);
  } catch (error: any) {
    console.error(error);

    if (
      error instanceof DrizzleQueryError &&
      error.cause?.message.includes("duplicate")
    ) {
      return fail("Duplicate department and academic year entry.");
    }

    return fail("An error occurred while updating the record.");
  }
}

export async function deletePiaStudents(input: RecordRef) {
  const session = await getEditorSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const parsed = recordRefSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const result = await db
      .delete(piaStudents)
      .where(
        and(eq(piaStudents.id, data.id), eq(piaStudents.version, data.version)),
      )
      .returning();

    if (result.length === 0) {
      return fail("Record not found.");
    }

    revalidatePath("/pia-students");
    return ok("Record deleted successfully.");
  } catch (error) {
    console.error(error);
    return fail("An error occurred while deleting the record.");
  }
}

type BulkDeletePiaStudentsInput = RecordRef[];

export async function bulkDeletePiaStudents(input: BulkDeletePiaStudentsInput) {
  const session = await getEditorSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const parsed = recordRefsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: invalidInput(parsed.error) };
  }
  const records = parsed.data;

  try {
    if (!records || records.length === 0) {
      return {
        success: false,
        message: "No records provided for deletion.",
      };
    }

    // One query for all selected records, matched on id and version. All or
    // nothing: if any record was changed or removed meanwhile, roll back so
    // the "refresh and try again" message is true.
    const result = await db
      .transaction(async (tx) => {
        const deleted = await tx
          .delete(piaStudents)
          .where(matchRecords(piaStudents, records))
          .returning({ id: piaStudents.id });
        if (deleted.length !== records.length) tx.rollback();
        return deleted.length;
      })
      .catch((error) => {
        if (error instanceof TransactionRollbackError) return 0;
        throw error;
      });

    if (result !== records.length) {
      return {
        success: false,
        message:
          "Some records were modified or already deleted. Please refresh and try again.",
        requested: records.length,
        deleted: result,
      };
    }

    revalidatePath("/pia-students");

    return {
      success: true,
      message: "Records deleted successfully.",
      requested: records.length,
      deleted: result,
    };
  } catch (error) {
    console.error("Bulk delete error:", error);
    return {
      success: false,
      message:
        "An unexpected error occurred while deleting records. Please try again later.",
    };
  }
}
