"use client";

import type * as React from "react";
import { useDirection } from "../direction-provider.js";
import { CheckIcon } from "../icons.js";
import { persianizeDigits } from "../lib/numeric.js";
import { cn } from "../lib/utils.js";

export type StepperStep = {
  label: React.ReactNode;
  description?: React.ReactNode;
  optional?: boolean;
};

export type StepperProps = {
  steps: StepperStep[];
  current: number; // 0-indexed active step
  orientation?: "horizontal" | "vertical";
  locale?: string;
  className?: string;
  onStepClick?: (stepIndex: number) => void;
};

export function Stepper({
  steps,
  current,
  orientation = "horizontal",
  locale,
  className,
  onStepClick,
}: StepperProps) {
  const direction = useDirection();
  const isPersian = Boolean(locale?.toLowerCase().startsWith("fa"));
  const isRtl = direction === "rtl" || isPersian;

  const isVertical = orientation === "vertical";

  const formatNumber = (num: number) => {
    return isPersian ? persianizeDigits(num) : String(num);
  };

  const isClickable = typeof onStepClick === "function";

  return (
    <nav
      aria-label="Progress"
      dir={isRtl ? "rtl" : "ltr"}
      className={cn("w-full", className)}
    >
      <ol
        className={cn(
          "w-full list-none p-0 m-0",
          isVertical ? "flex flex-col" : "flex items-center",
        )}
      >
        {steps.map((step, index) => {
          const isCompleted = index < current;
          const isCurrent = index === current;
          const isPending = index > current;
          const isLast = index === steps.length - 1;

          const stepNumber = formatNumber(index + 1);

          const circle = (
            <div
              className={cn(
                "size-8 min-w-8 rounded-full flex items-center justify-center text-sm transition-all select-none",
                isCompleted &&
                  "bg-primary text-primary-foreground shadow-xs font-semibold",
                isCurrent &&
                  "bg-background text-primary border-2 border-primary ring-4 ring-primary/15 font-bold shadow-xs",
                isPending &&
                  "bg-muted text-muted-foreground border border-border font-medium",
              )}
            >
              {isCompleted ? (
                <CheckIcon className="size-4 stroke-[2.5]" aria-hidden="true" />
              ) : (
                <span>{stepNumber}</span>
              )}
            </div>
          );

          const textBlock = (
            <div className="flex flex-col text-start">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "text-sm whitespace-nowrap",
                    isCurrent && "font-semibold text-foreground",
                    isCompleted && "font-medium text-foreground",
                    isPending && "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
                {step.optional && (
                  <span className="text-xs text-muted-foreground select-none">
                    ({isPersian ? "اختیاری" : "Optional"})
                  </span>
                )}
              </div>
              {step.description && (
                <span className="text-xs text-muted-foreground">
                  {step.description}
                </span>
              )}
            </div>
          );

          if (isVertical) {
            return (
              <li
                // biome-ignore lint/suspicious/noArrayIndexKey: stepper steps are positionally indexed
                key={index}
                aria-current={isCurrent ? "step" : undefined}
                className="relative flex gap-3 text-start"
              >
                <div className="flex flex-col items-center">
                  {isClickable ? (
                    <button
                      type="button"
                      onClick={() => onStepClick(index)}
                      className="cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:[transform:var(--press)]"
                      aria-label={`Step ${stepNumber}: ${String(step.label)}`}
                    >
                      {circle}
                    </button>
                  ) : (
                    circle
                  )}
                  {!isLast && (
                    <div
                      data-slot="stepper-connector"
                      className={cn(
                        "w-0.5 flex-1 min-h-6 my-1 transition-colors",
                        isCompleted ? "bg-primary" : "bg-border",
                      )}
                      aria-hidden="true"
                    />
                  )}
                </div>

                <div
                  className={cn(
                    "flex flex-col pt-1",
                    !isLast ? "pb-6" : "pb-1",
                  )}
                >
                  {isClickable ? (
                    <button
                      type="button"
                      onClick={() => onStepClick(index)}
                      className="cursor-pointer text-start rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {textBlock}
                    </button>
                  ) : (
                    textBlock
                  )}
                </div>
              </li>
            );
          }

          // Horizontal orientation
          return (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: stepper steps are positionally indexed
              key={index}
              aria-current={isCurrent ? "step" : undefined}
              className={cn("flex items-center", !isLast && "flex-1")}
            >
              {isClickable ? (
                <button
                  type="button"
                  onClick={() => onStepClick(index)}
                  className="flex items-center gap-2.5 cursor-pointer rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:[transform:var(--press)] text-start"
                  aria-label={`Step ${stepNumber}: ${String(step.label)}`}
                >
                  {circle}
                  {textBlock}
                </button>
              ) : (
                <div className="flex items-center gap-2.5">
                  {circle}
                  {textBlock}
                </div>
              )}

              {!isLast && (
                <div
                  data-slot="stepper-connector"
                  className={cn(
                    "flex-1 h-0.5 mx-3 min-w-6 transition-colors",
                    isCompleted ? "bg-primary" : "bg-border",
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
