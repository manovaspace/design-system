"use client";

import { useCallback, useRef } from "react";

import { MAX_PANEL_WIDTH, MIN_PANEL_WIDTH } from "../types.js";

type DevPanelResizerProps = {
  panelWidth: number;
  onResize: (width: number) => void;
};

export function DevPanelResizer({
  panelWidth,
  onResize,
}: DevPanelResizerProps) {
  const dragging = useRef(false);
  const startWidthRef = useRef(panelWidth);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      dragging.current = true;
      startWidthRef.current = panelWidth;
      const startX = event.clientX;
      event.currentTarget.setPointerCapture(event.pointerId);

      const onMove = (moveEvent: PointerEvent) => {
        if (!dragging.current) return;
        const delta = startX - moveEvent.clientX;
        const next = Math.min(
          MAX_PANEL_WIDTH,
          Math.max(MIN_PANEL_WIDTH, startWidthRef.current + delta),
        );
        onResize(next);
      };

      const onUp = () => {
        dragging.current = false;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [onResize, panelWidth],
  );

  return (
    // biome-ignore lint/a11y/useSemanticElements: draggable separator handle
    <div
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
      aria-valuenow={panelWidth}
      aria-valuemin={MIN_PANEL_WIDTH}
      aria-valuemax={MAX_PANEL_WIDTH}
      aria-label="Resize devtools panel"
      onPointerDown={onPointerDown}
      className="orbit-dev-panel-resizer absolute inset-y-0 start-0 z-10 w-1 -translate-x-1/2 cursor-col-resize touch-none hover:bg-primary/30 active:bg-primary/50"
    />
  );
}
