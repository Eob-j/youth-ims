"use server";

import { db } from "@/db";
import { youthMigration } from "@/db/schema";
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

const createYouthMigrationSchema = z.object({
  year: yearNumber,
  total: wholeNumber,
  male: wholeNumber,
  female: wholeNumber,
  origin: requiredText,
  destination: requiredText,
});
type CreateYouthMigrationInput = z.infer<typeof createYouthMigrationSchema>;

export async function createYouthMigration(input: CreateYouthMigrationInput) {
  const session = await getEditorSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const parsed = createYouthMigrationSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const [row] = await db.insert(youthMigration).values(data).returning();

    revalidatePath("/youth-migration");
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

const updateYouthMigrationSchema = createYouthMigrationSchema.extend(recordRefSchema.shape);
type UpdateYouthMigrationInput = z.infer<typeof updateYouthMigrationSchema>;

export async function updateYouthMigration(input: UpdateYouthMigrationInput) {
  const session = await getEditorSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const parsed = updateYouthMigrationSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const result = await db
      .update(youthMigration)
      .set({
        year: data.year,
        total: data.total,
        male: data.male,
        female: data.female,
        origin: data.origin,
        destination: data.destination,
        version: sql`${youthMigration.version} + 1`, // Increment version
      })
      .where(
        and(
          eq(youthMigration.id, data.id),
          eq(youthMigration.version, data.version),
        ),
      )
      .returning();

    if (result.length === 0) {
      return fail("Record modified by another user.");
    }
    revalidatePath("/youth-migration");
    return ok(result[0]);
  } catch (error) {
    console.error(error);
    return fail("An error occurred while updating the record.");
  }
}

export async function deleteYouthMigration(input: RecordRef) {
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
      .delete(youthMigration)
      .where(
        and(eq(youthMigration.id, id), eq(youthMigration.version, version)),
      )
      .returning();

    if (result.length === 0) {
      return fail("Record modified by another user.");
    }

    revalidatePath("/youth-migration");

    return ok("Record deleted successfully.");
  } catch (error) {
    console.error(error);
    return fail("An error occurred while deleting the record.");
  }
}

type BulkDeleteYouthMigrationInput = RecordRef[];

export async function bulkDeleteYouthMigration(input: BulkDeleteYouthMigrationInput) {
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
          .delete(youthMigration)
          .where(
            and(
              eq(youthMigration.id, record.id),
              eq(youthMigration.version, record.version),
            ),
          )
          .returning({ id: youthMigration.id });

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
    revalidatePath("/youth-migration");

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
