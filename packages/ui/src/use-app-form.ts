"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  type FieldValues,
  type Resolver,
  type UseFormProps,
  type UseFormReturn,
  useForm,
} from "react-hook-form";
import type { z } from "zod";

type ZodResolverParameters = Parameters<typeof zodResolver>;

export interface UseAppFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
> extends UseFormProps<TFieldValues, TContext> {
  schema?: z.ZodType<TFieldValues>;
  schemaOptions?: ZodResolverParameters[1];
  resolverOptions?: ZodResolverParameters[2];
}

export function useAppForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
>(
  props: UseAppFormProps<TFieldValues, TContext> = {},
): UseFormReturn<TFieldValues, TContext> {
  const {
    schema,
    schemaOptions,
    resolverOptions,
    mode = "onSubmit",
    reValidateMode = "onChange",
    criteriaMode = "firstError",
    resolver,
    ...restProps
  } = props;

  const computedResolver: Resolver<TFieldValues, TContext> | undefined =
    resolver ??
    (schema
      ? (zodResolver(
          schema as unknown as ZodResolverParameters[0],
          schemaOptions,
          resolverOptions as NonNullable<ZodResolverParameters[2]>,
        ) as unknown as Resolver<TFieldValues, TContext>)
      : undefined);

  return useForm<TFieldValues, TContext>({
    mode,
    reValidateMode,
    criteriaMode,
    ...(computedResolver ? { resolver: computedResolver } : {}),
    ...restProps,
  });
}
