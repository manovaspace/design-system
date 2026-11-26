---
"@manovaspace/tokens": minor
"@manovaspace/ui": minor
---

Implement M3 HCT DTCG 2025.10 token pipeline (`@manovaspace/tokens` v2) and SSR/runtime integration in `@manovaspace/ui`:
- Migrate `default.json` to DTCG 2025.10 3-tier format (`ref`, `sys`, `comp`, `resolver`, `themes`) while keeping all v1 exports and compatibility bridges intact.
- Add strict allowlisted `brand.tokens.json` (`parseBrandTokens`, `validateBrandTokens`) and white-label tenant seed (`parseTenantSeed`, `validateTenantSeed`) validators.
- Derive M3 tonal palettes and scheme roles across light/dark and `standard | medium | high` contrast levels via `@material/material-color-utilities`, enforce a WCAG 2.1 contrast gate (`4.5:1` text / `3:1` UI), emit M3 state layers, `shape`/`density`/`motion` scale tokens, colour-blind-safe `--chart-1..5`, flattened hex email/PDF export (`toFlattenedHexTokens`), canonical `--md-sys-color-*` CSS variables, and backwards-compatible shadcn/kit aliases.
- Update `OrbitTokensHead`, `TokenProvider`, and `resolveInitialBrandTokens` / `readPublicBrandTokens` (`@manovaspace/ui`) to handle `brand.tokens.json` and tenant `seed.primary` seamlessly.
