"use server";

import { db } from "@/db";
import { piaStudents } from "@/db/schema";
import { fail, ok } from "@/lib/action-result-helper";
import { getEditorSession } from "@/lib/auth-helper";
import { and, DrizzleQueryError, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type CreatePiaStudentsInput = {
  department: string;
  year: string;
  male: number;
  female: number;
  enrolled: number;
  graduated: number;
};

export async function createPiaStudents(data: CreatePiaStudentsInput) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  try {
    const [row] = await db.insert(piaStudents).values(data).returning();

    revalidatePath("/pia-students");
    return ok(row);
  } catch (error: any) {
    console.error(error);

    if (
      error instanceof DrizzleQueryError &&
      error.cause?.message.includes("duplicate")
    ) {
      return fail("Duplicate department and academic year entry.");
    }

    return fail("An error occurred while creating the record.");
  }
}

type UpdatePiaStudentsInput = {
  id: number;
  department: string;
  year: string;
  male: number;
  female: number;
  enrolled: number;
  graduated: number;
  version: number;
};

export async function updatePiaStudents(data: UpdatePiaStudentsInput) {
  const session = await getEditorSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await db
      .update(piaStudents)
      .set({
        department: data.department,
        year: data.year,
        male: data.male,
        female: data.female,
        enrolled: data.enrolled,
        graduated: data.graduated,
      })
      .where(
        and(eq(piaStudents.id, data.id), eq(piaStudents.version, data.version)),
      )
      .returning();

    if (result.length === 0) {
      return fail("Record not found.");
    }
    revalidatePath("/pia-students");
    return ok(result[0]);
  } catch (error: any) {
    console.error(error);

    if (
      error instanceof DrizzleQueryError &&
      error.cause?.message.includes("duplicate")
    ) {
      return fail("Duplicate department and academic year entry.");
    }

    return fail("An error occurred while updating the record.");
  }
}

export async function deletePiaStudents(data: { id: number; version: number }) {
  const session = await getEditorSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await db
      .delete(piaStudents)
      .where(
        and(eq(piaStudents.id, data.id), eq(piaStudents.version, data.version)),
      )
      .returning();

    if (result.length === 0) {
      return fail("Record not found.");
    }

    revalidatePath("/pia-students");
    return ok("Record deleted successfully.");
  } catch (error) {
    console.error(error);
    return fail("An error occurred while deleting the record.");
  }
}

type BulkDeletePiaStudentsInput = {
  id: number;
  version: number;
}[];

export async function bulkDeletePiaStudents(
  records: BulkDeletePiaStudentsInput,
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
          .delete(piaStudents)
          .where(
            and(
              eq(piaStudents.id, record.id),
              eq(piaStudents.version, record.version),
            ),
          )
          .returning({ id: piaStudents.id });

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

    revalidatePath("/pia-students");

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
