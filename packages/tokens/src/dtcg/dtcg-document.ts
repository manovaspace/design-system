import {
  BRAND_ANCHORS,
  COLOR_FAMILIES,
  COLOR_STEPS,
  type OrbitTokensRaw,
} from "../schema/types.js";
import { resolveBrandTokensFromConfig } from "./brand-pipeline.js";
import {
  CONTRAST_LEVELS,
  DEFAULT_BRAND_FONT,
  DEFAULT_BRAND_SEEDS,
  M3_TONES,
} from "./constants.js";
import { dtcgColorToHex, hexToDtcgColor } from "./hct-palette.js";
import {
  buildShadcnAliasCssVars,
  m3RolesToCssVars,
} from "./m3-to-shadcn-aliases.js";
import { scaleTokensToCssVars } from "./scale-tokens.js";
import { M3_STATE_LAYER_OPACITIES } from "./state-layers.js";
import type {
  BrandTokensConfig,
  DtcgDocument,
  DtcgGroup,
  DtcgToken,
  M3ColorRoles,
} from "./types.js";

function colorToken(hex: string, description?: string): DtcgToken {
  return {
    $value: hexToDtcgColor(hex),
    $type: "color",
    ...(description ? { $description: description } : {}),
  };
}

function refToken(
  refPath: string,
  type: DtcgToken["$type"],
  description?: string,
): DtcgToken<string> {
  return {
    $value: `{${refPath}}`,
    ...(type ? { $type: type } : {}),
    ...(description ? { $description: description } : {}),
  };
}

function isTokenLeaf(value: unknown): value is DtcgToken {
  return typeof value === "object" && value !== null && "$value" in value;
}

function readTokenValue(value: unknown): unknown {
  return isTokenLeaf(value) ? value.$value : value;
}

function buildDtcgM3ColorGroup(m3: M3ColorRoles): DtcgGroup {
  const group: DtcgGroup = {
    $type: "color",
    $description: "Material 3 canonical system color roles derived via HCT.",
  };
  for (const [role, hex] of Object.entries(m3)) {
    group[role] = colorToken(hex);
  }
  return group;
}

export type LegacyBaseScales = {
  color: Record<string, Record<string, string>>;
  spacing: Record<string, string>;
  typography: {
    fontFamily: Record<string, string>;
    fontSize: Record<string, string>;
    lineHeight: Record<string, string>;
  };
  radii: Record<string, string>;
  shadow: Record<string, string>;
  breakpoint: Record<string, string>;
  v1SemanticLight: Record<string, string>;
};

/**
 * Build a complete DTCG 2025.10 `default.json` document containing:
 * - Tier 1 (`ref`): M3 HCT tonal palettes + legacy `mnv` scales + base spacing/typography/radii/shadow/breakpoint/state
 * - Tier 2 (`sys`): Material 3 color roles + shadcn/kit semantic alias mappings
 * - Tier 3 (`comp`): Component tokens (`field.*`, `button.*`)
 * - `resolver` + `themes`: DTCG 2025.10 resolver contexts for `(light|dark) x (standard|medium|high)`
 */
export function buildDtcgDefaultDocument(
  legacy: LegacyBaseScales,
  seedConfig: BrandTokensConfig = {
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
  },
): DtcgDocument {
  const resolved = resolveBrandTokensFromConfig(seedConfig);

  const paletteGroup: DtcgGroup = {
    $type: "color",
    $description:
      "HCT tonal palettes generated with @material/material-color-utilities.",
  };
  for (const [family, tones] of Object.entries(resolved.palettes)) {
    const familyGroup: DtcgGroup = { $type: "color" };
    for (const tone of M3_TONES) {
      const hex = tones[tone];
      if (hex) {
        familyGroup[String(tone)] = colorToken(hex);
      }
    }
    paletteGroup[family] = familyGroup;
  }

  const legacyColorGroup: DtcgGroup = {
    $type: "color",
    $description:
      "Legacy 6-family 50-950 scale for backwards compatibility (--mnv-*).",
  };
  for (const family of Object.keys(legacy.color)) {
    const scale = legacy.color[family];
    if (!scale) continue;
    const scaleGroup: DtcgGroup = { $type: "color" };
    for (const [step, hex] of Object.entries(scale)) {
      scaleGroup[step] = colorToken(hex);
    }
    legacyColorGroup[family] = scaleGroup;
  }

  const spacingGroup: DtcgGroup = { $type: "dimension" };
  for (const [step, val] of Object.entries(legacy.spacing)) {
    spacingGroup[step] = { $value: val, $type: "dimension" };
  }

  const fontFamilyGroup: DtcgGroup = { $type: "fontFamily" };
  for (const [key, val] of Object.entries(legacy.typography.fontFamily)) {
    fontFamilyGroup[key] = { $value: val, $type: "fontFamily" };
  }
  const fontSizeGroup: DtcgGroup = { $type: "dimension" };
  for (const [key, val] of Object.entries(legacy.typography.fontSize)) {
    fontSizeGroup[key] = { $value: val, $type: "dimension" };
  }
  const lineHeightGroup: DtcgGroup = { $type: "number" };
  for (const [key, val] of Object.entries(legacy.typography.lineHeight)) {
    lineHeightGroup[key] = { $value: val, $type: "number" };
  }

  const radiiGroup: DtcgGroup = { $type: "dimension" };
  for (const [key, val] of Object.entries(legacy.radii)) {
    radiiGroup[key] = { $value: val, $type: "dimension" };
  }

  const shadowGroup: DtcgGroup = { $type: "shadow" };
  for (const [key, val] of Object.entries(legacy.shadow)) {
    shadowGroup[key] = { $value: val, $type: "shadow" };
  }

  const breakpointGroup: DtcgGroup = { $type: "dimension" };
  for (const [key, val] of Object.entries(legacy.breakpoint)) {
    breakpointGroup[key] = { $value: val, $type: "dimension" };
  }

  const stateGroup: DtcgGroup = {
    $type: "number",
    $description: "Material 3 state layer opacities.",
    hover: { $value: M3_STATE_LAYER_OPACITIES.hoverOpacity, $type: "number" },
    focus: { $value: M3_STATE_LAYER_OPACITIES.focusOpacity, $type: "number" },
    pressed: {
      $value: M3_STATE_LAYER_OPACITIES.pressedOpacity,
      $type: "number",
    },
    dragged: {
      $value: M3_STATE_LAYER_OPACITIES.draggedOpacity,
      $type: "number",
    },
    disabledContent: {
      $value: M3_STATE_LAYER_OPACITIES.disabledContentOpacity,
      $type: "number",
    },
    disabledContainer: {
      $value: M3_STATE_LAYER_OPACITIES.disabledContainerOpacity,
      $type: "number",
    },
  };

  const lightStandard = resolved.schemes.light.standard;
  const shadcnAliasGroup: DtcgGroup = {
    $description: "Shadcn and kit CSS variable aliases mapped to sys roles.",
  };
  for (const [cssVar, target] of Object.entries(
    buildShadcnAliasCssVars("light"),
  )) {
    const key = cssVar.replace(/^--/, "");
    const hex = lightStandard.semanticHex[key];
    const isColor = typeof hex === "string" && hex.startsWith("#");
    shadcnAliasGroup[key] = {
      $value: isColor ? hexToDtcgColor(hex) : target,
      $type: isColor ? "color" : "string",
      $extensions: {
        "org.manovaspace.tokens": { cssVarValue: target },
      },
    };
  }

  const compField: DtcgGroup = {
    $description: "Field control component tokens.",
    radius: refToken("ref.radii.lg", "dimension"),
    borderWidth: { $value: "1px", $type: "dimension" },
    background: refToken("sys.color.surfaceContainerLowest", "color"),
    border: refToken("sys.color.outline", "color"),
    borderInvalid: refToken("sys.color.error", "color"),
    foreground: refToken("sys.color.onSurface", "color"),
    shadow: refToken("ref.shadow.field", "shadow"),
    heightDefault: { $value: "2.5rem", $type: "dimension" },
    heightTouch: { $value: "2.75rem", $type: "dimension" },
  };

  const compButton: DtcgGroup = {
    $description: "Button component tokens (M3 disabled + state layers).",
    radius: refToken("ref.radii.lg", "dimension"),
    shadow: refToken("ref.shadow.control", "shadow"),
    shadowPress: refToken("ref.shadow.press", "shadow"),
    pressTransform: { $value: "scale(0.98)", $type: "string" },
    disabledContainerOpacity: refToken("ref.state.disabledContainer", "number"),
    disabledContentOpacity: refToken("ref.state.disabledContent", "number"),
    hoverStateOpacity: refToken("ref.state.hover", "number"),
    focusStateOpacity: refToken("ref.state.focus", "number"),
    pressedStateOpacity: refToken("ref.state.pressed", "number"),
  };

  const themes: Record<string, Record<string, unknown>> = {
    light: {},
    dark: {},
  };
  for (const contrast of CONTRAST_LEVELS) {
    (themes.light as Record<string, unknown>)[contrast] = {
      color: buildDtcgM3ColorGroup(resolved.schemes.light[contrast].m3),
    };
    (themes.dark as Record<string, unknown>)[contrast] = {
      color: buildDtcgM3ColorGroup(resolved.schemes.dark[contrast].m3),
    };
  }

  const scaleCss = scaleTokensToCssVars(resolved.scale);
  const m3Css = m3RolesToCssVars(lightStandard.m3);
  void scaleCss;
  void m3Css;

  return {
    $schema: "https://tr.designtokens.org/format/",
    $description:
      "Manova Orbit Design System Tokens — DTCG 2025.10 (reference -> system -> component + resolver)",
    $extensions: {
      "org.manovaspace.tokens": {
        specVersion: "2025.10",
        version: 2,
        v1SemanticLight: legacy.v1SemanticLight,
        brandAnchors: BRAND_ANCHORS,
      },
    },
    ref: {
      $description: "Tier 1: Reference palettes and primitive scales.",
      palette: paletteGroup,
      legacy: legacyColorGroup,
      spacing: spacingGroup,
      typography: {
        fontFamily: fontFamilyGroup,
        fontSize: fontSizeGroup,
        lineHeight: lineHeightGroup,
      },
      radii: radiiGroup,
      shadow: shadowGroup,
      breakpoint: breakpointGroup,
      state: stateGroup,
    },
    sys: {
      $description: "Tier 2: Material 3 system roles and shadcn aliases.",
      color: buildDtcgM3ColorGroup(lightStandard.m3),
      state: {
        hoverOpacity: refToken("ref.state.hover", "number"),
        focusOpacity: refToken("ref.state.focus", "number"),
        pressedOpacity: refToken("ref.state.pressed", "number"),
        draggedOpacity: refToken("ref.state.dragged", "number"),
        disabledContentOpacity: refToken("ref.state.disabledContent", "number"),
        disabledContainerOpacity: refToken(
          "ref.state.disabledContainer",
          "number",
        ),
      },
      semantic: shadcnAliasGroup,
    },
    comp: {
      $description: "Tier 3: Component tokens.",
      field: compField,
      button: compButton,
    },
    resolver: {
      version: "2025.10",
      sets: {
        reference: "#/ref",
        system: "#/sys",
        component: "#/comp",
      },
      modifiers: {
        colorScheme: {
          description: "Light and dark color schemes derived via M3 HCT.",
          default: "light",
          contexts: {
            light: { apply: "#/themes/light" },
            dark: { apply: "#/themes/dark" },
          },
        },
        contrast: {
          description: "WCAG / M3 contrast levels.",
          default: "standard",
          contexts: {
            standard: { level: 0 },
            medium: { level: 0.5 },
            high: { level: 1 },
          },
        },
      },
      resolutionOrder: [
        "reference",
        "system",
        "component",
        { modifier: "colorScheme" },
        { modifier: "contrast" },
      ],
    },
    themes,
  };
}

function extractColorGroup(
  group: DtcgGroup,
): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};
  for (const family of COLOR_FAMILIES) {
    const familyNode = group[family];
    if (!familyNode || typeof familyNode !== "object") continue;
    const scale: Record<string, string> = {};
    for (const step of COLOR_STEPS) {
      const leaf = (familyNode as Record<string, unknown>)[step];
      const rawVal = readTokenValue(leaf);
      if (
        rawVal &&
        (typeof rawVal === "string" || typeof rawVal === "object")
      ) {
        scale[step] = dtcgColorToHex(
          rawVal as
            | string
            | {
                colorSpace: "srgb";
                components: [number, number, number];
                hex?: string;
              },
        );
      }
    }
    result[family] = scale;
  }
  return result;
}

function extractStringRecord(group: unknown): Record<string, string> {
  if (!group || typeof group !== "object") return {};
  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(group as Record<string, unknown>)) {
    if (key.startsWith("$")) continue;
    const unwrapped = readTokenValue(val);
    if (typeof unwrapped === "string") {
      result[key] = unwrapped;
    } else if (typeof unwrapped === "number") {
      result[key] = String(unwrapped);
    }
  }
  return result;
}

/**
 * Bridge a DTCG 2025.10 `default.json` document back to the v1 `OrbitTokensRaw` shape
 * so all v1 consumers (`defaultTokensRaw`, `devtools`, `resolveTokens`, `validateTokens`)
 * continue working with zero breaking changes.
 */
export function dtcgDocumentToOrbitTokensRaw(
  doc: DtcgDocument,
): OrbitTokensRaw {
  const ref = doc.ref as Record<string, unknown>;
  const legacyGroup = (ref.legacy ?? {}) as DtcgGroup;
  const typoGroup = (ref.typography ?? {}) as Record<string, unknown>;
  const ext = (doc.$extensions?.["org.manovaspace.tokens"] ?? {}) as {
    v1SemanticLight?: Record<string, string>;
  };

  return {
    version: 1,
    color: extractColorGroup(legacyGroup),
    semantic: {
      light: { ...(ext.v1SemanticLight ?? {}) },
    },
    spacing: extractStringRecord(ref.spacing),
    typography: {
      fontFamily: extractStringRecord(typoGroup.fontFamily),
      fontSize: extractStringRecord(typoGroup.fontSize),
      lineHeight: extractStringRecord(typoGroup.lineHeight),
    },
    radii: extractStringRecord(ref.radii),
    shadow: extractStringRecord(ref.shadow),
    breakpoint: extractStringRecord(ref.breakpoint),
  };
}
