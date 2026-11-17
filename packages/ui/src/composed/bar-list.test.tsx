import { afterEach, describe, expect, it } from "vitest";

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
  globalThis.Node = dom.window.Node;
  globalThis.Event = dom.window.Event;
}

const { cleanup, render, screen } = await import("@testing-library/react");
const { BarList } = await import("./bar-list.js");

describe("BarList", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders an ordered list with aria-label and one item per entry in order", () => {
    const { container } = render(
      <BarList
        label="Spend by category"
        items={[
          { key: "a", label: "Alpha", value: 3, valueLabel: "3" },
          { key: "b", label: "Beta", value: 2, valueLabel: "2" },
          { key: "c", label: "Gamma", value: 1, valueLabel: "1" },
        ]}
      />,
    );

    const list = screen.getByRole("list", { name: "Spend by category" });
    expect(list.tagName).toBe("OL");
    const items = container.querySelectorAll("[data-slot='bar-list-item']");
    expect(items.length).toBe(3);
    expect(items[0]?.textContent).toContain("Alpha");
    expect(items[1]?.textContent).toContain("Beta");
    expect(items[2]?.textContent).toContain("Gamma");
  });

  it("scales bars to the largest value", () => {
    const { container } = render(
      <BarList
        label="Totals"
        items={[
          { key: "big", label: "Big", value: 200, valueLabel: "200" },
          { key: "half", label: "Half", value: 100, valueLabel: "100" },
        ]}
      />,
    );

    const bars = container.querySelectorAll<HTMLElement>(
      "[data-slot='bar-list-bar']",
    );
    expect(bars.length).toBe(2);
    expect(bars[0]?.getAttribute("style")).toContain("inline-size: 100%");
    expect(bars[1]?.getAttribute("style")).toContain("inline-size: 50%");
  });

  it("renders no bar for zero, NaN or negative values but still renders the row", () => {
    const { container } = render(
      <BarList
        label="Totals"
        items={[
          { key: "top", label: "Top", value: 10, valueLabel: "10" },
          { key: "zero", label: "Zero", value: 0, valueLabel: "0" },
          { key: "nan", label: "NaN row", value: Number.NaN, valueLabel: "-" },
          { key: "neg", label: "Negative", value: -5, valueLabel: "-5" },
        ]}
      />,
    );

    expect(
      container.querySelectorAll("[data-slot='bar-list-item']").length,
    ).toBe(4);
    expect(
      container.querySelectorAll("[data-slot='bar-list-bar']").length,
    ).toBe(1);
    expect(screen.getByText("Zero")).toBeDefined();
    expect(screen.getByText("Negative")).toBeDefined();
  });

  it("renders the empty state and no list when items are empty", () => {
    const { container } = render(
      <BarList label="Totals" items={[]} emptyState={<p>No receipts yet</p>} />,
    );

    expect(screen.getByText("No receipts yet")).toBeDefined();
    expect(
      container.querySelector("[data-slot='bar-list-empty']"),
    ).not.toBeNull();
    expect(container.querySelector("ol")).toBeNull();
  });

  it("renders nothing when items are empty and no empty state is given", () => {
    const { container } = render(<BarList label="Totals" items={[]} />);

    expect(container.innerHTML).toBe("");
  });

  it("renders the valueLabel text in the row", () => {
    render(
      <BarList
        label="Totals"
        items={[
          {
            key: "food",
            label: "غذا",
            description: "۳ فیش",
            value: 1500,
            valueLabel: "۱٬۵۰۰٬۰۰۰ ریال",
          },
        ]}
      />,
    );

    const value = screen.getByText("۱٬۵۰۰٬۰۰۰ ریال");
    expect(value.closest("[data-slot='bar-list-item']")).not.toBeNull();
    expect(screen.getByText("۳ فیش")).toBeDefined();
  });
});
