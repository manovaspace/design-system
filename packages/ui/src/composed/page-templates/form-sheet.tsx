"use client";

import type * as React from "react";

import { Button } from "../../button.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../dialog.js";
import { XMarkIcon } from "../../icons.js";
import { useKeyboardInset } from "../../lib/use-keyboard-inset.js";
import { cn } from "../../lib/utils.js";
import { SheetActions } from "../sheet-actions.js";

/**
 * Primary footer action of a `FormSheet`.
 * @experimental
 */
export type FormSheetAction = {
  label: string;
  onClick?: () => void;
  /** Use `"submit"` with `form` to submit a form in the sheet body. */
  type?: "button" | "submit";
  /** Id of the form a `type: "submit"` action submits. */
  form?: string;
  disabled?: boolean;
  /** Shows a spinner and blocks every close request until it settles. */
  pending?: boolean;
};

/** @experimental */
export type FormSheetProps = {
  /** Whether the sheet is open. */
  open: boolean;
  /** Called for every close request: close button, Escape, overlay, secondary. Ignored while the primary action is pending. */
  onOpenChange: (open: boolean) => void;
  /** Same text as the label of the button that opened the sheet. */
  title: string;
  /** Optional line under the title, read as the sheet's accessible description. */
  description?: string;
  /** Accessible name of the close icon button. */
  closeLabel: string;
  /** Last in the footer. Use `type: "submit"` + `form` to submit a form in `children`. */
  primaryAction: FormSheetAction;
  /** First in the footer, `secondary` variant. Defaults to closing the sheet. */
  secondaryAction: { label: string; onClick?: () => void };
  /** Validation or submit error, rendered above the footer buttons. */
  error?: React.ReactNode;
  /** Form fields and content; the body scrolls, the footer stays pinned. */
  children: React.ReactNode;
  /** Extra classes for the sheet content. */
  className?: string;
};

/**
 * Form sheet: full screen, dialog from md.
 *
 * Usage rules:
 * - `title` equals the label of the button that opened the sheet.
 * - Footer: secondary first, primary last. One primary action.
 * - Submit with `primaryAction.type = "submit"` and `form` set to the id of the form in `children`.
 * - The footer stays above the on-screen keyboard and respects the safe area.
 * - Use ProgressiveDialog for multi-step flows.
 * @experimental
 */
export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  closeLabel,
  primaryAction,
  secondaryAction,
  error,
  children,
  className,
}: FormSheetProps) {
  const pending = Boolean(primaryAction.pending);
  const keyboardInset = useKeyboardInset(open);
  const requestClose = () => {
    if (!pending) onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) onOpenChange(true);
        else requestClose();
      }}
    >
      <DialogContent
        data-slot="form-sheet"
        showCloseButton={false}
        // Radix adds the description id itself when `description` is rendered.
        aria-describedby={undefined}
        style={
          {
            "--form-sheet-keyboard-inset": `${keyboardInset}px`,
          } as React.CSSProperties
        }
        className={cn(
          // Below md: full screen. `translate-*` and `rtl:translate-*` reset the base centring.
          "inset-0 flex h-dvh max-h-dvh w-full max-w-none flex-col gap-0 rounded-none border-0 p-0 translate-x-0 translate-y-0 rtl:translate-x-0 sm:max-w-none max-md:pb-[var(--form-sheet-keyboard-inset,0px)]",
          // From md: centred dialog.
          "md:inset-auto md:start-[50%] md:top-[50%] md:h-auto md:w-[min(100%-2rem,32rem)] md:max-h-[min(85dvh,48rem)] md:translate-x-[-50%] md:translate-y-[-50%] md:rtl:-translate-x-[-50%] md:overflow-hidden md:rounded-[var(--radius-xl)] md:border md:border-border",
          className,
        )}
      >
        <DialogHeader className="flex-row items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1 text-start">
            <DialogTitle className="text-base font-semibold text-foreground">
              {title}
            </DialogTitle>
            {description ? (
              <DialogDescription className="text-sm text-muted-foreground">
                {description}
              </DialogDescription>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon-touch"
            aria-label={closeLabel}
            onClick={requestClose}
          >
            <XMarkIcon />
          </Button>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
          {children}
        </div>

        <SheetActions
          secondary={{
            label: secondaryAction.label,
            onClick: secondaryAction.onClick ?? requestClose,
          }}
          primary={{
            label: primaryAction.label,
            onClick: primaryAction.onClick,
            type: primaryAction.type,
            form: primaryAction.form,
            disabled: primaryAction.disabled,
            pending: primaryAction.pending,
          }}
          error={error}
        />
      </DialogContent>
    </Dialog>
  );
}
