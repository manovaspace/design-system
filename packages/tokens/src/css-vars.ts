import type { OrbitTokens } from "./schema/types.js";

export function colorVarName(family: string, step: string): string {
  return `--mnv-${family}-${step}`;
}

export function spacingVarName(step: string): string {
  return `--space-${step}`;
}

export function fontFamilyVarName(key: string): string {
  return `--font-${key}`;
}

export function fontSizeVarName(key: string): string {
  return `--font-size-${key}`;
}

export function lineHeightVarName(key: string): string {
  return `--line-height-${key}`;
}

export function radiusVarName(key: string): string {
  return `--radius-${key}`;
}

export function shadowVarName(key: string): string {
  return `--shadow-${key}`;
}

export function breakpointVarName(key: string): string {
  return `--breakpoint-${key}`;
}

export function tokensToCssVars(tokens: OrbitTokens): Map<string, string> {
  const vars = new Map<string, string>();

  for (const [family, scale] of Object.entries(tokens.color)) {
    for (const [step, value] of Object.entries(scale)) {
      vars.set(colorVarName(family, step), value);
    }
  }

  for (const [step, value] of Object.entries(tokens.spacing)) {
    vars.set(spacingVarName(step), value);
  }

  for (const [key, value] of Object.entries(tokens.typography.fontFamily)) {
    vars.set(fontFamilyVarName(key), value);
  }

  for (const [key, value] of Object.entries(tokens.typography.fontSize)) {
    vars.set(fontSizeVarName(key), value);
  }

  for (const [key, value] of Object.entries(tokens.typography.lineHeight)) {
    vars.set(lineHeightVarName(key), value);
  }

  for (const [key, value] of Object.entries(tokens.radii)) {
    vars.set(radiusVarName(key), value);
  }

  for (const [key, value] of Object.entries(tokens.shadow)) {
    vars.set(shadowVarName(key), value);
  }

  for (const [key, value] of Object.entries(tokens.breakpoint)) {
    vars.set(breakpointVarName(key), value);
  }

  for (const [key, value] of Object.entries(tokens.semantic.light)) {
    vars.set(`--${key}`, value);
  }

  return vars;
}

export function tokensToDarkCssVars(tokens: OrbitTokens): Map<string, string> {
  const vars = new Map<string, string>();
  for (const [key, value] of Object.entries(tokens.semantic.dark)) {
    vars.set(`--${key}`, value);
  }
  return vars;
}

export function mapToCssBlock(
  selector: string,
  vars: Map<string, string>,
  extra?: Record<string, string>,
): string {
  const lines: string[] = [];
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      lines.push(`  ${key}: ${value};`);
    }
  }
  for (const [name, value] of vars) {
    lines.push(`  ${name}: ${value};`);
  }
  return `${selector} {\n${lines.join("\n")}\n}`;
}
