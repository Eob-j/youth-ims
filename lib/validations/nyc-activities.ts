import z from "zod";
import {
  NYC_ACTIVITY_CATEGORIES,
  NYC_ACTIVITY_FUNDERS,
  NYC_ACTIVITY_REGIONS,
  NYC_ACTIVITY_STATUSES,
} from "@/lib/schema/nyc-activities";

const currentYear = new Date().getFullYear();

export const nycActivitySchema = z.object({
  activityName: z.string().min(2, "Activity name is required."),
  category: z.enum(NYC_ACTIVITY_CATEGORIES),
  region: z.enum(NYC_ACTIVITY_REGIONS),
  year: z
    .string()
    .regex(/^\d{4}$/, "Year must be a valid 4-digit number.")
    .refine((value) => Number(value) <= currentYear, {
      message: `Year must be less than or equal to ${currentYear}.`,
    }),
  beneficiaries: z
    .string()
    .regex(/^\d+$/, "Beneficiaries must be a non-negative number."),
  male: z.string().regex(/^\d+$/, "Male participants must be a non-negative number."),
  female: z
    .string()
    .regex(/^\d+$/, "Female participants must be a non-negative number."),
  fundingPartner: z.enum(NYC_ACTIVITY_FUNDERS),
  description: z.string().min(2, "Description is required."),
  status: z.enum(NYC_ACTIVITY_STATUSES),
});

export const nycActivityImportSchema = z.object({
  activityName: z.string().min(1),
  category: z.enum(NYC_ACTIVITY_CATEGORIES),
  region: z.enum(NYC_ACTIVITY_REGIONS),
  year: z.number().int().min(1900).max(currentYear),
  beneficiaries: z.number().int().min(0),
  male: z.number().int().min(0),
  female: z.number().int().min(0),
  fundingPartner: z.enum(NYC_ACTIVITY_FUNDERS),
  description: z.string().min(1),
  status: z.enum(NYC_ACTIVITY_STATUSES),
});

export type NycActivityFormValues = z.infer<typeof nycActivitySchema>;
