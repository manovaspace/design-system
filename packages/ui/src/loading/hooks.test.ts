import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDelayedLoading, useMinimumVisible } from "./hooks.js";

describe("useDelayedLoading", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("stays false until delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ loading }) => useDelayedLoading(loading, 300),
      { initialProps: { loading: true } },
    );

    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe(true);

    rerender({ loading: false });
    expect(result.current).toBe(false);
  });

  it("resets immediately when loading stops before delay", () => {
    const { result, rerender } = renderHook(
      ({ loading }) => useDelayedLoading(loading, 300),
      { initialProps: { loading: true } },
    );

    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ loading: false });
    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe(false);
  });
});

describe("useMinimumVisible", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows immediately when visible becomes true", () => {
    const { result } = renderHook(
      ({ visible }) => useMinimumVisible(visible, 300),
      { initialProps: { visible: true } },
    );

    expect(result.current).toBe(true);
  });

  it("keeps visible for minimum duration after hide", () => {
    const { result, rerender } = renderHook(
      ({ visible }) => useMinimumVisible(visible, 300),
      { initialProps: { visible: true } },
    );

    rerender({ visible: false });
    expect(result.current).toBe(true);

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe(false);
  });
});
