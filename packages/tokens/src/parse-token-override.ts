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
