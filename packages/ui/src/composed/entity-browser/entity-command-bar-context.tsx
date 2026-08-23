"use client";

import { createContext, type ReactNode, useContext } from "react";

const EntityBrowserCommandBarContext = createContext<ReactNode>(null);

export function EntityBrowserCommandBarProvider({
  suffix,
  children,
}: {
  suffix?: ReactNode;
  children: ReactNode;
}) {
  return (
    <EntityBrowserCommandBarContext.Provider value={suffix ?? null}>
      {children}
    </EntityBrowserCommandBarContext.Provider>
  );
}

export function useEntityBrowserCommandBarSuffix(): ReactNode {
  return useContext(EntityBrowserCommandBarContext);
}
