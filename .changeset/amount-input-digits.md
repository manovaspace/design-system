---
"@manovaspace/ui": minor
---

Extend `AmountInput` with arbitrary-precision string-digits mode, caret-preserving thousands grouping across edits, single-keystroke Backspace/Delete across grouping marks (`٬` / `,`), and raw ASCII digit clipboard copy.

String-digits mode requires the explicit `mode="digits"` prop. `AmountInputProps` is now a union: `mode` alone selects the mode, so a string `value` or `defaultValue` without `mode="digits"` is a type error, and `onValueChange` is only accepted in digits mode. Digits mode takes `value?: string`, `defaultValue?: string` and `onValueChange?: (digits: string) => void`.

In digits mode, `onChange` receives a number only when the digits are a safe integer (`Number.isSafeInteger`), and `null` when cleared. For larger amounts `onChange` is not called; read `onValueChange` instead.
