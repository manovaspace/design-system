# WheelDatePicker

`WheelDatePicker` is a Jalali (Persian) date picker. A bordered trigger button
opens a bottom sheet with three independently scrollable wheel columns: year,
month (Persian month names) and day. Import it from `@manovaspace/ui/experimental`
(outside the semver promise) or from the composed index.

## Props

| Prop | Type | Notes |
| --- | --- | --- |
| `value` | `string` | `"YYYY-MM-DD"` Gregorian. Empty shows the placeholder. |
| `onValueChange` | `(next: string) => void` | Emits `"YYYY-MM-DD"` Gregorian on confirm only. |
| `min` | `string` | Optional `"YYYY-MM-DD"` lower bound. Earlier days, months and years are disabled. |
| `max` | `string` | Optional `"YYYY-MM-DD"` upper bound. Later days, months and years are disabled. |
| `locale` | `"fa"` | Default `"fa"`. Only Persian is supported. |
| `disabled` | `boolean` | Disables the trigger. |
| `placeholder` | `string` | Shown when there is no value. Defaults to the title label. |
| `labels` | `object` | Optional overrides for `title`, `confirm`, `cancel`, `year`, `month`, `day`. |
| `className` | `string` | Applied to the trigger button. |

## Behaviour

- The trigger shows the Jalali date with Persian digits, for example `۱۴۰۵/۰۶/۲۹`.
- An empty value opens on today in `Asia/Tehran` (+03:30, no DST).
- The year column spans today minus 100 years to today plus 20 years. A draft
  year outside that span still gets a row.
- Changing the year or month clamps the day to the new month length. Month
  lengths come from `react-date-object` (Persian calendar), not local math.
- Out-of-range rows get `aria-disabled="true"` and stay visible. Confirm is
  disabled while the draft date is outside `min`/`max`.
- Cancel, overlay click and Escape close the sheet without emitting.
- Keyboard: each listbox is focusable. ArrowUp and ArrowDown move the
  selection in that column, skipping disabled rows. Enter re-selects the
  current row.

## Example

```tsx
import { useState } from "react";
import { WheelDatePicker } from "@manovaspace/ui/experimental";

export function BirthDate() {
  const [value, setValue] = useState<string | undefined>();

  return (
    <WheelDatePicker
      value={value}
      onValueChange={setValue}
      max="2026-12-31"
      placeholder="تاریخ تولد"
    />
  );
}
```
