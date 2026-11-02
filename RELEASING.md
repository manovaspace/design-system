# Releasing

How `@manovaspace/tokens`, `@manovaspace/ui`, and `@manovaspace/devtools` are versioned and published to [npmjs.org](https://www.npmjs.com).

Policy matches [manovaspace/ts](https://github.com/manovaspace/ts/blob/main/RELEASING.md), with notes specific to this repository below.

## Versioning policy

- **Independent semver** per package by default
- Optional `fixed` group in `.changeset/config.json` if tokens, ui, and/or devtools must always release together
- Prefer meaningful releases over frequent empty patches

## Compatibility promise (1.0 and later)

The stable API is the root entry (`@manovaspace/ui`) plus the existing subpaths
(`./icons`, `./icons/solid`, `./icons/brand`, `./motion`, `./loading`,
`./server`). `@manovaspace/ui/experimental` is outside the promise: anything
exported there may change or disappear in any minor release.

A breaking change is anything that makes a team bump the version, ship, and
then see bugs without changing their code. That includes exported types, prop
defaults, landmarks and roles, and token values.

Deprecate before removing. Add `@deprecated` with a migration note, keep the
item for at least one month, and remove it only in a major release. A codemod is
warranted only when the removal is mechanical and has more than one call site.
Promoting an export from `./experimental` to the stable root is non-breaking.

## Routine release

For local consumer co-development, run
`bun scripts/switch-consumers-to-link.mjs` before installing clients. After the
changeset is versioned and published, run
`bun scripts/switch-consumers-to-npm.mjs` and reinstall affected consumers so
CI and production resolve registry packages.

Include a changeset in each package PR. After those PRs merge, start a topic
branch from the updated `main`:

```bash
git switch -c chore/version-packages
bun install --frozen-lockfile
bun run version-packages
```

Review each affected package version, dependency range, generated changelog and
lockfile. Stage only the reviewed release files, commit with
`chore: version packages`, push the topic branch and open a PR. After CI passes,
squash merge it; the conventional title is `chore: version packages`. Direct
pushes to `main` are forbidden. If the intended versions have already been
calculated and merged, verify that state before publishing; do not calculate a
second bump.

[`.github/workflows/publish.yml`](./.github/workflows/publish.yml) publishes only
by a published GitHub Release or a maintainer-selected `workflow_dispatch` of
`.github/workflows/publish.yml`. Both pause until the owner approves the
`npm-publish` GitHub environment.

Merging the `chore: version packages` PR no longer publishes by itself. After the
merge, run `gh workflow run publish.yml --repo manovaspace/design-system` (or
publish a GitHub Release) and approve the environment.

The workflow uses the npm bundled with Node 24 and fails if it is older than
11.5.1. It never installs npm at run time.

The workflow builds and publishes existing manifest versions; it does not run
`changeset version`. Release/dispatch and local fallback must use a reviewed,
already-versioned commit and the complete intended unpublished package set.
CI sets `NPM_CONFIG_PROVENANCE=true` for npm provenance attestations.
Publishing changes npm; it does not deploy consumers.

Manual fallback:

```bash
bun run build
bun run release
```

## Gates and the Version Packages bot

`bun run check:api` compares the built declarations with the committed API Extractor
reports in `packages/ui/etc/` (root and every subpath export) and
`packages/tokens/etc/`. An unreviewed API change fails; run `bun run update:api`
and commit the report when the change is intended. `bun run check:package` runs
`publint` and `attw --pack` on every published package. The `.attw.json` files use
the `esm-only` profile and exclude the CSS entry points, which are assets rather
than modules; there are no other ignored findings.

CI runs both gates report-only today so they cannot fail the required `check`
job; they become blocking in S8.

A bot keeps one Version Packages pull request through
[`.github/workflows/version-packages.yml`](./.github/workflows/version-packages.yml)
using `changesets/action` in version mode. It never publishes; publishing stays in
`.github/workflows/publish.yml`. It needs the `RELEASE_TOKEN` secret, a
fine-grained PAT with contents and pull-request write on this repository. A PAT is
required because pull requests opened with the default `GITHUB_TOKEN` do not
trigger their own workflows. The owner creates the token; when the secret is empty
the workflow prints `secret not set, skipping` and succeeds.

[`.github/workflows/consumer-matrix-trigger.yml`](./.github/workflows/consumer-matrix-trigger.yml)
packs `@manovaspace/tokens` and `@manovaspace/ui`, uploads the tarballs, and
dispatches the private matrix in the handbook repository on the Version Packages
pull request and on demand. It needs the `MATRIX_TOKEN` secret, a fine-grained PAT
with Actions write on the handbook repository and statuses write here. It is
report-only: the matrix posts a `consumer-matrix` commit status with no private
details, so public logs stay free of consumer names and errors.

## First publish of a new package

New package names require a first local publish with 2FA, then trusted publishing:

```bash
bun run build && bun run release
TRUST_REPO=manovaspace/design-system ./scripts/configure-trusted-publishing.sh
```

Configure [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) for GitHub org `manovaspace`, repo `design-system`, workflow `publish.yml`, and environment `npm-publish`.

## Checklist

- [ ] Changeset included in the pull request
- [ ] Versions/changelogs calculated once and reviewed on a topic branch
- [ ] Version PR passed CI and merged
- [ ] Publish workflow approved in the `npm-publish` environment and succeeded
- [ ] `npm view @manovaspace/<package> version` matches the release
