"use client";

import type * as React from "react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  CheckIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "../icons.js";
import { foldPersian, persianizeDigits } from "../lib/persian.js";
import { cn } from "../lib/utils.js";
import { Popover, PopoverContent, PopoverTrigger } from "../popover.js";

export type MultiSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type MultiSelectProps = {
  options: (MultiSelectOption | string)[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  searchable?: boolean; // filter box at top of list (default true)
  maxVisible?: number; // chips shown before collapsing into "+N more" (default 3)
  max?: number; // max selections allowed
  emptyText?: string;
  locale?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
};

function normalizeOption(
  option: MultiSelectOption | string,
): MultiSelectOption {
  if (typeof option === "string") {
    return { value: option, label: option, disabled: false };
  }
  return option;
}

export function MultiSelect({
  options,
  value,
  defaultValue,
  onChange,
  placeholder,
  searchable = true,
  maxVisible = 3,
  max,
  emptyText,
  locale,
  disabled = false,
  className,
  id,
  "aria-label": ariaLabelProp,
}: MultiSelectProps) {
  const generatedId = useId();
  const controlId = id ?? `multiselect-${generatedId}`;
  const listboxId = `${controlId}-listbox`;

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [uncontrolledValue, setUncontrolledValue] = useState<string[]>(
    defaultValue ?? [],
  );
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const triggerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isControlled = value !== undefined;
  const selectedValues = isControlled ? value : uncontrolledValue;

  const isPersian = !locale || locale.toLowerCase().startsWith("fa");

  const normalizedOptions = useMemo(
    () => options.map(normalizeOption),
    [options],
  );

  const optionMap = useMemo(() => {
    const map = new Map<string, MultiSelectOption>();
    for (const opt of normalizedOptions) {
      map.set(opt.value, opt);
    }
    return map;
  }, [normalizedOptions]);

  const getOptionLabel = useCallback(
    (val: string) => optionMap.get(val)?.label ?? val,
    [optionMap],
  );

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return normalizedOptions;
    }
    const foldedQuery = foldPersian(searchQuery).toLowerCase();
    return normalizedOptions.filter((opt) => {
      const foldedLabel = foldPersian(opt.label).toLowerCase();
      const foldedValue = foldPersian(opt.value).toLowerCase();
      return (
        foldedLabel.includes(foldedQuery) || foldedValue.includes(foldedQuery)
      );
    });
  }, [normalizedOptions, searchQuery]);

  useEffect(() => {
    if (activeIndex >= filteredOptions.length) {
      setActiveIndex(Math.max(0, filteredOptions.length - 1));
    }
  }, [filteredOptions.length, activeIndex]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (disabled) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearchQuery("");
      setActiveIndex(0);
    }
  };

  const toggleOption = useCallback(
    (optValue: string) => {
      if (disabled) return;
      const opt = optionMap.get(optValue);
      if (opt?.disabled) return;

      const isSelected = selectedValues.includes(optValue);
      let next: string[];
      if (isSelected) {
        next = selectedValues.filter((v) => v !== optValue);
      } else {
        if (max !== undefined && selectedValues.length >= max) {
          return;
        }
        next = [...selectedValues, optValue];
      }
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      onChange?.(next);
    },
    [disabled, optionMap, selectedValues, max, isControlled, onChange],
  );

  const removeOption = useCallback(
    (optValue: string, e?: React.MouseEvent | React.KeyboardEvent) => {
      e?.stopPropagation();
      e?.preventDefault();
      if (disabled) return;
      const next = selectedValues.filter((v) => v !== optValue);
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      onChange?.(next);
    },
    [disabled, selectedValues, isControlled, onChange],
  );

  const moveFocus = useCallback(
    (direction: 1 | -1) => {
      if (filteredOptions.length === 0) return;
      let nextIndex = activeIndex + direction;
      while (nextIndex >= 0 && nextIndex < filteredOptions.length) {
        const opt = filteredOptions[nextIndex];
        if (opt && !opt.disabled) {
          setActiveIndex(nextIndex);
          return;
        }
        nextIndex += direction;
      }
    },
    [filteredOptions, activeIndex],
  );

  const toggleActiveOption = useCallback(() => {
    const activeOpt = filteredOptions[activeIndex];
    if (activeOpt && !activeOpt.disabled) {
      toggleOption(activeOpt.value);
    }
  }, [filteredOptions, activeIndex, toggleOption]);

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!open) {
      if (
        e.key === "Enter" ||
        e.key === " " ||
        e.key === "ArrowDown" ||
        e.key === "ArrowUp"
      ) {
        e.preventDefault();
        setOpen(true);
      }
    } else {
      if (e.key === "Escape") {
        e.preventDefault();
        handleOpenChange(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        moveFocus(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        moveFocus(-1);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleActiveOption();
      } else if (e.key === "Backspace" && selectedValues.length > 0) {
        e.preventDefault();
        const lastVal = selectedValues[selectedValues.length - 1];
        if (lastVal !== undefined) {
          removeOption(lastVal);
        }
      }
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveFocus(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveFocus(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      toggleActiveOption();
    } else if (e.key === " " && searchQuery === "") {
      e.preventDefault();
      toggleActiveOption();
    } else if (e.key === "Backspace" && searchQuery === "") {
      if (selectedValues.length > 0) {
        e.preventDefault();
        const lastVal = selectedValues[selectedValues.length - 1];
        if (lastVal !== undefined) {
          removeOption(lastVal);
        }
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleOpenChange(false);
      triggerRef.current?.focus();
    }
  };

  const visibleCount = Math.max(0, maxVisible);
  const visibleValues = selectedValues.slice(0, visibleCount);
  const excessCount = selectedValues.length - visibleCount;
  const excessLabel =
    excessCount > 0
      ? isPersian
        ? `+${persianizeDigits(excessCount)} مورد دیگر`
        : `+${excessCount} more`
      : null;

  const defaultPlaceholder = isPersian
    ? "انتخاب گزینه‌ها..."
    : "Select options...";
  const placeholderText = placeholder ?? defaultPlaceholder;
  const ariaLabel = ariaLabelProp ?? placeholderText;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div
          ref={triggerRef}
          role="combobox"
          id={controlId}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-disabled={disabled || undefined}
          aria-label={ariaLabel}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleTriggerKeyDown}
          className={cn(
            "flex min-h-10 w-full cursor-pointer items-center justify-between gap-2 ps-3 pe-2 py-1.5 text-start text-sm select-none",
            "rounded-[var(--rounded-field,var(--radius-lg))] border border-[var(--border-line-field,1px)] border-input",
            "bg-[var(--bg-field,var(--color-card))] shadow-[var(--shadow-field)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            disabled && "cursor-not-allowed opacity-50 pointer-events-none",
            className,
          )}
        >
          <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
            {selectedValues.length === 0 ? (
              <span className="text-muted-foreground select-none">
                {placeholderText}
              </span>
            ) : (
              <>
                {visibleValues.map((val) => {
                  const label = getOptionLabel(val);
                  return (
                    <span
                      key={val}
                      className="inline-flex items-center gap-1 rounded-[var(--radius-sm,4px)] bg-muted ps-2 pe-1 py-0.5 text-xs font-medium text-foreground"
                    >
                      <span className="truncate max-w-[150px]">{label}</span>
                      {!disabled && (
                        <button
                          type="button"
                          tabIndex={-1}
                          aria-label={
                            isPersian ? `حذف ${label}` : `Remove ${label}`
                          }
                          className="inline-flex size-3.5 items-center justify-center rounded-xs text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground focus:outline-none ms-0.5"
                          onClick={(e) => removeOption(val, e)}
                        >
                          <XMarkIcon className="size-3" aria-hidden="true" />
                        </button>
                      )}
                    </span>
                  );
                })}
                {excessLabel && (
                  <span
                    data-slot="multiselect-excess"
                    className="inline-flex items-center rounded-[var(--radius-sm,4px)] bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground"
                  >
                    {excessLabel}
                  </span>
                )}
              </>
            )}
          </div>
          <ChevronDownIcon
            className={cn(
              "size-4 shrink-0 text-muted-foreground ms-2 transition-transform duration-200",
              open && "rotate-180",
            )}
            aria-hidden="true"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width,280px)] min-w-[220px] p-1 bg-popover text-popover-foreground shadow-md rounded-[var(--radius-lg)] border border-border"
      >
        {searchable && (
          <div className="flex items-center border-b border-border px-2 py-1.5 mb-1">
            <MagnifyingGlassIcon
              className="size-4 shrink-0 text-muted-foreground me-2"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder={isPersian ? "جستجو..." : "Search..."}
              className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none text-start"
              // biome-ignore lint/a11y/noAutofocus: popover search input expects immediate focus when opened
              autoFocus
            />
          </div>
        )}
        <div
          id={listboxId}
          role="listbox"
          aria-multiselectable="true"
          aria-label={ariaLabel}
          tabIndex={-1}
          aria-activedescendant={
            filteredOptions[activeIndex]
              ? `${controlId}-opt-${activeIndex}`
              : undefined
          }
          className="max-h-60 overflow-y-auto p-0.5 space-y-0.5 outline-none"
          onKeyDown={handleTriggerKeyDown}
        >
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {emptyText ?? (isPersian ? "موردی یافت نشد" : "No options found")}
            </div>
          ) : (
            filteredOptions.map((opt, idx) => {
              const isSelected = selectedValues.includes(opt.value);
              const isMaxReached =
                max !== undefined &&
                selectedValues.length >= max &&
                !isSelected;
              const isOptDisabled = opt.disabled || isMaxReached;

              return (
                // biome-ignore lint/a11y/useKeyWithClickEvents: handled by container
                <div
                  key={opt.value}
                  id={`${controlId}-opt-${idx}`}
                  role="option"
                  tabIndex={-1}
                  aria-selected={isSelected}
                  aria-disabled={isOptDisabled || undefined}
                  data-active={idx === activeIndex}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center justify-between rounded-[var(--radius-sm,4px)] ps-2.5 pe-2 py-1.5 text-sm text-start outline-none transition-colors",
                    idx === activeIndex && "bg-accent text-accent-foreground",
                    isOptDisabled && "cursor-not-allowed opacity-50",
                    !isOptDisabled &&
                      idx !== activeIndex &&
                      "hover:bg-accent/60 hover:text-accent-foreground",
                  )}
                  onClick={() => {
                    if (!isOptDisabled) {
                      toggleOption(opt.value);
                    }
                  }}
                  onMouseEnter={() => {
                    if (!opt.disabled) {
                      setActiveIndex(idx);
                    }
                  }}
                >
                  <span className="truncate">{opt.label}</span>
                  <span
                    className={cn(
                      "ms-2 flex size-4 shrink-0 items-center justify-center text-primary",
                      !isSelected && "opacity-0",
                    )}
                  >
                    <CheckIcon className="size-4" aria-hidden="true" />
                  </span>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
