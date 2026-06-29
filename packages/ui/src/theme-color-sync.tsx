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
  const { tokens } = useTokens();
  const resolved = useMemo(() => resolveTokens(tokens), [tokens]);

  useEffect(() => {
    if (!resolvedTheme) return;

    const palette =
      resolvedTheme === "dark"
        ? resolved.semantic.dark
        : resolved.semantic.light;
    const color = palette.primary ?? "hsl(220 84% 53%)";
    setThemeColorMeta(color);
  }, [resolvedTheme, resolved]);

  return null;
}
