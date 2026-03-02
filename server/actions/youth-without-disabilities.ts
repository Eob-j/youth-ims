"use server";

import { db } from "@/db";
import { youthWithoutDisabilities } from "@/db/schema";
import { fail, ok } from "@/lib/action-result-helper";
import { getServerSideSession } from "@/lib/auth-helper";
import { and, DrizzleQueryError, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type CreateYouthWithoutDisabilitiesInput = {
  ageGroup: string;
  total: number;
  male: number;
  female: number;
  urban: number;
  rural: number;
};

export async function createYouthWithoutDisabilities(
  data: CreateYouthWithoutDisabilitiesInput,
) {
  const session = await getServerSideSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

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

type UpdateYouthWithoutDisabilitiesInput = {
  id: number;
  ageGroup: string;
  total: number;
  male: number;
  female: number;
  urban: number;
  rural: number;
  version: number;
};

export async function updateYouthWithoutDisabilities(
  data: UpdateYouthWithoutDisabilitiesInput,
) {
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

export async function deleteYouthWithoutDisabilities(data: {
  id: number;
  version: number;
}) {
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

type BulkDeleteYouthWithoutDisabilitiesInput = {
  id: number;
  version: number;
}[];

export async function bulkDeleteYouthWithoutDisabilities(
  records: BulkDeleteYouthWithoutDisabilitiesInput,
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
