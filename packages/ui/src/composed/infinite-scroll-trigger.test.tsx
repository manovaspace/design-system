import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  InfiniteScrollTrigger,
  type InfiniteScrollTriggerProps,
} from "./infinite-scroll-trigger.js";

type IntersectionCallback = (
  entries: Array<{ isIntersecting: boolean }>,
) => void;

const observers: Array<{
  callback: IntersectionCallback;
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}> = [];

class MockIntersectionObserver {
  callback: IntersectionCallback;
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  takeRecords = vi.fn(() => []);
  root = null;
  rootMargin = "";
  thresholds = [];

  constructor(callback: IntersectionCallback) {
    this.callback = callback;
    observers.push(this);
  }
}

const baseProps: InfiniteScrollTriggerProps = {
  hasMore: true,
  loading: false,
  onLoadMore: () => {},
  loadMoreLabel: "Load more",
  loadingLabel: "Loading more items",
};

function renderTrigger(overrides: Partial<InfiniteScrollTriggerProps> = {}) {
  const props = { ...baseProps, onLoadMore: vi.fn(), ...overrides };
  const view = render(<InfiniteScrollTrigger {...props} />);
  return { ...view, props };
}

describe("InfiniteScrollTrigger", () => {
  beforeEach(() => {
    observers.length = 0;
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("observes the sentinel and calls onLoadMore when it intersects", () => {
    const { props } = renderTrigger();

    expect(observers).toHaveLength(1);
    expect(observers[0]?.observe).toHaveBeenCalledTimes(1);

    observers[0]?.callback([{ isIntersecting: true }]);
    expect(props.onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("does not call onLoadMore when the sentinel is not intersecting", () => {
    const { props } = renderTrigger();

    observers[0]?.callback([{ isIntersecting: false }]);
    expect(props.onLoadMore).not.toHaveBeenCalled();
  });

  it("does not observe while loading", () => {
    renderTrigger({ loading: true });
    expect(observers).toHaveLength(0);
  });

  it("does not observe after a failed load and shows the retry button", () => {
    const { props } = renderTrigger({ failed: true, retryLabel: "Try again" });

    expect(observers).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(props.onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("uses loadMoreLabel for the retry button when retryLabel is missing", () => {
    renderTrigger({ failed: true });
    expect(screen.getByRole("button", { name: "Load more" })).toBeDefined();
  });

  it("renders nothing and observes nothing when there is no more data", () => {
    const { container } = renderTrigger({ hasMore: false });

    expect(container.firstChild).toBeNull();
    expect(observers).toHaveLength(0);
  });

  it("shows a polite spinner with the loading label while loading", () => {
    renderTrigger({ loading: true });

    const status = screen.getByRole("status", { name: "Loading more items" });
    expect(status).toBeDefined();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("re-arms the observer after loading finishes", () => {
    const onLoadMore = vi.fn();
    const { rerender } = renderTrigger({ onLoadMore });
    expect(observers).toHaveLength(1);

    rerender(
      <InfiniteScrollTrigger {...baseProps} onLoadMore={onLoadMore} loading />,
    );
    expect(observers[0]?.disconnect).toHaveBeenCalled();

    rerender(
      <InfiniteScrollTrigger
        {...baseProps}
        onLoadMore={onLoadMore}
        loading={false}
      />,
    );
    expect(observers).toHaveLength(2);
    expect(observers[1]?.observe).toHaveBeenCalledTimes(1);
  });

  it("disconnects the observer on unmount", () => {
    const { unmount } = renderTrigger();
    unmount();
    expect(observers[0]?.disconnect).toHaveBeenCalled();
  });

  it("uses the default rootMargin and accepts a custom one", () => {
    const spy = vi.fn();
    class SpyObserver extends MockIntersectionObserver {
      constructor(
        callback: IntersectionCallback,
        options?: IntersectionObserverInit,
      ) {
        super(callback);
        spy(options);
      }
    }
    vi.stubGlobal("IntersectionObserver", SpyObserver);

    renderTrigger();
    expect(spy).toHaveBeenLastCalledWith({
      root: null,
      rootMargin: "400px 0px",
    });

    cleanup();
    renderTrigger({ rootMargin: "100px 0px" });
    expect(spy).toHaveBeenLastCalledWith({
      root: null,
      rootMargin: "100px 0px",
    });
  });

  it("shows a fallback button when IntersectionObserver is unavailable", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const { props } = renderTrigger();

    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(props.onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("does not show the fallback button while loading", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    renderTrigger({ loading: true });

    expect(screen.queryByRole("button")).toBeNull();
  });
});
