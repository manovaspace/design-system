import { cva, type VariantProps } from "class-variance-authority";

/**
 * Shared CVA recipe for form field controls (Input, Textarea, SelectTrigger,
 * Combobox, DatePicker, WheelDatePicker, AmountInput, PickerTrigger).
 */
export const fieldControlVariants = cva(
  "w-full min-w-0 rounded-[var(--rounded-field,var(--radius-lg))] border-solid border-[length:var(--border-line-field,1px)] border-input bg-[var(--bg-field,var(--color-card))] text-[length:var(--font-size-body)] text-foreground shadow-[shadow:var(--shadow-field)] transition-[color,box-shadow] outline-hidden text-start placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
  {
    variants: {
      size: {
        default: "h-10",
        touch: "h-11",
      },
      state: {
        default:
          "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        invalid:
          "border-destructive focus-visible:border-destructive focus-visible:ring-2 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 focus-within:border-destructive focus-within:ring-2 focus-within:ring-destructive/20 dark:focus-within:ring-destructive/40",
        disabled: "opacity-50 pointer-events-none cursor-not-allowed",
        readonly:
          "bg-muted/50 text-muted-foreground border-border focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 cursor-default",
      },
      adornment: {
        none: "ps-3 pe-3",
        start: "ps-9 pe-3",
        end: "ps-3 pe-9",
        both: "ps-9 pe-9",
      },
    },
    defaultVariants: {
      size: "default",
      state: "default",
      adornment: "none",
    },
  },
);

export type FieldControlVariantProps = VariantProps<
  typeof fieldControlVariants
>;

/**
 * Resolves the canonical visual state for `fieldControlVariants`.
 * Precedence: `disabled` > `invalid` > `readOnly` > `default`.
 */
export function resolveFieldState(opts?: {
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
}): "default" | "invalid" | "disabled" | "readonly" {
  if (opts?.disabled) return "disabled";
  if (opts?.invalid) return "invalid";
  if (opts?.readOnly) return "readonly";
  return "default";
}
