import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Switch } from "./primitives/switch.js";

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

describe("Switch", () => {
  it("size touch sets data-size touch and the 44 px root height class", () => {
    render(<Switch size="touch" aria-label="Notifications" />);
    const root = screen.getByRole("switch", { name: "Notifications" });
    expect(root.getAttribute("data-size")).toBe("touch");
    expect(root.className).toContain("data-[size=touch]:h-11");
    expect(root.className).toContain("data-[size=touch]:w-14");
  });

  it("keeps default sizing when size is unset", () => {
    render(<Switch aria-label="Sync" />);
    const root = screen.getByRole("switch", { name: "Sync" });
    expect(root.getAttribute("data-size")).toBe("default");
    expect(root.className).toContain("data-[size=default]:h-[1.15rem]");
  });
});
