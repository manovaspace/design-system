# @manovaspace/ui

## 0.10.0

### Minor Changes

- 8f30d52: `@manovaspace/ui/motion` re-exports `motion`, `AnimatePresence`, `useScroll` and `useTransform` from framer-motion. Product apps can now build animated and scroll-linked sections without importing framer-motion directly, which the workspace UI-import gate forbids.

## 0.9.0

### Minor Changes

- 947d6ba: `ProgressiveDialog` gains `progress="segments"` (one bar per step) and per-step `parts`, so a wizard can show several pieces inside one step such as one page per item. `focusKey` returns focus and scroll to the content when a step pages through several pieces.

  `Progress` now sizes its indicator instead of translating it, so it fills from the inline start and reads correctly in RTL. LTR rendering is unchanged.

## 0.8.0

### Minor Changes

- 5dfacc8: Add the Adaptive Shell and composed form/data components: `NavTree`, `NavRail`, `NavMobileSheet`, `ShellHeader`, `HoldToConfirmButton`, `CardNumber`, `DirectionProvider`, `Collapse`, `MenuMorphGlyph`, `DateTimePicker`, plus `formatToman`, `formatLocaleInteger`, and relative-time and Persian date formatting helpers.
- 88939f5: Add `ProgressiveDialog`, a multi-step dialog shell: a desktop dialog at md and up and a full-screen sheet below. It shows the step list and progress, moves focus to each step's content, announces errors, and blocks dismissal while the primary action is pending. Product code supplies the step content, copy and close handling.

  Fix `Progress` so its `value` reaches the progressbar, which previously reported no `aria-valuenow`.

## 0.7.0

### Minor Changes

- 0835b1c: Add the Adaptive Shell and composed form/data components: `NavTree`, `NavRail`, `NavMobileSheet`, `ShellHeader`, `HoldToConfirmButton`, `CardNumber`, `DirectionProvider`, `Collapse`, `MenuMorphGlyph`, `DateTimePicker`, plus `formatToman`, `formatLocaleInteger`, and relative-time and Persian date formatting helpers.

## 0.6.0

### Minor Changes

- cb52031: Add `fullScreen` option to `EntityFilterBar` mobile filters sheet

## 0.5.0

### Minor Changes

- 13c3cc5: Add solid button variant with border and enhance secondary styling.

## 0.4.0

### Minor Changes

- 1451626: Add a shared Jalali/Gregorian date-time picker with an ISO instant contract.

## 0.3.0

### Minor Changes

- 52a220d: Add AlertDialog and Toast (Toaster + imperative toast()) overlays.
- Add reusable `ConfirmDialog`, `Alert`, and `EmptyState` components for
  localized confirmation and feedback flows.
- 52a220d: Add Form (react-hook-form), Sheet, Table, Tooltip, and Popover public wrappers with Storybook stories.
- 52a220d: Add MobileBottomTabBar, MobileTopBar, and LocalePreferenceProvider for phone-first app chrome.

### Patch Changes

- 52a220d: Use @manovaspace/build shared tsup config helpers.
- Updated dependencies [52a220d]
- Updated dependencies [52a220d]
  - @manovaspace/tokens@0.1.3

## 0.2.2

### Patch Changes

- Update npm homepage URLs to unified docs site at manovaspace.github.io/docs.
- Updated dependencies
  - @manovaspace/tokens@0.1.2

## 0.2.1

### Patch Changes

- Update repository and homepage URLs after split to manovaspace/design-system.
- Updated dependencies
  - @manovaspace/tokens@0.1.1

## 0.2.0

### Minor Changes

- 5c5fae6: Add `Avatar`, `AvatarImage`, and `AvatarFallback` primitives with size variants.
- 00c39aa: Add generic loading toolkit: Skeleton, Spinner, LoadingScreen, LoadingOverlay, LoadingStatus, and timing hooks (`@manovaspace/ui/loading`).
- 433ef5d: Add optional `WhatsNew` dialog for in-app release announcements from a `releases.json` manifest.

## 0.1.0

### Minor Changes

- 8fea439: Initial beta release of Orbit frontend toolkit packages.
- cf09e94: Migrate @manovaspace/ui from Base UI to Radix/shadcn primitives, Lucide + react-icons, Framer Motion helpers, and new @orbit/markdown package. Strengthen token CSS sync tests.

### Patch Changes

- Updated dependencies [8fea439]
- Updated dependencies [cf09e94]
  - @manovaspace/tokens@0.1.0
