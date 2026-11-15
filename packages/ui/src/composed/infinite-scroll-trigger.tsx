"use client";

import * as React from "react";

import { Button } from "../button.js";
import { cn } from "../lib/utils.js";
import { Spinner } from "../spinner.js";

export interface InfiniteScrollTriggerProps {
  hasMore: boolean;
  loading: boolean;
  /** The last load failed. Shows a retry button instead of observing. */
  failed?: boolean;
  onLoadMore(): void;
  loadMoreLabel: string;
  /** Label of the retry button when `failed`. Defaults to `loadMoreLabel`. */
  retryLabel?: string;
  /** Accessible label of the spinner shown while loading. */
  loadingLabel: string;
  /** Observer margin; loads start before the sentinel is on screen. */
  rootMargin?: string;
  className?: string;
}

/**
 * Loads the next page when a sentinel nears the viewport. Works inside nested
 * scroll containers because the observer uses the viewport as its root. Falls
 * back to a button when IntersectionObserver is unavailable or a load failed.
 */
export function InfiniteScrollTrigger({
  hasMore,
  loading,
  failed = false,
  onLoadMore,
  loadMoreLabel,
  retryLabel,
  loadingLabel,
  rootMargin = "400px 0px",
  className,
}: InfiniteScrollTriggerProps) {
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const onLoadMoreRef = React.useRef(onLoadMore);
  // null until mounted, so server and first client render match.
  const [canObserve, setCanObserve] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  React.useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      setCanObserve(false);
      return;
    }
    setCanObserve(true);
    const node = sentinelRef.current;
    if (!node || !hasMore || loading || failed) return;

    // Re-running this effect after `loading` returns to false re-arms the
    // observer, so a sentinel still on screen after a page loads fires again.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMoreRef.current();
        }
      },
      { root: null, rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, failed, rootMargin]);

  if (!hasMore && !loading) return null;

  const showFallback = hasMore && !loading && (failed || canObserve === false);
  const buttonLabel = failed ? (retryLabel ?? loadMoreLabel) : loadMoreLabel;

  return (
    <div
      data-slot="infinite-scroll-trigger"
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-4",
        className,
      )}
    >
      {hasMore ? (
        <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      ) : null}
      {loading ? <Spinner size="md" label={loadingLabel} /> : null}
      {showFallback ? (
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={() => onLoadMore()}
        >
          {buttonLabel}
        </Button>
      ) : null}
    </div>
  );
}
