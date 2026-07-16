import {
  mapToCssBlock,
  tokensToCssVars,
  tokensToDarkCssVars,
} from "./css-vars.js";
import type { OrbitTokens } from "./schema/types.js";

const GENERATED_HEADER =
  "/* AUTO-GENERATED from default.json — do not edit by hand. */\n";

export function tokensToCss(tokens: OrbitTokens): string {
  const rootVars = tokensToCssVars(tokens);
  const darkVars = tokensToDarkCssVars(tokens);

  const rootBlock = mapToCssBlock(":root", rootVars, {
    "color-scheme": "light",
  });
  const darkBlock = mapToCssBlock(".dark", darkVars, {
    "color-scheme": "dark",
  });

  return `${GENERATED_HEADER}${rootBlock}\n\n${darkBlock}\n`;
}

export function tokensToSplitCss(tokens: OrbitTokens): {
  colors: string;
  spacing: string;
  typography: string;
  radiiShadows: string;
  semantic: string;
} {
  const header =
    "/* AUTO-GENERATED from default.json — do not edit by hand. */\n\n";

  const colorLines = [":root {"];
  for (const [family, scale] of Object.entries(tokens.color)) {
    colorLines.push(`  /* ${family} */`);
    for (const [step, value] of Object.entries(scale)) {
      colorLines.push(`  --mnv-${family}-${step}: ${value};`);
    }
  }
  colorLines.push("}");

  const spacingLines = [":root {"];
  for (const [step, value] of Object.entries(tokens.spacing)) {
    spacingLines.push(`  --space-${step}: ${value};`);
  }
  spacingLines.push("}");

  const typoLines = [":root {"];
  for (const [key, value] of Object.entries(tokens.typography.fontFamily)) {
    typoLines.push(`  --font-${key}: ${value};`);
  }
  for (const [key, value] of Object.entries(tokens.typography.fontSize)) {
    typoLines.push(`  --font-size-${key}: ${value};`);
  }
  for (const [key, value] of Object.entries(tokens.typography.lineHeight)) {
    typoLines.push(`  --line-height-${key}: ${value};`);
  }
  typoLines.push("}");

  const radiiLines = [":root {"];
  for (const [key, value] of Object.entries(tokens.radii)) {
    radiiLines.push(`  --radius-${key}: ${value};`);
  }
  for (const [key, value] of Object.entries(tokens.shadow)) {
    radiiLines.push(`  --shadow-${key}: ${value};`);
  }
  radiiLines.push("}");

  const breakpointLines = [":root {"];
  for (const [key, value] of Object.entries(tokens.breakpoint)) {
    breakpointLines.push(`  --breakpoint-${key}: ${value};`);
  }
  breakpointLines.push("}");

  const lightLines = [":root {", "  color-scheme: light;"];
  for (const [key, value] of Object.entries(tokens.semantic.light)) {
    lightLines.push(`  --${key}: ${value};`);
  }
  lightLines.push("}");

  const darkLines = [".dark {", "  color-scheme: dark;"];
  for (const [key, value] of Object.entries(tokens.semantic.dark)) {
    darkLines.push(`  --${key}: ${value};`);
  }
  darkLines.push("}");

  return {
    colors: `${header + colorLines.join("\n")}\n`,
    spacing: `${header + spacingLines.join("\n")}\n`,
    typography: `${header + typoLines.join("\n")}\n`,
    radiiShadows:
      header +
      radiiLines.join("\n") +
      "\n\n" +
      breakpointLines.join("\n") +
      "\n",
    semantic: `${header + lightLines.join("\n")}\n\n${darkLines.join("\n")}\n`,
  };
}
