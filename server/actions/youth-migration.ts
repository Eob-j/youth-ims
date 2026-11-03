"use server";

import { db } from "@/db";
import { youthMigration } from "@/db/schema";
import { fail, ok } from "@/lib/action-result-helper";
import { getEditorSession } from "@/lib/auth-helper";
import { and, DrizzleQueryError, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type CreateYouthMigrationInput = {
  year: number;
  total: number;
  male: number;
  female: number;
  origin: string;
  destination: string;
};

export async function createYouthMigration(data: CreateYouthMigrationInput) {
  const session = await getEditorSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

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

type UpdateYouthMigrationInput = {
  id: number;
  year: number;
  total: number;
  male: number;
  female: number;
  origin: string;
  destination: string;
  version: number;
};

export async function updateYouthMigration(data: UpdateYouthMigrationInput) {
  const session = await getEditorSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

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

export async function deleteYouthMigration(data: {
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

type BulkDeleteYouthMigrationInput = {
  id: number;
  version: number;
}[];

export async function bulkDeleteYouthMigration(
  records: BulkDeleteYouthMigrationInput,
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
