---
"@manovaspace/tokens": minor
"@manovaspace/ui": minor
---

Implement M3 HCT DTCG 2025.10 token pipeline (`@manovaspace/tokens` v2) and SSR/runtime integration in `@manovaspace/ui`:
- Migrate `default.json` to DTCG 2025.10 3-tier format (`ref`, `sys`, `comp`, `resolver`, `themes`) while keeping all v1 exports and compatibility bridges intact.
- Add strict allowlisted `brand.tokens.json` (`parseBrandTokens`, `validateBrandTokens`) and white-label tenant seed (`parseTenantSeed`, `validateTenantSeed`) validators.
- Derive M3 tonal palettes and scheme roles across light/dark and `standard | medium | high` contrast levels via `@material/material-color-utilities`, enforce a WCAG 2.1 contrast gate (`4.5:1` text / `3:1` UI), emit M3 state layers, `shape`/`density`/`motion` scale tokens, colour-blind-safe `--chart-1..5`, flattened hex email/PDF export (`toFlattenedHexTokens`), canonical `--md-sys-color-*` CSS variables, and backwards-compatible shadcn/kit aliases.
- Update `OrbitTokensHead`, `TokenProvider`, and `resolveInitialBrandTokens` / `readPublicBrandTokens` (`@manovaspace/ui`) to handle `brand.tokens.json` and tenant `seed.primary` seamlessly.
- Validate tenant `logo` (https URL without credentials, max 2048 chars, or base64 `data:image/(png|jpeg|webp|svg+xml)` URI with at most 256 KB payload) and reject CSS/HTML control characters in font family stacks.
- Memoize pipeline results (bounded to 64 entries) and cache the parsed `public/brand.tokens.json` per path and mtime on the server.

### Migration notes
- shadcn alias values change from `hsl(H S% L%)` to `var(--md-sys-color-*)`, which resolve to hex. Code that wraps them like `hsl(var(--primary))` or does HSL channel math must switch to `var(--primary)` or `color-mix()`.
- v1 `OrbitTokensRaw` inputs now resolve through the M3 pipeline, so light colours change too (for example, `background` is no longer pure white).
- `deriveSemanticDark` and `invertHslLightness` are deprecated; migrate to the M3 dark scheme roles (`brand.tokens.json` or `resolveBrandTokens`).
- Tenant `logo` values must be absolute `https:` URLs or inline data URIs; relative paths such as `tenants/x/logo.svg` are now rejected.

- `TabsTrigger` inactive text uses `text-muted-foreground` instead of `text-foreground/60`, which fell below 4.5:1 on the new tab-list surface.
