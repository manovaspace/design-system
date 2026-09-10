"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";

interface EntityBrowserCommandBarContextValue {
  /** Result count line — rendered in the filter chip row when present. */
  suffix: ReactNode;
}

const EntityBrowserCommandBarContext =
  createContext<EntityBrowserCommandBarContextValue | null>(null);

export function EntityBrowserCommandBarProvider({
  suffix,
  children,
}: {
  suffix?: ReactNode;
  children: ReactNode;
}) {
  const value = useMemo(() => (suffix != null ? { suffix } : null), [suffix]);

  return (
    <EntityBrowserCommandBarContext.Provider value={value}>
      {children}
    </EntityBrowserCommandBarContext.Provider>
  );
}

/** Suffix slot for EntityFilterBar when nested in EntityBrowser. */
export function useEntityBrowserCommandBarSuffix(): ReactNode | undefined {
  const ctx = useEntityBrowserCommandBarContext();
  return ctx?.suffix;
}

export function useEntityBrowserCommandBarContext(): EntityBrowserCommandBarContextValue | null {
  return useContext(EntityBrowserCommandBarContext);
}
