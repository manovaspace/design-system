import type { ComponentProps } from "react";

import { Switch as PrimitiveSwitch } from "./primitives/switch.js";

/** @experimental */
export type SwitchProps = ComponentProps<typeof PrimitiveSwitch>;

/** @experimental */
export function Switch(props: SwitchProps) {
  return <PrimitiveSwitch {...props} />;
}
