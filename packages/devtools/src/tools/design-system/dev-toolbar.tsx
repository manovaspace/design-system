"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Button,
  iconProps,
  MoonIcon,
  SunIcon,
  useTheme,
} from "@manovaspace/ui";
import { useSyncExternalStore } from "react";

import { useDevtools } from "../../context.js";

function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function DevToolbar() {
  const { canUndo, canRedo, undo, redo } = useDevtools();
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const isDark = mounted && resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div
      className="orbit-dev-toolbar"
      role="toolbar"
      aria-label="Devtools actions"
    >
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="orbit-dev-toolbar__btn"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        onClick={toggleTheme}
      >
        {isDark ? (
          <MoonIcon {...iconProps({ size: "sm" })} />
        ) : (
          <SunIcon {...iconProps({ size: "sm" })} />
        )}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="orbit-dev-toolbar__btn"
        aria-label="Undo"
        disabled={!canUndo}
        onClick={undo}
      >
        <ArrowLeftIcon {...iconProps({ size: "sm" })} />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="orbit-dev-toolbar__btn"
        aria-label="Redo"
        disabled={!canRedo}
        onClick={redo}
      >
        <ArrowRightIcon {...iconProps({ size: "sm" })} />
      </Button>
    </div>
  );
}
