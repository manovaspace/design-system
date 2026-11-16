---
"@manovaspace/ui": minor
---

Add `FloatingActionButton`, a mobile-style floating primary action fixed to the bottom inline-end corner of the viewport. It renders as a 56px circle with the `label` as its accessible name, or as a pill with the label visible when `extended` is set. Its bottom offset follows `--fab-bottom-offset`, so consumers can lift it above a bottom navigation bar. `EntityBrowser` also gains a `stickyToolbar` prop that pins the command bar (toolbar and result meta) to the top of the scrolling page, with the top offset set by `--entity-browser-sticky-top` (default `0px`) so products with a fixed header can clear it.
