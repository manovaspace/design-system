---
"@manovaspace/ui": minor
---

`ProgressiveDialog` gains `progress="segments"` (one bar per step) and per-step `parts`, so a wizard can show several pieces inside one step such as one page per item. `focusKey` returns focus and scroll to the content when a step pages through several pieces.

`Progress` now sizes its indicator instead of translating it, so it fills from the inline start and reads correctly in RTL. LTR rendering is unchanged.
