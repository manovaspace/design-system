# PermissionGate

> **Experimental** — exported from `@manovaspace/ui/experimental`. The API may
> change or disappear in any minor release.

`PermissionGate` is a presentation-only permission boundary. The caller
computes `allowed` from its own authorization source; the component has no auth
library hooks, no data fetching, and no client policy. Server-side authorization
must still enforce the same rule.

## Usage

```tsx
import { PermissionGate } from "@manovaspace/ui/experimental";

// Remove content the user cannot access.
<PermissionGate allowed={canManageBilling} fallback={<p>Read only</p>}>
  <BillingSettings />
</PermissionGate>;

// Keep layout stable and show the controls as disabled.
<PermissionGate allowed={canManageBilling} mode="disable">
  <BillingSettings />
</PermissionGate>;
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `allowed` | `boolean` | — | Computed by the caller. |
| `children` | `ReactNode` | — | Content to show or disable. |
| `fallback` | `ReactNode` | `null` | Rendered instead of `children` in `hide` mode. |
| `mode` | `"hide" \| "disable"` | `"hide"` | How denied content is handled. |
| `className` | `string` | — | Applied to the wrapper in `disable` mode. |

## Modes

- **`hide`** (default) — allowed children render; denied children are not
  mounted, and `fallback` renders instead. Content leaves both layout and the
  accessibility tree.
- **`disable`** — children stay mounted inside a wrapper with
  `aria-disabled="true"` and `inert` while denied. The layout is preserved and
  the controls look disabled. `fallback` is ignored in this mode.

## Accessibility

In `disable` mode the wrapper carries both `aria-disabled` and `inert`:

- `inert` removes the subtree from the tab order and, in supporting browsers,
  from the accessibility tree, so focus cannot land on a denied control.
- `aria-disabled` communicates the disabled state to assistive technology where
  the subtree remains exposed.
- The wrapper stays in the DOM, so toggling permission does not shift layout.

In `hide` mode no denied markup is rendered, so there is nothing for assistive
technology to discover. Do not rely on this component for security; it only
reflects a permission decision the caller has already made.
