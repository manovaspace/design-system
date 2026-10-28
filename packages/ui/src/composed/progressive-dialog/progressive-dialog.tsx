"use client";

import type * as React from "react";
import { useEffect, useRef, useSyncExternalStore } from "react";

import { Button } from "../../button.js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../dialog.js";
import { XMarkIcon } from "../../icons.js";
import { cn } from "../../lib/utils.js";
import { Progress } from "../../progress.js";
import { Sheet, SheetContent } from "../../sheet.js";
import { Spinner } from "../../spinner.js";

const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";

function subscribe(onStoreChange: () => void) {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return () => {};
  }
  const media = window.matchMedia(DESKTOP_MEDIA_QUERY);
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
  return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
}

/** Server and first paint use the full-screen sheet; desktop switches on mount. */
function useIsDesktop() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export type ProgressiveDialogStep = {
  id: string;
  label: string;
};

/** Every visible string is passed in so the product owns the copy. */
export type ProgressiveDialogLabels = {
  /** Accessible name of the close control. */
  close: string;
  /** Text of the back action. */
  back: string;
  /** Accessible name of the step list and progress bar. */
  steps: string;
};

export type ProgressiveDialogPrimaryAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  /** Shows a spinner and blocks dismissal until the action settles. */
  pending?: boolean;
};

export interface ProgressiveDialogProps {
  open: boolean;
  /**
   * Called for every close request: the close control, Escape and the
   * overlay. The product decides whether to confirm unsaved input. Requests
   * are ignored while the primary action is pending.
   */
  onClose: () => void;
  title: string;
  steps: ProgressiveDialogStep[];
  /** Zero-based index of the current step in `steps`. */
  stepIndex: number;
  /** Back is shown only when this is set and the step is not the first. */
  onBack?: () => void;
  primaryAction: ProgressiveDialogPrimaryAction;
  /** Validation or submit error, announced to assistive technology. */
  error?: string | null;
  labels: ProgressiveDialogLabels;
  children: React.ReactNode;
  className?: string;
}

/**
 * A multi-step dialog: a desktop dialog at md and up, a full-screen sheet
 * below. Each step's content is supplied by the product; focus moves to it
 * when the step changes.
 */
export function ProgressiveDialog({
  open,
  onClose,
  title,
  steps,
  stepIndex,
  onBack,
  primaryAction,
  error,
  labels,
  children,
  className,
}: ProgressiveDialogProps) {
  const isDesktop = useIsDesktop();
  const requestClose = (nextOpen: boolean) => {
    if (!nextOpen && !primaryAction.pending) onClose();
  };
  const content = (
    <ProgressiveDialogFrame
      title={title}
      steps={steps}
      stepIndex={stepIndex}
      onBack={onBack}
      primaryAction={primaryAction}
      error={error}
      labels={labels}
      onClose={() => requestClose(false)}
      className={className}
    >
      {children}
    </ProgressiveDialogFrame>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={requestClose}>
        <DialogContent
          showCloseButton={false}
          className="w-[min(100%,36rem)] gap-0 p-0"
        >
          {content}
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Sheet open={open} onOpenChange={requestClose}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="inset-0 h-dvh max-h-dvh gap-0 border-0 p-0"
      >
        {content}
      </SheetContent>
    </Sheet>
  );
}

type FrameProps = Pick<
  ProgressiveDialogProps,
  | "title"
  | "steps"
  | "stepIndex"
  | "onBack"
  | "primaryAction"
  | "error"
  | "labels"
  | "children"
  | "className"
> & {
  onClose: () => void;
};

/** Header, step progress, content and actions; shared by both presentations. */
function ProgressiveDialogFrame({
  title,
  steps,
  stepIndex,
  onBack,
  primaryAction,
  error,
  labels,
  onClose,
  children,
  className,
}: FrameProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const previousStep = useRef(stepIndex);
  useEffect(() => {
    if (previousStep.current === stepIndex) return;
    previousStep.current = stepIndex;
    contentRef.current?.focus();
  }, [stepIndex]);

  const total = steps.length;
  const progress = total ? ((stepIndex + 1) / total) * 100 : 0;
  const showBack = Boolean(onBack) && stepIndex > 0;

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <DialogHeader className="flex-row items-center justify-between gap-3 border-b border-border px-4 py-3">
        <DialogTitle className="text-base font-semibold text-foreground">
          {title}
        </DialogTitle>
        <Button
          variant="ghost"
          size="icon"
          aria-label={labels.close}
          onClick={onClose}
        >
          <XMarkIcon />
        </Button>
      </DialogHeader>

      <div className="flex flex-col gap-2 px-4 pt-3">
        <Progress value={progress} aria-label={labels.steps} className="h-1" />
        <ol aria-label={labels.steps} className="flex gap-2 text-xs">
          {steps.map((step, index) => {
            const isCurrent = index === stepIndex;
            return (
              <li
                key={step.id}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex-1 truncate",
                  isCurrent
                    ? "font-semibold text-foreground"
                    : index < stepIndex
                      ? "text-foreground"
                      : "text-muted-foreground",
                )}
              >
                {step.label}
              </li>
            );
          })}
        </ol>
      </div>

      <div
        ref={contentRef}
        tabIndex={-1}
        data-slot="progressive-dialog-content"
        className="flex-1 overflow-y-auto px-4 py-4 outline-none"
      >
        {children}
      </div>

      <div className="flex flex-col gap-2 border-t border-border p-4">
        {error ? (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        ) : null}
        <div className="flex items-center gap-2">
          {showBack ? (
            <Button variant="outline" className="flex-1" onClick={onBack}>
              {labels.back}
            </Button>
          ) : null}
          <Button
            className="flex-1"
            aria-busy={primaryAction.pending || undefined}
            disabled={primaryAction.disabled || primaryAction.pending}
            onClick={primaryAction.onClick}
          >
            {primaryAction.pending ? <Spinner size="sm" decorative /> : null}
            {primaryAction.label}
          </Button>
        </div>
      </div>
    </div>
  );
}
