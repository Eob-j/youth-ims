"use server";

import { db } from "@/db";
import { humanTrafficking } from "@/db/schema";
import { fail, ok } from "@/lib/action-result-helper";
import { getServerSideSession } from "@/lib/auth-helper";
import { and, DrizzleQueryError, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type CreateHumanTraffickingInput = {
  lga: string;
  year: number;
  total: number;
  male: number;
  female: number;
  ageGroup: string;
};

export async function createHumanTrafficking(
  data: CreateHumanTraffickingInput,
) {
  const session = await getServerSideSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

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

type UpdateHumanTraffickingInput = {
  id: number;
  lga: string;
  year: number;
  total: number;
  male: number;
  female: number;
  ageGroup: string;
  version: number;
};

export async function updateHumanTrafficking(
  data: UpdateHumanTraffickingInput,
) {
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

export async function deleteHumanTrafficking(data: {
  id: number;
  version: number;
}) {
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

type BulkDeleteHumanTraffickingInput = {
  id: number;
  version: number;
}[];

export async function bulkDeleteHumanTrafficking(
  records: BulkDeleteHumanTraffickingInput,
) {
  const session = await getServerSideSession();
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
