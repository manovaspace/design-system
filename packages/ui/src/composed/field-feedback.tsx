"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";

import { useDirection } from "../direction-provider.js";
import { InformationCircleIcon } from "../icons.js";
import { cn } from "../lib/utils.js";

/** Vertical stack for a label, control, hints, and validation messages. */
export function FieldGroup({ className, ...props }: ComponentProps<"div">) {
  const direction = useDirection();

  return (
    <div
      data-slot="field-group"
      dir={direction}
      className={cn("grid gap-2 text-start", className)}
      {...props}
    />
  );
}

/** Secondary guidance shown below a control (always visible when set). */
export function FieldDescription({ className, ...props }: ComponentProps<"p">) {
  const direction = useDirection();

  return (
    <p
      data-slot="field-description"
      dir={direction}
      className={cn("text-sm text-muted-foreground text-start", className)}
      {...props}
    />
  );
}

const fieldMessageVariants = cva("text-sm", {
  variants: {
    variant: {
      error: "text-destructive",
      warning: "text-amber-700 dark:text-amber-400",
      info: "text-muted-foreground",
      success: "text-primary",
    },
    appearance: {
      inline: "",
      callout:
        "flex items-start gap-2 rounded-[var(--radius-lg)] border px-3 py-2",
    },
  },
  compoundVariants: [
    {
      variant: "error",
      appearance: "callout",
      className: "border-destructive/25 bg-destructive/5",
    },
    {
      variant: "warning",
      appearance: "callout",
      className: "border-amber-500/25 bg-amber-500/10",
    },
    {
      variant: "info",
      appearance: "callout",
      className: "border-border/50 bg-muted/40",
    },
    {
      variant: "success",
      appearance: "callout",
      className: "border-primary/25 bg-primary/5",
    },
  ],
  defaultVariants: {
    variant: "error",
    appearance: "inline",
  },
});

export type FieldMessageProps = ComponentProps<"p"> &
  VariantProps<typeof fieldMessageVariants> & {
    icon?: ReactNode | false;
  };

/**
 * Validation or contextual feedback below a field or at form scope.
 * Use `appearance="callout"` for prominent form-level alerts.
 */
export function FieldMessage({
  variant = "error",
  appearance = "inline",
  icon,
  className,
  children,
  ...props
}: FieldMessageProps) {
  const direction = useDirection();

  if (children == null || children === "") {
    return null;
  }

  const showIcon = icon !== false && appearance === "callout";
  const resolvedIcon =
    icon === undefined ? (
      <InformationCircleIcon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          variant === "error" && "text-destructive",
          variant === "warning" && "text-amber-600",
          variant === "info" && "text-muted-foreground",
          variant === "success" && "text-primary",
        )}
        aria-hidden
      />
    ) : (
      icon
    );

  return (
    <p
      data-slot="field-message"
      data-variant={variant}
      data-appearance={appearance}
      dir={direction}
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      className={cn(
        "text-start",
        fieldMessageVariants({ variant, appearance }),
        className,
      )}
      {...props}
    >
      {showIcon ? resolvedIcon : null}
      <span>{children}</span>
    </p>
  );
}

export { fieldMessageVariants };
