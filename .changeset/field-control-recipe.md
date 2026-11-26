---
"@manovaspace/ui": minor
---

Unify form field controls (`Input`, `Textarea`, `SelectTrigger`, `Combobox`, `DatePicker`, `WheelDatePicker`, `AmountInput`, and new experimental `PickerTrigger`) on a shared `fieldControlVariants` recipe with `size="default"` (40 px) / `"touch"` (44 px) and consistent `default` / `invalid` / `disabled` / `readonly` styling. Add `Field` `counter` slot and context wiring (`useFieldContextOptional`) for composite `SelectTrigger`, plus `aria-invalid` and `aria-describedby` forwarding on `DatePicker` and `WheelDatePicker`.
