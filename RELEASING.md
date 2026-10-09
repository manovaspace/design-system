# Releasing

`@manovaspace/tokens`, `@manovaspace/ui` and `@manovaspace/devtools` publish to [npm](https://www.npmjs.com/org/manovaspace).
Use the repository-declared Bun version and Node floor from `package.json`
(currently Bun 1.4.0 and Node >=24), with the committed `bun.lock`.

## Version authority

[Changesets](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md)
owns each publishable package's SemVer `package.json` version and generated
changelog. `.changeset/config.json` uses independent versions with no fixed or
linked groups. The private workspace root has no package release version.

- Patch: backward-compatible fixes and changes to published documentation.
- Minor: backward-compatible API additions.
- Major: breaking API or runtime compatibility changes, with migration guidance.

PR titles and commits follow Conventional Commits, including optional scopes.
Changesets select the bump; a commit title does not calculate package versions.
Add a `fixed` group only in a reviewed PR explaining why lockstep is required.
Docs-only changes outside published artifacts need no changeset or manifest bump.

## Package PR

1. Run `bun run changeset`; select the affected packages and bump severity.
2. Commit `.changeset/*.md` with the code and local API documentation.
3. Link a [public docs](https://github.com/manovaspace/docs) PR for changed consumer
   guides. Public setup/checks must work without the private Manova workspace.
4. Run the relevant build, test, typecheck and lint scripts from `package.json`.

## Version PR

After the package PRs merge, start a topic branch from the updated `main`:

```bash
git switch -c chore/version-packages
bun install --frozen-lockfile
bun run version-packages
```

Review package versions, dependency ranges, generated changelogs and the lockfile.
Stage only the reviewed release files, commit with `chore: version packages`,
push the topic branch and open a PR. Run the repo's CI checks. Squash merge with
the exact PR title `chore: version packages`; verify the merged head subject.
Direct pushes to `main` are forbidden.

## Actual publish triggers

[`.github/workflows/publish.yml`](./.github/workflows/publish.yml) runs on:

- A `main` push whose head commit message contains literal `chore: version packages`.
- A published GitHub Release.
- A maintainer-selected `workflow_dispatch`.

The workflow builds and runs `changeset publish` through `bun run release`;
it does **not** run `changeset version`. A title such as `chore(release): version
packages` does not satisfy the main-push condition. Release/dispatch triggers
must select a reviewed, already-versioned commit; they are not a second version
calculator. Avoid concurrent releases and never replace an existing npm version.

## First publish and authentication

Configure [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)
for organization `manovaspace`, repository `design-system`, workflow `publish.yml`.
The workflow requests `id-token: write` and npm provenance. Trusted-publisher
configuration and package existence are maintainer prerequisites, not assumed
from the workflow file.

If npm rejects OIDC for a package that does not yet exist, a maintainer may
perform the first publish locally using their npm permissions and required 2FA:

```bash
bun run build
bun run release
```

This publishes externally and requires explicit release authorization. Then run
`./scripts/configure-trusted-publishing.sh` and verify the package's trust settings.
This workflow has no `NPM_TOKEN` fallback; do not assume the TS token recipe applies.

## Verification

- Changesets have produced the intended package versions and changelogs.
- The version PR passed required checks and merged with the trigger subject.
- CI published the reviewed commit successfully.
- `npm view @manovaspace/<package> version` matches its manifest; inspect the
  packed artifact and install it in a clean consumer for release-critical changes.
- Registry dependency ranges resolve without local `link:` paths or private registries.
- Public docs describe released availability, supported locales and migration scope.

Publishing does not deploy consuming products. Their rollout evidence and
private integration changes belong in separately linked staff deliveries.
