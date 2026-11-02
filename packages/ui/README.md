# @manovaspace/ui

Radix-based React primitives styled with Tailwind CSS 4, including motion helpers, loading states, and icon packs. Pair with [`@manovaspace/tokens`](https://www.npmjs.com/package/@manovaspace/tokens).

```bash
bun add @manovaspace/ui @manovaspace/tokens
```

Also works with npm and yarn. Peers: `react` and `react-dom` ^19.

Stable exports live at the root. `@manovaspace/ui/experimental` is outside the
semver promise and may change in any minor release.

## Agent index

The package ships `dist/agents/index.md`, generated from the committed API reports and source JSDoc at build time. Before writing UI, read `node_modules/@manovaspace/ui/dist/agents/index.md`: it lists every stable export grouped by source area, with import paths and props for the components that fit the 8 KB cap. Run `o audit usage SYMBOL` before changing a shared component.

**Documentation:** [manovaspace.github.io/docs/design-system/packages/ui](https://manovaspace.github.io/docs/design-system/packages/ui/)

**Source:** [manovaspace/design-system](https://github.com/manovaspace/design-system/tree/main/packages/ui)

## License

MIT
