import { describe, expect, it } from "vitest";

import { resolveLocaleDir } from "./locale-preference.js";

describe("resolveLocaleDir", () => {
  it("marks listed locales as rtl", () => {
    expect(resolveLocaleDir("fa", ["fa", "ar"])).toBe("rtl");
    expect(resolveLocaleDir("en", ["fa", "ar"])).toBe("ltr");
  });
});
