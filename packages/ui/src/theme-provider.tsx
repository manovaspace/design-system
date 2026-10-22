"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import {
  type ComponentProps,
  type JSX,
  type ReactNode,
  useSyncExternalStore,
} from "react";

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider> & {
  children?: ReactNode;
};

export const ORBIT_THEME_STORAGE_KEY = "orbit-theme";

// ponytail: React 19 warns on <script> in client render; next-themes FOUC script only needed on SSR
const CLIENT_SCRIPT_PROPS = { type: "application/json" } as const;

function useIsClientRender(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeProvider({
  children,
  scriptProps,
  ...props
}: ThemeProviderProps) {
  const isClientRender = useIsClientRender();

  const Comp = NextThemesProvider as unknown as (
    props: ThemeProviderProps,
  ) => JSX.Element;
  return (
    <Comp
      attribute="class"
      defaultTheme="system"
      enableSystem
      enableColorScheme={false}
      disableTransitionOnChange
      storageKey={ORBIT_THEME_STORAGE_KEY}
      scriptProps={
        isClientRender
          ? { ...scriptProps, ...CLIENT_SCRIPT_PROPS }
          : scriptProps
      }
      {...props}
    >
      {children}
    </Comp>
  );
}
