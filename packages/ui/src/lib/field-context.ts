import * as React from "react";

/**
 * Field wiring shared with composite controls (`SelectTrigger`).
 * Leaf module: imports nothing from components, so components can import it
 * without creating a cycle with `composed/field.tsx`.
 */
export type FieldContextValue = {
  id: string;
  describedBy?: string;
  invalid: boolean;
  /**
   * Single-claim: the first consumer that passes an owner token wins the
   * Field id and messages. Later consumers in the same Field get `false`.
   * Calling with the current owner again returns `true` (render-safe).
   */
  claim: (owner: object) => boolean;
  /** Frees the claim when the owner unmounts. */
  release: (owner: object) => void;
};

export const FieldContext = React.createContext<FieldContextValue | null>(null);

/**
 * Returns the nearest enclosing `Field` wiring, or `null` outside a `Field`.
 */
export function useFieldContextOptional(): FieldContextValue | null {
  return React.useContext(FieldContext);
}

/** Static marker set on composite controls that accept Field wiring. */
export const FIELD_CONTROL_KIND_KEY = "fieldControl" as const;

/** True when a React element type is a Select root (marked in `select.tsx`). */
export function isSelectFieldControl(type: unknown): boolean {
  return (
    typeof type === "function" &&
    (type as unknown as Record<string, unknown>)[FIELD_CONTROL_KIND_KEY] ===
      "select"
  );
}
