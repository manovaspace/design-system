"use client";

import { useEffect, useRef, useState } from "react";

/** False until `loading` has been true for `delayMs`; resets immediately when loading stops. */
export function useDelayedLoading(
  loading: boolean,
  delayMs = 300,
): boolean {
  const [show, setShow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!loading) {
      setShow(false);
      return;
    }

    timerRef.current = setTimeout(() => {
      setShow(true);
      timerRef.current = null;
    }, delayMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [loading, delayMs]);

  return show;
}

/** Keeps `true` for at least `minMs` once shown to avoid sub-frame loader flashes on hide. */
export function useMinimumVisible(
  visible: boolean,
  minMs = 300,
): boolean {
  const [shown, setShown] = useState(visible);
  const shownAtRef = useRef<number | null>(visible ? Date.now() : null);

  useEffect(() => {
    if (visible) {
      shownAtRef.current = Date.now();
      setShown(true);
      return;
    }

    if (shownAtRef.current === null) {
      setShown(false);
      return;
    }

    const remaining = Math.max(0, minMs - (Date.now() - shownAtRef.current));
    const timer = setTimeout(() => {
      setShown(false);
      shownAtRef.current = null;
    }, remaining);

    return () => clearTimeout(timer);
  }, [visible, minMs]);

  return shown;
}
