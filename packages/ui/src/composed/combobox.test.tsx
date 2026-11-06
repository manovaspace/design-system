import { afterEach, describe, expect, it, vi } from "vitest";

if (typeof document === "undefined") {
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost",
    pretendToBeVisual: true,
  });
  const win = dom.window;
  globalThis.window = win as unknown as Window & typeof globalThis;
  globalThis.document = win.document;
  globalThis.navigator = win.navigator;
  globalThis.getComputedStyle = win.getComputedStyle.bind(win);
  globalThis.requestAnimationFrame = (cb) =>
    setTimeout(cb, 0) as unknown as number;
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
  globalThis.Element = win.Element;
  globalThis.HTMLElement = win.HTMLElement;
  globalThis.HTMLInputElement = win.HTMLInputElement;
  globalThis.HTMLButtonElement = win.HTMLButtonElement;
  globalThis.HTMLDivElement = win.HTMLDivElement;
  globalThis.Node = win.Node;
  globalThis.Event = win.Event;
  globalThis.CustomEvent = win.CustomEvent;
  globalThis.UIEvent = win.UIEvent;
  globalThis.MouseEvent = win.MouseEvent;
  globalThis.KeyboardEvent = win.KeyboardEvent;
  globalThis.FocusEvent = win.FocusEvent;
  globalThis.PointerEvent = (win.PointerEvent ??
    win.MouseEvent) as unknown as typeof PointerEvent;

  for (const key of Object.getOwnPropertyNames(win)) {
    if (!(key in globalThis)) {
      try {
        // @ts-expect-error dynamic copy
        globalThis[key] = win[key];
      } catch {}
    }
  }
}

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (!globalThis.DOMRect) {
  // @ts-expect-error jsdom stub
  globalThis.DOMRect = class DOMRect {
    x = 0;
    y = 0;
    width = 0;
    height = 0;
    top = 0;
    right = 0;
    bottom = 0;
    left = 0;
    toJSON() {
      return {};
    }
    static fromRect() {
      return {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => {},
      };
    }
  };
}

if (!window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = () => {};
}

const { cleanup, fireEvent, render, screen } = await import(
  "@testing-library/react"
);
const { Combobox } = await import("./combobox.js");

afterEach(() => {
  cleanup();
});

describe("Combobox", () => {
  it("renders with default Persian placeholder and emptyText", () => {
    render(<Combobox options={[]} />);

    const input = screen.getByRole("combobox");
    expect(input.getAttribute("placeholder")).toBe("جست‌وجو…");
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(input.getAttribute("aria-autocomplete")).toBe("list");

    // Open dropdown to view empty state
    fireEvent.click(input);
    expect(screen.getByText("چیزی پیدا نشد")).toBeDefined();
  });

  it("renders with English locale defaults when locale='en-US'", () => {
    render(<Combobox options={[]} locale="en-US" />);

    const input = screen.getByRole("combobox");
    expect(input.getAttribute("placeholder")).toBe("Search…");

    fireEvent.click(input);
    expect(screen.getByText("No options found")).toBeDefined();
  });

  it("respects custom placeholder and emptyText", () => {
    render(
      <Combobox
        options={[]}
        placeholder="Custom Search"
        emptyText="Nothing here"
      />,
    );

    const input = screen.getByRole("combobox");
    expect(input.getAttribute("placeholder")).toBe("Custom Search");

    fireEvent.click(input);
    expect(screen.getByText("Nothing here")).toBeDefined();
  });

  it("filters options with foldPersian (Arabic yeh, ZWNJ, prefix first)", () => {
    const options = [
      { value: "shiraz", label: "شیراز" },
      { value: "ali-abad", label: "علی‌آباد" },
      { value: "mohammad-ali", label: "محمد على" }, // Arabic yeh
      { value: "tehran", label: "تهران" },
    ];

    render(<Combobox options={options} />);

    const input = screen.getByRole("combobox");
    // Search with Persian yeh "علی"
    fireEvent.change(input, { target: { value: "علی" } });

    // Should match both "علی‌آباد" (prefix) and "محمد على" (substring + Arabic yeh folded)
    const matchedOptions = screen.getAllByRole("option");
    expect(matchedOptions.length).toBe(2);
    // Prefix match comes first
    expect(matchedOptions[0]?.textContent).toContain("علی‌آباد");
    expect(matchedOptions[1]?.textContent).toContain("محمد على");
    expect(screen.queryByText("شیراز")).toBeNull();
    expect(screen.queryByText("تهران")).toBeNull();
  });

  it("picks an option via click and calls onChange", () => {
    const onChange = vi.fn();
    const options = [
      { value: "teh", label: "تهران" },
      { value: "esf", label: "اصفهان" },
    ];

    render(<Combobox options={options} onChange={onChange} />);

    const input = screen.getByRole("combobox") as HTMLInputElement;
    fireEvent.click(input);

    const esfOption = screen.getByText("اصفهان");
    fireEvent.click(esfOption);

    expect(onChange).toHaveBeenCalledWith("esf");
    expect(input.value).toBe("اصفهان");
  });

  it("picks an option via keyboard ArrowDown and Enter", () => {
    const onChange = vi.fn();
    const options = [
      { value: "apple", label: "سیب" },
      { value: "banana", label: "موز" },
    ];

    render(<Combobox options={options} onChange={onChange} />);

    const input = screen.getByRole("combobox") as HTMLInputElement;
    // Arrow down opens dropdown and selects first index
    fireEvent.keyDown(input, { key: "ArrowDown" });
    // Next arrow down moves to second option
    fireEvent.keyDown(input, { key: "ArrowDown" });
    // Press Enter to pick
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith("banana");
    expect(input.value).toBe("موز");
  });

  it("reverts on blur in strict mode when input doesn't match an option", () => {
    const onChange = vi.fn();
    const options = [
      { value: "opt1", label: "گزینه یک" },
      { value: "opt2", label: "گزینه دو" },
    ];

    render(
      <Combobox
        options={options}
        defaultValue="opt1"
        strict
        onChange={onChange}
      />,
    );

    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input.value).toBe("گزینه یک");

    // Type unmatched text
    fireEvent.change(input, { target: { value: "متن نامعتبر" } });
    expect(input.value).toBe("متن نامعتبر");

    // Blur reverts to previous value's label
    fireEvent.blur(input);
    expect(input.value).toBe("گزینه یک");
  });

  it("clears on blur in strict mode when no initial option was selected", () => {
    const options = ["گزینه یک", "گزینه دو"];

    render(<Combobox options={options} strict />);

    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input.value).toBe("");

    fireEvent.change(input, { target: { value: "نامعتبر" } });
    expect(input.value).toBe("نامعتبر");

    fireEvent.blur(input);
    expect(input.value).toBe("");
  });

  it("commits matching option on blur in strict mode", () => {
    const onChange = vi.fn();
    const options = [
      { value: "shiraz", label: "شیراز" },
      { value: "tabriz", label: "تبریز" },
    ];

    render(<Combobox options={options} strict onChange={onChange} />);

    const input = screen.getByRole("combobox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "تبریز" } });
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith("tabriz");
    expect(input.value).toBe("تبریز");
  });

  it("commits highlighted option on Tab in strict mode", () => {
    const onChange = vi.fn();
    const options = [
      { value: "v1", label: "گزینه اول" },
      { value: "v2", label: "گزینه دوم" },
    ];

    render(<Combobox options={options} strict onChange={onChange} />);

    const input = screen.getByRole("combobox") as HTMLInputElement;
    fireEvent.click(input);
    fireEvent.keyDown(input, { key: "ArrowDown" }); // highlights option 0
    fireEvent.keyDown(input, { key: "Tab" });

    expect(onChange).toHaveBeenCalledWith("v1");
    expect(input.value).toBe("گزینه اول");
  });

  it("renders hidden input when name prop is provided", () => {
    const options = [
      { value: "val1", label: "Label 1" },
      { value: "val2", label: "Label 2" },
    ];

    const { container } = render(
      <Combobox name="category" options={options} defaultValue="val1" />,
    );

    const hidden = container.querySelector(
      'input[type="hidden"][name="category"]',
    ) as HTMLInputElement;
    expect(hidden).not.toBeNull();
    expect(hidden.value).toBe("val1");

    const input = screen.getByRole("combobox");
    fireEvent.click(input);

    const opt2 = screen.getByText("Label 2");
    fireEvent.click(opt2);

    expect(hidden.value).toBe("val2");
  });

  it("renders grouped options with group labels", () => {
    const options = [
      { value: "t1", label: "Tehran", group: "Iran" },
      { value: "i1", label: "Isfahan", group: "Iran" },
      { value: "p1", label: "Paris", group: "France" },
    ];

    render(<Combobox options={options} />);

    const input = screen.getByRole("combobox");
    fireEvent.click(input);

    expect(screen.getByText("Iran")).toBeDefined();
    expect(screen.getByText("France")).toBeDefined();
    expect(screen.getByText("Tehran")).toBeDefined();
    expect(screen.getByText("Paris")).toBeDefined();
  });
});
