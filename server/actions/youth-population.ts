"use server";

import { db } from "@/db";

import { youthPopulation } from "@/db/schema";
import { fail, ok } from "@/lib/action-result-helper";
import { getEditorSession } from "@/lib/auth-helper";
import { and, DrizzleQueryError, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { DatabaseError } from "pg";
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

const createYouthPopulationSchema = z.object({
  lga: requiredText,
  totalPopulation: wholeNumber,
  youthPopulation: wholeNumber,
  year: yearNumber,
  maleYouth: wholeNumber,
  femaleYouth: wholeNumber,
  urbanYouth: wholeNumber,
  ruralYouth: wholeNumber,
});
type CreateYouthPopulationInput = z.infer<typeof createYouthPopulationSchema>;

export async function createYouthPopulation(input: CreateYouthPopulationInput) {
  const session = await getEditorSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const parsed = createYouthPopulationSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const [row] = await db.insert(youthPopulation).values(data).returning();

    revalidatePath("/youth-population");
    return ok(row);
  } catch (error: any) {
    console.error(error);

    if (
      error instanceof DrizzleQueryError &&
      error.cause?.message.includes("duplicate")
    ) {
      return fail("Duplicate LGA and year entry.");
    }

    return fail("An error occurred while creating the record.");
  }
}

const updateYouthPopulationSchema = createYouthPopulationSchema.extend(recordRefSchema.shape);
type UpdateYouthPopulationInput = z.infer<typeof updateYouthPopulationSchema>;

export async function updateYouthPopulation(input: UpdateYouthPopulationInput) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  const parsed = updateYouthPopulationSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  //   const parsed = updateYouthPopulationSchema.safeParse(rawData);

  //   if (!parsed.success) {
  //     return {
  //       success: false,
  //       error: "Validation failed",
  //       details: parsed.error.flatten(),
  //     };
  //   }

  //   const data = parsed.data;

  try {
    const result = await db
      .update(youthPopulation)
      .set({
        lga: data.lga,
        year: data.year,
        totalPopulation: data.totalPopulation,
        youthPopulation: data.youthPopulation,
        maleYouth: data.maleYouth,
        femaleYouth: data.femaleYouth,
        urbanYouth: data.urbanYouth,
        ruralYouth: data.ruralYouth,
        version: sql`${youthPopulation.version} + 1`, // Increment version
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(youthPopulation.id, data.id),
          eq(youthPopulation.version, data.version),
        ),
      )
      .returning();

    if (result.length === 0) {
      return fail("Record modified by another user.");
    }
    revalidatePath("/youth-population");
    return ok(result[0]);
  } catch (error) {
    console.error(error);
    return fail("An error occurred while updating the record.");
  }
}

export async function deleteYouthPopulation(input: RecordRef) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  const parsed = recordRefSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  //   const parsed = deleteYouthPopulationSchema.safeParse(rawData);

  //   if (!parsed.success) {
  //     return {
  //       success: false,
  //       error: "Validation failed",
  //       details: parsed.error.flatten(),
  //     };
  //   }

  const { id, version } = data;

  const whereClause = version
    ? and(eq(youthPopulation.id, id), eq(youthPopulation.version, version))
    : eq(youthPopulation.id, id);

  try {
    const result = await db
      .delete(youthPopulation)
      .where(whereClause)
      .returning();

    if (result.length === 0) {
      return fail("Record modified by another user.");
    }

    revalidatePath("/youth-population");

    return ok("Record deleted successfully.");
  } catch (error) {
    console.error(error);
    return fail("An error occurred while deleting the record.");
  }
}

type BulkDeleteYouthPopulationInput = RecordRef[];

export async function bulkDeleteYouthPopulation(input: BulkDeleteYouthPopulationInput) {
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
          .delete(youthPopulation)
          .where(
            and(
              eq(youthPopulation.id, record.id),
              eq(youthPopulation.version, record.version),
            ),
          )
          .returning({ id: youthPopulation.id });

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
    revalidatePath("/youth-population");

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
