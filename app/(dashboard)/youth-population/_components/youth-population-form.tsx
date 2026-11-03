import type React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCalculatedTotal } from "@/hooks/use-calculated-total";
import { Controller, useFormContext } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import z from "zod";
import { youthPopulationSchema } from "@/lib/validations/youth-population";
export type YouthPopulationFormValues = z.infer<typeof youthPopulationSchema>;

export function YouthPopulationForm() {
  const { control } = useFormContext<YouthPopulationFormValues>();
  // Youth population is always male + female youth, so it is calculated
  // rather than typed in.
  useCalculatedTotal<YouthPopulationFormValues>("youthPopulation", [
    "maleYouth",
    "femaleYouth",
  ]);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* LGA */}
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

      {/* Total Population */}
      <Controller
        name="totalPopulation"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="totalPopulation">Total Population</FieldLabel>
            <Input
              {...field}
              id="totalPopulation"
              type="number"
              onChange={(e) => field.onChange(e.target.value)}
            />
            {fieldState.error && (
              <FieldError>{fieldState.error.message}</FieldError>
            )}
          </Field>
        )}
      />

      {/* Youth Population */}
      <Controller
        name="youthPopulation"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="youthPopulation">Youth Population</FieldLabel>
            <Input
              {...field}
              id="youthPopulation"
              type="number"
              readOnly
              tabIndex={-1}
              className="bg-muted"
            />
            <FieldDescription>
              * Calculated automatically: Male Youth + Female Youth.
            </FieldDescription>
            {fieldState.error && (
              <FieldError>{fieldState.error.message}</FieldError>
            )}
          </Field>
        )}
      />

      {/* Male Youth */}
      <Controller
        name="maleYouth"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="maleYouth">Male Youth</FieldLabel>
            <Input
              {...field}
              id="maleYouth"
              type="number"
              onChange={(e) => field.onChange(e.target.value)}
            />
            {fieldState.error && (
              <FieldError>{fieldState.error.message}</FieldError>
            )}
          </Field>
        )}
      />

      {/* Female Youth */}
      <Controller
        name="femaleYouth"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="femaleYouth">Female Youth</FieldLabel>
            <Input
              {...field}
              id="femaleYouth"
              type="number"
              onChange={(e) => field.onChange(e.target.value)}
            />
            {fieldState.error && (
              <FieldError>{fieldState.error.message}</FieldError>
            )}
          </Field>
        )}
      />

      {/* Urban Youth */}
      <Controller
        name="urbanYouth"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="urbanYouth">Urban Youth</FieldLabel>
            <Input
              {...field}
              id="urbanYouth"
              type="number"
              onChange={(e) => field.onChange(e.target.value)}
            />
            {fieldState.error && (
              <FieldError>{fieldState.error.message}</FieldError>
            )}
          </Field>
        )}
      />

      {/* Rural Youth */}
      <Controller
        name="ruralYouth"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="ruralYouth">Rural Youth</FieldLabel>
            <Input
              {...field}
              id="ruralYouth"
              type="number"
              onChange={(e) => field.onChange(e.target.value)}
            />
            {fieldState.error && (
              <FieldError>{fieldState.error.message}</FieldError>
            )}
          </Field>
        )}
      />

      {/* Year */}
      <Controller
        name="year"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="year">Year</FieldLabel>
            <Input
              {...field}
              id="year"
              type="number"
              onChange={(e) => field.onChange(e.target.value)}
            />
            {fieldState.error && (
              <FieldError>{fieldState.error.message}</FieldError>
            )}
          </Field>
        )}
      />
      {/* Youth Share */}
      <Field>
        <FieldLabel htmlFor="youthShare">Youth Share (%)</FieldLabel>
        <Input disabled />
        <FieldDescription>
          * This value is automatically calculated on the server based on total
          and youth population.
        </FieldDescription>
      </Field>
    </div>
  );
}
