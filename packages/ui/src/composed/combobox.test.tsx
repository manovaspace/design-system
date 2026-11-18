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

  it("does not pick an option on Enter while IME composition is active", () => {
    const onChange = vi.fn();
    const options = [
      { value: "apple", label: "سیب" },
      { value: "banana", label: "موز" },
    ];

    render(<Combobox options={options} onChange={onChange} />);

    const input = screen.getByRole("combobox") as HTMLInputElement;
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    fireEvent.keyDown(input, { key: "Enter", keyCode: 229 });
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("banana");
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

const pantry = [
  {
    value: "olive-oil",
    label: "Olive oil",
    description: "Cold-pressed",
    group: "Pantry",
  },
  {
    value: "black-pepper",
    label: "Black pepper",
    description: "Whole peppercorns",
    group: "Pantry",
  },
  {
    value: "green-tea",
    label: "Green tea",
    description: "Loose leaf",
    group: "Drinks",
  },
];

describe('Combobox trigger="button"', () => {
  it("renders a combobox button with the placeholder when nothing is selected", () => {
    render(
      <Combobox
        trigger="button"
        options={pantry}
        placeholder="Choose an item"
        locale="en-US"
      />,
    );

    const button = screen.getByRole("combobox");
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("aria-haspopup")).toBe("listbox");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.textContent).toBe("Choose an item");
  });

  it("opens on click and focuses the search box", () => {
    render(<Combobox trigger="button" options={pantry} locale="en-US" />);

    const button = screen.getByRole("combobox");
    fireEvent.click(button);

    expect(button.getAttribute("aria-expanded")).toBe("true");
    const search = screen.getByRole("searchbox");
    expect(search.getAttribute("aria-label")).toBe("Search…");
    expect(document.activeElement).toBe(search);
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("uses the Persian search label by default", () => {
    render(<Combobox trigger="button" options={pantry} />);

    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("searchbox").getAttribute("aria-label")).toBe(
      "جست‌وجو…",
    );
  });

  it.each(["Enter", " ", "ArrowDown", "ArrowUp"])(
    "opens with the %s key",
    (key) => {
      render(<Combobox trigger="button" options={pantry} locale="en-US" />);

      const button = screen.getByRole("combobox");
      fireEvent.keyDown(button, { key });

      expect(button.getAttribute("aria-expanded")).toBe("true");
      expect(screen.getByRole("searchbox")).toBeDefined();
    },
  );

  it("toggles aria-expanded on repeated clicks", () => {
    render(<Combobox trigger="button" options={pantry} locale="en-US" />);

    const button = screen.getByRole("combobox");
    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("searchbox")).toBeNull();
  });

  it("filters the listbox from the search box by label, value and description", () => {
    render(<Combobox trigger="button" options={pantry} locale="en-US" />);

    fireEvent.click(screen.getByRole("combobox"));
    const search = screen.getByRole("searchbox");

    fireEvent.change(search, { target: { value: "pep" } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getAllByRole("option")[0]?.textContent).toContain(
      "Black pepper",
    );

    fireEvent.change(search, { target: { value: "loose" } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getAllByRole("option")[0]?.textContent).toContain(
      "Green tea",
    );

    fireEvent.change(search, { target: { value: "green-tea" } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.queryByText("Olive oil")).toBeNull();
  });

  it("searches with foldPersian and ranks prefix matches first", () => {
    const options = [
      { value: "mohammad-ali", label: "محمد على" },
      { value: "ali-abad", label: "علی‌آباد" },
      { value: "tehran", label: "تهران" },
    ];

    render(<Combobox trigger="button" options={options} />);

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "علی" },
    });

    const matched = screen.getAllByRole("option");
    expect(matched).toHaveLength(2);
    expect(matched[0]?.textContent).toContain("علی‌آباد");
    expect(matched[1]?.textContent).toContain("محمد على");
    expect(screen.queryByText("تهران")).toBeNull();
  });

  it("selects with ArrowDown and Enter, updates the label and calls onChange", () => {
    const onChange = vi.fn();
    render(
      <Combobox
        trigger="button"
        options={pantry}
        onChange={onChange}
        locale="en-US"
      />,
    );

    const button = screen.getByRole("combobox");
    fireEvent.click(button);
    const search = screen.getByRole("searchbox");

    fireEvent.keyDown(search, { key: "ArrowDown" });
    fireEvent.keyDown(search, { key: "ArrowDown" });
    const options = screen.getAllByRole("option");
    expect(search.getAttribute("aria-activedescendant")).toBe(options[1]?.id);

    fireEvent.keyDown(search, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith("black-pepper");
    expect(button.textContent).toContain("Black pepper");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(button);
  });

  it("closes on Escape and returns focus to the button", () => {
    render(<Combobox trigger="button" options={pantry} locale="en-US" />);

    const button = screen.getByRole("combobox");
    fireEvent.click(button);
    fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Escape" });

    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(button);
  });

  it("resets the search text when the popover closes", () => {
    render(<Combobox trigger="button" options={pantry} locale="en-US" />);

    const button = screen.getByRole("combobox");
    fireEvent.click(button);
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "pep" },
    });
    expect(screen.getAllByRole("option")).toHaveLength(1);

    fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Escape" });
    fireEvent.click(button);

    const search = screen.getByRole("searchbox") as HTMLInputElement;
    expect(search.value).toBe("");
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("keeps the hidden name input in sync with the selection", () => {
    const { container } = render(
      <Combobox
        trigger="button"
        name="item"
        options={pantry}
        defaultValue="green-tea"
        locale="en-US"
      />,
    );

    const hidden = container.querySelector(
      'input[type="hidden"][name="item"]',
    ) as HTMLInputElement;
    expect(hidden.value).toBe("green-tea");

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Olive oil"));

    expect(hidden.value).toBe("olive-oil");
    expect(screen.getByRole("combobox").textContent).toContain("Olive oil");
  });

  it("does not select disabled options", () => {
    const onChange = vi.fn();
    const options = [
      { value: "a", label: "Available" },
      { value: "b", label: "Sold out", disabled: true },
    ];

    render(
      <Combobox
        trigger="button"
        options={options}
        onChange={onChange}
        locale="en-US"
      />,
    );

    const button = screen.getByRole("combobox");
    fireEvent.click(button);
    fireEvent.click(screen.getByText("Sold out"));

    expect(onChange).not.toHaveBeenCalled();
    expect(button.getAttribute("aria-expanded")).toBe("true");
  });

  it("does not open when disabled", () => {
    render(
      <Combobox trigger="button" options={pantry} disabled locale="en-US" />,
    );

    const button = screen.getByRole("combobox") as HTMLButtonElement;
    expect(button.disabled).toBe(true);

    fireEvent.click(button);
    fireEvent.keyDown(button, { key: "ArrowDown" });
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  it("forwards the ref to the button", async () => {
    const { createRef } = await import("react");
    const ref = createRef<HTMLInputElement | HTMLButtonElement>();

    render(<Combobox ref={ref} trigger="button" options={pantry} />);

    expect(ref.current?.tagName).toBe("BUTTON");
  });
});

describe("Combobox option descriptions", () => {
  it("renders descriptions in input mode and filters by description", () => {
    render(<Combobox options={pantry} locale="en-US" />);

    const input = screen.getByRole("combobox");
    fireEvent.click(input);
    expect(screen.getByText("Loose leaf")).toBeDefined();

    fireEvent.change(input, { target: { value: "peppercorns" } });
    const matched = screen.getAllByRole("option");
    expect(matched).toHaveLength(1);
    expect(matched[0]?.textContent).toContain("Black pepper");
  });

  it("renders descriptions in button mode", () => {
    render(<Combobox trigger="button" options={pantry} locale="en-US" />);

    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("Cold-pressed")).toBeDefined();
    expect(screen.getByText("Whole peppercorns")).toBeDefined();
  });
});

describe("Combobox trigger default", () => {
  it("uses the input trigger when trigger is not set", () => {
    render(<Combobox options={pantry} locale="en-US" />);

    const trigger = screen.getByRole("combobox");
    expect(trigger.tagName).toBe("INPUT");
    expect(screen.queryByRole("searchbox")).toBeNull();
  });
});
