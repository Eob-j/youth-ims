"use client";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { useCalculatedTotal } from "@/hooks/use-calculated-total";
import { Input } from "@/components/ui/input";
import type { YouthMigrationFormValues } from "@/lib/validations/youth-migration";
import { Controller, useFormContext } from "react-hook-form";

export function YouthMigrationForm() {
  const { control } = useFormContext<YouthMigrationFormValues>();
  // Total is always male + female (a database rule), so it is calculated
  // rather than typed in.
  useCalculatedTotal<YouthMigrationFormValues>("total", ["male", "female"]);
  return (
    <div className="grid grid-cols-2 gap-4">
      <Controller
        name="year"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="year">Year</FieldLabel>
            <Input {...field} id="year" aria-invalid={fieldState.invalid} />
            {fieldState.error && (
              <FieldError>{fieldState.error.message}</FieldError>
            )}
          </Field>
        )}
      />
      <Controller
        name="total"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="total">Total</FieldLabel>
            <Input
              {...field}
              id="total"
              type="number"
              readOnly
              tabIndex={-1}
              className="bg-muted"
            />
            <FieldDescription>
              * Calculated automatically: Male + Female.
            </FieldDescription>
            {fieldState.error && (
              <FieldError>{fieldState.error.message}</FieldError>
            )}
          </Field>
        )}
      />
      <Controller
        name="male"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="male">Male</FieldLabel>
            <Input
              {...field}
              id="male"
              type="number"
              onChange={(e) => field.onChange(e.target.value)}
            />
            {fieldState.error && (
              <FieldError>{fieldState.error.message}</FieldError>
            )}
          </Field>
        )}
      />
      <Controller
        name="female"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="female">Female</FieldLabel>
            <Input
              {...field}
              id="female"
              type="number"
              onChange={(e) => field.onChange(e.target.value)}
            />
            {fieldState.error && (
              <FieldError>{fieldState.error.message}</FieldError>
            )}
          </Field>
        )}
      />
      <Controller
        name="origin"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="origin">Origin</FieldLabel>
            <Input {...field} id="origin" aria-invalid={fieldState.invalid} />
            {fieldState.error && (
              <FieldError>{fieldState.error.message}</FieldError>
            )}
          </Field>
        )}
      />
      <Controller
        name="destination"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="destination">Destination</FieldLabel>
            <Input
              {...field}
              id="destination"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.error && (
              <FieldError>{fieldState.error.message}</FieldError>
            )}
          </Field>
        )}
      />
    </div>
  );
}
