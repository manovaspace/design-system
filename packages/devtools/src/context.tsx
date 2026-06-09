import { createContext, useContext } from "react";

import type { DevtoolsContextValue } from "./types.js";

export const DevtoolsContext = createContext<DevtoolsContextValue | null>(null);

export function useDevtools(): DevtoolsContextValue {
  const value = useContext(DevtoolsContext);
  if (!value) {
    throw new Error("useDevtools must be used within OrbitDevtoolsProvider");
  }
  return value;
}

export function useDevtoolsOptional(): DevtoolsContextValue | null {
  return useContext(DevtoolsContext);
}
