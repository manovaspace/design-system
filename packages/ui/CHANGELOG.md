# @manovaspace/ui

## 1.4.0

### Minor Changes

- 5251181: Add RowList/Row and EditFieldSheet

## 1.3.0

### Minor Changes

- 2a4c889: Add VibeFarsi parity components (Combobox, ComboboxAsync, MultiSelect, TagsInput, AmountInput, Pagination, Rating, SegmentedControl, Stepper, Breadcrumb, Field, SearchInput), Persian normalization utilities (foldPersian, amountToWords, shortAmount, graduated digits utilities), and tactile press and brand tokens.

### Patch Changes

- Updated dependencies [2a4c889]
  - @manovaspace/tokens@1.1.0

## 1.2.0

### Minor Changes

- a7a28b9: WorkspaceSwitcher gains `disabled` and `pendingId` for in-flight and locked states.

## 1.1.0

### Minor Changes

- d9c5e67: Add experimental `WorkspaceSwitcher` (RTL-aware workspace listbox with single and empty states) and `PermissionGate` (hide/disable permission boundary) with documentation and component tests.

### Patch Changes

- 225a304: Declare explicit `ReactNode` return types on `LoadingOverlay` and `LoadingStatus` so the public API report is stable.

## 1.0.0

### Major Changes

- 175d823: # `@manovaspace/ui` 1.0
  
  The stable API is the root entry `@manovaspace/ui` plus the existing subpaths
  (`./icons`, `./icons/solid`, `./icons/brand`, `./motion`, `./loading`,
  `./server`). From 1.0 these are covered by the compatibility promise in
  `RELEASING.md`. Breaking a stable export requires a major release; deprecations
  carry a migration note and at least one month before removal.
  
  `@manovaspace/ui/experimental` is outside the semver promise: anything exported
  there may change or disappear in any minor release.
  
  ## Removed names and replacements
  
  - `normalizeDigits` → `normalizePhoneDigits`
  - `formatPhoneDisplay` → `persianizePhoneDigits`
  - `formatPhoneCopy` → `normalizePhoneDigits`
  - `EntityListStates` → `EntityListBody`
  - `SelectGroupLabel` → `SelectLabel`
  - `SelectIcon` → no replacement; the chevron is built into `SelectTrigger`
  - `SelectList` → render children inside `SelectContent`
  
  ## Experimental exports moved to `@manovaspace/ui/experimental`
  
  These names were previously exported from the root. Import them from
  `@manovaspace/ui/experimental`:
  
  applyDocumentLocale, Collapse, CollapseProps, Collapsible, CollapsibleContent,
  CollapsibleContentProps, CollapsibleTrigger, CopyableMoney, CopyableMoneyLine,
  CopyableMoneyLineProps, CopyableMoneyProps, DateTimePicker, DateTimePickerProps,
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup,
  DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut,
  DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger,
  DropdownMenuTrigger, FieldDescription, FieldGroup, Form, formatLocaleInteger,
  formatLocaleRelativeTime, formatPersianDate, FormatPersianDateOptions,
  formatPhoneE164, formatPhoneSmsHref, formatPhoneTelHref, FormControl,
  FormDescription, FormField, FormItem, FormLabel, FormMessage, HintTooltip,
  HintTooltipProps, isValidIranMobile, LocalePreferenceProvider,
  LocalePreferenceProviderProps, MenuMorphGlyph, MenuMorphGlyphProps, MobileTopBar,
  MobileTopBarProps, normalizeIranMobile, normalizeIranMobileInput,
  normalizePhoneDigits, PageShell, pageShellContentVariants, PageShellProps,
  persianizeDigits, persianizePhoneDigits, PhoneAction, PhoneNumber,
  PhoneNumberLabels, phoneNumberPresets, PhoneNumberProps, PhoneNumberVariant,
  Progress, resolveLocaleDir, ScrollArea, ScrollAreaProps, ScrollBar, Slider,
  Switch, SwitchProps, Textarea, TextareaProps, TextDirection, Toggle, ToggleGroup,
  ToggleGroupItem, toggleVariants, toLatinDigits, toLocaleDigits, Tooltip,
  TooltipContent, TooltipProvider, TooltipTrigger, useFormField,
  useLocalePreference, WhatsNew, WhatsNewItem, WhatsNewManifest, WhatsNewProps.

### Patch Changes

- Updated dependencies [175d823]
  - @manovaspace/tokens@1.0.0

## 0.12.0

### Minor Changes

- 5c42e0e: Ship `dist/agents/index.md`, a compact agent index generated from the committed API reports at build time. Consumers can read the installed file before writing UI; it is capped at 8 KB and includes every stable export, grouped by source area, with props for the components that fit.

## 0.11.1

### Patch Changes

- 7f38e01: EntityBrowser renders a section so it can live inside PageShell or a custom shell without a duplicate main landmark.

## 0.11.0

### Minor Changes

- 98781c3: `ProgressiveDialog` step bars now carry `data-state` (`done`, `current` or `todo`) on every part. Completed steps render as a neutral mark, only the step being edited keeps the brand colour, and unreached steps stay a light track, so a wizard shows where the operator is instead of every bar reading as complete. `data-filled` and the per-step `parts` split are unchanged.

  `ProgressiveDialog` also accepts `errorAction` (`{ label, onClick, pending? }`) to render a retry inside the error row, inline with the message. The row is `role="alert"`, reports `aria-busy` and disables the action while pending, and stays until the caller clears `error`.

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
