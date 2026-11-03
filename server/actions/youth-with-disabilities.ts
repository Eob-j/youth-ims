"use server";

import { db } from "@/db";

import { youthWithDisabilities } from "@/db/schema";
import { fail, ok } from "@/lib/action-result-helper";
import { getEditorSession } from "@/lib/auth-helper";
import { and, DrizzleQueryError, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type CreateYouthWithDisabilitiesInput = {
  ageGroup: string;
  total: number;
  male: number;
  female: number;
  urban: number;
  rural: number;
  seeing: number;
  hearing: number;
  physical: number;
  learning: number;
  selfcare: number;
  speech: number;
};

export async function createYouthWithDisabilities(
  data: CreateYouthWithDisabilitiesInput,
) {
  const session = await getEditorSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

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

type UpdateYouthWithDisabilitiesInput = {
  id: number;
  ageGroup: string;
  total: number;
  male: number;
  female: number;
  urban: number;
  rural: number;
  seeing: number;
  hearing: number;
  physical: number;
  learning: number;
  selfcare: number;
  speech: number;
  version: number;
};

export async function updateYouthWithDisabilities(
  data: UpdateYouthWithDisabilitiesInput,
) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

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

export async function deleteYouthWithDisabilities(data: {
  id: number;
  version: number;
}) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  const { id, version } = data;

  const whereClause = version
    ? and(
        eq(youthWithDisabilities.id, id),
        eq(youthWithDisabilities.version, version),
      )
    : eq(youthWithDisabilities.id, id);

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

type BulkDeleteYouthWithDisabilitiesInput = {
  id: number;
  version: number;
}[];

export async function bulkDeleteYouthWithDisabilities(
  records: BulkDeleteYouthWithDisabilitiesInput,
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
