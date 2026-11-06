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
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

const { cleanup, fireEvent, render, screen, within } = await import(
  "@testing-library/react"
);
const { MultiSelect } = await import("./multi-select.js");

const sampleOptions = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
  { value: "angular", label: "Angular" },
];

describe("MultiSelect", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders trigger with placeholder and default ARIA attributes", () => {
    render(
      <MultiSelect
        options={sampleOptions}
        placeholder="Select framework"
        locale="en"
      />,
    );

    const combobox = screen.getByRole("combobox");
    expect(combobox).toBeDefined();
    expect(combobox.getAttribute("aria-expanded")).toBe("false");
    expect(combobox.getAttribute("aria-haspopup")).toBe("listbox");
    expect(screen.getByText("Select framework")).toBeDefined();
  });

  it("opens popover on click and toggles option selection", () => {
    const handleChange = vi.fn();
    render(
      <MultiSelect
        options={sampleOptions}
        onChange={handleChange}
        locale="en"
      />,
    );

    const combobox = screen.getByRole("combobox");
    fireEvent.click(combobox);

    expect(combobox.getAttribute("aria-expanded")).toBe("true");
    const listbox = screen.getByRole("listbox");
    expect(listbox).toBeDefined();

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(4);

    // Select "React"
    const firstOption = options[0];
    expect(firstOption).toBeDefined();
    if (firstOption) fireEvent.click(firstOption);
    expect(handleChange).toHaveBeenCalledWith(["react"]);

    // Chip should now appear inside trigger
    expect(within(combobox).getByText("React")).toBeDefined();
  });

  it("unselects via chip remove X button", () => {
    const handleChange = vi.fn();
    render(
      <MultiSelect
        options={sampleOptions}
        defaultValue={["react", "vue"]}
        onChange={handleChange}
        locale="en"
      />,
    );

    expect(screen.getByText("React")).toBeDefined();
    expect(screen.getByText("Vue")).toBeDefined();

    const removeReactBtn = screen.getByRole("button", {
      name: "Remove React",
    });
    fireEvent.click(removeReactBtn);

    expect(handleChange).toHaveBeenCalledWith(["vue"]);
  });

  it("collapses excess items into badge with maxVisible in Persian and English", () => {
    const { rerender } = render(
      <MultiSelect
        options={sampleOptions}
        defaultValue={["react", "vue", "svelte", "angular"]}
        maxVisible={2}
        locale="fa"
      />,
    );

    // 2 visible + 2 excess in Persian (+۲ مورد دیگر)
    expect(screen.getByText("React")).toBeDefined();
    expect(screen.getByText("Vue")).toBeDefined();
    expect(screen.queryByText("Svelte")).toBeNull();
    expect(screen.getByText("+۲ مورد دیگر")).toBeDefined();

    // Rerender with English locale
    rerender(
      <MultiSelect
        options={sampleOptions}
        defaultValue={["react", "vue", "svelte", "angular"]}
        maxVisible={2}
        locale="en"
      />,
    );

    expect(screen.getByText("+2 more")).toBeDefined();
  });

  it("enforces max limit on selections", () => {
    const handleChange = vi.fn();
    render(
      <MultiSelect
        options={sampleOptions}
        max={2}
        defaultValue={["react"]}
        onChange={handleChange}
        locale="en"
      />,
    );

    const combobox = screen.getByRole("combobox");
    fireEvent.click(combobox);

    const options = screen.getAllByRole("option");
    // Select second item "Vue"
    const secondOption = options[1];
    if (secondOption) fireEvent.click(secondOption);
    expect(handleChange).toHaveBeenLastCalledWith(["react", "vue"]);

    // Try selecting third item "Svelte" -> blocked by max=2
    const thirdOption = options[2];
    if (thirdOption) fireEvent.click(thirdOption);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("filters options using foldPersian", () => {
    const persianOptions = [
      { value: "ali-abad", label: "علی‌آباد" },
      { value: "tehran", label: "تهران" },
      { value: "shiraz", label: "شیراز" },
    ];

    render(<MultiSelect options={persianOptions} locale="fa" />);

    const combobox = screen.getByRole("combobox");
    fireEvent.click(combobox);

    const searchInput = screen.getByPlaceholderText("جستجو...");
    // Search with Arabic Yeh "علي اباد" without ZWNJ
    fireEvent.change(searchInput, { target: { value: "علي اباد" } });

    expect(screen.getByText("علی‌آباد")).toBeDefined();
    expect(screen.queryByText("تهران")).toBeNull();
    expect(screen.queryByText("شیراز")).toBeNull();
  });

  it("accepts plain string options gracefully", () => {
    const handleChange = vi.fn();
    render(
      <MultiSelect
        options={["Tehran", "Isfahan", "Shiraz"]}
        onChange={handleChange}
        locale="en"
      />,
    );

    const combobox = screen.getByRole("combobox");
    fireEvent.click(combobox);

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);

    const firstOption = options[0];
    if (firstOption) fireEvent.click(firstOption);
    expect(handleChange).toHaveBeenCalledWith(["Tehran"]);
    expect(within(combobox).getByText("Tehran")).toBeDefined();
  });

  it("supports keyboard navigation: ArrowDown, ArrowUp, Enter, Space, Backspace, Escape", () => {
    const handleChange = vi.fn();
    render(
      <MultiSelect
        options={sampleOptions}
        defaultValue={["react"]}
        onChange={handleChange}
        locale="en"
      />,
    );

    const combobox = screen.getByRole("combobox");

    // Open via Enter
    fireEvent.keyDown(combobox, { key: "Enter" });
    expect(combobox.getAttribute("aria-expanded")).toBe("true");

    const searchInput = screen.getByPlaceholderText("Search...");

    // Move to next option (Vue) with ArrowDown and select with Enter
    fireEvent.keyDown(searchInput, { key: "ArrowDown" });
    fireEvent.keyDown(searchInput, { key: "Enter" });
    expect(handleChange).toHaveBeenCalledWith(["react", "vue"]);

    // Move with ArrowDown (Svelte) and toggle with Space
    fireEvent.keyDown(searchInput, { key: "ArrowDown" });
    fireEvent.keyDown(searchInput, { key: " " });
    expect(handleChange).toHaveBeenCalledWith(["react", "vue", "svelte"]);

    // Backspace removes last chip if search is empty
    fireEvent.keyDown(searchInput, { key: "Backspace" });
    expect(handleChange).toHaveBeenCalledWith(["react", "vue"]);

    // Escape closes popover
    fireEvent.keyDown(searchInput, { key: "Escape" });
    expect(combobox.getAttribute("aria-expanded")).toBe("false");
  });

  it("does not allow interaction when disabled", () => {
    const handleChange = vi.fn();
    render(
      <MultiSelect
        options={sampleOptions}
        defaultValue={["react"]}
        onChange={handleChange}
        disabled
        locale="en"
      />,
    );

    const combobox = screen.getByRole("combobox");
    expect(combobox.getAttribute("aria-disabled")).toBe("true");

    fireEvent.click(combobox);
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});
