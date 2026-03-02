import z from "zod";
const requiredNumber = (fieldName: string) =>
  z
    .string()
    .min(1, `${fieldName} is required`)
    .refine((val) => !Number.isNaN(val), {
      message: `${fieldName} must be a valid number`,
    })
    .refine((val) => Number(val) >= 0, {
      message: `${fieldName} cannot be negative`,
    });

export const youthWithoutDisabilitiesSchema = z.object({
  ageGroup: z.string().min(1, "Age Group is required"),

  total: requiredNumber("Total"),
  male: requiredNumber("Male"),
  female: requiredNumber("Female"),
  urban: requiredNumber("Urban"),
  rural: requiredNumber("Rural"),
});

export type YouthWithoutDisabilitiesFormValues = z.infer<
  typeof youthWithoutDisabilitiesSchema
>;

// Todo : Add specific validation for each field
