import type { ComponentProps } from "react";
import { forwardRef } from "react";

import { cn } from "./lib/utils.js";
import { Input as PrimitiveInput } from "./primitives/input.js";

export type InputProps = Omit<ComponentProps<typeof PrimitiveInput>, "size"> & {
  /**
   * A number is the native HTML `size` attribute (visible character width).
   * `"touch"` is a 44 px tall field for phones; `"default"` (or unset) keeps the 40 px height.
   */
  size?: number | "default" | "touch";
  startAddon?: React.ReactNode;
  endAddon?: React.ReactNode;
  error?: React.ReactNode;
};

/** Public Input — token radius and touch-friendly height, with addon and error support. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type, startAddon, endAddon, error, dir, size, ...props },
  ref,
) {
  const nativeSize = typeof size === "number" ? size : undefined;
  const heightClass = size === "touch" ? "h-11" : "h-10";
  const hasAddon = Boolean(startAddon || endAddon);
  const isInvalid = Boolean(
    error || props["aria-invalid"] === true || props["aria-invalid"] === "true",
  );

  const errorElement = error ? (
    <p
      role="alert"
      data-slot="input-error"
      className="text-xs text-destructive"
    >
      {error}
    </p>
  ) : null;

  if (hasAddon) {
    const addonContainer = (
      <div
        data-slot="input-root"
        dir={dir}
        className={cn(
          heightClass,
          "flex w-full items-center gap-2 rounded-[var(--rounded-field,var(--radius-lg))] border border-[var(--border-line-field,1px)] border-input bg-[var(--bg-field,var(--color-card))] ps-3 pe-3 text-[length:var(--font-size-body)] shadow-[var(--shadow-field)] transition-[color,box-shadow]",
          isInvalid
            ? "border-destructive focus-within:border-destructive focus-within:ring-2 focus-within:ring-destructive/20 dark:focus-within:ring-destructive/40"
            : "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50",
          props.disabled && "opacity-50 pointer-events-none cursor-not-allowed",
          className,
        )}
      >
        {startAddon && (
          <div
            data-slot="input-start-addon"
            className="flex items-center shrink-0 text-muted-foreground"
          >
            {startAddon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          dir={dir}
          data-slot="input"
          aria-invalid={isInvalid ? "true" : undefined}
          disabled={props.disabled}
          size={nativeSize}
          className="h-full w-full min-w-0 bg-transparent border-0 p-0 text-[length:var(--font-size-body)] shadow-none outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:border-0 placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed selection:bg-primary selection:text-primary-foreground"
          {...props}
        />
        {endAddon && (
          <div
            data-slot="input-end-addon"
            className="flex items-center shrink-0 text-muted-foreground"
          >
            {endAddon}
          </div>
        )}
      </div>
    );

    if (error) {
      return (
        <div className="w-full space-y-1.5" dir={dir}>
          {addonContainer}
          {errorElement}
        </div>
      );
    }

    return addonContainer;
  }

  if (error) {
    return (
      <div className="w-full space-y-1.5" data-slot="input-root" dir={dir}>
        <PrimitiveInput
          ref={ref}
          type={type}
          dir={dir}
          aria-invalid="true"
          size={nativeSize}
          className={cn(
            heightClass,
            "rounded-[var(--rounded-field,var(--radius-lg))] border-[var(--border-line-field,1px)] bg-[var(--bg-field,var(--color-card))] shadow-[var(--shadow-field)] ps-3 pe-3 text-[length:var(--font-size-body)]",
            className,
          )}
          {...props}
        />
        {errorElement}
      </div>
    );
  }

  return (
    <PrimitiveInput
      ref={ref}
      type={type}
      dir={dir}
      aria-invalid={props["aria-invalid"]}
      size={nativeSize}
      className={cn(
        heightClass,
        "rounded-[var(--rounded-field,var(--radius-lg))] border-[var(--border-line-field,1px)] bg-[var(--bg-field,var(--color-card))] shadow-[var(--shadow-field)] ps-3 pe-3 text-[length:var(--font-size-body)]",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
