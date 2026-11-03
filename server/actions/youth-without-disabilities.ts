"use server";

import { db } from "@/db";
import { youthWithoutDisabilities } from "@/db/schema";
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
} from "@/lib/validations/action-input";
import z from "zod";

const createYouthWithoutDisabilitiesSchema = z.object({
  ageGroup: requiredText,
  total: wholeNumber,
  male: wholeNumber,
  female: wholeNumber,
  urban: wholeNumber,
  rural: wholeNumber,
});
type CreateYouthWithoutDisabilitiesInput = z.infer<typeof createYouthWithoutDisabilitiesSchema>;

export async function createYouthWithoutDisabilities(input: CreateYouthWithoutDisabilitiesInput) {
  const session = await getEditorSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const parsed = createYouthWithoutDisabilitiesSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const [row] = await db
      .insert(youthWithoutDisabilities)
      .values(data)
      .returning();

    revalidatePath("/youth-without-disabilities");
    return ok(row);
  } catch (error: any) {
    console.error(error);

    if (
      error instanceof DrizzleQueryError &&
      error.cause?.message.includes("duplicate")
    ) {
      return fail("Duplicate Age Group entry.");
    }

    return fail("An error occurred while creating the record.");
  }
}

const updateYouthWithoutDisabilitiesSchema = createYouthWithoutDisabilitiesSchema.extend(recordRefSchema.shape);
type UpdateYouthWithoutDisabilitiesInput = z.infer<typeof updateYouthWithoutDisabilitiesSchema>;

export async function updateYouthWithoutDisabilities(input: UpdateYouthWithoutDisabilitiesInput) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  const parsed = updateYouthWithoutDisabilitiesSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const result = await db
      .update(youthWithoutDisabilities)
      .set({
        ageGroup: data.ageGroup,
        total: data.total,
        male: data.male,
        female: data.female,
        urban: data.urban,
        rural: data.rural,
        version: sql`${youthWithoutDisabilities.version} + 1`, // Increment version
      })
      .where(
        and(
          eq(youthWithoutDisabilities.id, data.id),
          eq(youthWithoutDisabilities.version, data.version),
        ),
      )
      .returning();

    if (result.length === 0) {
      return fail("Record modified by another user.");
    }
    revalidatePath("/youth-without-disabilities");
    return ok(result[0]);
  } catch (error) {
    console.error(error);
    return fail("An error occurred while updating the record.");
  }
}

export async function deleteYouthWithoutDisabilities(input: RecordRef) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  const parsed = recordRefSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  const { id, version } = data;

  const whereClause = version
    ? and(
        eq(youthWithoutDisabilities.id, id),
        eq(youthWithoutDisabilities.version, version),
      )
    : eq(youthWithoutDisabilities.id, id);

  try {
    const result = await db
      .delete(youthWithoutDisabilities)
      .where(whereClause)
      .returning();

    if (result.length === 0) {
      return fail("Record modified by another user.");
    }

    revalidatePath("/youth-without-disabilities");

    return ok("Record deleted successfully.");
  } catch (error) {
    console.error(error);
    return fail("An error occurred while deleting the record.");
  }
}

type BulkDeleteYouthWithoutDisabilitiesInput = RecordRef[];

export async function bulkDeleteYouthWithoutDisabilities(input: BulkDeleteYouthWithoutDisabilitiesInput) {
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
          .delete(youthWithoutDisabilities)
          .where(
            and(
              eq(youthWithoutDisabilities.id, record.id),
              eq(youthWithoutDisabilities.version, record.version),
            ),
          )
          .returning({ id: youthWithoutDisabilities.id });

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
    revalidatePath("/youth-without-disabilities");

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
