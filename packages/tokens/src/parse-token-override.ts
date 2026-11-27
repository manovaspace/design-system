import { isBrandOrTenantInput } from "./dtcg/brand-pipeline.js";
import type { BrandTokensInput, TenantSeedInput } from "./dtcg/types.js";
import type { OrbitTokenOverride } from "./schema/types.js";

export function parseTokenOverridePayload(
  data: unknown,
): OrbitTokenOverride | undefined {
  if (!data || typeof data !== "object") return undefined;
  if ("tokens" in data && data.tokens && typeof data.tokens === "object") {
    return data.tokens as OrbitTokenOverride;
  }
  return data as OrbitTokenOverride;
}

export function parseTokenOrBrandPayload(
  data: unknown,
): OrbitTokenOverride | BrandTokensInput | TenantSeedInput | undefined {
  if (!data || typeof data !== "object") return undefined;
  if (isBrandOrTenantInput(data)) {
    return data;
  }
  return parseTokenOverridePayload(data);
}
