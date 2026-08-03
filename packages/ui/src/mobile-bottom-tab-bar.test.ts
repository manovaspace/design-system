import { describe, expect, it } from "vitest";

import {
  MOBILE_TAB_INDICATOR_WIDTH_PX,
  mobileTabIndicatorInset,
} from "./mobile-bottom-tab-bar.js";

describe("mobileTabIndicatorInset", () => {
  it("centers indicator in the active column", () => {
    expect(mobileTabIndicatorInset(0, 5)).toBe(
      `calc(0 * 20% + 10% - ${MOBILE_TAB_INDICATOR_WIDTH_PX / 2}px)`,
    );
    expect(mobileTabIndicatorInset(2, 5)).toBe(
      `calc(2 * 20% + 10% - ${MOBILE_TAB_INDICATOR_WIDTH_PX / 2}px)`,
    );
  });

  it("clamps index and guards empty count", () => {
    expect(mobileTabIndicatorInset(-1, 5)).toBe(mobileTabIndicatorInset(0, 5));
    expect(mobileTabIndicatorInset(9, 5)).toBe(mobileTabIndicatorInset(4, 5));
    expect(mobileTabIndicatorInset(0, 0)).toBe(
      `calc(0 * 100% + 50% - ${MOBILE_TAB_INDICATOR_WIDTH_PX / 2}px)`,
    );
  });
});
