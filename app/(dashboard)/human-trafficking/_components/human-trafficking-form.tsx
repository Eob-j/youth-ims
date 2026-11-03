import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { useCalculatedTotal } from "@/hooks/use-calculated-total";
import { Input } from "@/components/ui/input";
import { humanTraffickingSchema } from "@/lib/validations/human-trafficking";
import type { HumanTraffickingFormValues } from "@/lib/validations/human-trafficking";
import { Controller, useFormContext } from "react-hook-form";
import z from "zod";

export function HumanTraffickingForm() {
  const { control } = useFormContext<HumanTraffickingFormValues>();
  // Total is always male + female (a database rule), so it is calculated
  // rather than typed in.
  useCalculatedTotal<HumanTraffickingFormValues>("total", ["male", "female"]);
  return (
    <div className="grid grid-cols-2 gap-4">
      <Controller
        name="lga"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="lga">LGA</FieldLabel>
            <Input {...field} id="lga" aria-invalid={fieldState.invalid} />
            {fieldState.error && (
              <FieldError>{fieldState.error.message}</FieldError>
            )}
          </Field>
        )}
      />
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
        name="ageGroup"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="ageGroup">Age Group</FieldLabel>
            <Input {...field} id="ageGroup" aria-invalid={fieldState.invalid} />
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
    </div>
  );
}
