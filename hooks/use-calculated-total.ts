import { useEffect } from "react";
import {
  useFormContext,
  useWatch,
  type FieldValues,
  type Path,
  type PathValue,
} from "react-hook-form";

// Keeps a form field equal to the sum of two others, e.g. Total = Male +
// Female, for totals the database requires to match. The field stays empty
// until both values are entered. Values are form strings.
export function useCalculatedTotal<T extends FieldValues>(
  total: Path<T>,
  [first, second]: [Path<T>, Path<T>],
) {
  const { control, setValue, formState } = useFormContext<T>();
  const [a, b] = useWatch({ control, name: [first, second] });

  useEffect(() => {
    const value = a && b ? String(Number(a) + Number(b)) : "";
    setValue(total, value as PathValue<T, Path<T>>, {
      shouldValidate: formState.isSubmitted,
    });
  }, [a, b, total, setValue, formState.isSubmitted]);
}
