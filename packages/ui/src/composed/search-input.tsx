"use client";

import type * as React from "react";
import { forwardRef, useCallback, useRef, useState } from "react";

import { MagnifyingGlassIcon, XMarkIcon } from "../icons.js";
import { Input, type InputProps } from "../input.js";
import { cn } from "../lib/utils.js";

export type SearchInputProps = Omit<InputProps, "startAddon"> & {
  onClear?: () => void;
  locale?: string;
};

/**
 * Composed search input with magnifying glass icon and clear button.
 * Supports dual-mode English/Persian placeholders and bidirectional layout.
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      type = "search",
      value,
      defaultValue,
      onChange,
      onClear,
      placeholder,
      locale,
      dir,
      className,
      endAddon,
      ...props
    },
    ref,
  ) {
    const isControlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState<string>(
      defaultValue != null ? String(defaultValue) : "",
    );

    const currentValue = isControlled
      ? value != null
        ? String(value)
        : ""
      : uncontrolledValue;
    const hasValue = currentValue.length > 0;

    const inputRef = useRef<HTMLInputElement | null>(null);

    const setRefs = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current =
            node;
        }
      },
      [ref],
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setUncontrolledValue(e.target.value);
      }
      onChange?.(e);
    };

    const handleClear = () => {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      if (!isControlled) {
        setUncontrolledValue("");
      }
      onClear?.();
      inputRef.current?.focus();
    };

    const isPersian = Boolean(
      locale?.toLowerCase().startsWith("fa") || dir === "rtl",
    );
    const defaultPlaceholder = isPersian ? "جست‌وجو…" : "Search…";
    const resolvedPlaceholder =
      placeholder !== undefined ? placeholder : defaultPlaceholder;

    const clearButton =
      hasValue && onClear ? (
        <button
          type="button"
          onClick={handleClear}
          aria-label={isPersian ? "پاک کردن جستجو" : "Clear search"}
          className="flex size-5 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
          data-slot="search-input-clear"
        >
          <XMarkIcon className="size-3.5" aria-hidden="true" />
        </button>
      ) : null;

    const resolvedEndAddon =
      clearButton || endAddon ? (
        <div className="flex items-center gap-1.5">
          {clearButton}
          {endAddon}
        </div>
      ) : undefined;

    return (
      <Input
        ref={setRefs}
        type={type}
        dir={dir}
        value={value}
        defaultValue={isControlled ? undefined : defaultValue}
        onChange={handleChange}
        placeholder={resolvedPlaceholder}
        startAddon={
          <MagnifyingGlassIcon
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        }
        endAddon={resolvedEndAddon}
        className={cn(
          "[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
          className,
        )}
        {...props}
      />
    );
  },
);

SearchInput.displayName = "SearchInput";
