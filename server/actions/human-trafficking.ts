"use server";

import { db } from "@/db";
import { humanTrafficking } from "@/db/schema";
import { fail, ok } from "@/lib/action-result-helper";
import { getEditorSession } from "@/lib/auth-helper";
import { and, DrizzleQueryError, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  invalidInput,
  recordRefSchema,
  recordRefsSchema,
  type RecordRef,
  requiredText,
  wholeNumber,
  yearNumber,
} from "@/lib/validations/action-input";
import z from "zod";

const createHumanTraffickingSchema = z.object({
  lga: requiredText,
  year: yearNumber,
  total: wholeNumber,
  male: wholeNumber,
  female: wholeNumber,
  ageGroup: requiredText,
});
type CreateHumanTraffickingInput = z.infer<typeof createHumanTraffickingSchema>;

export async function createHumanTrafficking(input: CreateHumanTraffickingInput) {
  const session = await getEditorSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const parsed = createHumanTraffickingSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const [row] = await db.insert(humanTrafficking).values(data).returning();

    revalidatePath("/human-trafficking");
    return ok(row);
  } catch (error: any) {
    console.error(error);

    if (
      error instanceof DrizzleQueryError &&
      error.cause?.message.includes("duplicate")
    ) {
      return fail("Duplicate entry for this lga and year.");
    }

    return fail("An error occurred while creating the record.");
  }
}

const updateHumanTraffickingSchema = createHumanTraffickingSchema.extend(recordRefSchema.shape);
type UpdateHumanTraffickingInput = z.infer<typeof updateHumanTraffickingSchema>;

export async function updateHumanTrafficking(input: UpdateHumanTraffickingInput) {
  const session = await getEditorSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const parsed = updateHumanTraffickingSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const result = await db
      .update(humanTrafficking)
      .set({
        lga: data.lga,
        year: data.year,
        total: data.total,
        male: data.male,
        female: data.female,
        ageGroup: data.ageGroup,
        version: sql`${humanTrafficking.version} + 1`, // Increment version
      })
      .where(
        and(
          eq(humanTrafficking.id, data.id),
          eq(humanTrafficking.version, data.version),
        ),
      )
      .returning();

    if (result.length === 0) {
      return fail("Record modified by another user.");
    }
    revalidatePath("/human-trafficking");
    return ok(result[0]);
  } catch (error) {
    console.error(error);
    return fail("An error occurred while updating the record.");
  }
}

export async function deleteHumanTrafficking(input: RecordRef) {
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

  const whereClause = version
    ? and(eq(humanTrafficking.id, id), eq(humanTrafficking.version, version))
    : eq(humanTrafficking.id, id);

  try {
    const result = await db
      .delete(humanTrafficking)
      .where(whereClause)
      .returning();

    if (result.length === 0) {
      return fail("Record modified by another user.");
    }

    revalidatePath("/human-trafficking");

    return ok("Record deleted successfully.");
  } catch (error) {
    console.error(error);
    return fail("An error occurred while deleting the record.");
  }
}

type BulkDeleteHumanTraffickingInput = RecordRef[];

export async function bulkDeleteHumanTrafficking(input: BulkDeleteHumanTraffickingInput) {
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

    const result = await db.transaction(async (tx) => {
      let deletedCount = 0;

      for (const record of records) {
        const deleted = await tx
          .delete(humanTrafficking)
          .where(
            and(
              eq(humanTrafficking.id, record.id),
              eq(humanTrafficking.version, record.version),
            ),
          )
          .returning({ id: humanTrafficking.id });

        if (deleted.length > 0) {
          deletedCount++;
        }
      }

      return deletedCount;
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
    revalidatePath("/human-trafficking");

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
