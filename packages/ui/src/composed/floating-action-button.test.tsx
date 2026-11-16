import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PlusIcon } from "../icons.js";
import { FloatingActionButton } from "./floating-action-button.js";

afterEach(() => {
  cleanup();
});

describe("FloatingActionButton", () => {
  it("exposes the label as the accessible name when collapsed", () => {
    render(<FloatingActionButton label="New chat" icon={<PlusIcon />} />);

    const button = screen.getByRole("button", { name: "New chat" });
    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("data-slot")).toBe("floating-action-button");
  });

  it("fires onClick when pressed", () => {
    const onClick = vi.fn();
    render(
      <FloatingActionButton
        label="New chat"
        icon={<PlusIcon />}
        onClick={onClick}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "New chat" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("shows the label as visible text when extended", () => {
    render(
      <FloatingActionButton label="New chat" icon={<PlusIcon />} extended />,
    );

    expect(screen.getByText("New chat")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "New chat" }).className,
    ).toContain("min-h-14");
  });

  it("does not render the label as visible text when collapsed", () => {
    render(<FloatingActionButton label="New chat" icon={<PlusIcon />} />);

    expect(screen.queryByText("New chat")).toBeNull();
    expect(
      screen
        .getByRole("button", { name: "New chat" })
        .getAttribute("aria-label"),
    ).toBe("New chat");
  });

  it("forwards className and ref", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <FloatingActionButton
        ref={ref}
        label="New chat"
        icon={<PlusIcon />}
        className="lg:hidden"
      />,
    );

    const button = screen.getByRole("button", { name: "New chat" });
    expect(button.className).toContain("lg:hidden");
    expect(button.className).toContain("fixed");
    expect(ref.current).toBe(button);
  });
});
