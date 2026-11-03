import z from "zod";

// Shared pieces for validating server action input at runtime. TypeScript
// types are not checked when an action is called, so each action parses its
// input with a schema and only uses the parsed result. Unknown fields (such
// as id or version on a create) are dropped.

export const requiredText = z.string().trim().min(1);
export const wholeNumber = z.number().int().min(0);
export const yearNumber = z.number().int().min(1900).max(2100);
export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected a date as YYYY-MM-DD");
// A non-negative decimal sent as text, e.g. an amount or a percentage.
export const decimalText = z
  .string()
  .trim()
  .regex(/^\d+(\.\d+)?$/, "Expected a number");

// The record an edit or delete applies to. Version is used for optimistic
// locking.
export const recordRefSchema = z.object({
  id: z.number().int().positive(),
  version: z.number().int().positive(),
});
export type RecordRef = z.infer<typeof recordRefSchema>;

// Records selected for bulk delete. An empty list is left to each action's
// own "No records provided" check.
export const recordRefsSchema = z.array(recordRefSchema).max(1000);

// A short message for an action's failure result.
export function invalidInput(error: z.ZodError) {
  const issue = error.issues[0];
  if (!issue) return "Invalid input.";
  const field = issue.path.join(".");
  return field
    ? `Invalid ${field}: ${issue.message}`
    : `Invalid input: ${issue.message}`;
}
