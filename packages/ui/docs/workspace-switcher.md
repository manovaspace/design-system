# WorkspaceSwitcher

> **Experimental** — exported from `@manovaspace/ui/experimental`. The API may
> change or disappear in any minor release.

`WorkspaceSwitcher` is a domain-free workspace chooser: a trigger that shows the
current workspace, a keyboard-operable listbox, and optional create action. The
caller owns the workspace list, the current selection, authorization, and every
visible label. The component performs no data fetching and contains no auth
logic.

## Usage

```tsx
import { WorkspaceSwitcher } from "@manovaspace/ui/experimental";

<WorkspaceSwitcher
  workspaces={[
    { id: "orbit", name: "Orbit", subtitle: "Main workspace" },
    { id: "fryto", name: "Fryto", logoSrc: "/brand/fryto.svg" },
  ]}
  currentId={workspaceId}
  onSwitch={(id) => setWorkspaceId(id)}
  labels={{
    trigger: "Switch workspace",
    list: "Workspaces",
    empty: "No workspaces yet",
    create: "Create workspace",
  }}
  onCreate={() => openCreateWorkspace()}
/>;
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `workspaces` | `{ id: string; name: string; logoSrc?: string; subtitle?: string }[]` | Workspaces to choose from. |
| `currentId` | `string` | Id of the selected workspace. |
| `onSwitch` | `(id: string) => void` | Called when a workspace is chosen. |
| `labels` | `WorkspaceSwitcherLabels` | All visible copy: `trigger`, `list`, `empty`, and optional `create`. No language is hardcoded. |
| `onCreate` | `() => void` | Optional create action; requires `labels.create`. |
| `className` | `string` | Applied to the root element. |

`WorkspaceSwitcherItem` and `WorkspaceSwitcherLabels` are exported for typing
the caller's data and copy.

## States

- **Many workspaces** — button trigger, listbox popup, and an optional create
  action.
- **Single workspace** — a static label with the logo/initials and name; no
  trigger or menu is rendered.
- **Empty** — the `labels.empty` text in a static container; no menu is
  rendered.

When `logoSrc` is omitted the component shows initials derived from the
workspace name.

## Accessibility

- The trigger is a real `<button>` with `aria-haspopup="listbox"`,
  `aria-expanded`, and `aria-controls` referencing the open listbox.
- The popup is `role="listbox"` with `aria-label={labels.list}`. Each row is
  `role="option"` with `aria-selected`; the active row is exposed through
  `aria-activedescendant` while focus stays on the listbox.
- Keyboard: Arrow Down/Up move and wrap, Home/End jump to the first/last
  workspace, Enter or Space selects, Escape closes and returns focus to the
  trigger. Optional type-ahead matches workspace names.
- Touch targets (trigger, options, create action) are at least 44px high.
- Layout uses logical properties (`start`/`end`, `ms-auto`, `text-start`) and
  the chevron mirrors when the surrounding `DirectionProvider` is RTL.
- Selecting a workspace or pressing Escape returns focus to the trigger, so
  keyboard users keep their place.
