---
"@manovaspace/ui": minor
---

`ProgressiveDialog` step bars now carry `data-state` (`done`, `current` or `todo`) on every part. Completed steps render as a neutral mark, only the step being edited keeps the brand colour, and unreached steps stay a light track, so a wizard shows where the operator is instead of every bar reading as complete. `data-filled` and the per-step `parts` split are unchanged.

`ProgressiveDialog` also accepts `errorAction` (`{ label, onClick, pending? }`) to render a retry inside the error row, inline with the message. The row is `role="alert"`, reports `aria-busy` and disables the action while pending, and stays until the caller clears `error`.
