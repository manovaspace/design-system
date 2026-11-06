"use client";

import * as React from "react";
import { useDirection } from "../direction-provider.js";
import { cn } from "../lib/utils.js";

export type SegmentedControlOption = {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
};

export type SegmentedControlProps = {
  options: SegmentedControlOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

const sizeClasses = {
  sm: {
    container: "h-8 p-0.5 text-xs rounded-lg gap-0.5",
    option: "h-7 px-2.5 text-xs rounded-md gap-1.5",
    icon: "[&_svg]:size-3.5",
  },
  md: {
    container: "h-9 p-1 text-sm rounded-lg gap-1",
    option: "h-7 px-3 text-sm rounded-md gap-2",
    icon: "[&_svg]:size-4",
  },
  lg: {
    container: "h-11 p-1.5 text-base rounded-xl gap-1.5",
    option: "h-8 px-4 text-sm rounded-md gap-2",
    icon: "[&_svg]:size-4",
  },
} as const;

export function SegmentedControl({
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  size = "md",
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: SegmentedControlProps) {
  const direction = useDirection();
  const isRtl = direction === "rtl";

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = React.useState<string>(() => {
    if (defaultValue !== undefined) return defaultValue;
    const firstEnabled = options.find((opt) => !opt.disabled);
    return firstEnabled ? firstEnabled.value : (options[0]?.value ?? "");
  });

  const selectedValue = isControlled ? controlledValue : internalValue;

  const itemRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  const enabledOptions = options.filter(
    (opt) => !disabled && opt.disabled !== true,
  );

  const selectOption = (val: string) => {
    if (disabled) return;
    const target = options.find((opt) => opt.value === val);
    if (target?.disabled) return;

    if (!isControlled) {
      setInternalValue(val);
    }
    onChange?.(val);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentVal: string,
  ) => {
    if (disabled || enabledOptions.length <= 1) return;

    let delta = 0;
    if (event.key === "ArrowRight") {
      delta = isRtl ? -1 : 1;
    } else if (event.key === "ArrowLeft") {
      delta = isRtl ? 1 : -1;
    } else if (event.key === "ArrowDown") {
      delta = 1;
    } else if (event.key === "ArrowUp") {
      delta = -1;
    } else if (event.key === "Home") {
      event.preventDefault();
      const first = enabledOptions[0];
      if (first) {
        selectOption(first.value);
        itemRefs.current.get(first.value)?.focus();
      }
      return;
    } else if (event.key === "End") {
      event.preventDefault();
      const last = enabledOptions[enabledOptions.length - 1];
      if (last) {
        selectOption(last.value);
        itemRefs.current.get(last.value)?.focus();
      }
      return;
    }

    if (delta !== 0) {
      event.preventDefault();
      const currentIndex = enabledOptions.findIndex(
        (opt) => opt.value === currentVal,
      );
      const effectiveIndex = currentIndex === -1 ? 0 : currentIndex;
      const nextIndex =
        (effectiveIndex + delta + enabledOptions.length) %
        enabledOptions.length;
      const nextOption = enabledOptions[nextIndex];
      if (nextOption) {
        selectOption(nextOption.value);
        itemRefs.current.get(nextOption.value)?.focus();
      }
    }
  };

  const sizeStyle = sizeClasses[size] ?? sizeClasses.md;

  // Compute roving tabindex focusable value
  const hasSelectedEnabled = enabledOptions.some(
    (opt) => opt.value === selectedValue,
  );
  const firstFocusableValue = hasSelectedEnabled
    ? selectedValue
    : enabledOptions[0]?.value;

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      dir={isRtl ? "rtl" : "ltr"}
      className={cn(
        "inline-flex items-center bg-muted text-muted-foreground border border-border/50 select-none",
        sizeStyle.container,
        disabled && "opacity-50 pointer-events-none",
        className,
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === selectedValue;
        const isOptionDisabled = disabled || Boolean(option.disabled);
        const isFocusable =
          !isOptionDisabled && option.value === firstFocusableValue;

        return (
          // biome-ignore lint/a11y/useSemanticElements: ARIA radiogroup button pattern for segmented control
          <button
            key={option.value}
            ref={(node) => {
              if (node) {
                itemRefs.current.set(option.value, node);
              } else {
                itemRefs.current.delete(option.value);
              }
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-disabled={isOptionDisabled || undefined}
            tabIndex={isFocusable ? 0 : -1}
            disabled={isOptionDisabled}
            data-state={isSelected ? "checked" : "unchecked"}
            data-disabled={isOptionDisabled ? "" : undefined}
            onClick={() => selectOption(option.value)}
            onKeyDown={(e) => handleKeyDown(e, option.value)}
            className={cn(
              "relative inline-flex items-center justify-center font-medium whitespace-nowrap transition-all outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 active:[transform:var(--press)]",
              sizeStyle.option,
              sizeStyle.icon,
              isSelected
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40",
              isOptionDisabled &&
                "opacity-50 pointer-events-none cursor-not-allowed",
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
