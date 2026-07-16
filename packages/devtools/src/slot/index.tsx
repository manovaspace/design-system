import { useEffect } from "react";

import { useDevtoolsOptional } from "../context.js";
import type { CandidateOption } from "../types.js";

export type DevtoolsSlotProps = {
  id: string;
  label: string;
  candidates: CandidateOption[];
  defaultCandidateId?: string;
};

export function DevtoolsSlot({
  id,
  label,
  candidates,
  defaultCandidateId,
}: DevtoolsSlotProps) {
  const devtools = useDevtoolsOptional();
  const { registerSlot, unregisterSlot } = devtools ?? {};

  // Depend on the (stable, useCallback'd) register/unregister functions
  // rather than the whole `devtools` context value: that value is re-memoized
  // whenever `slots` changes, which registering/unregistering itself causes,
  // producing an infinite register -> unregister -> register loop.
  useEffect(() => {
    if (!registerSlot || !unregisterSlot) return;
    registerSlot({ id, label, candidates });
    return () => unregisterSlot(id);
  }, [registerSlot, unregisterSlot, id, label, candidates]);

  const selectedId =
    devtools?.getSelectedCandidateId(id) ??
    defaultCandidateId ??
    candidates[0]?.id;
  const active =
    candidates.find((candidate) => candidate.id === selectedId) ??
    candidates[0];

  const highlighted = devtools?.activeSlotId === id;

  return (
    <div
      data-orbit-devtools-slot={id}
      style={
        highlighted
          ? { outline: "2px solid var(--ring)", outlineOffset: 4 }
          : undefined
      }
    >
      {active?.render()}
    </div>
  );
}
