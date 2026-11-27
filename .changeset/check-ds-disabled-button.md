---
"@manovaspace/ui": patch
---

Button disabled styling now lives on each variant instead of the shared base. Filled and outlined variants (`default`, `destructive`, `outline`, `secondary`, `solid`, `brand`) get the neutral `12%` container (`disabled:bg-foreground/12 disabled:border-foreground/12`). `ghost` and `link` keep transparent disabled containers. Shared rules (`38%` content, no shadow, no opacity dimming) stay on the base. Redundant `dark:disabled:*` duplicates are removed because `foreground` is theme-aware.
