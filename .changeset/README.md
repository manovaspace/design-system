# Changesets

When a PR changes publishable package behavior (`packages/*`):

```bash
pnpm changeset
```

Commit the generated `.changeset/*.md` with the PR.

Maintainers release:

```bash
pnpm version-packages
git commit -am "chore: version packages"
git push
```

CI publishes to npm when that commit lands on `main`. Full policy: [RELEASING.md](../RELEASING.md).
