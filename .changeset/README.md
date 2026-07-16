# Changesets

When a pull request changes publishable package behavior under `packages/*`:

```bash
pnpm changeset
```

Commit the generated `.changeset/*.md` file with the pull request.

Maintainers release with:

```bash
pnpm version-packages
git commit -am "chore: version packages"
git push
```

CI publishes to npm when that commit reaches `main`. Full policy: [RELEASING.md](../RELEASING.md).
