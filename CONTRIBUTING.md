# Contributing

Contributions to `@manovaspace/*` are welcome. Packages are MIT-licensed and published on [npm](https://www.npmjs.com/org/manovaspace).

## Guidelines

1. **Scope** — Keep changes generic and reusable. Do not add client-specific product names, private URLs, or credentials.
2. **Package names** — Do not introduce new npm packages with an `Orbit` prefix. Some TypeScript exports still use legacy `Orbit*` identifiers (for example `OrbitTokensRaw`, `OrbitDevtoolsProvider`); leave those names until a dedicated rename release.
3. **Changesets** — Any change that should ship to npm must include a changeset.
4. **Documentation** — User-facing API changes should update [manovaspace/docs](https://github.com/manovaspace/docs).

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm lint
pnpm storybook   # http://localhost:10006
```

## Changesets

```bash
pnpm changeset
```

Select the affected packages and bump type (`patch`, `minor`, or `major`). Commit the generated file under `.changeset/` with your pull request.

Maintainers version and publish packages. See [RELEASING.md](./RELEASING.md).

## Commit messages

Prefer [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `chore:`.

Version bump commits use: `chore: version packages` (triggers CI publish).

## Questions

Open an [issue](https://github.com/manovaspace/design-system/issues) on this repository.
