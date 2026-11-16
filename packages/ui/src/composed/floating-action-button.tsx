"use client";

import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from "react";

import { cn } from "../lib/utils.js";

export type FloatingActionButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  /** Accessible name. Used as `aria-label` when collapsed; visible text when `extended`. */
  label: string;
  /** Icon rendered inside the button. The wrapper is `aria-hidden`. */
  icon: ReactNode;
  /** Shows `label` beside the icon as a pill. Default `false` (56px circle). */
  extended?: boolean;
  className?: string;
};

/**
 * Mobile-style floating primary action, fixed to the bottom inline-end corner
 * of the viewport (like a messaging app's "new chat" button).
 *
 * Bottom offset: the button sits at `1rem + safe-area-inset-bottom` plus
 * `--fab-bottom-offset`. Consumers set `--fab-bottom-offset` (for example to the
 * height of a bottom navigation bar) to lift the button above it.
 *
 * Products typically hide it at desktop widths with a `className` such as
 * `lg:hidden` and show a header button instead.
 */
export const FloatingActionButton = forwardRef<
  HTMLButtonElement,
  FloatingActionButtonProps
>(function FloatingActionButton(
  { label, icon, extended = false, className, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      {...props}
      aria-label={extended ? undefined : label}
      data-slot="floating-action-button"
      className={cn(
        "fixed z-40 end-4 bottom-[calc(1rem+env(safe-area-inset-bottom,0px)+var(--fab-bottom-offset,0px))] inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground shadow-lg transition-[transform,box-shadow] hover:bg-primary/90 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 motion-reduce:transition-none",
        extended ? "min-h-14 px-5" : "size-14",
        className,
      )}
    >
      <span aria-hidden="true" className="inline-flex shrink-0 items-center">
        {icon}
      </span>
      {extended ? <span>{label}</span> : null}
    </button>
  );
});
