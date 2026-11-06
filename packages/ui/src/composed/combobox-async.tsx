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
import { cn } from "../lib/utils.js";
import { Popover, PopoverAnchor, PopoverContent } from "../popover.js";
import { Spinner } from "../spinner.js";
import { type ComboboxOption, normalizeOption } from "./combobox.js";

export type { ComboboxOption };

export type ComboboxAsyncProps = {
  loadOptions: (
    query: string,
    signal: AbortSignal,
  ) => Promise<(ComboboxOption | string)[]>;
  value?: ComboboxOption | string | null;
  onChange?: (option: ComboboxOption | null) => void;
  placeholder?: string;
  minChars?: number; // default 1
  debounce?: number; // default 250ms
  emptyText?: string;
  errorText?: string;
  locale?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  size?: "sm" | "md" | "lg";
  name?: string;
  "data-testid"?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
};

function normalizeOptionOrNull(
  opt?: ComboboxOption | string | null,
): ComboboxOption | null {
  if (!opt) return null;
  if (typeof opt === "string") return { value: opt, label: opt };
  return opt;
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

/**
 * Debounced remote search combobox with in-flight abort cancellation,
 * loading spinner, error state handling, and W3C combobox ARIA semantics.
 */
export const ComboboxAsync = forwardRef<HTMLInputElement, ComboboxAsyncProps>(
  function ComboboxAsync(
    {
      loadOptions,
      value: valueProp,
      onChange,
      placeholder,
      minChars = 1,
      debounce = 250,
      emptyText,
      errorText,
      locale = "fa-IR",
      disabled = false,
      className,
      id: idProp,
      "aria-label": ariaLabel,
      "aria-invalid": ariaInvalid,
      "aria-describedby": ariaDescribedby,
      size = "md",
      name,
      "data-testid": testId,
      onBlur: onBlurProp,
      onFocus: onFocusProp,
    },
    forwardedRef,
  ) {
    const baseId = useId();
    const inputId = idProp ?? `${baseId}-input`;
    const listboxId = `${baseId}-listbox`;

    const isFa = !locale || locale.toLowerCase().startsWith("fa");
    const resolvedPlaceholder = placeholder ?? (isFa ? "جست‌وجو…" : "Search…");
    const resolvedEmptyText =
      emptyText ?? (isFa ? "چیزی پیدا نشد" : "No options found");
    const resolvedErrorText =
      errorText ?? (isFa ? "خطا در بارگذاری اطلاعات" : "Error loading options");
    const resolvedLoadingText = isFa ? "در حال جست‌وجو…" : "Loading…";
    const resolvedMinCharsText =
      minChars > 0
        ? isFa
          ? `حداقل ${minChars} حرف وارد کنید`
          : `Type at least ${minChars} character(s)`
        : resolvedEmptyText;

    const isControlled = valueProp !== undefined;
    const normalizedValueProp = useMemo(
      () => (isControlled ? normalizeOptionOrNull(valueProp) : undefined),
      [isControlled, valueProp],
    );

    const [uncontrolledOption, setUncontrolledOption] =
      useState<ComboboxOption | null>(() => normalizeOptionOrNull(valueProp));
    const selectedOption = isControlled
      ? (normalizedValueProp ?? null)
      : uncontrolledOption;

    const [inputValue, setInputValue] = useState(selectedOption?.label ?? "");
    const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
    const [options, setOptions] = useState<ComboboxOption[]>([]);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const isTypingRef = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useImperativeHandle(
      forwardedRef,
      () => inputRef.current as HTMLInputElement,
    );

    // Sync input value when selectedOption changes externally
    useEffect(() => {
      if (!isTypingRef.current) {
        setInputValue(selectedOption?.label ?? "");
      }
    }, [selectedOption]);

    // Clean up on unmount
    useEffect(() => {
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        abortControllerRef.current?.abort();
      };
    }, []);

    // Debounced remote search
    const triggerSearch = useCallback(
      (query: string) => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        abortControllerRef.current?.abort();

        if (query.trim().length < minChars) {
          setStatus("idle");
          setOptions([]);
          return;
        }

        setStatus("loading");

        timerRef.current = setTimeout(async () => {
          const controller = new AbortController();
          abortControllerRef.current = controller;

          try {
            const results = await loadOptions(query, controller.signal);
            if (!controller.signal.aborted) {
              setOptions(results.map(normalizeOption));
              setStatus("idle");
              setActiveIndex(-1);
            }
          } catch (err: unknown) {
            if (!controller.signal.aborted) {
              if (err instanceof Error && err.name === "AbortError") {
                return;
              }
              setStatus("error");
              setOptions([]);
            }
          }
        }, debounce);
      },
      [loadOptions, minChars, debounce],
    );

    // Auto-scroll highlighted option into view
    useEffect(() => {
      if (open && activeIndex >= 0) {
        const el = document.getElementById(`${baseId}-option-${activeIndex}`);
        el?.scrollIntoView?.({ block: "nearest" });
      }
    }, [open, activeIndex, baseId]);

    const selectOption = useCallback(
      (opt: ComboboxOption) => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        abortControllerRef.current?.abort();

        isTypingRef.current = false;
        if (!isControlled) {
          setUncontrolledOption(opt);
        }
        setInputValue(opt.label);
        setOpen(false);
        setStatus("idle");
        onChange?.(opt);
        inputRef.current?.focus();
      },
      [isControlled, onChange],
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextVal = e.target.value;
      isTypingRef.current = true;
      setInputValue(nextVal);
      setOpen(true);
      setActiveIndex(-1);
      triggerSearch(nextVal);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!open) {
          setOpen(true);
          if (options.length > 0) {
            setActiveIndex(0);
          }
        } else if (options.length > 0) {
          let next = activeIndex;
          for (let i = 1; i <= options.length; i++) {
            const idx = (activeIndex + i) % options.length;
            const item = options[idx];
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
          if (options.length > 0) {
            setActiveIndex(options.length - 1);
          }
        } else if (options.length > 0) {
          let prev = activeIndex;
          for (let i = 1; i <= options.length; i++) {
            const idx = (activeIndex - i + options.length) % options.length;
            const item = options[idx];
            if (item && !item.disabled) {
              prev = idx;
              break;
            }
          }
          setActiveIndex(prev);
        }
      } else if (e.key === "Enter") {
        if (open) {
          e.preventDefault();
          const activeOpt = activeIndex >= 0 ? options[activeIndex] : undefined;
          if (activeOpt && !activeOpt.disabled) {
            selectOption(activeOpt);
          } else if (options.length > 0) {
            const firstEnabled = options.find((o) => !o.disabled);
            if (firstEnabled) {
              selectOption(firstEnabled);
            }
          }
        }
      } else if (e.key === "Escape") {
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
      } else if (e.key === "Tab") {
        setOpen(false);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const related = e.relatedTarget as Node | null;
      if (containerRef.current?.contains(related)) {
        return;
      }

      isTypingRef.current = false;
      if (selectedOption) {
        setInputValue(selectedOption.label);
      } else {
        setInputValue("");
      }

      setOpen(false);
      onBlurProp?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      onFocusProp?.(e);
    };

    const handleClick = () => {
      if (!disabled && !open) {
        setOpen(true);
      }
    };

    const currentSize = sizeStyles[size];

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div ref={containerRef} className="relative w-full">
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
                "w-full rounded-[var(--rounded-field,var(--radius-lg))] border border-[var(--border-line-field,1px)] border-input bg-[var(--bg-field,var(--color-card))] shadow-[var(--shadow-field)] text-foreground placeholder:text-muted-foreground transition-[color,box-shadow] outline-none text-start",
                "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
                "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                currentSize.input,
                className,
              )}
            />
            {status === "loading" ? (
              <div
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 flex items-center justify-center text-muted-foreground pointer-events-none",
                  currentSize.icon,
                )}
              >
                <Spinner
                  size="sm"
                  className="size-full text-muted-foreground"
                  decorative
                />
              </div>
            ) : (
              <button
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                disabled={disabled}
                onClick={() => {
                  if (!disabled) {
                    setOpen((prev) => !prev);
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
            )}
            {name ? (
              <input
                type="hidden"
                name={name}
                value={selectedOption?.value ?? ""}
              />
            ) : null}
          </div>
        </PopoverAnchor>
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
          {status === "loading" ? (
            <div
              className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground select-none"
              role="status"
            >
              <Spinner size="sm" className="size-4" decorative />
              <span>{resolvedLoadingText}</span>
            </div>
          ) : status === "error" ? (
            <div
              className="py-6 text-center text-sm text-destructive select-none"
              role="alert"
            >
              {resolvedErrorText}
            </div>
          ) : options.length === 0 ? (
            <div
              className="py-6 text-center text-sm text-muted-foreground select-none"
              role="presentation"
            >
              {inputValue.trim().length < minChars
                ? resolvedMinCharsText
                : resolvedEmptyText}
            </div>
          ) : (
            options.map((option, flatIndex) => {
              const isSelected = selectedOption?.value === option.value;
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
                      selectOption(option);
                    }
                  }}
                  onMouseEnter={() => {
                    if (!option.disabled) {
                      setActiveIndex(flatIndex);
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
                  <span className="truncate">{option.label}</span>
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
            })
          )}
        </PopoverContent>
      </Popover>
    );
  },
);

ComboboxAsync.displayName = "ComboboxAsync";
