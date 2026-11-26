"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { forwardRef } from "react";

import { useDirection } from "../direction-provider.js";
import { ChevronRightIcon } from "../icons.js";
import {
  fieldControlVariants,
  resolveFieldState,
} from "../lib/field-control.js";
import { cn } from "../lib/utils.js";

/** @experimental */
export type PickerTriggerProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "children"
> & {
  id?: string;
  icon?: ReactNode;
  label?: ReactNode;
  placeholder: ReactNode;
  changeLabel?: ReactNode;
  trailingIcon?: ReactNode;
  size?: "default" | "touch";
  disabled?: boolean;
  className?: string;
};

/**
 * Field-styled button trigger for modal/sheet entity or record pickers.
 * @experimental
 */
export const PickerTrigger = forwardRef<HTMLButtonElement, PickerTriggerProps>(
  function PickerTrigger(
    {
      id,
      icon,
      label,
      placeholder,
      changeLabel,
      trailingIcon,
      size = "default",
      disabled,
      className,
      type = "button",
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref,
  ) {
    const direction = useDirection();
    return (
      <button
        {...props}
        ref={ref}
        type={type}
        id={id}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        data-slot="picker-trigger"
        className={cn(
          fieldControlVariants({
            size,
            state: resolveFieldState({
              disabled,
              invalid: ariaInvalid === true || ariaInvalid === "true",
            }),
            adornment: "none",
          }),
          "flex cursor-pointer items-center justify-between gap-2 font-medium hover:border-primary/50",
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {icon ? (
            <span
              className="size-5 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              {icon}
            </span>
          ) : null}
          <span className={cn("truncate", !label && "text-muted-foreground")}>
            {label || placeholder}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
          {changeLabel ? (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {changeLabel}
            </span>
          ) : null}
          {trailingIcon ?? (
            <ChevronRightIcon
              className={cn("size-4", direction === "rtl" && "-scale-x-100")}
              aria-hidden="true"
            />
          )}
        </span>
      </button>
    );
  },
);

PickerTrigger.displayName = "PickerTrigger";
