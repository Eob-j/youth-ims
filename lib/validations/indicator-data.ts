import z from "zod";
import {
  INDICATOR_CATEGORIES,
  INDICATOR_ORGANIZATIONS,
  INDICATOR_REGIONS,
} from "@/lib/schema/indicator-data";

const currentYear = new Date().getFullYear();

export const indicatorDataSchema = z.object({
  organization: z.enum(INDICATOR_ORGANIZATIONS),
  indicator: z.string().min(3, "Indicator is required."),
  year: z
    .string()
    .regex(/^\d{4}$/, "Year must be a valid 4-digit year.")
    .refine((value) => Number(value) <= currentYear, {
      message: `Year must be ${currentYear} or earlier.`,
    })
    .refine((value) => Number(value) >= 1900, {
      message: "Year must be 1900 or later.",
    }),
  region: z.enum(INDICATOR_REGIONS),
  male: z.string().regex(/^\d+$/, "Male must be a valid non-negative number."),
  female: z
    .string()
    .regex(/^\d+$/, "Female must be a valid non-negative number."),
  referenceSource: z.string().min(3, "Reference source is required."),
  category: z.enum(INDICATOR_CATEGORIES),
});

export const indicatorDataImportRowSchema = z.object({
  organization: z.enum(INDICATOR_ORGANIZATIONS),
  indicator: z.string().min(1),
  year: z.number().int().min(1900).max(2100),
  region: z.string().min(1),
  male: z.number().int().min(0),
  female: z.number().int().min(0),
  total: z.number().int().min(0),
  referenceSource: z.string().min(1),
  category: z.enum(INDICATOR_CATEGORIES),
});

export type IndicatorDataFormValues = z.infer<typeof indicatorDataSchema>;
