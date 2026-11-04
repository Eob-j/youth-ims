import z from "zod";

export const passwordForm = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password must be at most 20 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // path of error
  });

export const ROLES = ["admin", "data_entry", "viewer"] as const;

// New users get a generated password, so the form has no password fields.
// Also used by the createUser action to validate its input.
export const userSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Enter a valid email address"),
  role: z.enum(ROLES, { message: "Role is required" }),
});

export type userSchemaType = z.infer<typeof userSchema>;
