import {
  applyTokens,
  defaultTokensRaw,
  type OrbitTokensRaw,
} from "@manovaspace/tokens";
import { useTokenContextOptional } from "@manovaspace/ui";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { DevtoolsContext } from "./context.js";
import type {
  DevToolId,
  DevtoolsContextValue,
  OrbitDevtoolsConfig,
  SetDraftTokensOptions,
  SlotRegistration,
  ViewportPreset,
} from "./types.js";
import {
  DEFAULT_PANEL_WIDTH,
  MAX_PANEL_WIDTH,
  MIN_PANEL_WIDTH,
} from "./types.js";
import { useTokenHistory } from "./use-token-history.js";

const CANDIDATE_STORAGE_KEY = "orbit-devtools:candidates";
const PANEL_STORAGE_KEY = "orbit-devtools:panel";

type PanelPrefs = {
  open: boolean;
  width: number;
  activeTool: DevToolId;
};

const DEFAULT_PANEL_PREFS: PanelPrefs = {
  open: true,
  width: DEFAULT_PANEL_WIDTH,
  activeTool: "design-system",
};

const EMPTY_CANDIDATE_SELECTIONS: Record<string, string> = {};

const panelStoreListeners = new Set<() => void>();
const candidateStoreListeners = new Set<() => void>();

let panelSnapshotCache: PanelPrefs = DEFAULT_PANEL_PREFS;
let panelSnapshotRaw = "";
let candidateSnapshotCache: Record<string, string> = EMPTY_CANDIDATE_SELECTIONS;
let candidateSnapshotRaw = "{}";

function subscribePanelStore(listener: () => void): () => void {
  panelStoreListeners.add(listener);
  return () => panelStoreListeners.delete(listener);
}

function subscribeCandidateStore(listener: () => void): () => void {
  candidateStoreListeners.add(listener);
  return () => candidateStoreListeners.delete(listener);
}

function notifyPanelStore(): void {
  panelStoreListeners.forEach((listener) => {
    listener();
  });
}

function notifyCandidateStore(): void {
  candidateStoreListeners.forEach((listener) => {
    listener();
  });
}

function getPanelSnapshot(): PanelPrefs {
  if (typeof window === "undefined") {
    return DEFAULT_PANEL_PREFS;
  }
  try {
    const raw = sessionStorage.getItem(PANEL_STORAGE_KEY);
    if (!raw) {
      if (panelSnapshotCache !== DEFAULT_PANEL_PREFS) {
        panelSnapshotRaw = "";
        panelSnapshotCache = DEFAULT_PANEL_PREFS;
      }
      return DEFAULT_PANEL_PREFS;
    }
    if (raw === panelSnapshotRaw) {
      return panelSnapshotCache;
    }
    panelSnapshotRaw = raw;
    const parsed = JSON.parse(raw) as Partial<PanelPrefs>;
    const width = parsed.width ?? DEFAULT_PANEL_WIDTH;
    panelSnapshotCache = {
      open: parsed.open ?? true,
      width: Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, width)),
      activeTool: parsed.activeTool ?? "design-system",
    };
    return panelSnapshotCache;
  } catch {
    return DEFAULT_PANEL_PREFS;
  }
}

function readPanelPrefs(): PanelPrefs {
  return getPanelSnapshot();
}

function writePanelPrefs(prefs: PanelPrefs): void {
  const serialized = JSON.stringify(prefs);
  sessionStorage.setItem(PANEL_STORAGE_KEY, serialized);
  panelSnapshotRaw = serialized;
  panelSnapshotCache = prefs;
  notifyPanelStore();
}

function getCandidateSnapshot(): Record<string, string> {
  if (typeof window === "undefined") {
    return EMPTY_CANDIDATE_SELECTIONS;
  }
  const raw = sessionStorage.getItem(CANDIDATE_STORAGE_KEY) ?? "{}";
  if (raw === candidateSnapshotRaw) {
    return candidateSnapshotCache;
  }
  candidateSnapshotRaw = raw;
  try {
    candidateSnapshotCache = JSON.parse(raw) as Record<string, string>;
  } catch {
    candidateSnapshotCache = EMPTY_CANDIDATE_SELECTIONS;
  }
  return candidateSnapshotCache;
}

function _readCandidateSelections(): Record<string, string> {
  return getCandidateSnapshot();
}

function writeCandidateSelection(slotId: string, candidateId: string): void {
  const current = { ...getCandidateSnapshot(), [slotId]: candidateId };
  const serialized = JSON.stringify(current);
  sessionStorage.setItem(CANDIDATE_STORAGE_KEY, serialized);
  candidateSnapshotRaw = serialized;
  candidateSnapshotCache = current;
  notifyCandidateStore();
}

function usePanelPrefs(): PanelPrefs {
  return useSyncExternalStore(
    subscribePanelStore,
    getPanelSnapshot,
    () => DEFAULT_PANEL_PREFS,
  );
}

function useCandidateSelections(): Record<string, string> {
  return useSyncExternalStore(
    subscribeCandidateStore,
    getCandidateSnapshot,
    () => EMPTY_CANDIDATE_SELECTIONS,
  );
}

export type OrbitDevtoolsProviderProps = {
  children: React.ReactNode;
  config?: OrbitDevtoolsConfig;
  initialTokens?: OrbitTokensRaw;
};

export function OrbitDevtoolsProvider({
  children,
  config = {},
  initialTokens = defaultTokensRaw,
}: OrbitDevtoolsProviderProps) {
  const tokenContext = useTokenContextOptional();
  const sourceTokens = tokenContext?.tokens ?? initialTokens;
  const [baseTokens, setBaseTokens] = useState(sourceTokens);
  const [draftTokens, setDraftTokens] = useState(sourceTokens);
  const [slots, setSlots] = useState<Map<string, SlotRegistration>>(new Map());
  const panelPrefs = usePanelPrefs();
  const candidateSelections = useCandidateSelections();
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<ViewportPreset | null>(null);

  const setPanelOpen = useCallback((open: boolean) => {
    writePanelPrefs({ ...readPanelPrefs(), open });
  }, []);

  const setPanelWidth = useCallback((width: number) => {
    const clamped = Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, width));
    writePanelPrefs({ ...readPanelPrefs(), width: clamped });
  }, []);

  const setActiveTool = useCallback((activeTool: DevToolId) => {
    writePanelPrefs({ ...readPanelPrefs(), activeTool });
  }, []);

  const _sourceTokensKey = JSON.stringify(sourceTokens);
  const dirtyRef = useRef(false);
  const draftRef = useRef(draftTokens);
  draftRef.current = draftTokens;
  const history = useTokenHistory();

  useEffect(() => {
    if (dirtyRef.current) return;
    setBaseTokens(sourceTokens);
    setDraftTokens(sourceTokens);
  }, [sourceTokens]);

  useEffect(() => {
    const setPreviewTokens = tokenContext?.setPreviewTokens;
    if (setPreviewTokens) {
      setPreviewTokens(draftTokens);
      return () => setPreviewTokens(null);
    }
    applyTokens(draftTokens);
    return undefined;
  }, [draftTokens, tokenContext?.setPreviewTokens]);

  const setDraftTokensTracked = useCallback(
    (tokens: OrbitTokensRaw, options?: SetDraftTokensOptions) => {
      if (options?.recordHistory !== false) {
        history.pushBefore(draftRef.current);
      }
      dirtyRef.current = true;
      setDraftTokens(tokens);
    },
    [history],
  );

  const resetDraftTokens = useCallback(() => {
    dirtyRef.current = false;
    history.clear();
    setDraftTokens(baseTokens);
  }, [baseTokens, history]);

  const commitDraftTokens = useCallback(() => {
    dirtyRef.current = false;
    history.clear();
    setBaseTokens(draftTokens);
  }, [draftTokens, history]);

  const undo = useCallback(() => {
    const prev = history.undo(draftRef.current);
    if (!prev) return;
    dirtyRef.current = true;
    setDraftTokens(prev);
  }, [history]);

  const redo = useCallback(() => {
    const next = history.redo(draftRef.current);
    if (!next) return;
    dirtyRef.current = true;
    setDraftTokens(next);
  }, [history]);

  const registerSlot = useCallback((slot: SlotRegistration) => {
    setSlots((prev) => new Map(prev).set(slot.id, slot));
  }, []);

  const unregisterSlot = useCallback((id: string) => {
    setSlots((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const getSelectedCandidateId = useCallback(
    (slotId: string) => {
      const slot = slots.get(slotId);
      if (!slot) return "";
      return candidateSelections[slotId] ?? slot.candidates[0]?.id ?? "";
    },
    [candidateSelections, slots],
  );

  const setSelectedCandidateId = useCallback(
    (slotId: string, candidateId: string) => {
      writeCandidateSelection(slotId, candidateId);
    },
    [],
  );

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(draftTokens) !== JSON.stringify(baseTokens),
    [draftTokens, baseTokens],
  );

  const value = useMemo<DevtoolsContextValue>(
    () => ({
      config,
      draftTokens,
      baseTokens,
      setDraftTokens: setDraftTokensTracked,
      resetDraftTokens,
      commitDraftTokens,
      canUndo: history.canUndo,
      canRedo: history.canRedo,
      undo,
      redo,
      slots,
      registerSlot,
      unregisterSlot,
      getSelectedCandidateId,
      setSelectedCandidateId,
      activeSlotId,
      setActiveSlotId,
      viewport,
      setViewport,
      hasUnsavedChanges,
      panelOpen: panelPrefs.open,
      setPanelOpen,
      activeTool: panelPrefs.activeTool,
      setActiveTool,
      panelWidth: panelPrefs.width,
      setPanelWidth,
    }),
    [
      config,
      draftTokens,
      baseTokens,
      setDraftTokensTracked,
      resetDraftTokens,
      commitDraftTokens,
      history.canUndo,
      history.canRedo,
      undo,
      redo,
      slots,
      registerSlot,
      unregisterSlot,
      getSelectedCandidateId,
      setSelectedCandidateId,
      activeSlotId,
      viewport,
      hasUnsavedChanges,
      panelPrefs,
      setPanelOpen,
      setActiveTool,
      setPanelWidth,
    ],
  );

  return (
    <DevtoolsContext.Provider value={value}>
      {children}
    </DevtoolsContext.Provider>
  );
}
