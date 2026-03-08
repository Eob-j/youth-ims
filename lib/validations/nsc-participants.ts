import z from "zod";
import {
  NSC_CATEGORIES,
  NSC_GENDERS,
  NSC_LEVELS,
  NSC_REGIONS,
  NSC_STATUSES,
} from "@/lib/schema/nsc-participants";

export const nscParticipantSchema = z.object({
  name: z.string().min(2, "Name is required."),
  age: z
    .string()
    .regex(/^\d+$/, "Age must be a valid non-negative number."),
  gender: z.enum(NSC_GENDERS),
  region: z.enum(NSC_REGIONS),
  category: z.enum(NSC_CATEGORIES),
  sport: z.string().min(2, "Sport is required."),
  level: z.enum(NSC_LEVELS),
  status: z.enum(NSC_STATUSES),
  achievements: z.string(),
  dateRegistered: z.string().min(1, "Date registered is required."),
  contact: z.string(),
});

export const nscParticipantImportSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().min(0),
  gender: z.enum(NSC_GENDERS),
  region: z.string().min(1),
  category: z.string().min(1),
  sport: z.string().min(1),
  level: z.string().min(1),
  status: z.enum(NSC_STATUSES),
  achievements: z.string().nullable().optional(),
  dateRegistered: z.string().min(1),
  contact: z.string().nullable().optional(),
});

export type NscParticipantFormValues = z.infer<typeof nscParticipantSchema>;
