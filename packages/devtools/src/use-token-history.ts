import type { OrbitTokensRaw } from "@manovaspace/tokens";
import { useCallback, useRef, useState } from "react";

const MAX_HISTORY = 50;

export type TokenHistoryControls = {
  canUndo: boolean;
  canRedo: boolean;
  pushBefore: (snapshot: OrbitTokensRaw) => void;
  undo: (current: OrbitTokensRaw) => OrbitTokensRaw | null;
  redo: (current: OrbitTokensRaw) => OrbitTokensRaw | null;
  clear: () => void;
};

export function useTokenHistory(): TokenHistoryControls {
  const pastRef = useRef<OrbitTokensRaw[]>([]);
  const futureRef = useRef<OrbitTokensRaw[]>([]);
  const [version, setVersion] = useState(0);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const pushBefore = useCallback(
    (snapshot: OrbitTokensRaw) => {
      pastRef.current.push(structuredClone(snapshot));
      if (pastRef.current.length > MAX_HISTORY) {
        pastRef.current.shift();
      }
      futureRef.current = [];
      bump();
    },
    [bump],
  );

  const undo = useCallback(
    (current: OrbitTokensRaw): OrbitTokensRaw | null => {
      const past = pastRef.current;
      if (!past.length) return null;
      futureRef.current.push(structuredClone(current));
      const prev = past.pop()!;
      bump();
      return prev;
    },
    [bump],
  );

  const redo = useCallback(
    (current: OrbitTokensRaw): OrbitTokensRaw | null => {
      const future = futureRef.current;
      if (!future.length) return null;
      pastRef.current.push(structuredClone(current));
      const next = future.pop()!;
      bump();
      return next;
    },
    [bump],
  );

  const clear = useCallback(() => {
    pastRef.current = [];
    futureRef.current = [];
    bump();
  }, [bump]);

  return {
    canUndo: version >= 0 && pastRef.current.length > 0,
    canRedo: version >= 0 && futureRef.current.length > 0,
    pushBefore,
    undo,
    redo,
    clear,
  };
}
