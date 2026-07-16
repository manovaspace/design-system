"use client";

import { useEffect } from "react";

import { useDevtoolsOptional } from "../context.js";

/** Global undo/redo shortcuts while devtools is mounted. */
export function DevToolsKeyboardShortcuts() {
  const devtools = useDevtoolsOptional();

  useEffect(() => {
    if (!devtools) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        !(event.metaKey || event.ctrlKey) ||
        event.key.toLowerCase() !== "z"
      ) {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      if (event.shiftKey) {
        if (devtools.canRedo) devtools.redo();
      } else if (devtools.canUndo) {
        devtools.undo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [devtools]);

  return null;
}
