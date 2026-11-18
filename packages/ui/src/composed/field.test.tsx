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
const { Combobox } = await import("./combobox.js");

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

  it("labels the control and describes it with the hint", () => {
    const { container } = render(
      <Field label="Phone" hint="Digits only">
        <Input />
      </Field>,
    );

    const input = screen.getByLabelText("Phone");
    const hint = container.querySelector('[data-slot="field-hint"]');
    expect(hint?.id).toBe(`${input.id}-hint`);
    expect(input.getAttribute("aria-describedby")).toBe(hint?.id);
    expect(input.hasAttribute("aria-invalid")).toBe(false);
  });

  it("marks the control invalid and describes it with the error alert", () => {
    render(
      <Field label="Email" error="Please enter a valid email address">
        <Input type="email" />
      </Field>,
    );

    const input = screen.getByLabelText("Email");
    const alert = screen.getByRole("alert");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(alert.id).toBe(`${input.id}-error`);
    expect(input.getAttribute("aria-describedby")).toBe(alert.id);
    expect(alert.textContent).toBe("Please enter a valid email address");
  });

  it("merges the child's existing aria-describedby with the hint id", () => {
    const { container } = render(
      <Field label="Code" hint="Six digits">
        <Input aria-describedby="external-help" />
      </Field>,
    );

    const input = screen.getByLabelText("Code");
    const hint = container.querySelector('[data-slot="field-hint"]');
    expect(input.getAttribute("aria-describedby")).toBe(
      `external-help ${hint?.id}`,
    );
  });

  it("merges the child's existing aria-describedby with the error id", () => {
    render(
      <Field label="Code" error="Wrong code">
        <Input aria-describedby="external-help" />
      </Field>,
    );

    const input = screen.getByLabelText("Code");
    const alert = screen.getByRole("alert");
    expect(input.getAttribute("aria-describedby")).toBe(
      `external-help ${alert.id}`,
    );
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("respects the child's own id for the control and message ids", () => {
    const { container } = render(
      <Field label="Phone" hint="Digits only">
        <Input id="phone-input" />
      </Field>,
    );

    const input = screen.getByLabelText("Phone");
    expect(input.id).toBe("phone-input");
    expect(container.querySelector('[data-slot="field-hint"]')?.id).toBe(
      "phone-input-hint",
    );
    expect(input.getAttribute("aria-describedby")).toBe("phone-input-hint");
  });

  it("uses htmlFor as the control id when the child has no id", () => {
    render(
      <Field label="Phone" htmlFor="phone-field" hint="Digits only">
        <Input />
      </Field>,
    );

    const input = screen.getByLabelText("Phone");
    expect(input.id).toBe("phone-field");
    expect(input.getAttribute("aria-describedby")).toBe("phone-field-hint");
  });

  it("does not clone a non-element child but still renders the error with an id", () => {
    const { container } = render(
      <Field label="Code" error="Required">
        <Input />
        <span>extra</span>
      </Field>,
    );

    const alert = screen.getByRole("alert");
    expect(alert.id).not.toBe("");
    const input = container.querySelector("input");
    expect(input?.hasAttribute("aria-describedby")).toBe(false);
    expect(input?.hasAttribute("aria-invalid")).toBe(false);
  });

  it("renders a hint for a string child without throwing", () => {
    const { container } = render(
      <Field label="Note" hint="Optional">
        plain text
      </Field>,
    );

    const hint = container.querySelector('[data-slot="field-hint"]');
    expect(hint?.id).toMatch(/-hint$/);
    expect(container.textContent).toContain("plain text");
  });

  it("adds no aria-describedby or aria-invalid without a hint or error", () => {
    render(
      <Field label="Name">
        <Input />
      </Field>,
    );

    const input = screen.getByLabelText("Name");
    expect(input.hasAttribute("aria-describedby")).toBe(false);
    expect(input.hasAttribute("aria-invalid")).toBe(false);
  });

  it("wires the kit Combobox hint the same way as Input", () => {
    const { container } = render(
      <Field label="City" hint="Pick one from the list">
        <Combobox options={["تهران", "شیراز"]} />
      </Field>,
    );

    const input = screen.getByLabelText("City");
    const hint = container.querySelector('[data-slot="field-hint"]');
    expect(hint?.id).toBe(`${input.id}-hint`);
    expect(input.getAttribute("aria-describedby")).toBe(hint?.id);
  });

  it("wires the kit Combobox error the same way as Input", () => {
    render(
      <Field label="City" error="Choose a city">
        <Combobox options={["تهران", "شیراز"]} />
      </Field>,
    );

    const input = screen.getByLabelText("City");
    const alert = screen.getByRole("alert");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe(alert.id);
  });
});
