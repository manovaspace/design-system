import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  defaultTokensRaw,
  mergeTokenOverridesRaw,
  type OrbitTokenOverride,
  type OrbitTokensRaw,
  parseTokenOverridePayload,
} from "@manovaspace/tokens";

export type ResolveInitialTokensOptions = {
  cwd?: string;
  /** File name under public/, default theme.override.json */
  overrideFile?: string;
  /** Static override merged last (matches TokenProvider `tokens` prop) */
  tokens?: OrbitTokenOverride;
};

export function readPublicTokenOverride(
  options: Pick<ResolveInitialTokensOptions, "cwd" | "overrideFile"> = {},
): OrbitTokenOverride | undefined {
  const cwd = options.cwd ?? process.cwd();
  const file = options.overrideFile ?? "theme.override.json";
  const path = join(cwd, "public", file);
  if (!existsSync(path)) return undefined;

  try {
    const data: unknown = JSON.parse(readFileSync(path, "utf8"));
    return parseTokenOverridePayload(data);
  } catch {
    return undefined;
  }
}

/** Server-side merge: defaults → public override → static prop. */
export function resolveInitialTokens(
  options: ResolveInitialTokensOptions = {},
): OrbitTokensRaw {
  const local = readPublicTokenOverride(options);
  return mergeTokenOverridesRaw(defaultTokensRaw, local, options.tokens);
}
