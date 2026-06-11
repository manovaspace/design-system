"use client";

import { ChevronRightIcon, cn, iconProps, SwatchIcon } from "@manovaspace/ui";

type DevPanelEdgeToggleProps = {
  open: boolean;
  hasUnsavedChanges: boolean;
  onToggle: () => void;
  /** Seam tab when the panel is open */
  placement?: "seam" | "edge";
};

export function DevPanelEdgeToggle({
  open,
  hasUnsavedChanges,
  onToggle,
  placement = "edge",
}: DevPanelEdgeToggleProps) {
  const isSeam = placement === "seam";

  return (
    <button
      type="button"
      aria-label={open ? "Collapse Orbit Devtools" : "Open Orbit Devtools"}
      className={cn(
        "orbit-dev-panel-edge-toggle group",
        isSeam
          ? "orbit-dev-panel-edge-toggle--seam"
          : "orbit-dev-panel-edge-toggle--edge",
      )}
      onClick={onToggle}
    >
      {isSeam ? (
        <ChevronRightIcon
          {...iconProps({ size: "xs" })}
          className={cn(
            "origin-center text-foreground",
            "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            "group-hover:translate-x-1 group-active:translate-x-1.5 group-active:scale-90",
            !open &&
              "rotate-180 group-hover:-translate-x-1 group-active:-translate-x-1.5",
          )}
        />
      ) : (
        <SwatchIcon
          {...iconProps({ size: "sm" })}
          className="origin-center text-muted-foreground transition-[transform,color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-x-0.5 group-hover:text-foreground group-active:-translate-x-1 group-active:scale-90"
        />
      )}
      {hasUnsavedChanges ? (
        <span
          className={cn(
            "absolute rounded-full bg-primary",
            isSeam ? "start-1 top-2 size-1.5" : "end-1 top-1 size-2",
          )}
          title="Unsaved changes"
        />
      ) : null}
    </button>
  );
}
