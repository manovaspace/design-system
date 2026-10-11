# DateTimePicker

`DateTimePicker` is a shared UI wrapper for localized calendar selection and
time entry. It composes `react-multi-date-picker` for Jalali/Gregorian calendar
arithmetic with the library's shared `Button`, `Popover`, and `Input` wrappers.
Product apps import it from `@manovaspace/ui`; they do not import the calendar
library or its primitives directly.

## Value and timezone

- `value` is a nullable ISO-8601 instant; `onValueChange` emits an ISO instant
  with a UTC offset.
- `timeZone` is an IANA zone. The displayed date and the entered time are both
  interpreted in that zone; it defaults to `Asia/Tehran`.
- `locale="fa"` uses the Persian/Jalali calendar and Farsi locale. `locale="en"`
  uses Gregorian/English display. Omitted locale reads the active shared locale
  provider.
- An unset value displays the placeholder and opens on the current date/time.

The component handles conversion from selected calendar days to Gregorian
dates and converts the selected wall time to a UTC instant using the supplied
zone. Server payloads should keep the emitted instant; presentation belongs
to the consuming app's locale and timezone choice.
