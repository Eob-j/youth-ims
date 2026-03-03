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

export const humanTraffickingSchema = z.object({
  ageGroup: z.string().min(1, "Age Group is required"),
  year: requiredNumber("Year"),
  total: requiredNumber("Total"),
  male: requiredNumber("Male"),
  female: requiredNumber("Female"),
  lga: z.string().min(1, "LGA is required"),
});

export type HumanTraffickingFormValues = z.infer<typeof humanTraffickingSchema>;

// Todo : Add specific validation for each field
