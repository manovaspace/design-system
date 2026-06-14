import type { OrbitTokenOverride, OrbitTokensRaw } from "@manovaspace/tokens";
import type { ReactNode } from "react";

export type DevtoolsSaveOptions = {
  saveUrl?: string;
  localApiPath?: string;
  headers?: Record<string, string>;
};

export type OrbitDevtoolsConfig = {
  save?: DevtoolsSaveOptions;
  appName?: string;
  /** Called after a successful theme save so the host can reload persisted tokens. */
  onTokensReload?: () => Promise<void>;
};

export type CandidateOption = {
  id: string;
  label: string;
  render: () => ReactNode;
};

export type SlotRegistration = {
  id: string;
  label: string;
  candidates: CandidateOption[];
};

export type ViewportPreset = {
  id: string;
  label: string;
  width: number;
};

export type DevToolId = "design-system";

export const DEFAULT_PANEL_WIDTH = 352;
export const MIN_PANEL_WIDTH = 288;
export const MAX_PANEL_WIDTH = 512;

export type SetDraftTokensOptions = {
  /** When false, skip history push (undo/redo replay). Default true. */
  recordHistory?: boolean;
};

export type DevtoolsContextValue = {
  config: OrbitDevtoolsConfig;
  draftTokens: OrbitTokensRaw;
  baseTokens: OrbitTokensRaw;
  setDraftTokens: (
    tokens: OrbitTokensRaw,
    options?: SetDraftTokensOptions,
  ) => void;
  resetDraftTokens: () => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  slots: Map<string, SlotRegistration>;
  registerSlot: (slot: SlotRegistration) => void;
  unregisterSlot: (id: string) => void;
  getSelectedCandidateId: (slotId: string) => string;
  setSelectedCandidateId: (slotId: string, candidateId: string) => void;
  activeSlotId: string | null;
  setActiveSlotId: (id: string | null) => void;
  viewport: ViewportPreset | null;
  setViewport: (preset: ViewportPreset | null) => void;
  hasUnsavedChanges: boolean;
  commitDraftTokens: () => void;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  activeTool: DevToolId;
  setActiveTool: (tool: DevToolId) => void;
  panelWidth: number;
  setPanelWidth: (width: number) => void;
};

export type SaveDesignSystemResult = {
  ok: boolean;
  method: "remote" | "local" | "clipboard";
  message: string;
};

export type ThemeSavePayload = {
  version: number;
  tokens: OrbitTokenOverride;
  meta: {
    savedAt: string;
    app?: string;
  };
};
