import raw from "./default.json" with { type: "json" };
import { resolveTokens } from "./resolve-tokens.js";
import type { OrbitTokensRaw } from "./schema/types.js";

export const defaultTokensRaw = raw as OrbitTokensRaw;
export const defaultTokens = resolveTokens(defaultTokensRaw);
