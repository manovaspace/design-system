// @vitest-environment jsdom

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DirectionProvider } from "../direction-provider.js";
import { HoldToConfirmButton } from "./hold-to-confirm-button.js";

if (
  typeof window !== "undefined" &&
  typeof window.PointerEvent === "undefined"
) {
  class PointerEventPolyfill extends MouseEvent {
    pointerId: number;
    pointerType: string;
    isPrimary: boolean;
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 0;
      this.pointerType = params.pointerType ?? "mouse";
      this.isPrimary = params.isPrimary ?? false;
    }
  }
  window.PointerEvent =
    PointerEventPolyfill as unknown as typeof window.PointerEvent;
  globalThis.PointerEvent =
    PointerEventPolyfill as unknown as typeof globalThis.PointerEvent;
}

if (typeof Element !== "undefined") {
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
}

describe("HoldToConfirmButton", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("1. Quick tap (< 400ms) triggers onShortTapHint and does not call onConfirm", () => {
    const onConfirm = vi.fn();
    const onShortTapHint = vi.fn();

    act(() => {
      root.render(
        <HoldToConfirmButton
          onConfirm={onConfirm}
          onShortTapHint={onShortTapHint}
          labelIdle="Hold to reject"
          ariaDescription="Trade will be rejected"
          holdDurationMs={1000}
          tapHintThresholdMs={400}
        />,
      );
    });

    const button = container.querySelector("button");
    expect(button).toBeInstanceOf(HTMLButtonElement);
    if (!button) return;

    // Pointer down
    act(() => {
      button.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          button: 0,
        }),
      );
    });

    // Advance 150ms (< 400ms)
    act(() => {
      vi.advanceTimersByTime(150);
    });

    // Pointer up
    act(() => {
      button.dispatchEvent(
        new PointerEvent("pointerup", { bubbles: true, cancelable: true }),
      );
    });

    expect(onShortTapHint).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("2. Sustained hold (>= 1000ms) triggers onConfirm", () => {
    const onConfirm = vi.fn();
    const onShortTapHint = vi.fn();

    act(() => {
      root.render(
        <HoldToConfirmButton
          onConfirm={onConfirm}
          onShortTapHint={onShortTapHint}
          labelIdle="Hold to reject"
          ariaDescription="Trade will be rejected"
          holdDurationMs={1000}
          tapHintThresholdMs={400}
        />,
      );
    });

    const button = container.querySelector("button");
    expect(button).toBeInstanceOf(HTMLButtonElement);
    if (!button) return;

    // Pointer down
    act(() => {
      button.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          button: 0,
        }),
      );
    });

    // Advance past 1000ms
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onShortTapHint).not.toHaveBeenCalled();

    // Releasing after confirm should not trigger short tap hint
    act(() => {
      button.dispatchEvent(
        new PointerEvent("pointerup", { bubbles: true, cancelable: true }),
      );
    });

    expect(onShortTapHint).not.toHaveBeenCalled();
  });

  it("3. Mouse leave / pointer cancel resets progress", () => {
    const onConfirm = vi.fn();
    const onShortTapHint = vi.fn();

    act(() => {
      root.render(
        <HoldToConfirmButton
          onConfirm={onConfirm}
          onShortTapHint={onShortTapHint}
          labelIdle="Hold to reject"
          ariaDescription="Trade will be rejected"
          holdDurationMs={1000}
          tapHintThresholdMs={400}
        />,
      );
    });

    const button = container.querySelector("button");
    expect(button).toBeInstanceOf(HTMLButtonElement);
    if (!button) return;

    // Test pointercancel
    act(() => {
      button.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          button: 0,
        }),
      );
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    act(() => {
      button.dispatchEvent(
        new PointerEvent("pointercancel", { bubbles: true, cancelable: true }),
      );
    });

    // Advance past 1000ms — confirm should NOT fire
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onShortTapHint).not.toHaveBeenCalled();

    // Test mouseleave
    act(() => {
      button.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          button: 0,
        }),
      );
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    act(() => {
      button.dispatchEvent(
        new MouseEvent("mouseleave", { bubbles: true, cancelable: true }),
      );
    });

    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onShortTapHint).not.toHaveBeenCalled();
  });

  it("4. Keyboard Space down/up triggers hold/release", () => {
    const onConfirm = vi.fn();
    const onShortTapHint = vi.fn();

    act(() => {
      root.render(
        <HoldToConfirmButton
          onConfirm={onConfirm}
          onShortTapHint={onShortTapHint}
          labelIdle="Hold to reject"
          ariaDescription="Trade will be rejected"
          holdDurationMs={1000}
          tapHintThresholdMs={400}
        />,
      );
    });

    const button = container.querySelector("button");
    expect(button).toBeInstanceOf(HTMLButtonElement);
    if (!button) return;

    // Short space tap (< 400ms)
    act(() => {
      button.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          cancelable: true,
          key: " ",
        }),
      );
    });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    act(() => {
      button.dispatchEvent(
        new KeyboardEvent("keyup", {
          bubbles: true,
          cancelable: true,
          key: " ",
        }),
      );
    });

    expect(onShortTapHint).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();

    // Reset mocks for sustained space hold
    onShortTapHint.mockClear();
    onConfirm.mockClear();

    act(() => {
      button.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          cancelable: true,
          key: " ",
        }),
      );
    });

    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onShortTapHint).not.toHaveBeenCalled();

    act(() => {
      button.dispatchEvent(
        new KeyboardEvent("keyup", {
          bubbles: true,
          cancelable: true,
          key: " ",
        }),
      );
    });

    expect(onShortTapHint).not.toHaveBeenCalled();
  });

  it("5. Respects disabled prop", () => {
    const onConfirm = vi.fn();
    const onShortTapHint = vi.fn();

    act(() => {
      root.render(
        <HoldToConfirmButton
          disabled
          onConfirm={onConfirm}
          onShortTapHint={onShortTapHint}
          labelIdle="Hold to reject"
          ariaDescription="Trade will be rejected"
        />,
      );
    });

    const button = container.querySelector("button");
    expect(button).toBeInstanceOf(HTMLButtonElement);
    if (!button) return;
    expect(button.disabled).toBe(true);

    act(() => {
      button.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          button: 0,
        }),
      );
    });

    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onShortTapHint).not.toHaveBeenCalled();
  });

  it("6. Renders screen reader description and RTL support", () => {
    act(() => {
      root.render(
        <DirectionProvider direction="rtl">
          <HoldToConfirmButton
            onConfirm={vi.fn()}
            labelIdle="رد معامله"
            ariaDescription="توضیحات دسترسی‌پذیری برای لغو معامله"
          />
        </DirectionProvider>,
      );
    });

    const button = container.querySelector("button");
    expect(button).toBeInstanceOf(HTMLButtonElement);
    if (!button) return;

    const descId = button.getAttribute("aria-describedby");
    expect(descId).toBeTruthy();
    if (!descId) return;

    const descEl = document.getElementById(descId);
    expect(descEl).not.toBeNull();
    expect(descEl?.textContent).toContain(
      "توضیحات دسترسی‌پذیری برای لغو معامله",
    );

    // Check progress indicator element exists and uses inset-inline-start
    const indicator = button.querySelector(
      "[aria-hidden='true']",
    ) as HTMLElement | null;
    expect(indicator).not.toBeNull();
    expect(["0", "0px"]).toContain(indicator?.style.insetInlineStart);
  });
});
