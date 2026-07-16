# manovaspace/design-system

[![CI](https://github.com/manovaspace/design-system/actions/workflows/ci.yml/badge.svg)](https://github.com/manovaspace/design-system/actions/workflows/ci.yml)
[![Docs](https://github.com/manovaspace/design-system/actions/workflows/docs.yml/badge.svg)](https://manovaspace.github.io/design-system/)

MIT design system published on npm as [`@manovaspace/tokens`](https://www.npmjs.com/package/@manovaspace/tokens), [`@manovaspace/ui`](https://www.npmjs.com/package/@manovaspace/ui), [`@manovaspace/devtools`](https://www.npmjs.com/package/@manovaspace/devtools).

**Documentation:** [manovaspace.github.io/design-system](https://manovaspace.github.io/design-system/)

Utility packages (`tsconfig`, `markdown`, `pwa`, `observability`) live in [manovaspace/ts](https://github.com/manovaspace/ts).

## Packages

| npm | Description |
| --- | --- |
| `@manovaspace/tokens` | Design tokens — `default.json` → CSS |
| `@manovaspace/ui` | Radix/Tailwind components, motion, icons |
| `@manovaspace/devtools` | Dev-only toolbar and token editor |

## Development

```bash
pnpm install
pnpm build
pnpm storybook    # port 10006
pnpm test
```

## Releasing

See [RELEASING.md](./RELEASING.md).

## Local development (Manova workspace)

```json
"@manovaspace/tokens": "link:../../../manovaspace/design-system/packages/tokens",
"@manovaspace/ui": "link:../../../manovaspace/design-system/packages/ui",
"@manovaspace/devtools": "link:../../../manovaspace/design-system/packages/devtools"
```

From `orbit/orbit-frontend/apps/*`, use one extra `../`.
