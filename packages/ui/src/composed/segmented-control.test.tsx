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
  globalThis.HTMLButtonElement = dom.window.HTMLButtonElement;
  globalThis.Node = dom.window.Node;
}

const { cleanup, fireEvent, render, screen } = await import(
  "@testing-library/react"
);
const { DirectionProvider } = await import("../direction-provider.js");
const { SegmentedControl } = await import("./segmented-control.js");

describe("SegmentedControl", () => {
  afterEach(() => {
    cleanup();
  });

  const testOptions = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
  ];

  it("renders with role='radiogroup' and options with role='radio'", () => {
    render(
      <SegmentedControl
        options={testOptions}
        defaultValue="week"
        aria-label="View mode"
      />,
    );

    const group = screen.getByRole("radiogroup", { name: "View mode" });
    expect(group).toBeDefined();

    const radios = screen.getAllByRole("radio");
    expect(radios.length).toBe(4);

    const weekRadio = screen.getByRole("radio", { name: "Week" });
    expect(weekRadio.getAttribute("aria-checked")).toBe("true");

    const dayRadio = screen.getByRole("radio", { name: "Day" });
    expect(dayRadio.getAttribute("aria-checked")).toBe("false");
  });

  it("updates selection on click in uncontrolled mode", () => {
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        options={testOptions}
        defaultValue="day"
        onChange={handleChange}
      />,
    );

    const monthRadio = screen.getByRole("radio", { name: "Month" });
    fireEvent.click(monthRadio);

    expect(handleChange).toHaveBeenCalledWith("month");
    expect(monthRadio.getAttribute("aria-checked")).toBe("true");
    expect(
      screen.getByRole("radio", { name: "Day" }).getAttribute("aria-checked"),
    ).toBe("false");
  });

  it("respects value prop in controlled mode", () => {
    const handleChange = vi.fn();
    const { rerender } = render(
      <SegmentedControl
        options={testOptions}
        value="day"
        onChange={handleChange}
      />,
    );

    const yearRadio = screen.getByRole("radio", { name: "Year" });
    fireEvent.click(yearRadio);
    expect(handleChange).toHaveBeenCalledWith("year");

    // Since controlled value didn't change yet, still day
    expect(
      screen.getByRole("radio", { name: "Day" }).getAttribute("aria-checked"),
    ).toBe("true");

    rerender(
      <SegmentedControl
        options={testOptions}
        value="year"
        onChange={handleChange}
      />,
    );
    expect(yearRadio.getAttribute("aria-checked")).toBe("true");
  });

  it("supports keyboard navigation with ArrowRight and ArrowLeft in LTR", () => {
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        options={testOptions}
        defaultValue="day"
        onChange={handleChange}
      />,
    );

    const dayRadio = screen.getByRole("radio", { name: "Day" });
    dayRadio.focus();

    // ArrowRight -> Week
    fireEvent.keyDown(dayRadio, { key: "ArrowRight" });
    expect(handleChange).toHaveBeenCalledWith("week");

    const weekRadio = screen.getByRole("radio", { name: "Week" });
    expect(weekRadio.getAttribute("aria-checked")).toBe("true");

    // ArrowLeft -> Day
    fireEvent.keyDown(weekRadio, { key: "ArrowLeft" });
    expect(handleChange).toHaveBeenCalledWith("day");
  });

  it("inverts ArrowRight and ArrowLeft in RTL", () => {
    const handleChange = vi.fn();
    render(
      <DirectionProvider direction="rtl">
        <SegmentedControl
          options={testOptions}
          defaultValue="week"
          onChange={handleChange}
        />
      </DirectionProvider>,
    );

    const weekRadio = screen.getByRole("radio", { name: "Week" });
    weekRadio.focus();

    // In RTL, ArrowRight goes to previous (Day)
    fireEvent.keyDown(weekRadio, { key: "ArrowRight" });
    expect(handleChange).toHaveBeenCalledWith("day");

    // In RTL, ArrowLeft goes to next (Week)
    const dayRadio = screen.getByRole("radio", { name: "Day" });
    fireEvent.keyDown(dayRadio, { key: "ArrowLeft" });
    expect(handleChange).toHaveBeenCalledWith("week");
  });

  it("navigates with ArrowDown, ArrowUp, Home, and End", () => {
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        options={testOptions}
        defaultValue="day"
        onChange={handleChange}
      />,
    );

    const dayRadio = screen.getByRole("radio", { name: "Day" });
    dayRadio.focus();

    // ArrowDown -> Week
    fireEvent.keyDown(dayRadio, { key: "ArrowDown" });
    expect(handleChange).toHaveBeenCalledWith("week");

    // End -> Year
    const weekRadio = screen.getByRole("radio", { name: "Week" });
    fireEvent.keyDown(weekRadio, { key: "End" });
    expect(handleChange).toHaveBeenCalledWith("year");

    // Home -> Day
    const yearRadio = screen.getByRole("radio", { name: "Year" });
    fireEvent.keyDown(yearRadio, { key: "Home" });
    expect(handleChange).toHaveBeenCalledWith("day");

    // ArrowUp -> Year (wrapping)
    fireEvent.keyDown(dayRadio, { key: "ArrowUp" });
    expect(handleChange).toHaveBeenCalledWith("year");
  });

  it("skips disabled options during keyboard navigation", () => {
    const optionsWithDisabled = [
      { value: "a", label: "A" },
      { value: "b", label: "B", disabled: true },
      { value: "c", label: "C" },
    ];
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        options={optionsWithDisabled}
        defaultValue="a"
        onChange={handleChange}
      />,
    );

    const aRadio = screen.getByRole("radio", { name: "A" });
    aRadio.focus();

    // Next should skip B and go straight to C
    fireEvent.keyDown(aRadio, { key: "ArrowRight" });
    expect(handleChange).toHaveBeenCalledWith("c");

    // Clicking disabled option B does not trigger onChange
    const bRadio = screen.getByRole("radio", { name: "B" });
    fireEvent.click(bRadio);
    expect(handleChange).not.toHaveBeenCalledWith("b");
  });

  it("handles disabled prop on the whole control", () => {
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        options={testOptions}
        defaultValue="day"
        disabled={true}
        onChange={handleChange}
      />,
    );

    const group = screen.getByRole("radiogroup");
    expect(group.getAttribute("aria-disabled")).toBe("true");

    const radios = screen.getAllByRole("radio");
    for (const r of radios) {
      expect(r.hasAttribute("disabled")).toBe(true);
    }

    fireEvent.click(radios[1] as HTMLElement);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("maintains roving tabindex", () => {
    render(<SegmentedControl options={testOptions} defaultValue="week" />);

    const dayRadio = screen.getByRole("radio", { name: "Day" });
    const weekRadio = screen.getByRole("radio", { name: "Week" });
    const monthRadio = screen.getByRole("radio", { name: "Month" });

    expect(weekRadio.getAttribute("tabindex")).toBe("0");
    expect(dayRadio.getAttribute("tabindex")).toBe("-1");
    expect(monthRadio.getAttribute("tabindex")).toBe("-1");
  });

  it("supports size variants", () => {
    const { container: smContainer } = render(
      <SegmentedControl options={testOptions} size="sm" />,
    );
    expect(smContainer.firstChild).toHaveProperty("className");

    const { container: lgContainer } = render(
      <SegmentedControl options={testOptions} size="lg" />,
    );
    expect(lgContainer.firstChild).toHaveProperty("className");
  });
});
