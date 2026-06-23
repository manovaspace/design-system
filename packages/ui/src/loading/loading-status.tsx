"use client";

import type * as React from "react";

import { cn } from "../lib/utils.js";
import { useDelayedLoading } from "./hooks.js";
import { Spinner } from "./spinner.js";

export type LoadingStatusProps = {
  loading: boolean;
  delayMs?: number;
  label?: string;
  fallback?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

function LoadingStatus({
  loading,
  delayMs = 300,
  label,
  fallback,
  className,
  children,
}: LoadingStatusProps) {
  const showLoading = useDelayedLoading(loading, delayMs);

  if (showLoading) {
    return (
      <div
        data-slot="loading-status"
        className={cn("flex items-center justify-center", className)}
      >
        {fallback ?? <Spinner label={label} />}
      </div>
    );
  }

  return children;
}

export { LoadingStatus };
