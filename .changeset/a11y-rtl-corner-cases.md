---
"@manovaspace/ui": minor
---

Add logical `start`/`end` side docking to `SheetContent` (`side="start"|"end"`), base `scroll-margin-block-start` sticky-header focus clearance, and `@media (forced-colors: active)` fallback rules in `@manovaspace/ui/styles.css`.

Fix forced-colors focus: kit controls use `outline-hidden` instead of `outline-none` (Tailwind v4 `outline-none` has no forced-colors fallback), and the forced-colors `:focus-visible` outline rule now sits outside `@layer base` so it is not overridden by utilities. `--sticky-header-offset` is defined in `styles.css` (default `3.5rem`); `--entity-browser-sticky-top` now defaults to it.
