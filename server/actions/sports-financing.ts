"use server";

import { db } from "@/db";
import { sportsFinancing } from "@/db/schema";
import { fail, ok } from "@/lib/action-result-helper";
import { getEditorSession } from "@/lib/auth-helper";
import { and, DrizzleQueryError, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type CreateSportsFinancingInput = {
  associationName: string;
  amount: string;
  year: number;
  period: string;
};

export async function createSportsFinancing(data: CreateSportsFinancingInput) {
  const session = await getEditorSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

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

type UpdateSportsFinancingInput = {
  id: number;
  associationName: string;
  amount: string;
  year: number;
  period: string;
  version: number;
};

export async function updateSportsFinancing(data: UpdateSportsFinancingInput) {
  const session = await getEditorSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

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

export async function deleteSportsFinancing(data: {
  id: number;
  version: number;
}) {
  const session = await getEditorSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

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

type BulkDeleteSportsFinancingInput = {
  id: number;
  version: number;
}[];

export async function bulkDeleteSportsFinancing(
  records: BulkDeleteSportsFinancingInput,
) {
  const session = await getEditorSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

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
          .delete(sportsFinancing)
          .where(
            and(
              eq(sportsFinancing.id, record.id),
              eq(sportsFinancing.version, record.version),
            ),
          )
          .returning({ id: sportsFinancing.id });

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
