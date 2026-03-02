import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { youthWithoutDisabilitiesSchema } from "@/lib/validations/youth-without-disablilties";
import { Controller, useFormContext } from "react-hook-form";
import z from "zod";
export type YouthWithoutDisabilitiesFormValues = z.infer<
  typeof youthWithoutDisabilitiesSchema
>;

export function YouthWithoutDisabilitiesForm() {
  const { control } = useFormContext<YouthWithoutDisabilitiesFormValues>();
  return (
    <div className="grid grid-cols-2 gap-4">
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
              onChange={(e) => field.onChange(e.target.value)}
            />
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
        name="urban"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="urban">Urban</FieldLabel>
            <Input
              {...field}
              id="urban"
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
        name="rural"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="rural">Rural</FieldLabel>
            <Input
              {...field}
              id="rural"
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
