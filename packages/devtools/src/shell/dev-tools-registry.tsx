"use client";

import { iconProps, PaintBrushIcon } from "@manovaspace/ui";
import type { ComponentType } from "react";
import { DesignSystemEditor } from "../tools/design-system/design-system-editor.js";
import type { DevToolId } from "../types.js";

export type DevToolDefinition = {
  id: DevToolId;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  Panel: ComponentType;
};

export const DEV_TOOLS: DevToolDefinition[] = [
  {
    id: "design-system",
    label: "Design System",
    Icon: (props) => (
      <PaintBrushIcon {...iconProps({ size: "md" })} {...props} />
    ),
    Panel: DesignSystemEditor,
  },
];

export function getDevTool(id: DevToolId): DevToolDefinition {
  const tool = DEV_TOOLS.find((t) => t.id === id);
  if (!tool) return DEV_TOOLS[0]!;
  return tool;
}
