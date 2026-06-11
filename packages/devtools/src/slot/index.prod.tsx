import type { ReactNode } from "react";

export type DevtoolsSlotProps = {
  id: string;
  label: string;
  candidates: Array<{ id: string; label: string; render: () => ReactNode }>;
  defaultCandidateId?: string;
};

/** ponytail: prod stub — renders first candidate only, zero devtools registry */
export function DevtoolsSlot({
  candidates,
  defaultCandidateId,
}: DevtoolsSlotProps) {
  const active =
    candidates.find((c) => c.id === defaultCandidateId) ?? candidates[0];
  return <>{active?.render()}</>;
}
