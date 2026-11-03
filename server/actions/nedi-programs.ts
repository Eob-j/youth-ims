"use server";

import { db } from "@/db";
import { nediPrograms } from "@/db/schema";
import { fail, ok } from "@/lib/action-result-helper";
import { getEditorSession } from "@/lib/auth-helper";
import { StatusEnumType } from "@/lib/validations/nedi-programs";
import { and, DrizzleQueryError, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  invalidInput,
  recordRefSchema,
  recordRefsSchema,
  type RecordRef,
  requiredText,
  wholeNumber,
  isoDate,
} from "@/lib/validations/action-input";
import z from "zod";
import { statusEnum } from "@/db/schema";

const createNediProgramSchema = z.object({
  programName: requiredText,
  targetGroup: requiredText,
  beneficiaries: wholeNumber.nullable(),
  serviceType: requiredText,
  description: requiredText,
  status: z.enum(statusEnum.enumValues),
  location: requiredText,
  maleParticipants: wholeNumber.nullable().optional(),
  femaleParticipants: wholeNumber.nullable().optional(),
  startDate: isoDate,
  endDate: isoDate.nullable().optional(),
  implementingPartner: requiredText,
  fundingSource: requiredText,
});
type CreateNediProgramInput = z.infer<typeof createNediProgramSchema>;

export async function createNediProgram(input: CreateNediProgramInput) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  const parsed = createNediProgramSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const [row] = await db.insert(nediPrograms).values(data).returning();

    revalidatePath("/nedi-programs");
    return ok(row);
  } catch (error: any) {
    console.error(error);
    if (
      error instanceof DrizzleQueryError &&
      error.cause?.message.includes("duplicate")
    ) {
      return fail(
        "Duplicate program instance for same name, start date and location.",
      );
    }
    return fail("An error occurred while creating the record.");
  }
}

const updateNediProgramSchema = createNediProgramSchema.extend(recordRefSchema.shape);
type UpdateNediProgramInput = z.infer<typeof updateNediProgramSchema>;

export async function updateNediProgram(input: UpdateNediProgramInput) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  const parsed = updateNediProgramSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const result = await db
      .update(nediPrograms)
      .set({
        programName: data.programName,
        targetGroup: data.targetGroup,
        beneficiaries: data.beneficiaries,
        serviceType: data.serviceType,
        description: data.description,
        status: data.status,
        location: data.location,
        maleParticipants: data.maleParticipants,
        femaleParticipants: data.femaleParticipants,
        startDate: data.startDate,
        endDate: data.endDate,
        implementingPartner: data.implementingPartner,
        fundingSource: data.fundingSource,
      })
      .where(
        and(
          eq(nediPrograms.id, data.id),
          eq(nediPrograms.version, data.version),
        ),
      )
      .returning();

    if (result.length === 0) {
      return fail("Record not found.");
    }
    revalidatePath("/nedi-programs");
    return ok(result[0]);
  } catch (error: any) {
    console.error(error);
    if (
      error instanceof DrizzleQueryError &&
      error.cause?.message.includes("duplicate")
    ) {
      return fail(
        "Duplicate program instance for same name, start date and location.",
      );
    }
    return fail("An error occurred while updating the record.");
  }
}

export async function deleteNediProgram(input: RecordRef) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  const parsed = recordRefSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const data = parsed.data;

  try {
    const result = await db
      .delete(nediPrograms)
      .where(
        and(
          eq(nediPrograms.id, data.id),
          eq(nediPrograms.version, data.version),
        ),
      )
      .returning();

    if (result.length === 0) {
      return fail("Record not found.");
    }

    revalidatePath("/nedi-programs");
    return ok("Record deleted successfully.");
  } catch (error) {
    console.error(error);
    return fail("An error occurred while deleting the record.");
  }
}

type BulkDeleteNediProgramsInput = RecordRef[];

export async function bulkDeleteNediPrograms(input: BulkDeleteNediProgramsInput) {
  const session = await getEditorSession();
  if (!session) {
    return fail("Unauthorized");
  }

  const parsed = recordRefsSchema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidInput(parsed.error));
  }
  const records = parsed.data;

  try {
    if (!records || records.length === 0) {
      return fail("No records provided for deletion.");
    }

    const result = await db.transaction(async (tx) => {
      let deletedCount = 0;
      for (const record of records) {
        const deleted = await tx
          .delete(nediPrograms)
          .where(and(eq(nediPrograms.id, record.id)))
          .returning({ id: nediPrograms.id });
        if (deleted.length > 0) {
          deletedCount++;
        }
      }
      return deletedCount;
    });

    if (result !== records.length) {
      return ok({
        message:
          "Some records were modified or already deleted. Please refresh and try again.",
        requested: records.length,
        deleted: result,
      });
    }

    revalidatePath("/nedi-programs");
    return ok({
      message: "Records deleted successfully.",
      requested: records.length,
      deleted: result,
    });
  } catch (error) {
    console.error("Bulk delete error:", error);
    return fail(
      "An unexpected error occurred while deleting records. Please try again later.",
    );
  }
}
