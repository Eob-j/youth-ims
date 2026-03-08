"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  INDICATOR_CATEGORIES,
  INDICATOR_ORGANIZATIONS,
  INDICATOR_REGIONS,
} from "@/lib/schema/indicator-data";
import type { IndicatorDataFormValues } from "@/lib/validations/indicator-data";
import { Controller, useFormContext } from "react-hook-form";

const categoryLabel: Record<string, string> = {
  finance: "Finance Access",
  training: "Training/Skills",
  sport_financing: "Sport Financing",
};

export function IndicatorDataForm() {
  const { control } = useFormContext<IndicatorDataFormValues>();

  return (
    <div className="grid grid-cols-2 gap-4">
      <Controller
        name="organization"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="organization">Organization</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="organization">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {INDICATOR_ORGANIZATIONS.map((organization) => (
                  <SelectItem key={organization} value={organization}>
                    {organization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
          </Field>
        )}
      />
      <Controller
        name="year"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="year">Year</FieldLabel>
            <Input {...field} id="year" type="number" min={1900} max={new Date().getFullYear()} />
            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
          </Field>
        )}
      />
      <Controller
        name="region"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="region">Region</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="region">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {INDICATOR_REGIONS.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
          </Field>
        )}
      />
      <Controller
        name="category"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="category">Category</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {INDICATOR_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {categoryLabel[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
          </Field>
        )}
      />
      <Controller
        name="male"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="male">Male Participants</FieldLabel>
            <Input {...field} id="male" type="number" min={0} />
            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
          </Field>
        )}
      />
      <Controller
        name="female"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="female">Female Participants</FieldLabel>
            <Input {...field} id="female" type="number" min={0} />
            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
          </Field>
        )}
      />
      <Controller
        name="indicator"
        control={control}
        render={({ field, fieldState }) => (
          <Field className="col-span-2" data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="indicator">Indicator Description</FieldLabel>
            <Textarea {...field} id="indicator" rows={2} />
            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
          </Field>
        )}
      />
      <Controller
        name="referenceSource"
        control={control}
        render={({ field, fieldState }) => (
          <Field className="col-span-2" data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="referenceSource">Reference/Source</FieldLabel>
            <Input {...field} id="referenceSource" />
            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
          </Field>
        )}
      />
    </div>
  );
}
