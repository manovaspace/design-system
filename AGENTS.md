# manovaspace/design-system — Agent Guide

MIT open-commons monorepo for the design system. Packages publish to `registry.npmjs.org` as `@manovaspace/*`.

Utilities (`tsconfig`, `markdown`, `pwa`, `observability`): [`manovaspace/ts`](../ts).

## Packages

| Package | Role |
| --- | --- |
| `@manovaspace/tokens` | `default.json` → CSS variables, fonts |
| `@manovaspace/ui` | Radix/shadcn primitives (incl. Form, Sheet, Table, Tooltip, Popover), motion, icons |
| `@manovaspace/devtools` | Dev-only design-system toolbar |

## Commands

```bash
bun run build
bun run storybook        # port 10006 — enables Storybook MCP while running
bun run test
bun run typecheck
bun run check:ds         # hex + default palette bans in packages/ui and packages/devtools
bun run quality          # lint + check:ds
```

Node >= 24. Package manager: bun@1.4.0.

## Layer order

Change **tokens → ui → apps**. Run Storybook before shipping visual changes.

`Form*` requires peer `react-hook-form` (optional peer — install it in the product when using Form). Keep a single RHF version in the app to avoid dual `FormProvider` contexts.

Decision tree: `handbook/docs/orbit/guides/orbit-component-architecture.md`. Hydration for consuming apps: `handbook/docs/orbit/guides/orbit-frontend-hydration.md`.

## Storybook MCP

`@storybook/addon-mcp` is enabled. While `bun run storybook` runs, agents must use Storybook MCP to verify `@manovaspace/ui` component props — never invent props from memory. Details: `handbook/docs/orbit/guides/cursor-mcp.md` (Storybook MCP section).

## Workspace triggers

Canonical: Manova workspace [`FUTURE-TRIGGERS.md`](../../FUTURE-TRIGGERS.md).
