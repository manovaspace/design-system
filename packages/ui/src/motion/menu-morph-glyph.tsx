"use client";

import { cn } from "../lib/utils.js";

export type MenuMorphGlyphProps = {
  open: boolean;
  className?: string;
};

/** Lightweight hamburger ↔ X icon transition without a runtime animation library. */
export function MenuMorphGlyph({ open, className }: MenuMorphGlyphProps) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
      className={cn("size-5 shrink-0", className)}
    >
      <title>Menu</title>
      <line
        x1={4}
        y1={6}
        x2={20}
        y2={6}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        className={cn(
          "origin-center transition-transform duration-300 ease-in-out motion-reduce:transition-none",
          open && "translate-y-[6px] rotate-45",
        )}
      />
      <line
        x1={4}
        y1={12}
        x2={20}
        y2={12}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        className={cn(
          "transition-opacity duration-200 ease-in-out motion-reduce:transition-none",
          open ? "opacity-0" : "opacity-100",
        )}
      />
      <line
        x1={4}
        y1={18}
        x2={20}
        y2={18}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        className={cn(
          "origin-center transition-transform duration-300 ease-in-out motion-reduce:transition-none",
          open && "-translate-y-[6px] -rotate-45",
        )}
      />
    </svg>
  );
}
