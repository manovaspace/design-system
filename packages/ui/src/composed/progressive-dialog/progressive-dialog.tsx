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
  /**
   * Optional sub-steps inside this step, shown as extra pieces in its bar.
   * Use it when a step pages through several things, such as one page per
   * selected item. Ignored by the default `"bar"` progress.
   */
  parts?: { completed: number; total: number };
};

/**
 * `"bar"` is one bar for the whole wizard. `"segments"` gives every step its
 * own bar, so the sheet reads as a set of stages instead of a single fill.
 */
export type ProgressiveDialogProgress = "bar" | "segments";

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

/** Optional retry shown next to `error`, so the operator can act on it. */
export type ProgressiveDialogErrorAction = {
  label: string;
  onClick: () => void;
  /** Disables the action and marks the error row busy until it settles. */
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
  /** Progress presentation. Defaults to `"bar"`. */
  progress?: ProgressiveDialogProgress;
  /**
   * Identity of what the operator is looking at. Focus and scroll return to the
   * content whenever it changes; defaults to `stepIndex`. Pass a finer key when
   * one step pages through several pieces.
   */
  focusKey?: string | number;
  /** Back is shown only when this is set and the step is not the first. */
  onBack?: () => void;
  primaryAction: ProgressiveDialogPrimaryAction;
  /** Validation or submit error, announced to assistive technology. */
  error?: string | null;
  /**
   * Retry for `error`, rendered inline with the message. It stays visible until
   * the caller clears `error`; the row grows the footer, never the step content.
   */
  errorAction?: ProgressiveDialogErrorAction | null;
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
  progress = "bar",
  focusKey,
  onBack,
  primaryAction,
  error,
  errorAction,
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
      progress={progress}
      focusKey={focusKey ?? stepIndex}
      onBack={onBack}
      primaryAction={primaryAction}
      error={error}
      errorAction={errorAction}
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
  | "progress"
  | "focusKey"
  | "onBack"
  | "primaryAction"
  | "error"
  | "errorAction"
  | "labels"
  | "children"
  | "className"
> & {
  onClose: () => void;
};

/** At most this many pieces per step, so a long page list stays readable. */
const MAX_PARTS = 8;

/**
 * `done` is neutral and muted-foreground at 70% measures 3.6:1 on the light
 * dialog background and 4.7:1 on the dark one. `current` stays brand primary.
 * `todo` is the same neutral at 25%, a track that is visibly lighter than
 * `done` in both themes. Every part of a step carries its step's state.
 */
type StepState = "done" | "current" | "todo";

/** One step's bar; `parts` splits it into the pages inside that step. */
function StepBar({
  step,
  done,
  current,
}: {
  step: ProgressiveDialogStep;
  done: boolean;
  current: boolean;
}) {
  const total = Math.max(1, step.parts?.total ?? 1);
  const completed = done
    ? total
    : Math.min(total, Math.max(0, step.parts?.completed ?? (current ? 1 : 0)));
  const cells = Array.from(
    { length: Math.min(total, MAX_PARTS) },
    (_, position) => position,
  );
  const filled =
    total <= MAX_PARTS
      ? completed
      : Math.round((completed / total) * cells.length);
  const state: StepState = done ? "done" : current ? "current" : "todo";

  return (
    <span
      data-slot="progressive-dialog-step-bar"
      data-state={state}
      className="flex gap-0.5"
      aria-hidden="true"
    >
      {cells.map((position) => (
        <span
          key={`part-${position}`}
          data-slot="progressive-dialog-step-part"
          data-state={state}
          data-filled={position < filled ? "true" : "false"}
          className={cn(
            "h-1 flex-1 rounded-full",
            state === "done" && "bg-muted-foreground/70",
            state === "current" &&
              (position < filled ? "bg-primary" : "bg-primary/20"),
            state === "todo" && "bg-muted-foreground/25",
          )}
        />
      ))}
    </span>
  );
}

/** Header, step progress, content and actions; shared by both presentations. */
function ProgressiveDialogFrame({
  title,
  steps,
  stepIndex,
  progress = "bar",
  focusKey,
  onBack,
  primaryAction,
  error,
  errorAction,
  labels,
  onClose,
  children,
  className,
}: FrameProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const previousKey = useRef(focusKey);
  useEffect(() => {
    if (previousKey.current === focusKey) return;
    previousKey.current = focusKey;
    const content = contentRef.current;
    if (!content) return;
    content.focus();
    if (typeof content.scrollTo === "function") content.scrollTo({ top: 0 });
  }, [focusKey]);

  const total = steps.length;
  const percentage = total ? ((stepIndex + 1) / total) * 100 : 0;
  const showBack = Boolean(onBack) && stepIndex > 0;
  const segmented = progress === "segments";

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

      {segmented ? (
        <ol
          aria-label={labels.steps}
          data-slot="progressive-dialog-progress"
          data-progress="segments"
          className="flex gap-2 px-4 pt-3"
        >
          {steps.map((step, index) => {
            const isCurrent = index === stepIndex;
            return (
              <li
                key={step.id}
                aria-current={isCurrent ? "step" : undefined}
                className="flex min-w-0 flex-1 flex-col gap-1.5"
              >
                <StepBar
                  step={step}
                  done={index < stepIndex}
                  current={isCurrent}
                />
                <span
                  className={cn(
                    "truncate text-xs",
                    isCurrent
                      ? "font-semibold text-foreground"
                      : index < stepIndex
                        ? "text-foreground"
                        : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="flex flex-col gap-2 px-4 pt-3">
          <Progress
            value={percentage}
            aria-label={labels.steps}
            className="h-1"
          />
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
      )}

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
          <div
            role="alert"
            aria-busy={errorAction?.pending || undefined}
            data-slot="progressive-dialog-error"
            className="flex w-full items-start justify-between gap-3"
          >
            <p className="min-w-0 flex-1 text-sm font-medium text-destructive">
              {error}
            </p>
            {errorAction ? (
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                disabled={errorAction.pending}
                onClick={errorAction.onClick}
              >
                {errorAction.label}
              </Button>
            ) : null}
          </div>
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
