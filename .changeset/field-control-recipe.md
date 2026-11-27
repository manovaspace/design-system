---
"@manovaspace/ui": minor
---

Unify form field controls (`Input`, `Textarea`, `SelectTrigger`, `Combobox`, `DatePicker`, `WheelDatePicker`, `AmountInput`, and new experimental `PickerTrigger`) on a shared `fieldControlVariants` recipe with `size="default"` (40 px) / `"touch"` (44 px) and consistent `default` / `invalid` / `disabled` / `readonly` styling. Add `Field` `counter` slot and Field context wiring for composite `SelectTrigger`, plus `aria-invalid` and `aria-describedby` forwarding on `DatePicker` and `WheelDatePicker`.

### Visual changes

- `Combobox` `md` trigger: 36 px to 40 px (`h-9` to `h-10`). `lg` icon size changed.
- `DatePicker` and `WheelDatePicker` default trigger: 44 px to 40 px. Pass `size="touch"` for 44 px.
- `Textarea` and `SelectTrigger` read the field tokens (`--rounded-field`, `--bg-field`, `--border-line-field`, `--shadow-field`) and use a 2 px focus ring instead of 3 px.
- `Field` renders a wrapper row for hint, error and counter.
- Read-only inputs get muted styling.
- `AmountInput` `size` prop is now `"default" | "touch"`. The native numeric `size` attribute is no longer accepted. This matches `Input`.
