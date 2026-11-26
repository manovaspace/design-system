import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

if (typeof document === "undefined" || typeof Element === "undefined") {
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost",
  });
  globalThis.window = dom.window as unknown as Window & typeof globalThis;
  globalThis.document = dom.window.document;
  globalThis.navigator = dom.window.navigator;
  globalThis.Element = dom.window.Element;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.HTMLInputElement = dom.window.HTMLInputElement;
  globalThis.HTMLButtonElement = dom.window.HTMLButtonElement;
  globalThis.Node = dom.window.Node;
  globalThis.Event = dom.window.Event;
  globalThis.CustomEvent = dom.window.CustomEvent;
  globalThis.MouseEvent = dom.window.MouseEvent;
  globalThis.KeyboardEvent = dom.window.KeyboardEvent;
  globalThis.FocusEvent = dom.window.FocusEvent;
  globalThis.UIEvent = dom.window.UIEvent;
  globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
}

const { cleanup, createEvent, fireEvent, render, screen } = await import(
  "@testing-library/react"
);
const { AmountInput } = await import("./amount-input.js");

function ControlledDigitsHarness({
  initialDigits,
  locale,
  onValueChange,
}: {
  initialDigits: string;
  locale?: string;
  onValueChange?: (next: string) => void;
}) {
  const [digits, setDigits] = React.useState(initialDigits);
  return (
    <AmountInput
      locale={locale}
      value={digits}
      onValueChange={(next) => {
        onValueChange?.(next);
        setDigits(next);
      }}
      words={false}
    />
  );
}

describe("AmountInput", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders with Persian digits and thousands separator (٬) by default", () => {
    render(<AmountInput value={1250000} />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("۱٬۲۵۰٬۰۰۰");
    expect(input.getAttribute("dir")).toBe("ltr");

    // Unit "تومان" displayed by default in fa
    const unitEl = screen.getByText("تومان");
    expect(unitEl).toBeDefined();
  });

  it("spells out words underneath using amountToWords", () => {
    render(<AmountInput value={1250000} />);

    const words = screen.getByText("یک میلیون و دویست و پنجاه هزار تومان");
    expect(words).toBeDefined();
    expect(words.getAttribute("data-slot")).toBe("amount-input-words");
  });

  it("hides words when words={false}", () => {
    render(<AmountInput value={1250000} words={false} />);

    expect(
      screen.queryByText("یک میلیون و دویست و پنجاه هزار تومان"),
    ).toBeNull();
  });

  it("renders standard commas and Latin digits in non-Persian locale", () => {
    render(<AmountInput value={1250000} locale="en" unit="USD" />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("1,250,000");

    expect(screen.getByText("USD")).toBeDefined();
    // Words are not shown by default in en
    expect(screen.queryByText(/million/i)).toBeNull();
  });

  it("handles user typing and emits clean integer to onChange", () => {
    const handleChange = vi.fn();
    render(<AmountInput onChange={handleChange} />);

    const input = screen.getByRole("textbox") as HTMLInputElement;

    // Typing Persian digits with spaces or separators
    fireEvent.change(input, { target: { value: "۵۰۰٬۰۰۰" } });
    expect(handleChange).toHaveBeenCalledWith(500000);

    // Typing Latin digits
    fireEvent.change(input, { target: { value: "2000000" } });
    expect(handleChange).toHaveBeenCalledWith(2000000);

    // Clearing the field emits null
    fireEvent.change(input, { target: { value: "" } });
    expect(handleChange).toHaveBeenCalledWith(null);
  });

  it("validates min limit and shows error with aria-invalid='true'", () => {
    const { rerender } = render(<AmountInput value={50000} min={100000} />);

    const input = screen.getByRole("textbox");
    expect(input.getAttribute("aria-invalid")).toBe("true");

    const error = screen.getByRole("alert");
    expect(error).toBeDefined();
    expect(error.className).toContain("text-destructive");
    expect(error.textContent).toContain("۱۰۰٬۰۰۰");

    // Value within range clears error
    rerender(<AmountInput value={150000} min={100000} />);
    expect(input.getAttribute("aria-invalid")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("validates max limit and shows error with aria-invalid='true'", () => {
    render(<AmountInput value={5000000} max={2000000} />);

    const input = screen.getByRole("textbox");
    expect(input.getAttribute("aria-invalid")).toBe("true");

    const error = screen.getByRole("alert");
    expect(error).toBeDefined();
    expect(error.className).toContain("text-destructive");
    expect(error.textContent).toContain("۲٬۰۰۰٬۰۰۰");
  });

  it("renders quick preset chips and clicking sets the amount", () => {
    const handleChange = vi.fn();
    render(
      <AmountInput
        quick={[100_000, 500_000, 1_000_000]}
        onChange={handleChange}
      />,
    );

    // Short amount format: ۱۰۰ هزار, ۵۰۰ هزار, ۱ میلیون
    const chip1 = screen.getByText("۱۰۰ هزار");
    const chip2 = screen.getByText("۵۰۰ هزار");
    const chip3 = screen.getByText("۱ میلیون");

    expect(chip1).toBeDefined();
    expect(chip2).toBeDefined();
    expect(chip3).toBeDefined();

    fireEvent.click(chip2);
    expect(handleChange).toHaveBeenCalledWith(500000);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("۵۰۰٬۰۰۰");
  });

  it("handles uncontrolled defaultValue", () => {
    render(<AmountInput defaultValue={350000} />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("۳۵۰٬۰۰۰");
  });

  it("normalizes digits on copy event", () => {
    render(<AmountInput value={1250000} />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    const setData = vi.fn();
    const copyEvent = createEvent.copy(input, {
      clipboardData: { setData },
    });

    input.selectionStart = 0;
    input.selectionEnd = 0;
    fireEvent(input, copyEvent);

    expect(setData).toHaveBeenCalledWith("text/plain", "1250000");
  });

  it("forwards ref to HTMLInputElement", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<AmountInput ref={ref} />);

    expect(ref.current).toBeDefined();
    expect(ref.current?.tagName).toBe("INPUT");
  });

  it("respects disabled state", () => {
    const handleChange = vi.fn();
    render(<AmountInput disabled quick={[100_000]} onChange={handleChange} />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.disabled).toBe(true);

    const chip = screen.getByRole("button", { name: "۱۰۰ هزار" });
    expect(chip.hasAttribute("disabled")).toBe(true);

    fireEvent.click(chip);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("supports controlled string-digits mode and arbitrary-precision integers", () => {
    const handleValueChange = vi.fn();
    render(
      <ControlledDigitsHarness
        initialDigits="12345678901234567890"
        onValueChange={handleValueChange}
      />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    // Exact 20-digit grouping in Persian without float precision loss
    expect(input.value).toBe("۱۲٬۳۴۵٬۶۷۸٬۹۰۱٬۲۳۴٬۵۶۷٬۸۹۰");
    // Beyond Number.MAX_SAFE_INTEGER so words do not show wrong rounded text
    expect(screen.queryByText(/صفر/)).toBeNull();

    fireEvent.change(input, {
      target: { value: "۱۲٬۳۴۵٬۶۷۸٬۹۰۱٬۲۳۴٬۵۶۷٬۸۹۰۱" },
    });
    expect(handleValueChange).toHaveBeenLastCalledWith("123456789012345678901");
    expect(input.value).toBe("۱۲۳٬۴۵۶٬۷۸۹٬۰۱۲٬۳۴۵٬۶۷۸٬۹۰۱");

    fireEvent.change(input, { target: { value: "" } });
    expect(handleValueChange).toHaveBeenLastCalledWith("");
    expect(input.value).toBe("");
  });

  it("preserves caret position across grouping changes when typing in the middle", () => {
    render(<ControlledDigitsHarness initialDigits="1234567" locale="en" />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("1,234,567");

    // Simulate typing '9' right after '4' (between '4' and ','): "1,2349,567" with caret at 6
    fireEvent.change(input, {
      target: { value: "1,2349,567", selectionStart: 6 },
    });
    expect(input.value).toBe("12,349,567");
    expect(input.selectionStart).toBe(6);
    expect(input.selectionEnd).toBe(6);
  });

  it("deletes adjacent digit when pressing Backspace or Delete across grouping marks", () => {
    const { rerender } = render(
      <ControlledDigitsHarness initialDigits="12345" locale="fa" />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("۱۲٬۳۴۵");

    // Caret right after '٬' (index 3): Backspace deletes '2', leaving "1,345" with caret after '1' (index 1)
    input.setSelectionRange(3, 3);
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(input.value).toBe("۱٬۳۴۵");
    expect(input.selectionStart).toBe(1);

    // Caret right before '٬' (index 1): Delete removes '3', leaving "145" with caret at index 1
    input.setSelectionRange(1, 1);
    fireEvent.keyDown(input, { key: "Delete" });
    expect(input.value).toBe("۱۴۵");
    expect(input.selectionStart).toBe(1);

    rerender(<ControlledDigitsHarness initialDigits="12345" locale="en" />);
    // In English locale: update to "12,345"
    fireEvent.change(input, { target: { value: "12345", selectionStart: 5 } });
    expect(input.value).toBe("12,345");
    input.setSelectionRange(3, 3);
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(input.value).toBe("1,345");
    expect(input.selectionStart).toBe(1);
  });

  it("copies raw ASCII digits for collapsed and ranged selections in digits mode", () => {
    render(
      <AmountInput
        value="12345678901234567890"
        onValueChange={() => undefined}
        words={false}
      />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    const setData = vi.fn();

    // Collapsed copy copies all raw ASCII digits
    input.setSelectionRange(0, 0);
    fireEvent(
      input,
      createEvent.copy(input, {
        clipboardData: { setData },
      }),
    );
    expect(setData).toHaveBeenLastCalledWith(
      "text/plain",
      "12345678901234567890",
    );

    // Ranged copy over "۱۲٬۳۴۵" -> "12345" without grouping separator
    input.setSelectionRange(0, 6);
    fireEvent(
      input,
      createEvent.copy(input, {
        clipboardData: { setData },
      }),
    );
    expect(setData).toHaveBeenLastCalledWith("text/plain", "12345");
  });

  it("validates min/max accurately in string-digits mode including huge values", () => {
    render(
      <AmountInput
        value="99999999999999999999"
        onValueChange={() => undefined}
        max={2000000}
      />,
    );
    const input = screen.getByRole("textbox");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("alert").textContent).toContain("۲٬۰۰۰٬۰۰۰");
  });

  it("supports uncontrolled digits mode and quick chips", () => {
    const handleValueChange = vi.fn();
    render(
      <AmountInput
        mode="digits"
        defaultValue="250000"
        quick={[100_000, 500_000]}
        onValueChange={handleValueChange}
      />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("۲۵۰٬۰۰۰");

    fireEvent.click(screen.getByRole("button", { name: "۵۰۰ هزار" }));
    expect(handleValueChange).toHaveBeenCalledWith("500000");
    expect(input.value).toBe("۵۰۰٬۰۰۰");
  });
});
