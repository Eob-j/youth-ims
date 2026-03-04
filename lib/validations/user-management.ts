import z from "zod";

const passwordForm = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // path of error
  });

export const userSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required"),
    role: z.string().min(1, "Role is required"),
  })
  .and(passwordForm);

export type userSchemaType = z.infer<typeof userSchema>;
