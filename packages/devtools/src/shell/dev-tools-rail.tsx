"use client";

import { Button, cn } from "@manovaspace/ui";

import type { DevToolId } from "../types.js";
import { DEV_TOOLS } from "./dev-tools-registry.js";

/** ponytail: fixed slot count until a second dev tool ships */
const TOOL_SLOT_COUNT = 2;

type DevToolsRailProps = {
  activeTool: DevToolId;
  onToolChange: (tool: DevToolId) => void;
  className?: string;
};

export function DevToolsRail({
  activeTool,
  onToolChange,
  className,
}: DevToolsRailProps) {
  const slots: Array<(typeof DEV_TOOLS)[number] | null> = [...DEV_TOOLS];
  while (slots.length < TOOL_SLOT_COUNT) {
    slots.push(null);
  }

  return (
    <div className={cn("orbit-dev-panel-header__tools", className)}>
      {slots.map((tool, index) => {
        if (!tool) {
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed placeholder slots
              key={`tool-slot-${index}`}
              className="orbit-dev-panel-header__tool-slot"
              aria-hidden
            />
          );
        }

        const active = activeTool === tool.id;
        return (
          <Button
            key={tool.id}
            type="button"
            title={tool.label}
            aria-label={tool.label}
            aria-current={active ? "true" : undefined}
            variant="ghost"
            size="icon-sm"
            className={cn(
              "orbit-dev-panel-header__tool-btn",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
            onClick={() => onToolChange(tool.id)}
          >
            <tool.Icon />
          </Button>
        );
      })}
    </div>
  );
}
