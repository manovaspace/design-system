import {
  mapToCssBlock,
  tokensToCssVars,
  tokensToDarkCssVars,
} from "./css-vars.js";
import { resolveTokens } from "./resolve-tokens.js";
import type { OrbitTokens, OrbitTokensRaw } from "./schema/types.js";

const STYLE_ID = "orbit-tokens-runtime";

export type ApplyTokensTarget = HTMLElement | null | undefined;

function runtimeCssFromResolved(tokens: OrbitTokens): string {
  const rootVars = tokensToCssVars(tokens);
  const darkVars = tokensToDarkCssVars(tokens);

  const rootCss = mapToCssBlock(":root", rootVars, {
    "color-scheme": "light",
  });
  const darkCss = mapToCssBlock(".dark", darkVars, {
    "color-scheme": "dark",
  });

  return `${rootCss}\n${darkCss}`;
}

export function tokensToRuntimeCss(raw: OrbitTokensRaw): string {
  return runtimeCssFromResolved(resolveTokens(raw));
}

export function applyTokens(
  raw: OrbitTokensRaw,
  target?: ApplyTokensTarget,
): void {
  if (typeof document === "undefined") return;

  const tokens = resolveTokens(raw);
  const darkVars = tokensToDarkCssVars(tokens);
  const css = runtimeCssFromResolved(tokens);
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;

  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    document.body.insertBefore(style, document.body.firstChild);
  }

  style.textContent = css;
  // ponytail: never re-parent the node — SSR / React may own its mount point

  if (target) {
    for (const [name, value] of darkVars) {
      if (target.classList.contains("dark")) {
        target.style.setProperty(name, value);
      }
    }
  }
}

export function clearAppliedTokens(): void {
  if (typeof document === "undefined") return;
  document.getElementById(STYLE_ID)?.remove();
}
