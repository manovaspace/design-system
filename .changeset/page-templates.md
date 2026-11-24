---
"@manovaspace/ui": minor
"@manovaspace/storybook": patch
---

Add experimental page templates in `@manovaspace/ui/experimental`: `ListPage` (untitled or titled, with search, filters, sort and add), `SummaryPage`, `DetailPage` with `DetailPageSection`, and `FormSheet`. `ProgressiveDialog` now shares the sheet footer: back uses the `secondary` variant, primary is last, both are 44 px, and the footer stays above the on-screen keyboard and inside the safe area. `EntitySearchField` clear button is a 44 px target. `EntityMobileMessage` renders a `div`, so block empty states are valid HTML.

Storybook: viewport presets are phone 390, tablet 768, laptop 1024 and desktop 1440, and `bun run storybook:shots` screenshots the template stories at those widths.
