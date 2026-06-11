import type { OrbitTokenOverride } from "@manovaspace/tokens";

import type { DevtoolsSaveOptions, SaveDesignSystemResult } from "../types.js";
import {
  buildThemePayload,
  copyJsonToClipboard,
  saveToLocalApi,
  saveToRemote,
} from "./adapters.js";

export type SaveDesignSystemOptions = DevtoolsSaveOptions & {
  appName?: string;
  preferClipboard?: boolean;
};

export async function saveDesignSystem(
  tokens: OrbitTokenOverride,
  options: SaveDesignSystemOptions = {},
): Promise<SaveDesignSystemResult[]> {
  const payload = buildThemePayload(tokens, options.appName);
  const results: SaveDesignSystemResult[] = [];

  if (options.saveUrl) {
    results.push(await saveToRemote(payload, options));
  } else if (process.env.NODE_ENV === "development") {
    results.push(await saveToLocalApi(payload, options));
  }

  if (options.preferClipboard) {
    results.push(await copyJsonToClipboard(payload));
  }

  return results;
}

export async function copyDesignSystemJson(
  tokens: OrbitTokenOverride,
  appName?: string,
): Promise<SaveDesignSystemResult> {
  return copyJsonToClipboard(buildThemePayload(tokens, appName));
}
