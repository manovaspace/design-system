import type { ComponentProps } from "react";

import { Switch as PrimitiveSwitch } from "./primitives/switch.js";

export type SwitchProps = ComponentProps<typeof PrimitiveSwitch>;

export function Switch(props: SwitchProps) {
  return <PrimitiveSwitch {...props} />;
}
