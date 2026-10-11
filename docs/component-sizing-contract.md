# Manova Component Sizing Contract

**Status:** Approved specification; Figma design review in progress  
**Scope:** `@manovaspace/tokens`, `@manovaspace/ui`, and consuming products  
**Decision owner:** Manova design system

## Purpose

Manova needs one clear sizing baseline across shared components. Products should be able to tune that baseline through their theme while keeping the same component API and interaction behavior. Named size variants cover genuine use cases without each product inventing its own scale.

This contract applies to Figma library components, design tokens, shared UI components, and product UI built from them.

## Principles

1. **Manova owns the baseline.** Shared components have documented defaults and use tokens for dimensions that products may theme.
2. **Variants have stable meaning.** Use `compact`, `default`, and `comfortable`. A variant keeps its intent across products even if its pixel value is themed.
3. **The default favors clear interaction.** The Manova default for common form controls is 48 CSS px high. Compact is for dense or secondary contexts; comfortable is for high-touch primary workflows.
4. **Visual size and hit area are separate.** A small icon or checkbox can sit inside a larger interactive target. Never shrink the hit area just to shrink the visible mark.
5. **Theme values tune components; APIs select intent.** A product can override supported sizing tokens and select a supported variant. It should not need per-instance pixel values or utility-class overrides for routine sizing.
6. **General foundations remain general.** Spacing, typography, and radius tokens continue to define their own scales. Component sizing tokens compose those foundations rather than replacing them.
7. **Responsive and RTL behavior are part of the contract.** Sizing and spacing must remain usable in narrow viewports and in both reading directions.

## Proposed size roles and baseline values

Values below are Manova defaults for review. They are CSS pixel dimensions and should be stored as typed, theme-overridable tokens, not repeated as literals in component styles.

| Component dimension | Compact | Default | Comfortable | Notes |
| --- | ---: | ---: | ---: | --- |
| Button, input, select, OTP control height | 40 | 48 | 56 | Public component default is `default`. OTP remains a single-field input unless a separate interaction spec changes it. |
| Interactive hit-area minimum | 44 × 44 | 44 × 44 | 48 × 48 | Applies to icon buttons, checkbox/radio controls, and other small visual affordances. |
| Checkbox/radio visual mark | 18 × 18 | 20 × 20 | 24 × 24 | The containing label or control supplies the hit area. |
| Selectable/entity card minimum height | 64 | 72 | 88 | Content may grow the card; height is a minimum, not a fixed crop. |
| Dialog content width | 28rem | 40rem | 56rem | Width is capped by the viewport; small screens use the established full-screen/sheet presentation. |

`default` is the shared API default. A product may change the token values behind a role, but the role names and component behavior remain stable. A product may also opt a specific component or workflow into another role when the UX requires it.

## Token and theme contract

Add a typed component-sizing namespace to the canonical token source in `@manovaspace/tokens`. It should cover the dimensions in the table and leave room for other cross-component dimensions only when a shared use case exists.

- Token values use a consistent CSS length representation and generate CSS custom properties.
- Partial theme overrides inherit all unspecified Manova defaults.
- Theme resolution keeps the existing precedence: Manova defaults, product theme override, remote override when configured, then explicit provider tokens.
- Products can override role values such as default control height, card minimum height, and dialog width through that mechanism.
- Product themes do not redefine variant names, component APIs, interaction states, or accessibility behavior.
- Components with no meaningful size choice may expose only the hit-area token and keep their visible size fixed by the shared component contract.

The Figma proposal uses the `Orbit · Component sizing` collection with a single `Default` mode and these variable paths:

- `component/control-height/{role}`
- `component/target-min/{role}`
- `component/selection-mark/{role}`
- `component/entity-card-min-height/{role}`
- `component/dialog-width/{role}`

Its CSS names are `--component-{dimension}-{role}`, for example `--component-control-height-default`. Preserve these CSS names when adding the canonical TypeScript and JSON shape, unless the token generator requires a documented mapping. Generate the variables from one canonical source; do not maintain a second hand-written sizing table in UI code.

## Shared UI component contract

- Public components that support size expose the same `compact | default | comfortable` vocabulary and default to `default` unless the component catalog documents a reason otherwise.
- Components consume generated sizing variables rather than local hard-coded heights, widths, or minimum heights.
- Wrappers and primitives agree on the same default. A wrapper must not silently promote a primitive size or use a separate scale.
- `className` remains available for layout composition, not as the standard product theming mechanism for size.
- The component catalog records supported variants, defaults, dimensions, responsive behavior, RTL behavior, and whether the visual size differs from its hit area.
- New reusable sizing behavior is implemented in `@manovaspace/ui` and documented with examples. Product business rules and flow state stay in the product app.

## Initial component coverage

The first implementation slice should normalize the components Fryto needs:

- Button
- Input, OTP input, and Select
- Checkbox and radio controls
- Selectable option and entity-selection cards
- Dialog and Sheet content sizing

Other components join the contract when they expose a meaningful, reusable sizing decision. Do not change every component in one migration if doing so makes compatibility review difficult.

## Product adoption

Fryto should inherit Manova `default` values first. Its product theme may then tune the supported component tokens as a coherent set. For its guided inventory flows, select `comfortable` for primary high-touch controls and entity choices where the larger target improves scanning and selection. Keep compact sizing for genuinely dense management surfaces only.

Products should not fork shared components or set one-off dimensions through local CSS to achieve a theme. If a product needs a new size role or a different interaction pattern, document the use case and add it to the shared contract only if it generalizes.

## Documentation and source of truth

- This document defines the cross-package sizing contract.
- `packages/tokens/src/default.json` and its schema define the canonical values and override shape.
- `@manovaspace/ui` documents which components expose each role and consumes the generated tokens.
- Figma Manova components use the same role names and baseline values. Product Figma files inherit the shared library and override theme values rather than redefining shared components.
- Product workflow specs state which role each workflow uses when that choice affects task completion or touch comfort.

## Acceptance checks for implementation

1. The token schema validates sizing tokens and generated CSS includes them.
2. Partial product overrides preserve unspecified Manova values.
3. Shared component wrappers and primitives resolve to the documented role and default consistently.
4. The initial component coverage has a documented variant matrix and examples.
5. Keyboard focus, disabled, error, loading, RTL, and narrow-screen states remain intact when dimensions change.
6. Existing callers keep working or receive an explicit migration path before a public API change.

## Approved baseline

The approved roles are `compact | default | comfortable`, with the baseline values in the table above. The Figma component library is the next review artifact; implementation follows after that design is accepted.
