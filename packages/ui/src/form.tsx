"use client";

import type { ComponentProps, ReactNode } from "react";
import type {
  ControllerProps,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";

import {
  Form as PrimitiveForm,
  FormControl as PrimitiveFormControl,
  FormDescription as PrimitiveFormDescription,
  FormField as PrimitiveFormField,
  FormItem as PrimitiveFormItem,
  FormLabel as PrimitiveFormLabel,
  FormMessage as PrimitiveFormMessage,
  useFormField as primitiveUseFormField,
} from "./primitives/form.js";

/** @experimental */
export const useFormField = primitiveUseFormField;

/** @experimental */
export function Form<TFieldValues extends FieldValues>({
  children,
  ...props
}: UseFormReturn<TFieldValues> & { children: ReactNode }) {
  return <PrimitiveForm {...props}>{children}</PrimitiveForm>;
}

/** @experimental */
export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return <PrimitiveFormField {...props} />;
}

/** @experimental */
export function FormItem(props: ComponentProps<typeof PrimitiveFormItem>) {
  return <PrimitiveFormItem {...props} />;
}

/** @experimental */
export function FormLabel(props: ComponentProps<typeof PrimitiveFormLabel>) {
  return <PrimitiveFormLabel {...props} />;
}

/** @experimental */
export function FormControl(
  props: ComponentProps<typeof PrimitiveFormControl>,
) {
  return <PrimitiveFormControl {...props} />;
}

/** @experimental */
export function FormDescription(
  props: ComponentProps<typeof PrimitiveFormDescription>,
) {
  return <PrimitiveFormDescription {...props} />;
}

/** @experimental */
export function FormMessage(
  props: ComponentProps<typeof PrimitiveFormMessage>,
) {
  return <PrimitiveFormMessage {...props} />;
}
