# App Components Catalog & Design System Standard

LLM-oriented and human-oriented reference for **`@manovaspace/ui`**, **`@manovaspace/tokens`**, and consuming applications (Orbit, Falak, clients).
Derived from the **Goldstein / Abshodeh** (`~/Dev/abshodeh`) UI/UX benchmark.

Product language is **bilingual (Persian `fa` RTL-first and English `en`)**. Code and docs are English.

---

## Decision tree

```text
Need UI in any Orbit / Manova product?
├─ A whole page or a form/flow sheet?       → Page templates (below): ListPage, SummaryPage, DetailPage, FormSheet, ProgressiveDialog
├─ Brand color / radius / spacing?       → @manovaspace/tokens (CSS vars: --background, --surface-sunken, --sidebar-*)
├─ Basic primitive (Button, Dialog)?     → @manovaspace/ui primitives
├─ Searchable list / directory / queue?  → @manovaspace/ui/composed/entity-browser (EntityBrowser)
├─ Responsive shell (sidebar + header)?  → @manovaspace/ui/composed/shell (NavRail, ShellHeader, NavTree, NavMobileSheet)
├─ Money / currency readout?             → <DataValue> (@manovaspace/ui); <CopyableMoney> is experimental (@manovaspace/ui/experimental)
├─ Phone / Card input or readout?        → <CardNumber> (@manovaspace/ui); <PhoneNumber> is experimental (@manovaspace/ui/experimental)
├─ Form feedback / inline alert?         → <FieldFeedback>, <Alert> (@manovaspace/ui)
├─ Numeric input with Persian digits?    → <DecimalInput> (@manovaspace/ui)
├─ High-touch selection / radio card?    → <SelectableOptionCard> (@manovaspace/ui)
├─ Confirm / destructive dialog?         → <ConfirmDialog> (@manovaspace/ui)
├─ Switch workspace?                     → <WorkspaceSwitcher> (@manovaspace/ui/experimental)
├─ Permission-gated UI?                  → <PermissionGate> (@manovaspace/ui/experimental)
├─ Filter sheet of rows (navigation + toggles)? → <FilterSheet> (@manovaspace/ui)
└─ Multi-step flow in a dialog or sheet? → <ProgressiveDialog> (@manovaspace/ui)
```

---

## Page templates

A page template is one component per kind of page. It fixes the layout, the order of actions and the
responsive behaviour, so two pages of the same kind look and behave the same. Use the template; do not
rebuild its layout from primitives. Each template's JSDoc lists its usage rules.

Templates ship from `@manovaspace/ui/experimental` while their contracts settle; import them from there. They may change in a minor release.

```text
What is this page or flow?
├─ A list of records (directory, ledger, catalog) with search?   → <ListPage>
├─ The home of a module (overview, dashboard)?                   → <SummaryPage>
├─ One record and its sections?                                  → <DetailPage> + <DetailPageSection>
├─ Create or edit one record in a form?                          → <FormSheet>
├─ A flow with more than one step (pick, then fill, then review)?→ <ProgressiveDialog>
└─ Edit one field of a record?                                   → <EditFieldSheet>
```

Rules every template follows:

- **Lists:** untitled for the page's main list (the app shell shows the title); titled when a page holds several lists. Sort opens a sheet of choices titled with the sort button label.
- **Add action:** a labelled header button from `lg`, a `FloatingActionButton` below `lg` (bottom
  inline-end, lifted by `--fab-bottom-offset`). A titled list keeps the header button at every
  width.
- **Counts:** the filtered total goes in the search placeholder («جستجو در ۵۲ کالا»). No count line.
- **Filters:** a filter button beside the search opens a `FilterSheet` titled with the button label.
  Only active filters show, as removable chips in one horizontally scrolling row.
- **Empty state:** say what the list holds and offer the next step (`EmptyState` with an action).
- **Sheets:** full screen below `md`, dialog from `md`. Footer: secondary first, primary last; cancel
  is the secondary. The footer stays above the on-screen keyboard and inside the safe area.
- **Sheet title** equals the label of the button that opened it.
- **Wizards:** same steps and progress cue at every width; one primary action per step.
- **Detail pages:** back to the parent list, one primary action, destructive actions last.
- **Everywhere:** logical properties only (RTL), 44 px touch targets, no hover-only affordances,
  tokens only.

Screenshots of every template story at 390, 768 and 1440 px: `bun run storybook:shots` (writes
`storybook-shots/`, gitignored).

---

## Import cheat sheet

| Need | Import from | Notes |
| --- | --- | --- |
| Whole page layout | `@manovaspace/ui/experimental` (`ListPage`, `SummaryPage`, `DetailPage`, `FormSheet`) | Page templates; see "Page templates". |
| Searchable list / table / catalog | `@manovaspace/ui` (`EntityBrowser`, `EntityDataTable`, `EntitySearchField`, `EntityFilterBar`) | Provides command bar, search, filter chips, data table, and empty states. |
| Filter pills under a list search | `@manovaspace/ui` (`FilterPillBar`) | One scrollable row of single-select toggle pills and menu pills (bottom-sheet picker, searchable above 8 options). |
| Filter sheet of rows (navigation + toggles) | `@manovaspace/ui` (`FilterSheet`) | Bottom sheet of rows: navigation rows open a single-choice, multi-choice or custom sub-page; toggle rows hold a switch. Footer has reset and apply. |
| Load more at the end of a list | `@manovaspace/ui` (`InfiniteScrollTrigger`) | Sentinel-driven next-page loader with loading spinner, retry and button fallback. |
| Desktop sidebar navigation | `@manovaspace/ui` (`NavRail`, `NavTree`) | Desktop aside rail with collapsible sections and badges. |
| Mobile navigation drawer | `@manovaspace/ui` (`NavMobileSheet`) | Slide-over drawer for mobile screen navigation. |
| Top header | `@manovaspace/ui` (`ShellHeader`) | Adaptive branded header with user identity, notifications, and actions. |
| Numeric decimal input | `@manovaspace/ui` (`DecimalInput`) | Persian numerals (`۰-۹`) on screen, clean Latin numbers (`0-9`) in state. |
| Touch option card | `@manovaspace/ui` (`SelectableOptionCard`) | Greasy-thumb-friendly cards with selection badge and RTL support. |
| Form validation text | `@manovaspace/ui` (`FieldFeedback`) | Accessible live-region validation message (`role="alert"`). |
| Currency with copy | `@manovaspace/ui/experimental` (`CopyableMoney`) | Formatted Toman with copy-to-clipboard affordance; experimental. |
| Iranian phone display | `@manovaspace/ui/experimental` (`PhoneNumber`) | Formatted MSISDN with prefix chip; experimental. |
| Iranian bank card display | `@manovaspace/ui` (`CardNumber`) | Grouped 16-digit card number with bank brand detection. |
| Workspace chooser | `@manovaspace/ui/experimental` (`WorkspaceSwitcher`) | RTL-aware trigger and listbox for switching workspaces; experimental. |
| Permission-gated UI | `@manovaspace/ui/experimental` (`PermissionGate`) | Hide or disable caller-authorized content; experimental, no auth hooks. |

`EntityDataTable` shows the `mobile` rows below `md` and the table from `md`; pass `tableFrom="lg"` for a wide table so tablets (768–1023 px) get the rows.

---

## Architectural Rules for Agents

1. **No Raw Inline Brand Styles**: Never use ad-hoc `style={{ color: "var(--brand-*)" }}`. Always use standard Tailwind semantic tokens: `bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`, `bg-surface-sunken`, `bg-primary`.
2. **Adaptive Shell Over Rigid Mobile Frame**: Never trap desktop experiences in narrow phone containers (`max-w-lg`). Desktop layouts must be wide and fluid (`max-w-7xl` or full-width) with `NavRail` and `ShellHeader`; mobile layouts adapt with touch targets and bottom sheets.
3. **Standardize on `EntityBrowser`**: All entity lists, inventories, balances, catalogs, and transaction logs must use the `EntityBrowser` pattern. Never invent custom unstyled table or list shells.
4. **Persian Numerals on Screen**: In Persian (`fa`) locale, numbers must be displayed using Persian digits (`۰-۹`), while state and API payloads maintain clean ASCII Latin digits (`0-9`).
