"use client";

import { Button, ChevronRightIcon, cn, iconProps } from "@manovaspace/ui";
import { useEffect, useState } from "react";

import { useDevtools } from "../context.js";
import { DevPanelEdgeToggle } from "./dev-panel-edge-toggle.js";
import { DevPanelResizer } from "./dev-panel-resizer.js";
import { getDevTool } from "./dev-tools-registry.js";

export function DevSidePanel() {
  const {
    panelOpen,
    setPanelOpen,
    activeTool,
    panelWidth,
    setPanelWidth,
    hasUnsavedChanges,
  } = useDevtools();
  const [transitionEnabled, setTransitionEnabled] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setTransitionEnabled(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const tool = getDevTool(activeTool);
  const Panel = tool.Panel;

  return (
    <>
      {!panelOpen ? (
        <DevPanelEdgeToggle
          open={false}
          hasUnsavedChanges={hasUnsavedChanges}
          onToggle={() => setPanelOpen(true)}
        />
      ) : null}
      <aside
        dir="ltr"
        aria-label="Orbit Devtools"
        aria-hidden={!panelOpen}
        data-open={panelOpen ? "true" : "false"}
        style={{ width: panelOpen ? panelWidth : 0 }}
        className={cn(
          "orbit-dev-side-panel",
          transitionEnabled && "orbit-dev-side-panel--animated",
        )}
      >
        {panelOpen ? (
          <DevPanelEdgeToggle
            open
            placement="seam"
            hasUnsavedChanges={hasUnsavedChanges}
            onToggle={() => setPanelOpen(false)}
          />
        ) : null}
        {panelOpen ? (
          <div
            className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
            dir="ltr"
          >
            <DevPanelResizer panelWidth={panelWidth} onResize={setPanelWidth} />
            <header className="orbit-dev-panel-header orbit-dev-panel-header--simple">
              <span className="orbit-dev-panel-title">Devtools</span>
              <div className="flex items-center gap-1.5">
                {hasUnsavedChanges ? (
                  <span
                    className="size-2 shrink-0 rounded-full bg-primary"
                    title="Unsaved changes"
                  />
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="group size-8 border-0 shadow-none"
                  aria-label="Collapse Orbit Devtools"
                  onClick={() => setPanelOpen(false)}
                >
                  <ChevronRightIcon
                    {...iconProps({ size: "sm" })}
                    className="origin-center transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-active:translate-x-1.5 group-active:scale-90"
                  />
                </Button>
              </div>
            </header>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background text-foreground">
              <Panel />
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
}
