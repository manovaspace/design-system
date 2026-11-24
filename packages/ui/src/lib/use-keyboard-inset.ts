"use client";

import { useEffect, useState } from "react";

/**
 * Height in px of the on-screen keyboard, read from `window.visualViewport`.
 * Returns 0 on the server, when `enabled` is false, or when the Visual
 * Viewport API is missing. Updates on the viewport's `resize` and `scroll`.
 *
 * @internal
 */
export function useKeyboardInset(enabled: boolean): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => {
      setInset(
        Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop),
      );
    };
    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, [enabled]);

  return enabled ? inset : 0;
}
