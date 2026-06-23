"use client";

import { useReducedMotion as useFramerReducedMotion } from "framer-motion";

/** `prefers-reduced-motion` — false when unset (SSR / no preference). */
export function useReducedMotion() {
  return useFramerReducedMotion() ?? false;
}
