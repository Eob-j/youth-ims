"use server";

import { db } from "@/db";
import { sportsFinancing } from "@/db/schema";
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
  yearNumber,
  decimalText,
} from "@/lib/validations/action-input";
import z from "zod";
import { matchRecords } from "@/lib/db/match-records";

const createSportsFinancingSchema = z.object({
  associationName: requiredText,
  amount: decimalText,
  year: yearNumber,
  period: requiredText,
});
type CreateSportsFinancingInput = z.infer<typeof createSportsFinancingSchema>;

export async function createSportsFinancing(input: CreateSportsFinancingInput) {
  const session = await getEditorSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const parsed = createSportsFinancingSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const [row] = await db.insert(sportsFinancing).values(data).returning();

    revalidatePath("/sports-financing");
    return ok(row);
  } catch (error: any) {
    console.error(error);

    if (
      error instanceof DrizzleQueryError &&
      error.cause?.message.includes("duplicate")
    ) {
      return fail("Duplicate entry for this association, year and period.");
    }

    return fail("An error occurred while creating the record.");
  }
}

const updateSportsFinancingSchema = createSportsFinancingSchema.extend(recordRefSchema.shape);
type UpdateSportsFinancingInput = z.infer<typeof updateSportsFinancingSchema>;

export async function updateSportsFinancing(input: UpdateSportsFinancingInput) {
  const session = await getEditorSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const parsed = updateSportsFinancingSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const result = await db
      .update(sportsFinancing)
      .set({
        associationName: data.associationName,
        amount: data.amount,
        year: data.year,
        period: data.period,
        version: sql`${sportsFinancing.version} + 1`,
      })
      .where(
        and(
          eq(sportsFinancing.id, data.id),
          eq(sportsFinancing.version, data.version),
        ),
      )
      .returning();

    if (result.length === 0) {
      return fail("Record modified by another user.");
    }
    revalidatePath("/sports-financing");
    return ok(result[0]);
  } catch (error) {
    console.error(error);
    return fail("An error occurred while updating the record.");
  }
}

export async function deleteSportsFinancing(input: RecordRef) {
  const session = await getEditorSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const parsed = recordRefSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  const { id, version } = data;

  try {
    const result = await db
      .delete(sportsFinancing)
      .where(
        and(eq(sportsFinancing.id, id), eq(sportsFinancing.version, version)),
      )
      .returning();

    if (result.length === 0) {
      return fail("Record modified by another user.");
    }

    revalidatePath("/sports-financing");

    return ok("Record deleted successfully.");
  } catch (error) {
    console.error(error);
    return fail("An error occurred while deleting the record.");
  }
}

type BulkDeleteSportsFinancingInput = RecordRef[];

export async function bulkDeleteSportsFinancing(input: BulkDeleteSportsFinancingInput) {
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
          .delete(sportsFinancing)
          .where(matchRecords(sportsFinancing, records))
          .returning({ id: sportsFinancing.id });
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
    revalidatePath("/sports-financing");

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

export const bulkDeleteSportFinancing = bulkDeleteSportsFinancing;
