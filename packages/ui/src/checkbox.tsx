import type { ComponentProps } from "react";

import { Checkbox as PrimitiveCheckbox } from "./primitives/checkbox.js";

export type CheckboxProps = ComponentProps<typeof PrimitiveCheckbox>;

/** Public Checkbox — use this in apps, not primitives. */
export function Checkbox(props: CheckboxProps) {
  return <PrimitiveCheckbox {...props} />;
}
