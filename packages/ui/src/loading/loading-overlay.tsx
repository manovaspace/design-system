"use client";

import type * as React from "react";

import { cn } from "../lib/utils.js";
import { Spinner } from "./spinner.js";

export type LoadingOverlayProps = React.ComponentProps<"div"> & {
  visible?: boolean;
  label?: string;
  position?: "fixed" | "absolute";
};

function LoadingOverlay({
  className,
  visible = true,
  label = "Loading",
  position = "absolute",
  children,
  ...props
}: LoadingOverlayProps) {
  if (!visible) {
    return children ?? null;
  }

  return (
    <div
      data-slot="loading-overlay-host"
      className={cn(position === "absolute" && "relative", className)}
      {...props}
    >
      {children}
      <div
        data-slot="loading-overlay"
        className={cn(
          "inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
          position === "fixed" ? "fixed" : "absolute",
        )}
      >
        <Spinner size="lg" label={label} />
      </div>
    </div>
  );
}

export { LoadingOverlay };
