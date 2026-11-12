"use client";

import type { JSX } from "react";
import * as React from "react";
import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { Button } from "../button.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../dialog.js";
import { Input } from "../input.js";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../sheet.js";
import { Spinner } from "../spinner.js";
import { Field } from "./field.js";

export type EditFieldSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  label: string;
  value: string;
  helper?: string;
  maxLength?: number; // default 120
  required?: boolean; // default true
  requiredMessage: string;
  saveFailedMessage: string;
  validate?: (next: string) => string | null;
  onSave: (next: string) => Promise<void>; // rejecting keeps the sheet open
  saveLabel: string;
  cancelLabel: string;
  closeLabel: string;
  inputMode?: "text" | "numeric" | "tel";
  autoComplete?: string;
  dir?: "ltr" | "rtl" | "auto";
};

const SM_MEDIA_QUERY = "(min-width: 640px)";

function subscribe(onStoreChange: () => void) {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return () => {};
  }
  const media = window.matchMedia(SM_MEDIA_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return true;
  }
  return window.matchMedia(SM_MEDIA_QUERY).matches;
}

function useMinSmViewport() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/**
 * Responsive single-field edit sheet.
 * Bottom sheet below `sm`, centred dialog from `sm`.
 * Automatically manages draft state, autofocus, whitespace normalization,
 * submit gating and error recovery.
 */
export function EditFieldSheet({
  open,
  onOpenChange,
  title,
  label,
  value,
  helper,
  maxLength = 120,
  required = true,
  requiredMessage,
  saveFailedMessage,
  validate,
  onSave,
  saveLabel,
  cancelLabel,
  closeLabel,
  inputMode = "text",
  autoComplete,
  dir,
}: EditFieldSheetProps): JSX.Element {
  const isDesktop = useMinSmViewport();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (open) {
      setDraft(value);
      setError(null);
      setIsSaving(false);
    }
  }, [open, value]);

  useLayoutEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const normalizedDraft = draft.trim().replace(/\s+/g, " ");
  const normalizedValue = value.trim().replace(/\s+/g, " ");
  const isUnchanged = normalizedDraft === normalizedValue;
  const isSaveDisabled = isSaving || isUnchanged;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value);
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextValue = draft.trim().replace(/\s+/g, " ");

    if (required && !nextValue) {
      setError(requiredMessage);
      inputRef.current?.focus();
      return;
    }

    if (validate) {
      const validationError = validate(nextValue);
      if (validationError) {
        setError(validationError);
        inputRef.current?.focus();
        return;
      }
    }

    if (nextValue === normalizedValue) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onSave(nextValue);
      setIsSaving(false);
      onOpenChange(false);
    } catch {
      setIsSaving(false);
      setError(saveFailedMessage);
      inputRef.current?.focus();
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field
        label={label}
        htmlFor={inputId}
        hint={helper}
        error={error}
        required={required}
      >
        <Input
          id={inputId}
          ref={inputRef}
          value={draft}
          onChange={handleChange}
          maxLength={maxLength}
          autoComplete={autoComplete}
          inputMode={inputMode}
          dir={dir}
          disabled={isSaving}
          autoFocus
        />
      </Field>

      <div className="flex flex-row items-center justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isSaving}
        >
          {cancelLabel}
        </Button>
        <Button type="submit" disabled={isSaveDisabled}>
          {isSaving ? <Spinner className="size-4 me-2" /> : null}
          {saveLabel}
        </Button>
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader className="p-0 pb-2">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="sr-only">
              {helper || title}
            </DialogDescription>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        closeLabel={closeLabel}
        className="rounded-t-[var(--radius-xl)] pb-[calc(1rem+env(safe-area-inset-bottom,0px))] p-6"
      >
        <SheetHeader className="p-0 pb-2">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription className="sr-only">
            {helper || title}
          </SheetDescription>
        </SheetHeader>
        {formContent}
      </SheetContent>
    </Sheet>
  );
}
