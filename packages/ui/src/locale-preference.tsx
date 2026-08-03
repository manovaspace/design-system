"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { DirectionProvider } from "./direction-provider.js";

export type TextDirection = "ltr" | "rtl";

export function resolveLocaleDir(
  locale: string,
  rtlLocales: readonly string[],
): TextDirection {
  return rtlLocales.includes(locale) ? "rtl" : "ltr";
}

export function applyDocumentLocale(locale: string, dir: TextDirection) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.lang = locale;
  root.dir = dir;
}

type LocalePreferenceContextValue = {
  locale: string;
  setLocale: (locale: string) => void;
  ready: boolean;
  dir: TextDirection;
  locales: readonly string[];
};

const LocalePreferenceContext =
  createContext<LocalePreferenceContextValue | null>(null);

export type LocalePreferenceProviderProps = {
  storageKey: string;
  locales: readonly string[];
  defaultLocale: string;
  /** Locales that use `dir="rtl"`. */
  rtlLocales?: readonly string[];
  children: ReactNode;
};

function readStoredLocale(
  storageKey: string,
  locales: readonly string[],
  defaultLocale: string,
): string {
  if (typeof window === "undefined") return defaultLocale;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw && locales.includes(raw)) return raw;
  } catch {
    /* ignore */
  }
  return defaultLocale;
}

/** Persist locale preference and sync `html` lang/dir (+ DirectionProvider). */
export function LocalePreferenceProvider({
  storageKey,
  locales,
  defaultLocale,
  rtlLocales = [],
  children,
}: LocalePreferenceProviderProps) {
  const fallback = locales.includes(defaultLocale)
    ? defaultLocale
    : (locales[0] ?? defaultLocale);
  const [locale, setLocaleState] = useState(fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const next = readStoredLocale(storageKey, locales, fallback);
    const dir = resolveLocaleDir(next, rtlLocales);
    setLocaleState(next);
    applyDocumentLocale(next, dir);
    setReady(true);
  }, [storageKey, locales, fallback, rtlLocales]);

  const setLocale = useCallback(
    (next: string) => {
      if (!locales.includes(next)) return;
      const dir = resolveLocaleDir(next, rtlLocales);
      setLocaleState(next);
      applyDocumentLocale(next, dir);
      try {
        window.localStorage.setItem(storageKey, next);
      } catch {
        /* ignore */
      }
    },
    [locales, rtlLocales, storageKey],
  );

  const dir = resolveLocaleDir(locale, rtlLocales);

  const value = useMemo(
    () => ({ locale, setLocale, ready, dir, locales }),
    [locale, setLocale, ready, dir, locales],
  );

  return (
    <LocalePreferenceContext.Provider value={value}>
      <DirectionProvider direction={dir}>{children}</DirectionProvider>
    </LocalePreferenceContext.Provider>
  );
}

export function useLocalePreference(): LocalePreferenceContextValue {
  const ctx = useContext(LocalePreferenceContext);
  if (!ctx) {
    throw new Error(
      "useLocalePreference must be used within LocalePreferenceProvider",
    );
  }
  return ctx;
}
