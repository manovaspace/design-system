import type { ReactNode } from "react";
import { DevSidePanel } from "./dev-side-panel.js";
import { DevToolsKeyboardShortcuts } from "./dev-tools-keyboard.js";

/** Split layout: app scrolls in its pane; devtools panel scrolls internally. */
export function DevToolsShell({ children }: { children: ReactNode }) {
  return (
    <div dir="ltr" className="orbit-dev-tools-shell">
      <DevToolsKeyboardShortcuts />
      <div className="orbit-dev-tools-main">{children}</div>
      <DevSidePanel />
    </div>
  );
}
