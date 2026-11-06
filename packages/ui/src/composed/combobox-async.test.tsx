import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

const { act, cleanup, fireEvent, render, screen } = await import(
  "@testing-library/react"
);
const { ComboboxAsync } = await import("./combobox-async.js");

describe("ComboboxAsync", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
    cleanup();
  });

  it("does not trigger loadOptions when query length < minChars", () => {
    const loadOptions = vi.fn().mockResolvedValue([]);
    render(<ComboboxAsync loadOptions={loadOptions} minChars={3} />);

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "ab" } });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(loadOptions).not.toHaveBeenCalled();
  });

  it("debounces search and displays loaded options", async () => {
    const loadOptions = vi.fn().mockImplementation(async (query: string) => {
      return [
        { value: "res1", label: `Result for ${query}` },
        { value: "res2", label: "Other result" },
      ];
    });

    render(<ComboboxAsync loadOptions={loadOptions} debounce={200} />);

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "test" } });

    // Before debounce fires
    expect(loadOptions).not.toHaveBeenCalled();

    // Advance timer to trigger loadOptions
    await act(async () => {
      vi.advanceTimersByTime(250);
    });

    expect(loadOptions).toHaveBeenCalledWith("test", expect.any(AbortSignal));

    // Options should now be in the document
    expect(screen.getByText("Result for test")).toBeDefined();
    expect(screen.getByText("Other result")).toBeDefined();
  });

  it("picks an option and calls onChange with option object", async () => {
    const onChange = vi.fn();
    const loadOptions = vi
      .fn()
      .mockResolvedValue([{ value: "item1", label: "Selected Item" }]);

    render(
      <ComboboxAsync
        loadOptions={loadOptions}
        onChange={onChange}
        debounce={100}
      />,
    );

    const input = screen.getByRole("combobox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "item" } });

    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    const opt = screen.getByText("Selected Item");
    fireEvent.click(opt);

    expect(onChange).toHaveBeenCalledWith({
      value: "item1",
      label: "Selected Item",
    });
    expect(input.value).toBe("Selected Item");
  });

  it("aborts previous in-flight request when user types again", async () => {
    const signals: AbortSignal[] = [];
    const loadOptions = vi
      .fn()
      .mockImplementation(async (_q: string, signal: AbortSignal) => {
        signals.push(signal);
        return new Promise(() => {}); // never resolves
      });

    render(<ComboboxAsync loadOptions={loadOptions} debounce={100} />);

    const input = screen.getByRole("combobox");

    // First keystroke
    fireEvent.change(input, { target: { value: "first" } });
    await act(async () => {
      vi.advanceTimersByTime(120);
    });
    expect(signals.length).toBe(1);
    expect(signals[0]?.aborted).toBe(false);

    // Second keystroke before first finishes
    fireEvent.change(input, { target: { value: "first second" } });
    await act(async () => {
      vi.advanceTimersByTime(120);
    });

    // Previous signal should now be aborted
    expect(signals[0]?.aborted).toBe(true);
    expect(signals.length).toBe(2);
    expect(signals[1]?.aborted).toBe(false);
  });

  it("displays errorText when loadOptions rejects", async () => {
    const loadOptions = vi.fn().mockRejectedValue(new Error("Network failure"));

    render(
      <ComboboxAsync
        loadOptions={loadOptions}
        debounce={100}
        errorText="خطا در ارتباط"
      />,
    );

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "error-query" } });

    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    expect(screen.getByRole("alert").textContent).toContain("خطا در ارتباط");
  });

  it("renders with English defaults when locale='en-US'", () => {
    const loadOptions = vi.fn().mockResolvedValue([]);
    render(<ComboboxAsync loadOptions={loadOptions} locale="en-US" />);

    const input = screen.getByRole("combobox");
    expect(input.getAttribute("placeholder")).toBe("Search…");
  });
});
