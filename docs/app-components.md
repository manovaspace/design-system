# App Components Catalog & Design System Standard

LLM-oriented and human-oriented reference for **`@manovaspace/ui`**, **`@manovaspace/tokens`**, and consuming applications (Orbit, Fryto, clients).
Derived from the **Goldstein / Abshodeh** (`~/Dev/abshodeh`) UI/UX benchmark.

Product language is **bilingual (Persian `fa` RTL-first and English `en`)**. Code and docs are English.

---

## Decision tree

```text
Need UI in any Orbit / Manova product?
├─ Brand color / radius / spacing?       → @manovaspace/tokens (CSS vars: --background, --surface-sunken, --sidebar-*)
├─ Basic primitive (Button, Dialog)?     → @manovaspace/ui primitives
├─ Searchable list / directory / queue?  → @manovaspace/ui/composed/entity-browser (EntityBrowser)
├─ Responsive shell (sidebar + header)?  → @manovaspace/ui/composed/shell (NavRail, ShellHeader, NavTree, NavMobileSheet)
├─ Money / currency readout?             → <CopyableMoney> or <DataValue> (@manovaspace/ui)
├─ Phone / Card input or readout?        → <PhoneNumber>, <CardNumber> (@manovaspace/ui)
├─ Form feedback / inline alert?         → <FieldFeedback>, <Alert> (@manovaspace/ui)
├─ Numeric input with Persian digits?    → <DecimalInput> (@manovaspace/ui)
├─ High-touch selection / radio card?    → <SelectableOptionCard> (@manovaspace/ui)
└─ Confirm / destructive dialog?         → <ConfirmDialog> (@manovaspace/ui)
```

---

## Import cheat sheet

| Need | Import from | Notes |
| --- | --- | --- |
| Searchable list / table / catalog | `@manovaspace/ui` (`EntityBrowser`, `EntityDataTable`, `EntitySearchField`, `EntityFilterBar`) | Provides command bar, search, filter chips, data table, and empty states. |
| Desktop sidebar navigation | `@manovaspace/ui` (`NavRail`, `NavTree`) | Desktop aside rail with collapsible sections and badges. |
| Mobile navigation drawer | `@manovaspace/ui` (`NavMobileSheet`) | Slide-over drawer for mobile screen navigation. |
| Top header | `@manovaspace/ui` (`ShellHeader`) | Adaptive branded header with user identity, notifications, and actions. |
| Numeric decimal input | `@manovaspace/ui` (`DecimalInput`) | Persian numerals (`۰-۹`) on screen, clean Latin numbers (`0-9`) in state. |
| Touch option card | `@manovaspace/ui` (`SelectableOptionCard`) | Greasy-thumb-friendly cards with selection badge and RTL support. |
| Form validation text | `@manovaspace/ui` (`FieldFeedback`) | Accessible live-region validation message (`role="alert"`). |
| Currency with copy | `@manovaspace/ui` (`CopyableMoney`) | Formatted Toman with copy-to-clipboard affordance. |
| Iranian phone display | `@manovaspace/ui` (`PhoneNumber`) | Formatted MSISDN with prefix chip. |
| Iranian bank card display | `@manovaspace/ui` (`CardNumber`) | Grouped 16-digit card number with bank brand detection. |

---

## Architectural Rules for Agents

1. **No Raw Inline Brand Styles**: Never use ad-hoc `style={{ color: "var(--fryto-*)" }}`. Always use standard Tailwind semantic tokens: `bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`, `bg-surface-sunken`, `bg-primary`.
2. **Adaptive Shell Over Rigid Mobile Frame**: Never trap desktop experiences in narrow phone containers (`max-w-lg`). Desktop layouts must be wide and fluid (`max-w-7xl` or full-width) with `NavRail` and `ShellHeader`; mobile layouts adapt with touch targets and bottom sheets.
3. **Standardize on `EntityBrowser`**: All entity lists, inventories, balances, catalogs, and transaction logs must use the `EntityBrowser` pattern. Never invent custom unstyled table or list shells.
4. **Persian Numerals on Screen**: In Persian (`fa`) locale, numbers must be displayed using Persian digits (`۰-۹`), while state and API payloads maintain clean ASCII Latin digits (`0-9`).
