import type { ComponentProps } from "react";

import { cn } from "./lib/utils.js";
import { Textarea as PrimitiveTextarea } from "./primitives/textarea.js";

export type TextareaProps = ComponentProps<typeof PrimitiveTextarea>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <PrimitiveTextarea
      className={cn(
        "rounded-[var(--radius-lg)] px-[var(--space-3)] py-[var(--space-2)] text-[length:var(--font-size-body)]",
        className,
      )}
      {...props}
    />
  );
}
