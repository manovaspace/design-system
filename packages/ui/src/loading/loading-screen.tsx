"use client";

import type * as React from "react";

import { cn } from "../lib/utils.js";
import { Spinner } from "./spinner.js";

export type LoadingScreenProps = React.ComponentProps<"div"> & {
  logo?: React.ReactNode;
  label?: string;
  description?: string;
  showSpinner?: boolean;
};

function LoadingScreen({
  className,
  logo,
  label,
  description,
  showSpinner = true,
  ...props
}: LoadingScreenProps) {
  const statusLabel = label ?? "Loading";

  return (
    <div
      data-slot="loading-screen"
      role="status"
      aria-live="polite"
      aria-label={statusLabel}
      className={cn(
        "flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-4 text-foreground",
        "supports-[padding:max(0px)]:pt-[max(0px,env(safe-area-inset-top))]",
        "supports-[padding:max(0px)]:pb-[max(0px,env(safe-area-inset-bottom))]",
        className,
      )}
      {...props}
    >
      {logo ? (
        <div data-slot="loading-screen-logo" className="animate-pulse">
          {logo}
        </div>
      ) : null}
      {showSpinner ? <Spinner size="lg" decorative /> : null}
      {label ? (
        <p className="text-sm font-medium text-foreground">{label}</p>
      ) : null}
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export { LoadingScreen };
