"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { CheckIcon, ChevronDownIcon } from "../icons.js";
import { isImeComposing } from "../lib/ime.js";
import { foldPersian } from "../lib/persian.js";
import { cn } from "../lib/utils.js";
import { Popover, PopoverAnchor, PopoverContent } from "../popover.js";

export type ComboboxOption = {
  value: string;
  label: string;
  /** Secondary line under the label. Also matched by the search. */
  description?: string;
  disabled?: boolean;
  group?: string;
};

export type ComboboxProps = {
  options: (ComboboxOption | string)[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Button trigger only: placeholder of the search box inside the popover. */
  searchPlaceholder?: string;
  emptyText?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  strict?: boolean; // On blur, if query doesn't match an option, revert to value or clear (input trigger only)
  name?: string; // renders hidden input for standard HTML forms
  locale?: string; // 'fa-IR' | 'en-US'
  /**
   * "input" (default): text input with suggestions in a popover.
   * "button": button showing the selected label; opens a popover with a search box and the same listbox.
   */
  trigger?: "input" | "button";
  className?: string;
  id?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "data-testid"?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLButtonElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement | HTMLButtonElement>;
};

export function normalizeOption(
  option: ComboboxOption | string,
): ComboboxOption {
  if (typeof option === "string") {
    return { value: option, label: option };
  }
  return option;
}

function normalizeSearch(text: string): string {
  return foldPersian(text).toLowerCase();
}

const sizeStyles: Record<"sm" | "md" | "lg", { input: string; icon: string }> =
  {
    sm: {
      input: "h-8 text-xs ps-2.5 pe-7",
      icon: "size-3.5 end-2",
    },
    md: {
      input: "h-9 text-sm ps-3 pe-8",
      icon: "size-4 end-2.5",
    },
    lg: {
      input: "h-11 text-base ps-4 pe-9",
      icon: "size-5 end-3",
    },
  };

const fieldClass =
  "w-full rounded-[var(--rounded-field,var(--radius-lg))] border border-[var(--border-line-field,1px)] border-input bg-[var(--bg-field,var(--color-card))] shadow-[var(--shadow-field)] text-foreground placeholder:text-muted-foreground transition-[color,box-shadow] outline-none text-start";

const fieldStateClass = [
  "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
  "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

const searchClass =
  "mb-1 h-9 w-full rounded-[var(--rounded-field,var(--radius-lg))] border border-[var(--border-line-field,1px)] border-input bg-[var(--bg-field,var(--color-card))] text-sm text-foreground placeholder:text-muted-foreground ps-3 pe-3 text-start outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

type ComboboxGroup = {
  name?: string;
  items: { option: ComboboxOption; flatIndex: number }[];
};

/** Next enabled index from `from` in direction `dir`, wrapping. A `from` of -1 starts at the matching edge. */
function stepEnabledIndex(
  list: ComboboxOption[],
  from: number,
  dir: 1 | -1,
): number {
  const n = list.length;
  if (n === 0) return -1;
  const start = from < 0 ? (dir === 1 ? -1 : n) : from;
  for (let i = 1; i <= n; i++) {
    const idx = (((start + dir * i) % n) + n) % n;
    const item = list[idx];
    if (item && !item.disabled) {
      return idx;
    }
  }
  return from;
}

/** Listbox body shared by both triggers: empty state, groups and options. */
function ComboboxOptionList({
  baseId,
  groups,
  emptyText,
  selectedValue,
  activeIndex,
  onHighlight,
  onSelect,
}: {
  baseId: string;
  groups: ComboboxGroup[];
  emptyText: string;
  selectedValue: string;
  activeIndex: number;
  onHighlight: (flatIndex: number) => void;
  onSelect: (option: ComboboxOption) => void;
}) {
  if (groups.length === 0) {
    return (
      <div
        className="py-6 text-center text-sm text-muted-foreground select-none"
        role="presentation"
      >
        {emptyText}
      </div>
    );
  }

  return (
    <>
      {groups.map((group, groupIdx) => (
        <div key={group.name ?? `group-${groupIdx}`} role="presentation">
          {group.name ? (
            <div
              className="px-2 py-1.5 text-xs font-semibold text-muted-foreground select-none"
              role="presentation"
            >
              {group.name}
            </div>
          ) : null}
          {group.items.map(({ option, flatIndex }) => {
            const isSelected = option.value === selectedValue;
            const isActive = flatIndex === activeIndex;
            return (
              // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard navigation handled by combobox input
              <div
                key={option.value}
                id={`${baseId}-option-${flatIndex}`}
                role="option"
                tabIndex={-1}
                aria-selected={isSelected}
                aria-disabled={option.disabled}
                data-highlighted={isActive ? "" : undefined}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (!option.disabled) {
                    onSelect(option);
                  }
                }}
                onMouseEnter={() => {
                  if (!option.disabled) {
                    onHighlight(flatIndex);
                  }
                }}
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 ps-2.5 pe-8 text-start text-sm outline-none transition-colors",
                  isActive && "bg-accent text-accent-foreground",
                  isSelected && !isActive && "text-foreground font-medium",
                  option.disabled &&
                    "pointer-events-none opacity-50 cursor-not-allowed",
                )}
              >
                {option.description ? (
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate">{option.label}</span>
                    <span className="truncate text-xs text-muted-foreground text-start">
                      {option.description}
                    </span>
                  </span>
                ) : (
                  <span className="truncate">{option.label}</span>
                )}
                {isSelected && (
                  <span
                    className="absolute end-2.5 flex size-4 items-center justify-center text-primary"
                    aria-hidden="true"
                  >
                    <CheckIcon className="size-4" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}

/**
 * Filterable dropdown with input or button trigger.
 * Persian normalization and W3C combobox ARIA semantics in both modes.
 * `trigger="input"` (default) is a text input with live suggestions;
 * `trigger="button"` shows the selection and opens a popover with a search box.
 */
export const Combobox = forwardRef<
  HTMLInputElement | HTMLButtonElement,
  ComboboxProps
>(function Combobox(
  {
    options,
    value: valueProp,
    defaultValue,
    onChange,
    placeholder,
    searchPlaceholder,
    emptyText,
    size = "md",
    disabled = false,
    strict = false,
    name,
    locale = "fa-IR",
    trigger = "input",
    className,
    id: idProp,
    "aria-label": ariaLabel,
    "aria-invalid": ariaInvalid,
    "aria-describedby": ariaDescribedby,
    "data-testid": testId,
    onBlur: onBlurProp,
    onFocus: onFocusProp,
  },
  forwardedRef,
) {
  const baseId = useId();
  const inputId = idProp ?? `${baseId}-input`;
  const listboxId = `${baseId}-listbox`;
  const searchId = `${baseId}-search`;
  const isButton = trigger === "button";

  const isFa = !locale || locale.toLowerCase().startsWith("fa");
  const resolvedPlaceholder = placeholder ?? (isFa ? "جست‌وجو…" : "Search…");
  const resolvedSearchPlaceholder =
    searchPlaceholder ?? (isFa ? "جست‌وجو…" : "Search…");
  const resolvedEmptyText =
    emptyText ?? (isFa ? "چیزی پیدا نشد" : "No options found");

  const normalizedOptions = useMemo(
    () => options.map(normalizeOption),
    [options],
  );

  const isControlled = valueProp !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(
    defaultValue ?? "",
  );
  const selectedValue = isControlled ? (valueProp ?? "") : uncontrolledValue;

  const [inputValue, setInputValue] = useState(() => {
    const match = normalizedOptions.find((opt) => opt.value === selectedValue);
    return match ? match.label : selectedValue;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  useImperativeHandle(
    forwardedRef,
    () =>
      (isButton ? buttonRef.current : inputRef.current) as
        | HTMLInputElement
        | HTMLButtonElement,
  );

  // Keep input label in sync when selectedValue changes externally
  useEffect(() => {
    if (!isFiltering) {
      const matching = normalizedOptions.find(
        (opt) => opt.value === selectedValue,
      );
      setInputValue(matching ? matching.label : selectedValue);
    }
  }, [selectedValue, normalizedOptions, isFiltering]);

  // Filtering: prefix-first, then substring, normalized via foldPersian
  const filteredOptions = useMemo(() => {
    if (!isFiltering) {
      return normalizedOptions;
    }
    const q = normalizeSearch(searchQuery);
    if (!q) {
      return normalizedOptions;
    }

    const prefixMatches: ComboboxOption[] = [];
    const substringMatches: ComboboxOption[] = [];

    for (const option of normalizedOptions) {
      const labelNorm = normalizeSearch(option.label);
      const valueNorm = normalizeSearch(option.value);
      const descriptionNorm = normalizeSearch(option.description ?? "");

      if (
        labelNorm.startsWith(q) ||
        valueNorm.startsWith(q) ||
        descriptionNorm.startsWith(q)
      ) {
        prefixMatches.push(option);
      } else if (
        labelNorm.includes(q) ||
        valueNorm.includes(q) ||
        descriptionNorm.includes(q)
      ) {
        substringMatches.push(option);
      }
    }

    return [...prefixMatches, ...substringMatches];
  }, [normalizedOptions, searchQuery, isFiltering]);

  // Grouping: preserve flat order and flatIndex for navigation
  const groups = useMemo(() => {
    const result: ComboboxGroup[] = [];
    const map = new Map<string | undefined, ComboboxGroup>();

    filteredOptions.forEach((option, flatIndex) => {
      let entry = map.get(option.group);
      if (!entry) {
        entry = { name: option.group, items: [] };
        map.set(option.group, entry);
        result.push(entry);
      }
      entry.items.push({ option, flatIndex });
    });

    return result;
  }, [filteredOptions]);

  // Auto-scroll highlighted option into view
  useEffect(() => {
    if (open && activeIndex >= 0) {
      const el = document.getElementById(`${baseId}-option-${activeIndex}`);
      el?.scrollIntoView?.({ block: "nearest" });
    }
  }, [open, activeIndex, baseId]);

  const selectOption = useCallback(
    (opt: ComboboxOption) => {
      if (!isControlled) {
        setUncontrolledValue(opt.value);
      }
      setInputValue(opt.label);
      setSearchQuery("");
      setIsFiltering(false);
      setOpen(false);
      onChange?.(opt.value);
      (isButton ? buttonRef.current : inputRef.current)?.focus();
    },
    [isControlled, isButton, onChange],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setInputValue(nextVal);
    setSearchQuery(nextVal);
    setIsFiltering(true);
    setActiveIndex(-1);
    if (!open) {
      setOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setIsFiltering(false);
        const selectedIdx = filteredOptions.findIndex(
          (o) => o.value === selectedValue,
        );
        setActiveIndex(Math.max(selectedIdx, 0));
      } else if (filteredOptions.length > 0) {
        let next = activeIndex;
        for (let i = 1; i <= filteredOptions.length; i++) {
          const idx = (activeIndex + i) % filteredOptions.length;
          const item = filteredOptions[idx];
          if (item && !item.disabled) {
            next = idx;
            break;
          }
        }
        setActiveIndex(next);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setIsFiltering(false);
        const selectedIdx = filteredOptions.findIndex(
          (o) => o.value === selectedValue,
        );
        setActiveIndex(
          selectedIdx >= 0 ? selectedIdx : filteredOptions.length - 1,
        );
      } else if (filteredOptions.length > 0) {
        let prev = activeIndex;
        for (let i = 1; i <= filteredOptions.length; i++) {
          const idx =
            (activeIndex - i + filteredOptions.length) % filteredOptions.length;
          const item = filteredOptions[idx];
          if (item && !item.disabled) {
            prev = idx;
            break;
          }
        }
        setActiveIndex(prev);
      }
    } else if (e.key === "Enter" && !isImeComposing(e)) {
      if (open) {
        e.preventDefault();
        const activeOpt =
          activeIndex >= 0 ? filteredOptions[activeIndex] : undefined;
        if (activeOpt && !activeOpt.disabled) {
          selectOption(activeOpt);
        } else if (filteredOptions.length > 0) {
          const q = normalizeSearch(inputValue);
          const exactMatch = filteredOptions.find(
            (o) =>
              !o.disabled &&
              (normalizeSearch(o.label) === q ||
                normalizeSearch(o.value) === q),
          );
          const target = exactMatch ?? filteredOptions.find((o) => !o.disabled);
          if (target) {
            selectOption(target);
          }
        }
      }
    } else if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        setOpen(false);
        setIsFiltering(false);
      }
    } else if (e.key === "Tab") {
      if (open && strict) {
        const activeOpt =
          activeIndex >= 0 ? filteredOptions[activeIndex] : undefined;
        if (activeOpt && !activeOpt.disabled) {
          selectOption(activeOpt);
        } else if (filteredOptions.length > 0) {
          const firstEnabled = filteredOptions.find((o) => !o.disabled);
          if (firstEnabled) {
            selectOption(firstEnabled);
          }
        }
      }
      setOpen(false);
      setIsFiltering(false);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const related = e.relatedTarget as Node | null;
    if (containerRef.current?.contains(related)) {
      return;
    }

    if (strict) {
      const q = normalizeSearch(inputValue);
      const match = normalizedOptions.find(
        (opt) =>
          !opt.disabled &&
          (normalizeSearch(opt.label) === q ||
            normalizeSearch(opt.value) === q),
      );
      if (match) {
        if (!isControlled) {
          setUncontrolledValue(match.value);
        }
        onChange?.(match.value);
        setInputValue(match.label);
      } else {
        // Revert to current selected value or clear
        if (selectedValue) {
          const currentOpt = normalizedOptions.find(
            (opt) => opt.value === selectedValue,
          );
          setInputValue(currentOpt ? currentOpt.label : selectedValue);
        } else {
          setInputValue("");
          if (!isControlled) {
            setUncontrolledValue("");
          }
          onChange?.("");
        }
      }
    }

    setOpen(false);
    setIsFiltering(false);
    onBlurProp?.(e);
  };

  const handleFocus = (
    e: React.FocusEvent<HTMLInputElement | HTMLButtonElement>,
  ) => {
    onFocusProp?.(e);
  };

  const handleClick = () => {
    if (!disabled && !open) {
      setOpen(true);
      setIsFiltering(false);
    }
  };

  // Button trigger: open with the selection highlighted ("select"), or
  // from the first/last enabled option when opened with ArrowDown/ArrowUp.
  const openButtonPopover = (mode: "select" | "first" | "last") => {
    const n = normalizedOptions.length;
    const selectedIdx = normalizedOptions.findIndex(
      (o) => o.value === selectedValue,
    );
    let next = selectedIdx;
    if (mode === "first") {
      next = Math.max(selectedIdx, 0);
    } else if (mode === "last") {
      next = selectedIdx >= 0 ? selectedIdx : n - 1;
    }
    setSearchQuery("");
    setIsFiltering(false);
    setActiveIndex(n === 0 ? -1 : next);
    setOpen(true);
  };

  const resetButtonPopover = () => {
    setOpen(false);
    setSearchQuery("");
    setIsFiltering(false);
    setActiveIndex(-1);
  };

  // Closing from the button (click, Enter, Space, Escape, Tab) returns focus to it.
  const closeButtonPopover = () => {
    resetButtonPopover();
    buttonRef.current?.focus();
  };

  const handleButtonOpenChange = (next: boolean) => {
    if (!next) {
      resetButtonPopover();
    }
  };

  const handleButtonClick = () => {
    if (disabled) return;
    if (open) {
      closeButtonPopover();
    } else {
      openButtonPopover("select");
    }
  };

  const handleButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (
      e.key === "ArrowDown" ||
      e.key === "ArrowUp" ||
      e.key === "Enter" ||
      e.key === " "
    ) {
      e.preventDefault();
      if (open) {
        if (e.key === "Enter" || e.key === " ") {
          closeButtonPopover();
        }
        return;
      }
      if (e.key === "ArrowDown") {
        openButtonPopover("first");
      } else if (e.key === "ArrowUp") {
        openButtonPopover("last");
      } else {
        openButtonPopover("select");
      }
    }
  };

  const handleButtonBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    const related = e.relatedTarget as Node | null;
    const listbox = document.getElementById(listboxId);
    if (
      related &&
      (related === searchRef.current || listbox?.contains(related))
    ) {
      return;
    }
    onBlurProp?.(e);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsFiltering(true);
    setActiveIndex(-1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(
        stepEnabledIndex(
          filteredOptions,
          activeIndex,
          e.key === "ArrowDown" ? 1 : -1,
        ),
      );
    } else if (e.key === "Enter" && !isImeComposing(e)) {
      e.preventDefault();
      const activeOpt =
        activeIndex >= 0 ? filteredOptions[activeIndex] : undefined;
      if (activeOpt && !activeOpt.disabled) {
        selectOption(activeOpt);
        return;
      }
      const q = normalizeSearch(searchQuery);
      if (!q) return;
      const target =
        filteredOptions.find(
          (o) =>
            !o.disabled &&
            (normalizeSearch(o.label) === q || normalizeSearch(o.value) === q),
        ) ?? filteredOptions.find((o) => !o.disabled);
      if (target) {
        selectOption(target);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeButtonPopover();
    } else if (e.key === "Tab") {
      // Keep focus inside the trigger instead of letting Tab leave the portal.
      e.preventDefault();
      closeButtonPopover();
    }
  };

  const currentSize = sizeStyles[size];
  const selectedLabel =
    normalizedOptions.find((opt) => opt.value === selectedValue)?.label ??
    selectedValue;

  const optionList = (
    <ComboboxOptionList
      baseId={baseId}
      groups={groups}
      emptyText={resolvedEmptyText}
      selectedValue={selectedValue}
      activeIndex={activeIndex}
      onHighlight={setActiveIndex}
      onSelect={selectOption}
    />
  );

  return (
    <Popover
      open={open}
      onOpenChange={isButton ? handleButtonOpenChange : setOpen}
    >
      <PopoverAnchor asChild>
        <div ref={containerRef} className="relative w-full">
          {isButton ? (
            <button
              ref={buttonRef}
              type="button"
              id={inputId}
              role="combobox"
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-invalid={ariaInvalid}
              aria-describedby={ariaDescribedby}
              aria-label={ariaLabel}
              disabled={disabled}
              onClick={handleButtonClick}
              onKeyDown={handleButtonKeyDown}
              onFocus={handleFocus}
              onBlur={handleButtonBlur}
              data-testid={testId}
              className={cn(
                fieldClass,
                fieldStateClass,
                "relative flex cursor-pointer items-center",
                currentSize.input,
                className,
              )}
            >
              <span
                className={cn(
                  "min-w-0 flex-1 truncate",
                  !selectedLabel && "text-muted-foreground",
                )}
              >
                {selectedLabel || resolvedPlaceholder}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center justify-center text-muted-foreground",
                  currentSize.icon,
                )}
              >
                <ChevronDownIcon
                  className={cn(
                    "size-full opacity-60 transition-transform duration-200",
                    open && "rotate-180",
                  )}
                />
              </span>
            </button>
          ) : (
            <>
              <input
                ref={inputRef}
                id={inputId}
                role="combobox"
                aria-expanded={open}
                aria-controls={listboxId}
                aria-autocomplete="list"
                aria-haspopup="listbox"
                aria-activedescendant={
                  open && activeIndex >= 0
                    ? `${baseId}-option-${activeIndex}`
                    : undefined
                }
                aria-invalid={ariaInvalid}
                aria-describedby={ariaDescribedby}
                aria-label={ariaLabel}
                disabled={disabled}
                placeholder={resolvedPlaceholder}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onClick={handleClick}
                data-testid={testId}
                className={cn(
                  fieldClass,
                  fieldStateClass,
                  currentSize.input,
                  className,
                )}
              />
              <button
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                disabled={disabled}
                onClick={() => {
                  if (!disabled) {
                    setOpen((prev) => !prev);
                    setIsFiltering(false);
                    inputRef.current?.focus();
                  }
                }}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none",
                  currentSize.icon,
                )}
              >
                <ChevronDownIcon
                  className={cn(
                    "size-full opacity-60 transition-transform duration-200",
                    open && "rotate-180",
                  )}
                />
              </button>
            </>
          )}
          {name ? (
            <input type="hidden" name={name} value={selectedValue} />
          ) : null}
        </div>
      </PopoverAnchor>
      {isButton ? (
        <PopoverContent
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            searchRef.current?.focus();
          }}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            // Clicks on the trigger toggle it; they must not dismiss first.
            if (containerRef.current?.contains(e.target as Node)) {
              e.preventDefault();
            }
          }}
          className="w-[var(--radix-popover-trigger-width)] min-w-[var(--radix-popover-trigger-width)] p-1"
        >
          <input
            ref={searchRef}
            id={searchId}
            type="search"
            autoComplete="off"
            aria-label={resolvedSearchPlaceholder}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              open && activeIndex >= 0
                ? `${baseId}-option-${activeIndex}`
                : undefined
            }
            placeholder={resolvedSearchPlaceholder}
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            className={searchClass}
          />
          <div
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel ?? resolvedPlaceholder}
            className="max-h-60 overflow-y-auto"
          >
            {optionList}
          </div>
        </PopoverContent>
      ) : (
        <PopoverContent
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel ?? resolvedPlaceholder}
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          className="w-[var(--radix-popover-trigger-width)] min-w-[var(--radix-popover-trigger-width)] p-1 max-h-60 overflow-y-auto"
        >
          {optionList}
        </PopoverContent>
      )}
    </Popover>
  );
});

Combobox.displayName = "Combobox";
