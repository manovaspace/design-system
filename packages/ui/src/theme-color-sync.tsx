"use client";

import { resolveTokens } from "@manovaspace/tokens";
import { useTheme } from "next-themes";
import { useEffect, useMemo } from "react";

import { useTokens } from "./token-provider.js";

function setThemeColorMeta(content: string): void {
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

export function ThemeColorSync() {
  const { resolvedTheme } = useTheme();
  const { tokens, brand } = useTokens();
  const resolved = useMemo(
    () => (brand ? null : resolveTokens(tokens)),
    [brand, tokens],
  );

  useEffect(() => {
    if (!resolvedTheme) return;

    const scheme = resolvedTheme === "dark" ? "dark" : "light";
    if (brand) {
      const color = brand.schemes[scheme][brand.config.contrast].m3.primary;
      setThemeColorMeta(color);
      return;
    }

    if (!resolved) return;
    const palette =
      scheme === "dark" ? resolved.semantic.dark : resolved.semantic.light;
    const color = palette.primary ?? "hsl(220 84% 53%)";
    setThemeColorMeta(color);
  }, [brand, resolvedTheme, resolved]);

  return null;
}
