#!/usr/bin/env bun
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  resolveBrandTokensFromConfig,
  resolvedBrandTokensToCss,
} from "../src/dtcg/brand-pipeline.js";
import {
  DEFAULT_BRAND_FONT,
  DEFAULT_BRAND_SEEDS,
} from "../src/dtcg/constants.js";
import {
  buildDtcgDefaultDocument,
  dtcgDocumentToLegacyScales,
  dtcgDocumentToOrbitTokensRaw,
} from "../src/dtcg/dtcg-document.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "src");
const cssDir = join(srcDir, "css");

const HEADER =
  "/* AUTO-GENERATED from default.json — do not edit by hand. */\n\n";

// Regenerate src/default.json. The legacy --mnv-* scales and v1 semantic anchors
// are the only inputs read back from the previous file; everything derived
// (HCT palettes, roles, aliases, components, themes) comes from src/dtcg/.
const defaultJsonPath = join(srcDir, "default.json");
const previousDoc = JSON.parse(readFileSync(defaultJsonPath, "utf8"));
const doc = buildDtcgDefaultDocument(dtcgDocumentToLegacyScales(previousDoc));
writeFileSync(defaultJsonPath, `${JSON.stringify(doc, null, 2)}\n`);
// Format like the rest of the repo (biome), so a clean regeneration leaves no diff.
execFileSync("bun", ["x", "biome", "format", "--write", defaultJsonPath], {
  cwd: root,
  stdio: "inherit",
});
const legacyRaw = dtcgDocumentToOrbitTokensRaw(doc);

// Run M3 HCT + WCAG 2.1 verification across all schemes and contrast levels.
const resolvedV2 = resolveBrandTokensFromConfig({
  seed: {
    primary: DEFAULT_BRAND_SEEDS.primary,
    secondary: DEFAULT_BRAND_SEEDS.secondary,
    tertiary: DEFAULT_BRAND_SEEDS.tertiary,
    neutral: DEFAULT_BRAND_SEEDS.neutral,
    error: DEFAULT_BRAND_SEEDS.error,
  },
  font: {
    sans: DEFAULT_BRAND_FONT.sans,
    data: DEFAULT_BRAND_FONT.data,
  },
  shape: "default",
  density: "default",
  motion: "standard",
  contrast: "standard",
});

// Colors CSS: legacy --mnv-* scale + M3 reference HCT tonal palettes
const colorLines = [":root {"];
for (const [family, scale] of Object.entries(legacyRaw.color)) {
  colorLines.push(`  /* ${family} */`);
  for (const [step, value] of Object.entries(scale)) {
    colorLines.push(`  --mnv-${family}-${step}: ${value};`);
  }
}
for (const [family, tones] of Object.entries(resolvedV2.palettes)) {
  const kebab = family.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
  colorLines.push(`  /* md-ref-palette-${kebab} */`);
  for (const [tone, value] of Object.entries(tones)) {
    colorLines.push(`  --md-ref-palette-${kebab}-${tone}: ${value};`);
  }
}
colorLines.push("}");

const spacingLines = [":root {"];
for (const [step, value] of Object.entries(legacyRaw.spacing)) {
  spacingLines.push(`  --space-${step}: ${value};`);
}
spacingLines.push("}");

const typoLines = [":root {"];
for (const [key, value] of Object.entries(legacyRaw.typography.fontFamily)) {
  typoLines.push(`  --font-${key}: ${value};`);
}
for (const [key, value] of Object.entries(legacyRaw.typography.fontSize)) {
  typoLines.push(`  --font-size-${key}: ${value};`);
}
for (const [key, value] of Object.entries(legacyRaw.typography.lineHeight)) {
  typoLines.push(`  --line-height-${key}: ${value};`);
}
typoLines.push("}");

const radiiShadowsLines = [":root {"];
for (const [key, value] of Object.entries(legacyRaw.radii)) {
  radiiShadowsLines.push(`  --radius-${key}: ${value};`);
}
for (const [key, value] of Object.entries(legacyRaw.shadow)) {
  radiiShadowsLines.push(`  --shadow-${key}: ${value};`);
}
radiiShadowsLines.push("}", "", ":root {");
for (const [key, value] of Object.entries(legacyRaw.breakpoint)) {
  radiiShadowsLines.push(`  --breakpoint-${key}: ${value};`);
}
radiiShadowsLines.push("}");

const colorsCss = `${HEADER}${colorLines.join("\n")}\n`;
const spacingCss = `${HEADER}${spacingLines.join("\n")}\n`;
const typographyCss = `${HEADER}${typoLines.join("\n")}\n`;
const radiiShadowsCss = `${HEADER}${radiiShadowsLines.join("\n")}\n`;
const semanticCss = `${HEADER}${resolvedBrandTokensToCss(resolvedV2)}`;

mkdirSync(cssDir, { recursive: true });
writeFileSync(join(cssDir, "colors.css"), colorsCss);
writeFileSync(join(cssDir, "spacing.css"), spacingCss);
writeFileSync(join(cssDir, "typography.css"), typographyCss);
writeFileSync(join(cssDir, "radii-shadows.css"), radiiShadowsCss);
writeFileSync(join(cssDir, "semantic.css"), semanticCss);

const distDir = join(root, "dist");
if (existsSync(distDir)) {
  writeFileSync(join(distDir, "colors.css"), colorsCss);
  writeFileSync(join(distDir, "spacing.css"), spacingCss);
  writeFileSync(join(distDir, "typography.css"), typographyCss);
  writeFileSync(join(distDir, "radii-shadows.css"), radiiShadowsCss);
  writeFileSync(join(distDir, "semantic.css"), semanticCss);
  writeFileSync(
    join(distDir, "default.json"),
    `${JSON.stringify(doc, null, 2)}\n`,
  );
}

const colorEntries = Object.entries(legacyRaw.color)
  .map(([family, scale]) => {
    const steps = Object.entries(scale)
      .map(([step, value]) => `    ${step}: "${value}",`)
      .join("\n");
    return `  ${family}: {\n${steps}\n  },`;
  })
  .join("\n");

writeFileSync(
  join(srcDir, "colors.ts"),
  `/**
 * AUTO-GENERATED from default.json — do not edit by hand.
 */

export const mnvColors = {
${colorEntries}
} as const;

export type MnvColorFamily = keyof typeof mnvColors;
export type MnvColorStep = keyof (typeof mnvColors)["primary"];

export { validateMnvColors } from "./validate-tokens.js";
`,
);

console.log("[@manovaspace/tokens] codegen complete (DTCG 2025.10 + M3 HCT)");
