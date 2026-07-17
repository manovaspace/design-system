# Releasing

How `@manovaspace/tokens`, `@manovaspace/ui`, and `@manovaspace/devtools` are versioned and published to [npmjs.org](https://www.npmjs.com).

Policy matches [manovaspace/ts](https://github.com/manovaspace/ts/blob/main/RELEASING.md), with notes specific to this repository below.

## Versioning policy

- **Independent semver** per package by default
- Optional `fixed` group in `.changeset/config.json` if tokens, ui, and/or devtools must always release together
- Prefer meaningful releases over frequent empty patches

## Routine release

```bash
pnpm changeset
pnpm version-packages
git add -A
git commit -m "chore: version packages"
git push origin main
```

CI publishes when a `chore: version packages` commit lands on `main` (see `.github/workflows/publish.yml`).

Manual fallback:

```bash
pnpm build
pnpm release
```

## First publish of a new package

New package names require a first local publish with 2FA, then trusted publishing:

```bash
pnpm build && pnpm release
TRUST_REPO=manovaspace/design-system ./scripts/configure-trusted-publishing.sh
```

Configure [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) for GitHub org `manovaspace`, repo `design-system`, workflow `publish.yml`.

## Checklist

- [ ] Changeset included in the pull request
- [ ] `pnpm version-packages` run on `main`
- [ ] `chore: version packages` pushed
- [ ] CI publish succeeded
- [ ] `npm view @manovaspace/<package> version` matches the release
