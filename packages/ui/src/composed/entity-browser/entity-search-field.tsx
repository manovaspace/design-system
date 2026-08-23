"use client";

import type { KeyboardEvent } from "react";
import { Button } from "../../button";
import { MagnifyingGlassIcon, XMarkIcon } from "../../icons";
import { Input } from "../../input";
import { Label } from "../../label";
import { latinizeDigits } from "../../lib/latin-digits";
import { cn } from "../../lib/utils";

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
      data-slot="entity-search-field"
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
          value={value}
          placeholder={placeholder}
          onChange={(event) =>
            onValueChange(latinizeDigits(event.target.value))
          }
          onKeyDown={onKeyDown}
          className="pe-9 ps-9"
          autoComplete="off"
        />
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="absolute end-1 top-1/2 size-7 -translate-y-1/2 p-0 text-muted-foreground"
            aria-label={clearLabel}
          >
            <XMarkIcon className="size-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
