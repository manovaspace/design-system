"use client";

import {
  applyTokens,
  type BrandTokensInput,
  defaultTokensRaw,
  isBrandOrTenantInput,
  isResolvedBrandTokens,
  mergeTokenOverridesRaw,
  type OrbitTokenOverride,
  type OrbitTokensRaw,
  parseBrandTokens,
  parseTokenOverridePayload,
  type ResolvedBrandTokens,
  resolveBrandTokens,
  resolveTenantBranding,
  type TenantSeedInput,
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
  /** DTCG brand.tokens.json input or pre-resolved v2 tokens */
  brandTokens?: BrandTokensInput | ResolvedBrandTokens;
  /** White-label tenant seed (`seed.primary` + optional `logo`) */
  tenantSeed?: TenantSeedInput;
  /** Fetch remote theme JSON (client branding) */
  remoteUrl?: string;
  /** Path to local override file served from public/ */
  overridePath?: string;
};

export type TokenContextValue = {
  tokens: OrbitTokensRaw;
  brand: ResolvedBrandTokens | null;
  reload: () => Promise<void>;
  /** Dev preview layer; when set, overrides `tokens` for runtime CSS only */
  setPreviewTokens: (tokens: OrbitTokensRaw | null) => void;
};

const TokenContext = createContext<TokenContextValue | null>(null);

async function fetchPayload(path: string): Promise<unknown> {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) return undefined;
    return await response.json();
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

function resolveBrandPair(
  brandInput: BrandTokensInput | ResolvedBrandTokens | undefined,
  tenantInput: TenantSeedInput | undefined,
): ResolvedBrandTokens | null {
  if (!brandInput && !tenantInput) return null;

  const baseConfig = brandInput
    ? isResolvedBrandTokens(brandInput)
      ? brandInput.config
      : parseBrandTokens(brandInput)
    : undefined;

  if (tenantInput) {
    return resolveTenantBranding(tenantInput, baseConfig).resolved;
  }

  if (brandInput) {
    return isResolvedBrandTokens(brandInput)
      ? brandInput
      : resolveBrandTokens(brandInput);
  }

  return null;
}

export function TokenProvider({
  children,
  initialTokens,
  tokens: staticOverride,
  brandTokens,
  tenantSeed,
  remoteUrl,
  overridePath = "/theme.override.json",
}: TokenProviderProps) {
  const [merged, setMerged] = useState<OrbitTokensRaw>(
    initialTokens ?? defaultTokensRaw,
  );
  const [resolvedBrand, setResolvedBrand] =
    useState<ResolvedBrandTokens | null>(() =>
      resolveBrandPair(brandTokens, tenantSeed),
    );
  const [previewTokens, setPreviewTokens] = useState<OrbitTokensRaw | null>(
    null,
  );

  const load = useCallback(async () => {
    const [remoteRaw, localRaw] = await Promise.all([
      remoteUrl ? fetchPayload(remoteUrl) : undefined,
      fetchPayload(overridePath),
    ]);

    const nextBrandInput = isBrandOrTenantInput(localRaw)
      ? (localRaw as BrandTokensInput)
      : brandTokens;
    const nextTenantInput = isBrandOrTenantInput(remoteRaw)
      ? (remoteRaw as TenantSeedInput)
      : tenantSeed;

    const nextBrand = resolveBrandPair(nextBrandInput, nextTenantInput);
    setResolvedBrand(nextBrand);

    const local = isBrandOrTenantInput(localRaw)
      ? undefined
      : parseTokenOverridePayload(localRaw);
    const remote = isBrandOrTenantInput(remoteRaw)
      ? undefined
      : parseTokenOverridePayload(remoteRaw);

    const base = initialTokens ?? defaultTokensRaw;
    setMerged(mergeLoadedTokens(base, local, remote, staticOverride));
  }, [
    brandTokens,
    initialTokens,
    overridePath,
    remoteUrl,
    staticOverride,
    tenantSeed,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const runtimeTokens = previewTokens ?? resolvedBrand ?? merged;

  useEffect(() => {
    applyTokens(runtimeTokens);
  }, [runtimeTokens]);

  const value = useMemo(
    () => ({
      tokens: merged,
      brand: resolvedBrand,
      reload: load,
      setPreviewTokens,
    }),
    [merged, resolvedBrand, load],
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
