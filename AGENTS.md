# manovaspace/design-system — Agent Guide

MIT open-commons monorepo for the design system. Packages publish to `registry.npmjs.org` as `@manovaspace/*`.

Utilities (`tsconfig`, `markdown`, `pwa`, `observability`): [`manovaspace/ts`](../ts).

## Packages

| Package | Role |
| --- | --- |
| `@manovaspace/tokens` | `default.json` → CSS variables, fonts |
| `@manovaspace/ui` | Radix/shadcn primitives, motion, icons |
| `@manovaspace/devtools` | Dev-only design-system toolbar |

## Commands

```bash
pnpm build
pnpm storybook        # port 10006
pnpm test
pnpm typecheck
```

Node >= 24. Package manager: pnpm@11.10.0.

## Layer order

Change **tokens → ui → apps**. Run Storybook before shipping visual changes.

## Workspace triggers

Canonical: Manova workspace [`FUTURE-TRIGGERS.md`](../../FUTURE-TRIGGERS.md).
