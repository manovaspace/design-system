import {
  isBrandOrTenantInput,
  parseBrandTokens,
  type RuntimeTokenInput,
  resolveTenantBranding,
  type TenantSeedInput,
  tokensToRuntimeCss,
} from "@manovaspace/tokens";

const RUNTIME_STYLE_ID = "orbit-tokens-runtime";

export type OrbitTokensHeadProps = {
  tokens: RuntimeTokenInput;
  tenantSeed?: TenantSeedInput;
};

/** First child of `<body>`. applyTokens() updates textContent only — never re-parents. */
export function OrbitTokensHead({ tokens, tenantSeed }: OrbitTokensHeadProps) {
  const effectiveTokens: RuntimeTokenInput = tenantSeed
    ? resolveTenantBranding(
        tenantSeed,
        isBrandOrTenantInput(tokens) && !("logo" in tokens)
          ? parseBrandTokens(tokens)
          : undefined,
      ).resolved
    : tokens;

  return (
    <style
      id={RUNTIME_STYLE_ID}
      suppressHydrationWarning
      // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted token CSS from @manovaspace/tokens
      dangerouslySetInnerHTML={{ __html: tokensToRuntimeCss(effectiveTokens) }}
    />
  );
}
