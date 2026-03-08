"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  NYC_ACTIVITY_CATEGORIES,
  NYC_ACTIVITY_FUNDERS,
  NYC_ACTIVITY_REGIONS,
  NYC_ACTIVITY_STATUSES,
} from "@/lib/schema/nyc-activities";
import type { NycActivityFormValues } from "@/lib/validations/nyc-activities";
import { Controller, useFormContext } from "react-hook-form";

export function NycActivitiesForm() {
  const { control } = useFormContext<NycActivityFormValues>();

  return (
    <div className="grid grid-cols-2 gap-4">
      <Controller
        name="activityName"
        control={control}
        render={({ field, fieldState }) => (
          <Field className="col-span-2" data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="activityName">Activity Name</FieldLabel>
            <Input {...field} id="activityName" />
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
                {NYC_ACTIVITY_CATEGORIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                {NYC_ACTIVITY_REGIONS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
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
        name="fundingPartner"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="fundingPartner">Funding Partner</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="fundingPartner">
                <SelectValue placeholder="Select funder" />
              </SelectTrigger>
              <SelectContent>
                {NYC_ACTIVITY_FUNDERS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
          </Field>
        )}
      />

      <Controller
        name="beneficiaries"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="beneficiaries">Total Beneficiaries</FieldLabel>
            <Input {...field} id="beneficiaries" type="number" min={0} />
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
        name="status"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="status">Status</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {NYC_ACTIVITY_STATUSES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
          </Field>
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field, fieldState }) => (
          <Field className="col-span-2" data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea {...field} id="description" rows={3} />
            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
          </Field>
        )}
      />
    </div>
  );
}
