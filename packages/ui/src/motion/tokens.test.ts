import { describe, expect, it } from "vitest";

import { duration, easeOut, staggerDelay } from "./tokens.js";

describe("motion tokens", () => {
  it("exposes shared easing and durations", () => {
    expect(easeOut).toEqual([0.16, 1, 0.3, 1]);
    expect(duration.base).toBe(0.22);
    expect(duration.fadeIn).toBe(0.35);
  });

  it("caps stagger delay by max index", () => {
    expect(staggerDelay(0)).toBe(0);
    expect(staggerDelay(2, 0.05)).toBe(0.1);
    expect(staggerDelay(10, 0.05, 4)).toBe(0.2);
  });
});
