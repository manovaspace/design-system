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
const { Pagination, getPaginationRange } = await import("./pagination.js");

describe("Pagination", () => {
  afterEach(() => {
    cleanup();
  });

  describe("getPaginationRange", () => {
    it("returns all pages when totalPages <= 7", () => {
      expect(getPaginationRange({ totalPages: 5, page: 1 })).toEqual([
        1, 2, 3, 4, 5,
      ]);
      expect(getPaginationRange({ totalPages: 7, page: 4 })).toEqual([
        1, 2, 3, 4, 5, 6, 7,
      ]);
    });

    it("returns right ellipsis when page is near start and totalPages > 7", () => {
      expect(getPaginationRange({ totalPages: 10, page: 2 })).toEqual([
        1,
        2,
        3,
        4,
        5,
        "ellipsis-right",
        10,
      ]);
    });

    it("returns left and right ellipsis when page is in middle", () => {
      expect(getPaginationRange({ totalPages: 10, page: 5 })).toEqual([
        1,
        "ellipsis-left",
        4,
        5,
        6,
        "ellipsis-right",
        10,
      ]);
    });

    it("returns left ellipsis when page is near end", () => {
      expect(getPaginationRange({ totalPages: 10, page: 9 })).toEqual([
        1,
        "ellipsis-left",
        6,
        7,
        8,
        9,
        10,
      ]);
    });
  });

  it("renders correct number of pages without ellipsis for small page counts", () => {
    const handleChange = vi.fn();
    render(
      <Pagination page={2} pageSize={10} total={40} onChange={handleChange} />,
    );

    expect(screen.getByRole("button", { name: "Page 1" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Page 2" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Page 3" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Page 4" })).toBeDefined();
  });

  it("marks current page with aria-current='page'", () => {
    const handleChange = vi.fn();
    render(
      <Pagination page={3} pageSize={10} total={50} onChange={handleChange} />,
    );

    const activeBtn = screen.getByRole("button", { name: "Page 3" });
    expect(activeBtn.getAttribute("aria-current")).toBe("page");

    const inactiveBtn = screen.getByRole("button", { name: "Page 1" });
    expect(inactiveBtn.getAttribute("aria-current")).toBeNull();
  });

  it("triggers onChange when clicking a page button", () => {
    const handleChange = vi.fn();
    render(
      <Pagination page={1} pageSize={10} total={50} onChange={handleChange} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Page 4" }));
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it("disables previous button on first page and enables it otherwise", () => {
    const handleChange = vi.fn();
    const { rerender } = render(
      <Pagination page={1} pageSize={10} total={30} onChange={handleChange} />,
    );

    const prevBtn = screen.getByRole("button", { name: "Previous page" });
    expect(prevBtn.hasAttribute("disabled")).toBe(true);

    rerender(
      <Pagination page={2} pageSize={10} total={30} onChange={handleChange} />,
    );
    expect(prevBtn.hasAttribute("disabled")).toBe(false);

    fireEvent.click(prevBtn);
    expect(handleChange).toHaveBeenCalledWith(1);
  });

  it("disables next button on last page and enables it otherwise", () => {
    const handleChange = vi.fn();
    const { rerender } = render(
      <Pagination page={3} pageSize={10} total={30} onChange={handleChange} />,
    );

    const nextBtn = screen.getByRole("button", { name: "Next page" });
    expect(nextBtn.hasAttribute("disabled")).toBe(true);

    rerender(
      <Pagination page={2} pageSize={10} total={30} onChange={handleChange} />,
    );
    expect(nextBtn.hasAttribute("disabled")).toBe(false);

    fireEvent.click(nextBtn);
    expect(handleChange).toHaveBeenCalledWith(3);
  });

  it("formats numbers with persianizeDigits when locale starts with fa", () => {
    const handleChange = vi.fn();
    render(
      <Pagination
        page={2}
        pageSize={10}
        total={40}
        locale="fa-IR"
        onChange={handleChange}
      />,
    );

    // Persian digits: 1 -> ۱, 2 -> ۲, 3 -> ۳, 4 -> ۴
    expect(screen.getByRole("button", { name: "صفحه ۲" })).toBeDefined();
    expect(
      screen
        .getByRole("button", { name: "صفحه ۲" })
        .getAttribute("aria-current"),
    ).toBe("page");
    expect(screen.getByRole("button", { name: "صفحه ۱" })).toBeDefined();
    expect(screen.getByRole("button", { name: "صفحه قبل" })).toBeDefined();
    expect(screen.getByRole("button", { name: "صفحه بعد" })).toBeDefined();
  });

  it("renders ellipsis dots when total pages > 7", () => {
    const handleChange = vi.fn();
    render(
      <Pagination page={5} pageSize={10} total={100} onChange={handleChange} />,
    );

    const ellipsisItems = screen.getAllByText("…");
    expect(ellipsisItems.length).toBe(2);
  });

  it("supports custom aria-label", () => {
    render(
      <Pagination
        page={1}
        pageSize={10}
        total={20}
        onChange={() => {}}
        aria-label="Table navigation"
      />,
    );

    expect(
      screen.getByRole("navigation", { name: "Table navigation" }),
    ).toBeDefined();
  });

  it("inverts chevron direction in RTL", () => {
    const { container: ltrContainer } = render(
      <Pagination page={1} pageSize={10} total={30} onChange={() => {}} />,
    );
    const ltrPrevSvg = ltrContainer.querySelector(
      "button[aria-label='Previous page'] svg",
    );

    const { container: rtlContainer } = render(
      <DirectionProvider direction="rtl">
        <Pagination page={1} pageSize={10} total={30} onChange={() => {}} />
      </DirectionProvider>,
    );
    const rtlPrevSvg = rtlContainer.querySelector(
      "button[aria-label='Previous page'] svg",
    );

    expect(ltrPrevSvg?.getAttribute("class")).toBeDefined();
    expect(rtlPrevSvg?.getAttribute("class")).toBeDefined();
  });
});
