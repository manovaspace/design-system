import raw from "./default.json" with { type: "json" };
import { dtcgDocumentToOrbitTokensRaw } from "./dtcg/dtcg-document.js";
import type { DtcgDocument } from "./dtcg/types.js";
import { resolveTokens } from "./resolve-tokens.js";
import type { OrbitTokensRaw } from "./schema/types.js";

export const defaultDtcgDocument = raw as unknown as DtcgDocument;
export const defaultTokensRaw: OrbitTokensRaw =
  dtcgDocumentToOrbitTokensRaw(defaultDtcgDocument);
export const defaultTokens = resolveTokens(defaultTokensRaw);
