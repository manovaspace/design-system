---
"@manovaspace/ui": patch
---

Fix public `Button` applying `shadow-[var(--shadow-sm)]` to every variant. The `ghost` and `link` variants now render flat (no drop shadow), consistent with the design system. The `variant` prop is now forwarded to the underlying primitive so the shadow is conditioned on the variant.