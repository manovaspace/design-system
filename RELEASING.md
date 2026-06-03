# Releasing — design system

How `@manovaspace/tokens`, `@manovaspace/ui`, and `@manovaspace/devtools` are published.

Policy matches [manovaspace/ts/RELEASING.md](https://github.com/manovaspace/ts/blob/main/RELEASING.md) with these notes:

- **Independent semver** per package (default). Optional `fixed` group in `.changeset/config.json` if tokens/ui/devtools must lockstep.
- CI publishes on `chore: version packages` commits to `main` via OIDC (`publish.yml`).
- **First publish** of a new package name requires local `pnpm release` with 2FA, then `./scripts/configure-trusted-publishing.sh`.

```bash
cd manovaspace/design-system
pnpm changeset
pnpm version-packages
git commit -am "chore: version packages" && git push
```

Trusted publishing: `TRUST_REPO=manovaspace/design-system` (set in `configure-trusted-publishing.sh`).
