"use server";

import { db } from "@/db";
import { nyssPrograms } from "@/db/schema";
import { fail, ok } from "@/lib/action-result-helper";
import { getEditorSession } from "@/lib/auth-helper";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type CreateNyssProgramInput = {
  programName: string;
  institution: string;
  year: number;
  region: string;
  sector: string;
  totalGraduates: number;
  maleGraduates: number;
  femaleGraduates: number;
  employmentRate: string;
};

export async function createNyssProgram(data: CreateNyssProgramInput) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  try {
    const [row] = await db.insert(nyssPrograms).values(data).returning();
    revalidatePath("/nyss");
    return ok(row);
  } catch (error) {
    console.error(error);
    return fail("An error occurred while creating the record.");
  }
}

type UpdateNyssProgramInput = CreateNyssProgramInput & {
  id: number;
  version: number;
};

export async function updateNyssProgram(data: UpdateNyssProgramInput) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  try {
    const result = await db
      .update(nyssPrograms)
      .set({
        programName: data.programName,
        institution: data.institution,
        year: data.year,
        region: data.region,
        sector: data.sector,
        totalGraduates: data.totalGraduates,
        maleGraduates: data.maleGraduates,
        femaleGraduates: data.femaleGraduates,
        employmentRate: data.employmentRate,
      })
      .where(
        and(
          eq(nyssPrograms.id, data.id),
          eq(nyssPrograms.version, data.version),
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

export async function deleteNyssProgram(data: { id: number; version: number }) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  try {
    const result = await db
      .delete(nyssPrograms)
      .where(
        and(
          eq(nyssPrograms.id, data.id),
          eq(nyssPrograms.version, data.version),
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

type BulkDeleteNyssProgramsInput = {
  id: number;
  version: number;
}[];

export async function bulkDeleteNyssPrograms(
  records: BulkDeleteNyssProgramsInput,
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
          .delete(nyssPrograms)
          .where(
            and(
              eq(nyssPrograms.id, record.id),
              eq(nyssPrograms.version, record.version),
            ),
          )
          .returning({ id: nyssPrograms.id });

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
