---
"@manovaspace/ui": minor
---

Row: list rows keep their `li` in every mode. `asChild` now renders the child inside the `li` as a stretched action, and the new `onPress` and `disabled` props make a row pressable without `role="button"`. Passing a non-listitem `role` warns in development. EntityBrowser: a flush `RowList` inside the browser body is no longer clipped.
