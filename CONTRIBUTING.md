# Contributing

Thanks for improving `@manovaspace/*`. This monorepo is MIT open commons — generic tooling with no Orbit platform or client business logic.

## Before you open a PR

1. **Scope** — No `@orbit/*` imports, no new `Orbit`-prefixed **package names**, no client names or internal URLs. Legacy type names (`OrbitTokensRaw`, `OrbitDevtoolsProvider`, etc.) remain until MS-FT-013.
2. **Extraction gate** — See [Manova ADR-017](https://github.com/manovaspace/ts/blob/main/AGENTS.md) (also in Manova `orbit-docs` for staff).
3. **Changeset** — Any change that should ship to npm needs a changeset (see below).

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm lint
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

Open a [GitHub issue](https://github.com/manovaspace/ts/issues).
