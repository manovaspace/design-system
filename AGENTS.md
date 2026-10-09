# manovaspace/design-system — Agent Guide

MIT open-commons monorepo for the design system. Packages publish to `registry.npmjs.org` as `@manovaspace/*`.

Utilities (`tsconfig`, `markdown`, `pwa`, `observability`): [`manovaspace/ts`](https://github.com/manovaspace/ts).

## Packages

| Package | Role |
| --- | --- |
| `@manovaspace/tokens` | `default.json` → CSS variables, fonts |
| `@manovaspace/ui` | Radix/shadcn primitives (incl. Form, Sheet, Table, Tooltip, Popover), motion, icons |
| `@manovaspace/devtools` | Dev-only design-system toolbar |

## Commands

```bash
bun install --frozen-lockfile
bun run build
bun run storybook        # port 10006 — enables Storybook MCP while running
bun run test
bun run typecheck
bun run check:ds         # hex + default palette bans in packages/ui and packages/devtools
bun run quality          # lint + check:ds
```

Node >= 24. Package manager: bun@1.4.0. Use committed `bun.lock`.
Releases follow [RELEASING.md](./RELEASING.md): Changesets own per-package
versions; a topic-branch version PR merges with `chore: version packages`.
No direct pushes to main.

## Layer order

Change **tokens → ui → apps**. Run Storybook before shipping visual changes.

`Form*` requires peer `react-hook-form` (optional peer — install it in the product when using Form). Keep a single RHF version in the app to avoid dual `FormProvider` contexts.

Reusable multi-primitive flows belong in `packages/ui/src/composed/` and are
exported from the package barrel.

### Standard Architectural Suites (Goldstein / Abshodeh Benchmark)
- **Entity Browser Suite**: `EntityBrowser`, `EntityDataTable`, `EntitySearchField`, `EntityFilterBar`, `EntityPagination`, `EntityListStates`.
- **Adaptive Shell Suite**: `NavRail` (desktop sidebar), `NavTree` (collapsible tree), `NavMobileSheet` (mobile navigation sheet), `ShellHeader` (adaptive top bar), `AppShellChrome`.
- **Composed Form & Data Widgets**: `DecimalInput` (Persian on-screen, Latin in state), `SelectableOptionCard` (touch selection), `CopyableMoney` (Toman with copy), `PhoneNumber`, `CardNumber`, `DataValue`, `FieldFeedback`, `HintTooltip`.

Canonical App Catalog & Decision Tree: [`docs/app-components.md`](docs/app-components.md).
Public architecture and usage authority: this local catalog, package source/types
and Storybook examples. Consumer guides are at
[manovaspace docs](https://manovaspace.github.io/docs/design-system/). Public
contribution requires no private handbook, staff identity or workspace checkout.
Staff keep deployment and integration runbooks separately in their handbook.

## Storybook MCP

`@storybook/addon-mcp` is enabled. If an MCP client is available while Storybook
runs, use it to inspect component props. Otherwise verify props from local
TypeScript definitions, source, tests and Storybook examples. MCP and private
handbook access are optional; never invent props from memory.

## Workspace triggers

Staff working inside the Manova workspace may consult its root
`FUTURE-TRIGGERS.md`. This staff-only pointer is not a public setup or check
prerequisite; public contributors follow repository-local docs.
