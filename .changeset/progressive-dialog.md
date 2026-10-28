---
"@manovaspace/ui": minor
---

Add `ProgressiveDialog`, a multi-step dialog shell: a desktop dialog at md and up and a full-screen sheet below. It shows the step list and progress, moves focus to each step's content, announces errors, and blocks dismissal while the primary action is pending. Product code supplies the step content, copy and close handling.

Fix `Progress` so its `value` reaches the progressbar, which previously reported no `aria-valuenow`.
