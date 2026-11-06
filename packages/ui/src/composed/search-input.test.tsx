import * as React from "react";
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
  globalThis.HTMLButtonElement = dom.window.HTMLButtonElement;
  globalThis.Node = dom.window.Node;
  globalThis.Event = dom.window.Event;
  globalThis.MouseEvent = dom.window.MouseEvent;
}

const { cleanup, fireEvent, render, screen } = await import(
  "@testing-library/react"
);
const { SearchInput } = await import("./search-input.js");

afterEach(() => {
  cleanup();
});

describe("SearchInput", () => {
  it("renders magnifying glass icon as startAddon", () => {
    const { container } = render(<SearchInput />);
    const startAddon = container.querySelector(
      '[data-slot="input-start-addon"]',
    );
    expect(startAddon).not.toBeNull();
    // Lucide Search icon is an SVG
    expect(startAddon?.querySelector("svg")).not.toBeNull();
  });

  describe("dual-mode placeholders", () => {
    it("defaults to English 'Search…' by default", () => {
      render(<SearchInput />);
      expect(screen.getByPlaceholderText("Search…")).toBeDefined();
    });

    it("defaults to Persian 'جست‌وجو…' when locale starts with 'fa'", () => {
      render(<SearchInput locale="fa-IR" />);
      expect(screen.getByPlaceholderText("جست‌وجو…")).toBeDefined();
    });

    it("defaults to Persian 'جست‌وجو…' when dir='rtl'", () => {
      render(<SearchInput dir="rtl" />);
      expect(screen.getByPlaceholderText("جست‌وجو…")).toBeDefined();
    });

    it("respects custom placeholder over defaults", () => {
      render(<SearchInput locale="fa" placeholder="جستجوی اعضا..." />);
      expect(screen.getByPlaceholderText("جستجوی اعضا...")).toBeDefined();
    });
  });

  describe("clear button", () => {
    it("does not render clear button when value is empty", () => {
      const onClear = vi.fn();
      const { container } = render(<SearchInput value="" onClear={onClear} />);
      expect(
        container.querySelector('[data-slot="search-input-clear"]'),
      ).toBeNull();
    });

    it("does not render clear button when onClear is not provided", () => {
      const { container } = render(
        <SearchInput value="test" onChange={() => {}} />,
      );
      expect(
        container.querySelector('[data-slot="search-input-clear"]'),
      ).toBeNull();
    });

    it("renders clear button when value is non-empty and onClear is provided", () => {
      const onClear = vi.fn();
      const { container } = render(
        <SearchInput value="apple" onChange={() => {}} onClear={onClear} />,
      );

      const clearBtn = container.querySelector(
        '[data-slot="search-input-clear"]',
      );
      expect(clearBtn).not.toBeNull();
      expect(clearBtn?.getAttribute("type")).toBe("button");

      if (clearBtn) fireEvent.click(clearBtn);
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it("handles uncontrolled typing and clearing", () => {
      const onClear = vi.fn();
      const { container } = render(<SearchInput onClear={onClear} />);

      const input = screen.getByPlaceholderText("Search…") as HTMLInputElement;
      expect(
        container.querySelector('[data-slot="search-input-clear"]'),
      ).toBeNull();

      // Type text into input
      fireEvent.change(input, { target: { value: "query text" } });
      expect(input.value).toBe("query text");

      const clearBtn = container.querySelector(
        '[data-slot="search-input-clear"]',
      );
      expect(clearBtn).not.toBeNull();

      if (clearBtn) fireEvent.click(clearBtn);
      expect(onClear).toHaveBeenCalledTimes(1);
      expect(input.value).toBe("");
    });
  });

  it("forwards ref to HTMLInputElement", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<SearchInput ref={ref} placeholder="Ref search" />);

    expect(ref.current).toBeInstanceOf(globalThis.HTMLInputElement);
    expect(ref.current?.placeholder).toBe("Ref search");
  });
});
