# manovaspace/design-system

[![CI](https://github.com/manovaspace/design-system/actions/workflows/ci.yml/badge.svg)](https://github.com/manovaspace/design-system/actions/workflows/ci.yml)

Design tokens, React UI primitives, and development tooling for Next.js applications. Published on npm under [`@manovaspace/*`](https://www.npmjs.com/org/manovaspace).

**Documentation:** [manovaspace.github.io/docs/design-system](https://manovaspace.github.io/docs/design-system/)

## Packages

| Package | Description | Docs |
| --- | --- | --- |
| [`@manovaspace/tokens`](https://www.npmjs.com/package/@manovaspace/tokens) | Design tokens, CSS variables, and font assets | [docs](https://manovaspace.github.io/docs/design-system/packages/tokens/) |
| [`@manovaspace/ui`](https://www.npmjs.com/package/@manovaspace/ui) | Radix and Tailwind component primitives | [docs](https://manovaspace.github.io/docs/design-system/packages/ui/) |
| [`@manovaspace/devtools`](https://www.npmjs.com/package/@manovaspace/devtools) | Development-only token editor and toolbar | [docs](https://manovaspace.github.io/docs/design-system/packages/devtools/) |

Related utilities (`tsconfig`, `markdown`, `pwa`, `observability`): [manovaspace/ts](https://github.com/manovaspace/ts).

## Requirements

- Node.js 24 or newer (for developing this monorepo)
- React 19 for `@manovaspace/ui` and `@manovaspace/devtools`
- Tailwind CSS 4 when extending the token theme in an application
- pnpm (recommended; npm and yarn also work for installing published packages)

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm storybook   # http://localhost:10006
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for pull requests and [RELEASING.md](./RELEASING.md) for versioning and publish.

## License

[MIT](./LICENSE)
