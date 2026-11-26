import * as React from "react";
import { afterEach, describe, expect, it } from "vitest";

if (typeof document === "undefined") {
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost",
  });
  globalThis.window = dom.window as unknown as Window & typeof globalThis;
  globalThis.document = dom.window.document;
  globalThis.navigator = dom.window.navigator;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.HTMLInputElement = dom.window.HTMLInputElement;
  globalThis.Node = dom.window.Node;
  globalThis.Event = dom.window.Event;
  globalThis.MouseEvent = dom.window.MouseEvent;
}

const { cleanup, render, screen } = await import("@testing-library/react");
const { Input } = await import("./input.js");

afterEach(() => {
  cleanup();
});

describe("Input", () => {
  it("renders simple input with backwards compatibility and design tokens", () => {
    const { container } = render(<Input placeholder="Enter username" />);
    const input = screen.getByPlaceholderText("Enter username");

    expect(input).toBeDefined();
    expect(input.getAttribute("data-slot")).toBe("input");
    expect(input.className).toContain(
      "rounded-[var(--rounded-field,var(--radius-lg))]",
    );
    expect(input.className).toContain(
      "border-[length:var(--border-line-field,1px)]",
    );
    expect(input.className).toContain("bg-[var(--bg-field,var(--color-card))]");
    expect(input.className).toContain("shadow-[shadow:var(--shadow-field)]");
    expect(input.className).toContain("ps-3");
    expect(input.className).toContain("pe-3");
    // No wrapper div when no addons or errors
    expect(container.querySelector('[data-slot="input-root"]')).toBeNull();
  });

  it("renders wrapper container with startAddon and CSS logical styling", () => {
    const { container } = render(
      <Input
        placeholder="Search..."
        startAddon={<span data-testid="start-addon">🔍</span>}
      />,
    );

    const root = container.querySelector('[data-slot="input-root"]');
    expect(root).not.toBeNull();
    expect(root?.className).toContain(
      "rounded-[var(--rounded-field,var(--radius-lg))]",
    );
    expect(root?.className).toContain(
      "border-[length:var(--border-line-field,1px)]",
    );
    expect(root?.className).toContain("bg-[var(--bg-field,var(--color-card))]");
    expect(root?.className).toContain("shadow-[shadow:var(--shadow-field)]");
    expect(root?.className).toContain("ps-3");
    expect(root?.className).toContain("pe-3");
    expect(root?.className).toContain("gap-2");

    const startAddon = container.querySelector(
      '[data-slot="input-start-addon"]',
    );
    expect(startAddon).not.toBeNull();
    expect(startAddon?.textContent).toBe("🔍");

    const input = screen.getByPlaceholderText("Search...");
    expect(input.getAttribute("data-slot")).toBe("input");
    expect(input.className).toContain("bg-transparent");
    expect(input.className).toContain("border-0");
  });

  it("renders endAddon when provided", () => {
    const { container } = render(
      <Input
        placeholder="Amount"
        endAddon={<span data-testid="end-addon">USD</span>}
      />,
    );

    const endAddon = container.querySelector('[data-slot="input-end-addon"]');
    expect(endAddon).not.toBeNull();
    expect(endAddon?.textContent).toBe("USD");
  });

  it("renders error message and marks input aria-invalid", () => {
    const { container } = render(
      <Input placeholder="Email" error="Invalid email address" />,
    );

    const error = screen.getByRole("alert");
    expect(error.getAttribute("data-slot")).toBe("input-error");
    expect(error.textContent).toBe("Invalid email address");
    expect(error.className).toContain("text-destructive");

    const input = screen.getByPlaceholderText("Email");
    expect(input.getAttribute("aria-invalid")).toBe("true");

    const root = container.querySelector('[data-slot="input-root"]');
    expect(root).not.toBeNull();
  });

  it("renders both addons and error message together", () => {
    const { container } = render(
      <Input
        placeholder="Phone"
        startAddon={<span>📞</span>}
        error="Phone is required"
      />,
    );

    const error = screen.getByRole("alert");
    expect(error.textContent).toBe("Phone is required");

    const startAddon = container.querySelector(
      '[data-slot="input-start-addon"]',
    );
    expect(startAddon).not.toBeNull();

    const input = screen.getByPlaceholderText("Phone");
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("applies dir to outer container when passed", () => {
    const { container } = render(
      <Input dir="ltr" placeholder="123" startAddon={<span>#</span>} />,
    );

    const root = container.querySelector('[data-slot="input-root"]');
    expect(root?.getAttribute("dir")).toBe("ltr");
  });

  it("forwards ref to HTMLInputElement with and without addons", () => {
    const ref1 = React.createRef<HTMLInputElement>();
    render(<Input ref={ref1} placeholder="Ref 1" />);
    expect(ref1.current).toBeInstanceOf(globalThis.HTMLInputElement);
    expect(ref1.current?.placeholder).toBe("Ref 1");

    const ref2 = React.createRef<HTMLInputElement>();
    render(
      <Input ref={ref2} placeholder="Ref 2" startAddon={<span>@</span>} />,
    );
    expect(ref2.current).toBeInstanceOf(globalThis.HTMLInputElement);
    expect(ref2.current?.placeholder).toBe("Ref 2");
  });

  it("size touch uses h-11 in plain variant and sets no DOM size attribute", () => {
    render(<Input placeholder="Touch plain" size="touch" />);
    const input = screen.getByPlaceholderText("Touch plain");
    expect(input.className).toContain("h-11");
    expect(input.className).not.toContain("h-10");
    expect(input.hasAttribute("size")).toBe(false);
  });

  it("size touch uses h-11 in error variant and sets no DOM size attribute", () => {
    render(<Input placeholder="Touch error" size="touch" error="Required" />);
    const input = screen.getByPlaceholderText("Touch error");
    expect(input.className).toContain("h-11");
    expect(input.className).not.toContain("h-10");
    expect(input.hasAttribute("size")).toBe(false);
    expect(screen.getByRole("alert").textContent).toBe("Required");
  });

  it("size touch uses h-11 on the addon container and sets no DOM size attribute", () => {
    const { container } = render(
      <Input
        placeholder="Touch addon"
        size="touch"
        startAddon={<span>@</span>}
      />,
    );
    const root = container.querySelector('[data-slot="input-root"]');
    expect(root?.className).toContain("h-11");
    expect(root?.className).not.toContain("h-10");
    const input = screen.getByPlaceholderText("Touch addon");
    expect(input.hasAttribute("size")).toBe(false);
  });

  it("keeps default height when size is default or unset", () => {
    render(<Input placeholder="Default height" size="default" />);
    const input = screen.getByPlaceholderText("Default height");
    expect(input.className).toContain("h-10");
    expect(input.className).not.toContain("h-11");
    expect(input.hasAttribute("size")).toBe(false);
  });

  it("passes numeric size through as the native size attribute", () => {
    render(<Input placeholder="Native size" size={20} />);
    const input = screen.getByPlaceholderText("Native size");
    expect(input.getAttribute("size")).toBe("20");
    expect(input.className).toContain("h-10");
  });
});
