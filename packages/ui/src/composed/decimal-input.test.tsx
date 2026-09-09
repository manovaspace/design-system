import { afterEach, describe, expect, it, vi } from "vitest";

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

const { cleanup, createEvent, fireEvent, render, screen } = await import(
  "@testing-library/react"
);
const { DecimalInput } = await import("./decimal-input.js");

afterEach(() => {
  cleanup();
});

describe("DecimalInput", () => {
  it("renders with Persian digits by default and enforces dir='ltr'", () => {
    render(
      <DecimalInput
        value="1234.56"
        onValueChange={() => {}}
        data-testid="dec-input"
      />,
    );

    const input = screen.getByTestId("dec-input") as HTMLInputElement;
    expect(input.getAttribute("dir")).toBe("ltr");
    expect(input.value).toBe("۱۲۳۴.۵۶");

    const wrapper = input.closest("[data-slot='decimal-input-wrapper']");
    expect(wrapper).toBeDefined();
    expect(wrapper?.getAttribute("dir")).toBe("ltr");
  });

  it("renders placeholder in Persian digits by default", () => {
    render(
      <DecimalInput
        value=""
        placeholder="0.00"
        onValueChange={() => {}}
        data-testid="dec-input"
      />,
    );

    const input = screen.getByTestId("dec-input") as HTMLInputElement;
    expect(input.placeholder).toBe("۰.۰۰");
  });

  it("renders Latin digits when an explicit non-Persian locale is specified", () => {
    render(
      <DecimalInput
        value="1234.56"
        locale="en-US"
        onValueChange={() => {}}
        data-testid="dec-input"
      />,
    );

    const input = screen.getByTestId("dec-input") as HTMLInputElement;
    expect(input.value).toBe("1234.56");
  });

  it("sanitizes typing and calls onValueChange with clean Latin digits", () => {
    const handleValueChange = vi.fn();
    render(
      <DecimalInput
        value="12"
        onValueChange={handleValueChange}
        data-testid="dec-input"
      />,
    );

    const input = screen.getByTestId("dec-input") as HTMLInputElement;

    // Typing Persian digits and momayyez
    fireEvent.change(input, { target: { value: "۱۲٫۵" } });
    expect(handleValueChange).toHaveBeenCalledWith("12.5");

    // Multiple decimal points are collapsed to one
    fireEvent.change(input, { target: { value: "12.3.4" } });
    expect(handleValueChange).toHaveBeenCalledWith("12.34");
  });

  it("handles integer mode vs decimal mode", () => {
    const handleValueChange = vi.fn();
    const { rerender } = render(
      <DecimalInput
        value="100"
        integer={true}
        onValueChange={handleValueChange}
        data-testid="dec-input"
      />,
    );

    const input = screen.getByTestId("dec-input") as HTMLInputElement;
    expect(input.getAttribute("inputmode")).toBe("numeric");

    // Integer mode strips decimal points and non-digits
    fireEvent.change(input, { target: { value: "123.45" } });
    expect(handleValueChange).toHaveBeenCalledWith("12345");

    fireEvent.change(input, { target: { value: "۱۲۳۴abc" } });
    expect(handleValueChange).toHaveBeenCalledWith("1234");

    // Switch back to decimal mode
    rerender(
      <DecimalInput
        value="100"
        integer={false}
        onValueChange={handleValueChange}
        data-testid="dec-input"
      />,
    );

    expect(input.getAttribute("inputmode")).toBe("decimal");
    fireEvent.change(input, { target: { value: "123.45" } });
    expect(handleValueChange).toHaveBeenCalledWith("123.45");
  });

  it("handles allowNegative option", () => {
    const handleValueChange = vi.fn();
    const { rerender } = render(
      <DecimalInput
        value="5"
        allowNegative={false}
        onValueChange={handleValueChange}
        data-testid="dec-input"
      />,
    );

    const input = screen.getByTestId("dec-input") as HTMLInputElement;

    // allowNegative=false strips minus sign
    fireEvent.change(input, { target: { value: "-45.5" } });
    expect(handleValueChange).toHaveBeenCalledWith("45.5");

    // allowNegative=true preserves minus sign
    rerender(
      <DecimalInput
        value="5"
        allowNegative={true}
        onValueChange={handleValueChange}
        data-testid="dec-input"
      />,
    );

    fireEvent.change(input, { target: { value: "-45.5" } });
    expect(handleValueChange).toHaveBeenCalledWith("-45.5");

    // Allows entering leading minus alone
    fireEvent.change(input, { target: { value: "-" } });
    expect(handleValueChange).toHaveBeenCalledWith("-");
  });

  it("renders unit label badge when provided", () => {
    const { rerender } = render(
      <DecimalInput
        value="10"
        unitLabel="kg"
        onValueChange={() => {}}
        data-testid="dec-input"
      />,
    );

    const badge = screen.getByTestId("unit-label");
    expect(badge).toBeDefined();
    expect(badge.textContent).toBe("kg");

    rerender(
      <DecimalInput
        value="10"
        onValueChange={() => {}}
        data-testid="dec-input"
      />,
    );

    expect(screen.queryByTestId("unit-label")).toBeNull();
  });

  it("renders autoLocked icon when autoLocked is true", () => {
    const { rerender } = render(
      <DecimalInput
        value="10"
        autoLocked={true}
        onValueChange={() => {}}
        data-testid="dec-input"
      />,
    );

    expect(screen.getByTestId("lock-icon")).toBeDefined();

    rerender(
      <DecimalInput
        value="10"
        autoLocked={false}
        onValueChange={() => {}}
        data-testid="dec-input"
      />,
    );

    expect(screen.queryByTestId("lock-icon")).toBeNull();
  });

  it("normalizes Persian digits to Latin clipboard text on copy", () => {
    render(
      <DecimalInput
        value="1234.5"
        onValueChange={() => {}}
        data-testid="dec-input"
      />,
    );

    const input = screen.getByTestId("dec-input") as HTMLInputElement;

    const setData = vi.fn();
    const copyEvent = createEvent.copy(input, {
      clipboardData: { setData },
    });

    // Full copy (no selection / start === end)
    input.selectionStart = 0;
    input.selectionEnd = 0;
    fireEvent(input, copyEvent);

    expect(setData).toHaveBeenCalledWith("text/plain", "1234.5");
    expect(copyEvent.defaultPrevented).toBe(true);

    // Partial selection copy: selecting "۱۲۳"
    const partialSetData = vi.fn();
    const partialCopyEvent = createEvent.copy(input, {
      clipboardData: { setData: partialSetData },
    });

    input.selectionStart = 0;
    input.selectionEnd = 3;
    fireEvent(input, partialCopyEvent);

    expect(partialSetData).toHaveBeenCalledWith("text/plain", "123");
    expect(partialCopyEvent.defaultPrevented).toBe(true);
  });
});
