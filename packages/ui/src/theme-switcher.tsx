"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

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
};

const DEFAULT_LABELS: ThemeSwitcherLabels = {
  system: "System",
  light: "Light",
  dark: "Dark",
  ariaLabel: "Appearance",
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
  variant?: "icon" | "labeled";
  className?: string;
  labels?: Partial<ThemeSwitcherLabels>;
};

export function ThemeSwitcher({
  variant = "icon",
  className,
  labels: labelsProp,
}: ThemeSwitcherProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const mounted = useMounted();
  const { theme, setTheme } = useTheme();
  const currentTheme = (theme ?? "system") as Theme;

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

  return (
    <Select
      value={currentTheme}
      onValueChange={(value) => {
        if (value) setTheme(value);
      }}
    >
      <SelectTrigger className={triggerClassName} aria-label={labels.ariaLabel}>
        {variant === "icon" ? (
          <ThemeOptionIcon theme={currentTheme} />
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
