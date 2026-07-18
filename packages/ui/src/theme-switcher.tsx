"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Button } from "./button.js";
import { iconProps } from "./icon.js";
import { ComputerDesktopIcon, MoonIcon, SunIcon } from "./icons.js";
import { cn } from "./lib/utils.js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select.js";

const THEMES = ["system", "light", "dark"] as const;

type Theme = (typeof THEMES)[number];

export type ThemeSwitcherLabels = {
  system: string;
  light: string;
  dark: string;
  ariaLabel: string;
  /** Toggle variant: announce switch to light */
  toLight?: string;
  /** Toggle variant: announce switch to dark */
  toDark?: string;
};

const DEFAULT_LABELS: ThemeSwitcherLabels = {
  system: "System",
  light: "Light",
  dark: "Dark",
  ariaLabel: "Appearance",
  toLight: "Switch to light mode",
  toDark: "Switch to dark mode",
};

function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function themeLabel(theme: Theme, labels: ThemeSwitcherLabels): string {
  return labels[theme];
}

function ThemeOptionIcon({ theme }: { theme: Theme }) {
  if (theme === "dark") {
    return <MoonIcon {...iconProps({ size: "sm" })} />;
  }
  if (theme === "light") {
    return <SunIcon {...iconProps({ size: "sm" })} />;
  }
  return <ComputerDesktopIcon {...iconProps({ size: "sm" })} />;
}

export type ThemeSwitcherProps = {
  /**
   * - `toggle` — single control that flips light ↔ dark (uses resolved theme)
   * - `icon` / `labeled` — select among system / light / dark
   */
  variant?: "toggle" | "icon" | "labeled";
  className?: string;
  labels?: Partial<ThemeSwitcherLabels>;
};

/**
 * Color-mode control.
 *
 * Toggle uses `resolvedTheme` so “system” still flips the effective appearance.
 * Select variants keep storing `system` | `light` | `dark` explicitly.
 */
export function ThemeSwitcher({
  variant = "icon",
  className,
  labels: labelsProp,
}: ThemeSwitcherProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const mounted = useMounted();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const currentTheme = (theme ?? "system") as Theme;
  const isDark = resolvedTheme === "dark";

  if (variant === "toggle") {
    if (!mounted) {
      return (
        <div
          className={cn(
            "inline-flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-lg)] border border-input opacity-50",
            className,
          )}
          aria-hidden
        >
          <SunIcon {...iconProps({ size: "sm" })} />
        </div>
      );
    }

    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn("size-9 shrink-0", className)}
        aria-label={isDark ? labels.toLight : labels.toDark}
        aria-pressed={isDark}
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        {isDark ? (
          <SunIcon {...iconProps({ size: "sm" })} />
        ) : (
          <MoonIcon {...iconProps({ size: "sm" })} />
        )}
      </Button>
    );
  }

  const triggerClassName = cn(
    variant === "icon"
      ? "size-9 w-9 shrink-0 justify-center px-0 [&_[data-slot=select-icon]]:hidden"
      : "w-full",
    className,
  );

  if (!mounted) {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-[var(--radius-lg)] border border-input opacity-50",
          triggerClassName,
        )}
        aria-hidden
      >
        {variant === "icon" ? (
          <SunIcon {...iconProps({ size: "sm" })} />
        ) : (
          <span className="truncate text-sm">{labels.system}</span>
        )}
      </div>
    );
  }

  // Icon trigger shows the *resolved* mode so system preference is visible.
  const triggerIconTheme: Theme =
    variant === "icon" ? (isDark ? "dark" : "light") : currentTheme;

  return (
    <Select
      value={currentTheme}
      onValueChange={(value) => {
        if (value === "system" || value === "light" || value === "dark") {
          setTheme(value);
        }
      }}
    >
      <SelectTrigger className={triggerClassName} aria-label={labels.ariaLabel}>
        {variant === "icon" ? (
          <ThemeOptionIcon theme={triggerIconTheme} />
        ) : (
          <SelectValue>{themeLabel(currentTheme, labels)}</SelectValue>
        )}
      </SelectTrigger>
      <SelectContent>
        {THEMES.map((value) => (
          <SelectItem key={value} value={value}>
            <span className="flex items-center gap-2">
              <ThemeOptionIcon theme={value} />
              {themeLabel(value, labels)}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
