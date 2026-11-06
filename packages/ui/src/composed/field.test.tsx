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
const { Field } = await import("./field.js");
const { Input } = await import("../input.js");

afterEach(() => {
  cleanup();
});

describe("Field", () => {
  it("renders label, children, and sets data-slot attributes", () => {
    const { container } = render(
      <Field
        label="Username"
        htmlFor="user-input"
        id="field-wrap"
        className="custom-field"
      >
        <Input id="user-input" placeholder="Enter username" />
      </Field>,
    );

    const field = container.querySelector('[data-slot="field"]');
    expect(field).not.toBeNull();
    expect(field?.id).toBe("field-wrap");
    expect(field?.className).toContain("custom-field");
    expect(field?.className).toContain("text-start");

    const label = container.querySelector('[data-slot="field-label"]');
    expect(label).not.toBeNull();
    expect(label?.getAttribute("for")).toBe("user-input");
    expect(label?.textContent).toBe("Username");

    expect(screen.getByPlaceholderText("Enter username")).toBeDefined();
  });

  it("renders accessible red asterisk when required", () => {
    const { container } = render(
      <Field label="Email" htmlFor="email-input" required>
        <Input id="email-input" />
      </Field>,
    );

    const label = container.querySelector('[data-slot="field-label"]');
    expect(label?.textContent).toContain("*");

    const asterisk = label?.querySelector("span");
    expect(asterisk).not.toBeNull();
    expect(asterisk?.textContent).toBe("*");
    expect(asterisk?.getAttribute("aria-hidden")).toBe("true");
    expect(asterisk?.className).toContain("text-destructive");
    expect(asterisk?.className).toContain("ms-0.5");
  });

  it("renders hint when no error is present", () => {
    const { container } = render(
      <Field label="Password" hint="Must be at least 8 characters">
        <Input type="password" />
      </Field>,
    );

    const hint = container.querySelector('[data-slot="field-hint"]');
    expect(hint).not.toBeNull();
    expect(hint?.textContent).toBe("Must be at least 8 characters");
    expect(hint?.className).toContain("text-xs");
    expect(hint?.className).toContain("text-muted-foreground");
    expect(hint?.className).toContain("text-start");
    expect(container.querySelector('[data-slot="field-error"]')).toBeNull();
  });

  it("renders error message with role='alert' when error is present", () => {
    render(
      <Field label="Email" error="Please enter a valid email address">
        <Input type="email" />
      </Field>,
    );

    const error = screen.getByRole("alert");
    expect(error.getAttribute("data-slot")).toBe("field-error");
    expect(error.textContent).toBe("Please enter a valid email address");
    expect(error.className).toContain("text-xs");
    expect(error.className).toContain("text-destructive");
    expect(error.className).toContain("text-start");
  });

  it("prioritizes error message over hint when both are provided", () => {
    const { container } = render(
      <Field
        label="Username"
        hint="Unique handle"
        error="Username already taken"
      >
        <Input />
      </Field>,
    );

    expect(container.querySelector('[data-slot="field-error"]')).not.toBeNull();
    expect(screen.getByRole("alert").textContent).toBe(
      "Username already taken",
    );
    expect(container.querySelector('[data-slot="field-hint"]')).toBeNull();
  });
});
