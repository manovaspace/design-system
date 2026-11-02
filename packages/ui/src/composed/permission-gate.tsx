"use client";

import type { ReactNode } from "react";

import { cn } from "../lib/utils.js";

/** How PermissionGate handles denied content. @experimental */
export type PermissionGateMode = "hide" | "disable";

/** Props for PermissionGate. @experimental */
export type PermissionGateProps = {
  /** Computed by the caller; this component never reads an auth source. */
  allowed: boolean;
  children: ReactNode;
  /** Rendered instead of `children` in `hide` mode. Ignored in `disable` mode. */
  fallback?: ReactNode;
  /**
   * `hide` removes the children entirely; `disable` keeps them mounted inside a
   * wrapper with `aria-disabled` and `inert` when access is denied. Defaults to
   * `"hide"`.
   */
  mode?: PermissionGateMode;
  /** Applied to the wrapper in `disable` mode. */
  className?: string;
};

/**
 * Permission boundary with hide and disable modes.
 *
 * `allowed` is a plain boolean computed by the caller; the component has no
 * auth-library hooks and no data access. In `hide` mode denied content is not
 * rendered, so it is removed from layout and the accessibility tree. In
 * `disable` mode the wrapper receives `aria-disabled="true"` and `inert`,
 * which removes descendants from tab order and, in supporting browsers, from
 * the accessibility tree while keeping their layout. `fallback` applies to
 * `hide` mode only. Use this for presentation; authorization still belongs on
 * the server and in the caller.
 *
 * @experimental API may change.
 */
export function PermissionGate({
  allowed,
  children,
  fallback = null,
  mode = "hide",
  className,
}: PermissionGateProps): ReactNode {
  if (mode === "hide") {
    return allowed ? children : fallback;
  }

  return (
    <div
      data-slot="permission-gate"
      data-mode={mode}
      data-allowed={allowed ? "true" : "false"}
      aria-disabled={allowed ? undefined : true}
      inert={allowed ? undefined : true}
      className={cn(!allowed && "opacity-50", className)}
    >
      {children}
    </div>
  );
}
