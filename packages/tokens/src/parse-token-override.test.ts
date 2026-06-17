import { describe, expect, it } from "vitest";

import { parseTokenOverridePayload } from "./parse-token-override.js";

describe("parseTokenOverridePayload", () => {
  it("unwraps save payload wrapper", () => {
    const override = { color: { primary: { "900": "#000" } } };
    expect(parseTokenOverridePayload({ version: 1, tokens: override })).toEqual(
      override,
    );
  });

  it("accepts bare override objects", () => {
    const override = { spacing: { "4": "1rem" } };
    expect(parseTokenOverridePayload(override)).toEqual(override);
  });

  it("returns undefined for invalid input", () => {
    expect(parseTokenOverridePayload(null)).toBeUndefined();
    expect(parseTokenOverridePayload("nope")).toBeUndefined();
  });
});
