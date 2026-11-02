import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PermissionGate } from "./permission-gate.js";

describe("PermissionGate", () => {
  it("renders children when allowed in hide mode", () => {
    render(
      <PermissionGate allowed>
        <button type="button">Save</button>
      </PermissionGate>,
    );

    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
    expect(document.querySelector('[data-slot="permission-gate"]')).toBeNull();
  });

  it("renders the fallback when denied in hide mode", () => {
    render(
      <PermissionGate allowed={false} fallback={<p>Read only</p>}>
        <button type="button">Save</button>
      </PermissionGate>,
    );

    expect(screen.getByText("Read only")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
  });

  it("renders nothing when denied in hide mode without a fallback", () => {
    const { container } = render(
      <PermissionGate allowed={false}>
        <button type="button">Save</button>
      </PermissionGate>,
    );

    expect(container.innerHTML).toBe("");
  });

  it("wraps denied children with aria-disabled and inert in disable mode", () => {
    const { container } = render(
      <PermissionGate allowed={false} mode="disable">
        <button type="button">Save</button>
      </PermissionGate>,
    );

    const gate = container.querySelector('[data-slot="permission-gate"]');
    expect(gate?.getAttribute("aria-disabled")).toBe("true");
    expect(gate?.hasAttribute("inert")).toBe(true);
    expect(gate?.getAttribute("data-mode")).toBe("disable");
    expect(gate?.getAttribute("data-allowed")).toBe("false");
    expect(gate?.className).toContain("opacity-50");
    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
  });

  it("leaves allowed children interactive in disable mode", () => {
    const { container } = render(
      <PermissionGate allowed mode="disable">
        <button type="button">Save</button>
      </PermissionGate>,
    );

    const gate = container.querySelector('[data-slot="permission-gate"]');
    expect(gate?.hasAttribute("aria-disabled")).toBe(false);
    expect(gate?.hasAttribute("inert")).toBe(false);
    expect(gate?.getAttribute("data-allowed")).toBe("true");
    expect(gate?.className).not.toContain("opacity-50");
    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
  });

  it("ignores the fallback in disable mode", () => {
    render(
      <PermissionGate
        allowed={false}
        fallback={<p>Read only</p>}
        mode="disable"
      >
        <button type="button">Save</button>
      </PermissionGate>,
    );

    expect(screen.queryByText("Read only")).toBeNull();
    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
  });
});
