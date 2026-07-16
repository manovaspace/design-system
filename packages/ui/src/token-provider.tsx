"use client";

import {
  applyTokens,
  defaultTokensRaw,
  mergeTokenOverridesRaw,
  type OrbitTokenOverride,
  type OrbitTokensRaw,
  parseTokenOverridePayload,
} from "@manovaspace/tokens";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type TokenProviderProps = {
  children: React.ReactNode;
  /** Merged tokens from SSR; avoids flash before client fetch */
  initialTokens?: OrbitTokensRaw;
  /** Static override merged on top of defaults */
  tokens?: OrbitTokenOverride;
  /** Fetch remote theme JSON (client branding) */
  remoteUrl?: string;
  /** Path to local override file served from public/ */
  overridePath?: string;
};

export type TokenContextValue = {
  tokens: OrbitTokensRaw;
  reload: () => Promise<void>;
  /** Dev preview layer; when set, overrides `tokens` for runtime CSS only */
  setPreviewTokens: (tokens: OrbitTokensRaw | null) => void;
};

const TokenContext = createContext<TokenContextValue | null>(null);

async function fetchOverride(
  path: string,
): Promise<OrbitTokenOverride | undefined> {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) return undefined;
    const data: unknown = await response.json();
    return parseTokenOverridePayload(data);
  } catch {
    return undefined;
  }
}

/** Merge fetched overrides onto SSR/base tokens (exported for tests). */
export function mergeLoadedTokens(
  base: OrbitTokensRaw,
  local: OrbitTokenOverride | undefined,
  remote: OrbitTokenOverride | undefined,
  staticOverride: OrbitTokenOverride | undefined,
): OrbitTokensRaw {
  return mergeTokenOverridesRaw(base, local, remote, staticOverride);
}

export function TokenProvider({
  children,
  initialTokens,
  tokens: staticOverride,
  remoteUrl,
  overridePath = "/theme.override.json",
}: TokenProviderProps) {
  const [merged, setMerged] = useState<OrbitTokensRaw>(
    initialTokens ?? defaultTokensRaw,
  );
  const [previewTokens, setPreviewTokens] = useState<OrbitTokensRaw | null>(
    null,
  );

  const load = useCallback(async () => {
    const [remote, local] = await Promise.all([
      remoteUrl ? fetchOverride(remoteUrl) : undefined,
      fetchOverride(overridePath),
    ]);
    const base = initialTokens ?? defaultTokensRaw;
    setMerged(mergeLoadedTokens(base, local, remote, staticOverride));
  }, [initialTokens, overridePath, remoteUrl, staticOverride]);

  useEffect(() => {
    void load();
  }, [load]);

  const runtimeTokens = previewTokens ?? merged;

  useEffect(() => {
    applyTokens(runtimeTokens);
  }, [runtimeTokens]);

  const value = useMemo(
    () => ({
      tokens: merged,
      reload: load,
      setPreviewTokens,
    }),
    [merged, load],
  );

  return (
    <TokenContext.Provider value={value}>{children}</TokenContext.Provider>
  );
}

export function useTokens(): TokenContextValue {
  const value = useContext(TokenContext);
  if (!value) {
    throw new Error("useTokens must be used within TokenProvider");
  }
  return value;
}

export function useTokenContextOptional(): TokenContextValue | null {
  return useContext(TokenContext);
}
