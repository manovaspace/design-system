"use client";

import type * as React from "react";
import { useDirection } from "../direction-provider.js";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons.js";
import { cn } from "../lib/utils.js";

export type BreadcrumbItem = {
  label: React.ReactNode;
  href?: string;
};

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
  "aria-label"?: string;
};

export function Breadcrumb({
  items,
  separator,
  className,
  "aria-label": ariaLabel = "Breadcrumb",
}: BreadcrumbProps) {
  const direction = useDirection();
  const isRtl = direction === "rtl";

  const defaultSeparator = isRtl ? (
    <ChevronLeftIcon className="size-3.5" aria-hidden="true" />
  ) : (
    <ChevronRightIcon className="size-3.5" aria-hidden="true" />
  );

  const activeSeparator = separator ?? defaultSeparator;

  return (
    <nav
      aria-label={ariaLabel}
      dir={isRtl ? "rtl" : "ltr"}
      className={cn("flex items-center", className)}
    >
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground list-none p-0 m-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: breadcrumbs are positionally ordered
              key={index}
              className="inline-flex items-center gap-1.5"
            >
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-medium text-foreground"
                >
                  {item.label}
                </span>
              ) : item.href ? (
                <a
                  href={item.href}
                  className="transition-colors hover:text-foreground underline-offset-4 hover:underline"
                >
                  {item.label}
                </a>
              ) : (
                <span>{item.label}</span>
              )}

              {!isLast && (
                <span
                  aria-hidden="true"
                  className="inline-flex items-center text-muted-foreground/60 select-none"
                >
                  {activeSeparator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
