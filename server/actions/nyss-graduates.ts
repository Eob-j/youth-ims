"use server";

import { db } from "@/db";
import { nyssGraduates } from "@/db/schema";
import { fail, ok } from "@/lib/action-result-helper";
import { getEditorSession } from "@/lib/auth-helper";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type CreateNyssGraduateInput = {
  name: string;
  age: number;
  gender: string;
  region: string;
  trainingProgram: string;
  graduationYear: string;
  employmentStatus: string;
  sector: string;
};

export async function createNyssGraduate(data: CreateNyssGraduateInput) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  try {
    const [row] = await db.insert(nyssGraduates).values(data).returning();
    revalidatePath("/nyss");
    return ok(row);
  } catch (error) {
    console.error(error);
    return fail("An error occurred while creating the record.");
  }
}

type UpdateNyssGraduateInput = CreateNyssGraduateInput & {
  id: number;
  version: number;
};

export async function updateNyssGraduate(data: UpdateNyssGraduateInput) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  try {
    const result = await db
      .update(nyssGraduates)
      .set({
        name: data.name,
        age: data.age,
        gender: data.gender,
        region: data.region,
        trainingProgram: data.trainingProgram,
        graduationYear: data.graduationYear,
        employmentStatus: data.employmentStatus,
        sector: data.sector,
      })
      .where(
        and(
          eq(nyssGraduates.id, data.id),
          eq(nyssGraduates.version, data.version),
        ),
      )
      .returning();

    if (result.length === 0) {
      return fail("Record not found.");
    }

    revalidatePath("/nyss");
    return ok(result[0]);
  } catch (error) {
    console.error(error);
    return fail("An error occurred while updating the record.");
  }
}

export async function deleteNyssGraduate(data: {
  id: number;
  version: number;
}) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  try {
    const result = await db
      .delete(nyssGraduates)
      .where(
        and(
          eq(nyssGraduates.id, data.id),
          eq(nyssGraduates.version, data.version),
        ),
      )
      .returning();

    if (result.length === 0) {
      return fail("Record not found.");
    }

    revalidatePath("/nyss");
    return ok("Record deleted successfully.");
  } catch (error) {
    console.error(error);
    return fail("An error occurred while deleting the record.");
  }
}

type BulkDeleteNyssGraduatesInput = {
  id: number;
  version: number;
}[];

export async function bulkDeleteNyssGraduates(
  records: BulkDeleteNyssGraduatesInput,
) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  try {
    if (!records || records.length === 0) {
      return fail("No records provided for deletion.");
    }

    const result = await db.transaction(async (tx) => {
      let deletedCount = 0;

      for (const record of records) {
        const deleted = await tx
          .delete(nyssGraduates)
          .where(
            and(
              eq(nyssGraduates.id, record.id),
              eq(nyssGraduates.version, record.version),
            ),
          )
          .returning({ id: nyssGraduates.id });
        if (deleted.length > 0) {
          deletedCount++;
        }
      }

      return deletedCount;
    });

    revalidatePath("/nyss");
    return ok({
      message: "Records deleted successfully.",
      requested: records.length,
      deleted: result,
    });
  } catch (error) {
    console.error(error);
    return fail("An unexpected error occurred while deleting records.");
  }
}
