"use client";

import { createContext, type ReactNode, useContext } from "react";

type Direction = "ltr" | "rtl";

const DirectionContext = createContext<Direction>("ltr");

export function DirectionProvider({
  direction,
  children,
}: {
  direction: Direction;
  children: ReactNode;
}) {
  return (
    <DirectionContext.Provider value={direction}>
      {children}
    </DirectionContext.Provider>
  );
}

export function useDirection(): Direction {
  return useContext(DirectionContext);
}
