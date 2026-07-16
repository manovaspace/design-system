import type { OrbitTokenOverride, OrbitTokensRaw } from "@manovaspace/tokens";
import { brandAnchorStep, COLOR_FAMILIES } from "@manovaspace/tokens";
import type {
  DevtoolsSaveOptions,
  SaveDesignSystemResult,
  ThemeSavePayload,
} from "../types.js";

export function buildThemePayload(
  tokens: OrbitTokenOverride,
  appName?: string,
): ThemeSavePayload {
  return {
    version: 1,
    tokens,
    meta: {
      savedAt: new Date().toISOString(),
      app: appName,
    },
  };
}

export {
  buildTokenOverridePayload,
  buildTokenOverrideThemePayload,
} from "./build-override-payload.js";

/** @deprecated Use buildTokenOverrideThemePayload — kept for anchor-only callers. */
export function buildColorOverridePayload(
  draft: OrbitTokensRaw,
  base: OrbitTokensRaw,
  appName?: string,
): ThemeSavePayload | null {
  const color: OrbitTokenOverride["color"] = {};

  for (const family of COLOR_FAMILIES) {
    const step = brandAnchorStep(family);
    const draftVal = draft.color[family]?.[step];
    const baseVal = base.color[family]?.[step];
    if (draftVal && draftVal !== baseVal) {
      color[family] = { [step]: draftVal };
    }
  }

  if (Object.keys(color).length === 0) return null;

  return buildThemePayload({ color }, appName);
}

export async function saveToRemote(
  payload: ThemeSavePayload,
  options: DevtoolsSaveOptions,
): Promise<SaveDesignSystemResult> {
  if (!options.saveUrl) {
    return { ok: false, method: "remote", message: "No saveUrl configured" };
  }

  const response = await fetch(options.saveUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return {
      ok: false,
      method: "remote",
      message: `Remote save failed (${response.status})`,
    };
  }

  return { ok: true, method: "remote", message: "Saved to remote API" };
}

export async function saveToLocalApi(
  payload: ThemeSavePayload,
  options: DevtoolsSaveOptions,
): Promise<SaveDesignSystemResult> {
  const path = options.localApiPath ?? "/api/orbit-devtools/theme";
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    return {
      ok: false,
      method: "local",
      message: `Local save failed (${response.status}): ${text}`,
    };
  }

  return {
    ok: true,
    method: "local",
    message: "Saved to public/theme.override.json",
  };
}

export async function copyJsonToClipboard(
  payload: ThemeSavePayload,
): Promise<SaveDesignSystemResult> {
  const json = JSON.stringify(payload, null, 2);
  await navigator.clipboard.writeText(json);
  return { ok: true, method: "clipboard", message: "JSON copied to clipboard" };
}

export function downloadJson(payload: ThemeSavePayload): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "theme.override.json";
  anchor.click();
  URL.revokeObjectURL(url);
}
