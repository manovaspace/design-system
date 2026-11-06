"use client";

import type * as React from "react";
import { forwardRef, useCallback, useId, useState } from "react";

import { persianizeDigits } from "../lib/numeric.js";
import { cn } from "../lib/utils.js";

export type RatingProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "onChange" | "defaultValue"
> & {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  max?: number; // default 5
  precision?: 1 | 0.5; // default 1
  readOnly?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  locale?: string;
  className?: string;
  id?: string;
  "aria-label"?: string;
};

const sizeMap = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/**
 * Star rating component with precision (1 or 0.5), RTL reading order,
 * keyboard accessibility, and full ARIA slider semantics.
 */
export const Rating = forwardRef<HTMLDivElement, RatingProps>(function Rating(
  {
    value,
    defaultValue,
    onChange,
    max = 5,
    precision = 1,
    readOnly = false,
    disabled = false,
    size = "md",
    locale,
    className,
    id,
    "aria-label": ariaLabelProp,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const rootId = id ?? `rating-${generatedId}`;

  const isFa = !locale || locale.toLowerCase().startsWith("fa");
  const isRtl = isFa;

  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<number>(
    defaultValue ?? 0,
  );
  const currentValue = isControlled ? (value ?? 0) : uncontrolledValue;

  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  const displayValue = hoveredValue !== null ? hoveredValue : currentValue;

  const updateValue = useCallback(
    (next: number) => {
      if (readOnly || disabled) return;
      const clamped = Math.max(0, Math.min(max, next));
      if (!isControlled) {
        setUncontrolledValue(clamped);
      }
      onChange?.(clamped);
    },
    [readOnly, disabled, max, isControlled, onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (readOnly || disabled) return;

    const step = precision;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      // In RTL, right arrow moves backward (decreases)
      updateValue(isRtl ? currentValue - step : currentValue + step);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      // In RTL, left arrow moves forward (increases)
      updateValue(isRtl ? currentValue + step : currentValue - step);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      updateValue(currentValue + step);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      updateValue(currentValue - step);
    } else if (e.key === "Home") {
      e.preventDefault();
      updateValue(0);
    } else if (e.key === "End") {
      e.preventDefault();
      updateValue(max);
    }
  };

  const handleMouseMove = (
    starIndex: number,
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (readOnly || disabled) return;
    if (precision === 0.5) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const isFirstHalf = isRtl ? x > rect.width / 2 : x < rect.width / 2;
      setHoveredValue(isFirstHalf ? starIndex - 0.5 : starIndex);
    } else {
      setHoveredValue(starIndex);
    }
  };

  const handleClick = (
    starIndex: number,
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (readOnly || disabled) return;
    let nextValue = starIndex;
    if (precision === 0.5) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const isFirstHalf = isRtl ? x > rect.width / 2 : x < rect.width / 2;
      nextValue = isFirstHalf ? starIndex - 0.5 : starIndex;
    }
    updateValue(nextValue);
  };

  const defaultAriaLabel = isFa ? "امتیاز" : "Rating";
  const ariaLabel = ariaLabelProp ?? defaultAriaLabel;

  const valueText = isFa
    ? `${persianizeDigits(currentValue)} از ${persianizeDigits(max)} ستاره`
    : `${currentValue} of ${max} stars`;

  const starSizeClass = sizeMap[size] ?? sizeMap.md;

  const stars: number[] = [];
  for (let i = 1; i <= max; i++) {
    stars.push(i);
  }

  return (
    <div
      ref={ref}
      id={rootId}
      role="slider"
      dir={isRtl ? "rtl" : "ltr"}
      tabIndex={disabled ? -1 : 0}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={currentValue}
      aria-valuetext={valueText}
      aria-disabled={disabled ? "true" : undefined}
      aria-readonly={readOnly ? "true" : undefined}
      onKeyDown={handleKeyDown}
      onMouseLeave={() => {
        if (!readOnly && !disabled) {
          setHoveredValue(null);
        }
      }}
      data-slot="rating"
      className={cn(
        "inline-flex items-center gap-1 select-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
        disabled && "opacity-50 pointer-events-none cursor-not-allowed",
        readOnly && "cursor-default",
        !readOnly && !disabled && "cursor-pointer",
        className,
      )}
      {...props}
    >
      {stars.map((starIndex) => {
        const isFull = displayValue >= starIndex;
        const isHalf =
          !isFull &&
          displayValue >= starIndex - 0.5 &&
          displayValue < starIndex;
        const state = isFull ? "full" : isHalf ? "half" : "empty";

        return (
          // biome-ignore lint/a11y/noStaticElementInteractions: star clicks map to slider value
          // biome-ignore lint/a11y/useKeyWithClickEvents: slider role on container handles keyboard events
          <div
            key={starIndex}
            data-slot="rating-star"
            data-index={starIndex}
            data-state={state}
            onMouseMove={(e) => handleMouseMove(starIndex, e)}
            onClick={(e) => handleClick(starIndex, e)}
            className={cn(
              "relative inline-flex items-center justify-center shrink-0",
              starSizeClass,
            )}
          >
            {/* Background empty star */}
            <StarIcon
              className={cn(
                starSizeClass,
                "text-muted-foreground/30 fill-muted/20 transition-colors",
              )}
            />

            {/* Foreground filled/half star overlay */}
            <div
              className={cn(
                "absolute top-0 start-0 h-full overflow-hidden pointer-events-none transition-all flex",
                isFull && "w-full",
                isHalf && "w-1/2",
                !isFull && !isHalf && "w-0",
              )}
            >
              <StarIcon
                className={cn(
                  starSizeClass,
                  "shrink-0 max-w-none text-status-warning fill-status-warning",
                )}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
});

Rating.displayName = "Rating";
