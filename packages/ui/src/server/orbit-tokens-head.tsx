import { type OrbitTokensRaw, tokensToRuntimeCss } from "@manovaspace/tokens";

const RUNTIME_STYLE_ID = "orbit-tokens-runtime";

/** First child of `<body>`. applyTokens() updates textContent only — never re-parents. */
export function OrbitTokensHead({ tokens }: { tokens: OrbitTokensRaw }) {
  return (
    <style
      id={RUNTIME_STYLE_ID}
      suppressHydrationWarning
      // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted token CSS from @manovaspace/tokens
      dangerouslySetInnerHTML={{ __html: tokensToRuntimeCss(tokens) }}
    />
  );
}
