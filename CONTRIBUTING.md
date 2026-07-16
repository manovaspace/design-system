# Contributing

Thanks for improving `@manovaspace/*` — MIT TypeScript libraries on [npm](https://www.npmjs.com/org/manovaspace).

## Before you open a PR

1. **Scope** — Keep packages generic and reusable. No client product names, private URLs, or new `Orbit`-prefixed **package** names on npm. Legacy TypeScript identifiers (`OrbitTokensRaw`, `OrbitDevtoolsProvider`, etc.) remain until a rename release.
2. **Changeset** — Any change that should ship to npm needs a changeset (see below).
3. **Docs** — User-facing API changes should update [manovaspace/docs](https://github.com/manovaspace/docs).

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm lint
pnpm storybook   # port 10006
```

## Changesets (required for releasable changes)

```bash
pnpm changeset
```

Pick affected packages and semver bump type (`patch` / `minor` / `major`). Commit the generated `.changeset/*.md` with your PR.

Maintainers version and publish — see [RELEASING.md](./RELEASING.md).

## Commit style

- `feat:` / `fix:` / `docs:` / `chore:` — conventional commits welcome
- Version bumps: `chore: version packages` (triggers CI publish)

## Questions

Open a [GitHub issue](https://github.com/manovaspace/design-system/issues).
