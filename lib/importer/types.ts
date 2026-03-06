import { z } from "zod";

export type ColumnType =
  | "required"
  | "optional"
  | "computed"
  | "computed-if-missing";

export type ColumnDefinition<T = any> = {
  type: ColumnType;
  compute?: (row: any, context?: any) => any;
  transform?: (value: any) => any;
};

export type ImportConfig<T> = {
  schema: z.ZodType<T>;
  table: any;
  columns: Record<string, ColumnDefinition>;
  conflictStrategy?: "error" | "ignore";
};
