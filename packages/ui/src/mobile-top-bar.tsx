"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "./lib/utils.js";

export type MobileTopBarProps = {
  start?: ReactNode;
  title: ReactNode;
  end?: ReactNode;
  /** Optional row under the title bar (e.g. search field). */
  below?: ReactNode;
  className?: string;
  contentClassName?: string;
} & Omit<ComponentPropsWithoutRef<"header">, "children" | "title">;

/** Fixed mobile top bar: start | centered title | end, with safe-area. */
export function MobileTopBar({
  start,
  title,
  end,
  below,
  className,
  contentClassName,
  ...props
}: MobileTopBarProps) {
  return (
    <header
      data-slot="mobile-top-bar"
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b border-border bg-background",
        className,
      )}
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
      {...props}
    >
      <div
        className={cn(
          "relative mx-auto flex h-14 w-full max-w-lg items-center px-4",
          contentClassName,
        )}
      >
        <div className="z-10 flex flex-1 items-center justify-start">{start}</div>
        <h1 className="pointer-events-none absolute inset-x-16 text-center text-base font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <div className="z-10 flex flex-1 items-center justify-end">{end}</div>
      </div>
      {below ? (
        <div className="mx-auto w-full max-w-lg px-4 pb-3">{below}</div>
      ) : null}
    </header>
  );
}
