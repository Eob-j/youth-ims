"use server";

import { db } from "@/db";

import { youthWithDisabilities } from "@/db/schema";
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

const createYouthWithDisabilitiesSchema = z.object({
  ageGroup: requiredText,
  total: wholeNumber,
  male: wholeNumber,
  female: wholeNumber,
  urban: wholeNumber,
  rural: wholeNumber,
  seeing: wholeNumber,
  hearing: wholeNumber,
  physical: wholeNumber,
  learning: wholeNumber,
  selfcare: wholeNumber,
  speech: wholeNumber,
});
type CreateYouthWithDisabilitiesInput = z.infer<typeof createYouthWithDisabilitiesSchema>;

export async function createYouthWithDisabilities(input: CreateYouthWithDisabilitiesInput) {
  const session = await getEditorSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const parsed = createYouthWithDisabilitiesSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const [row] = await db
      .insert(youthWithDisabilities)
      .values(data)
      .returning();

    revalidatePath("/youth-with-disabilities");
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

const updateYouthWithDisabilitiesSchema = createYouthWithDisabilitiesSchema.extend(recordRefSchema.shape);
type UpdateYouthWithDisabilitiesInput = z.infer<typeof updateYouthWithDisabilitiesSchema>;

export async function updateYouthWithDisabilities(input: UpdateYouthWithDisabilitiesInput) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  const parsed = updateYouthWithDisabilitiesSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const result = await db
      .update(youthWithDisabilities)
      .set({
        ageGroup: data.ageGroup,
        total: data.total,
        male: data.male,
        female: data.female,
        urban: data.urban,
        rural: data.rural,
        seeing: data.seeing,
        hearing: data.hearing,
        physical: data.physical,
        learning: data.learning,
        selfcare: data.selfcare,
        speech: data.speech,
        version: sql`${youthWithDisabilities.version} + 1`, // Increment version
      })
      .where(
        and(
          eq(youthWithDisabilities.id, data.id),
          eq(youthWithDisabilities.version, data.version),
        ),
      )
      .returning();

    if (result.length === 0) {
      return fail("Record modified by another user.");
    }
    revalidatePath("/youth-with-disabilities");
    return ok(result[0]);
  } catch (error) {
    console.error(error);
    return fail("An error occurred while updating the record.");
  }
}

export async function deleteYouthWithDisabilities(input: RecordRef) {
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

  const whereClause = and(
    eq(youthWithDisabilities.id, id),
    eq(youthWithDisabilities.version, version),
  );

  try {
    const result = await db
      .delete(youthWithDisabilities)
      .where(whereClause)
      .returning();

    if (result.length === 0) {
      return fail("Record modified by another user.");
    }

    revalidatePath("/youth-with-disabilities");

    return ok("Record deleted successfully.");
  } catch (error) {
    console.error(error);
    return fail("An error occurred while deleting the record.");
  }
}

type BulkDeleteYouthWithDisabilitiesInput = RecordRef[];

export async function bulkDeleteYouthWithDisabilities(input: BulkDeleteYouthWithDisabilitiesInput) {
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
          .delete(youthWithDisabilities)
          .where(
            and(
              eq(youthWithDisabilities.id, record.id),
              eq(youthWithDisabilities.version, record.version),
            ),
          )
          .returning({ id: youthWithDisabilities.id });

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
    revalidatePath("/youth-with-disabilities");

    return {
      success: true,
      message: "Records deleted successfully.",
      requested: records.length,
      deleted: result,
    };
  } catch (error) {
    // 🔒 Log full error internally (important)
    console.error("Bulk delete error:", error);

    // 🚫 Never send raw DB error to frontend
    return {
      success: false,
      message:
        "An unexpected error occurred while deleting records. Please try again later.",
    };
  }
}
