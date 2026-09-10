/**
 * Debounced search field for Entity Browser. Escape clears and keeps focus.
 * Persian digits on screen; Latin digits in state/URL for consistent API + chips.
 */
"use client";

import type { KeyboardEvent } from "react";
import { Button } from "../../button.js";
import { MagnifyingGlassIcon, XMarkIcon } from "../../icons.js";
import { Input } from "../../input.js";
import { Label } from "../../label.js";
import { persianizeDigits, toLatinDigits } from "../../lib/numeric.js";

export interface EntitySearchFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  onClear: () => void;
  clearLabel: string;
  className?: string;
}

export function EntitySearchField({
  id,
  label,
  placeholder,
  value,
  onValueChange,
  onClear,
  clearLabel,
  className,
}: EntitySearchFieldProps) {
  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape" && value) {
      event.preventDefault();
      onClear();
    }
  }

  return (
    <div
      className={className ?? "min-w-[12rem] flex-1 space-y-1.5 sm:max-w-sm"}
    >
      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>
      <div className="relative">
        <MagnifyingGlassIcon
          aria-hidden
          className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id={id}
          type="text"
          value={persianizeDigits(value)}
          placeholder={placeholder}
          onChange={(event) => onValueChange(toLatinDigits(event.target.value))}
          onKeyDown={onKeyDown}
          className="pe-9 ps-9"
          autoComplete="off"
        />
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onClear}
            className="absolute end-1 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-label={clearLabel}
          >
            <XMarkIcon />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
