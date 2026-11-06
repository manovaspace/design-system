"use client";

import * as React from "react";
import { useCallback, useId, useMemo, useRef, useState } from "react";

import { XMarkIcon } from "../icons.js";
import { persianizeDigits } from "../lib/persian.js";
import { cn } from "../lib/utils.js";

export type TagsInputProps = {
  value?: string[];
  defaultValue?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  max?: number; // counter "۳ / ۵" or "3 / 5"
  separators?: string[]; // default ["،", ","]
  validate?: (tag: string) => string | null; // trim or validate
  locale?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
};

const DEFAULT_SEPARATORS = ["،", ","];

const defaultValidate = (tag: string): string | null => {
  const trimmed = tag.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const TagsInput = React.forwardRef<HTMLInputElement, TagsInputProps>(
  function TagsInput(
    {
      value,
      defaultValue,
      onChange,
      placeholder,
      max,
      separators = DEFAULT_SEPARATORS,
      validate = defaultValidate,
      locale,
      disabled = false,
      className,
      id,
      "aria-label": ariaLabelProp,
    },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? `tags-input-${generatedId}`;

    const [uncontrolledTags, setUncontrolledTags] = useState<string[]>(
      defaultValue ?? [],
    );
    const [inputValue, setInputValue] = useState("");

    const inputRef = useRef<HTMLInputElement>(null);

    const isControlled = value !== undefined;
    const tags = isControlled ? value : uncontrolledTags;

    const isPersian = !locale || locale.toLowerCase().startsWith("fa");

    const splitText = useCallback(
      (text: string) => {
        const escaped = separators
          .map((s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"))
          .concat(["\\n", "\\r"]);
        const regex = new RegExp(`(?:${escaped.join("|")})+`);
        return text.split(regex);
      },
      [separators],
    );

    const addTags = useCallback(
      (candidates: string[]) => {
        if (disabled) return;
        const next = [...tags];
        for (const raw of candidates) {
          const valid = validate(raw);
          if (!valid) continue;
          if (next.includes(valid)) continue;
          if (max !== undefined && next.length >= max) break;
          next.push(valid);
        }
        if (next.length !== tags.length) {
          if (!isControlled) {
            setUncontrolledTags(next);
          }
          onChange?.(next);
        }
      },
      [disabled, tags, validate, max, isControlled, onChange],
    );

    const removeTag = useCallback(
      (index: number) => {
        if (disabled) return;
        const next = tags.filter((_, i) => i !== index);
        if (!isControlled) {
          setUncontrolledTags(next);
        }
        onChange?.(next);
      },
      [disabled, tags, isControlled, onChange],
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;

      if (e.key === "Enter" || separators.includes(e.key)) {
        e.preventDefault();
        if (inputValue) {
          addTags([inputValue]);
          setInputValue("");
        }
        return;
      }

      if (e.key === "Backspace" && inputValue === "") {
        if (tags.length > 0) {
          e.preventDefault();
          removeTag(tags.length - 1);
        }
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const val = e.target.value;

      const hasSeparator = separators.some((sep) => val.includes(sep));
      if (hasSeparator) {
        const pieces = splitText(val);
        const endsWithSep = separators.some((s) => val.endsWith(s));
        if (endsWithSep) {
          addTags(pieces);
          setInputValue("");
        } else {
          const toAdd = pieces.slice(0, -1);
          const remaining = pieces[pieces.length - 1] ?? "";
          addTags(toAdd);
          setInputValue(remaining);
        }
      } else {
        setInputValue(val);
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (disabled) return;
      const pasted = e.clipboardData.getData("text");
      if (!pasted) return;

      const hasSeparator =
        separators.some((s) => pasted.includes(s)) ||
        pasted.includes("\n") ||
        pasted.includes("\r");

      if (hasSeparator) {
        e.preventDefault();
        const pieces = splitText(pasted);
        addTags(pieces);
        setInputValue("");
      }
    };

    const handleContainerClick = () => {
      if (!disabled) {
        inputRef.current?.focus();
      }
    };

    const setRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    const isAtMax = max !== undefined && tags.length >= max;

    const counterText = useMemo(() => {
      if (max === undefined) return null;
      return isPersian
        ? `${persianizeDigits(tags.length)} / ${persianizeDigits(max)}`
        : `${tags.length} / ${max}`;
    }, [max, tags.length, isPersian]);

    const defaultAriaLabel = isPersian ? "برچسب‌ها" : "Tags";
    const ariaLabel = ariaLabelProp ?? defaultAriaLabel;

    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: clicks forward to input
      // biome-ignore lint/a11y/useSemanticElements: tag input container cannot be a fieldset
      <div
        role="group"
        aria-label={ariaLabel}
        onClick={handleContainerClick}
        className={cn(
          "relative flex min-h-10 w-full flex-wrap items-center gap-1.5 ps-2 pe-2 py-1.5 text-sm",
          "rounded-[var(--rounded-field,var(--radius-lg))] border border-[var(--border-line-field,1px)] border-input",
          "bg-[var(--bg-field,var(--color-card))] shadow-[var(--shadow-field)]",
          "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50 pointer-events-none",
          className,
        )}
      >
        {tags.map((tag, index) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-[var(--radius-sm,4px)] bg-muted ps-2 pe-1 py-0.5 text-xs font-medium text-foreground"
          >
            <span className="truncate max-w-[180px]">{tag}</span>
            {!disabled && (
              <button
                type="button"
                tabIndex={-1}
                aria-label={isPersian ? `حذف ${tag}` : `Remove ${tag}`}
                className="inline-flex size-3.5 items-center justify-center rounded-xs text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground focus:outline-none ms-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(index);
                }}
              >
                <XMarkIcon className="size-3" aria-hidden="true" />
              </button>
            )}
          </span>
        ))}
        <input
          ref={setRef}
          id={inputId}
          type="text"
          value={inputValue}
          disabled={disabled}
          placeholder={tags.length === 0 || !isAtMax ? placeholder : undefined}
          aria-label={ariaLabel}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className="flex-1 min-w-[80px] bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed text-start ps-1"
        />
        {counterText && (
          <span
            data-slot="tags-input-counter"
            className="ms-auto shrink-0 select-none text-xs text-muted-foreground self-center pe-1"
          >
            {counterText}
          </span>
        )}
      </div>
    );
  },
);

TagsInput.displayName = "TagsInput";
