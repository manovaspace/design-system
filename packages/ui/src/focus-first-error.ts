import type { FieldErrors } from "react-hook-form";

function isElementOrDocument(val: unknown): val is HTMLElement | Document {
  if (!val || typeof val !== "object") {
    return false;
  }
  if ("nodeType" in val) {
    const nodeType = (val as { nodeType: unknown }).nodeType;
    return nodeType === 1 || nodeType === 9;
  }
  return false;
}

function isNaturallyFocusable(element: HTMLElement): boolean {
  const tag = element.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "select" ||
    tag === "textarea" ||
    tag === "button" ||
    tag === "a" ||
    tag === "area"
  );
}

function safeFocus(element: HTMLElement): void {
  try {
    if (!element.hasAttribute("tabindex") && !isNaturallyFocusable(element)) {
      element.setAttribute("tabindex", "-1");
    }
    element.focus();
  } catch {
    // Gracefully catch focus errors in unsupported or headless environments
  }
}

function getFirstErrorKey(
  errors: Record<string, unknown>,
  prefix = "",
): string | null {
  for (const key of Object.keys(errors)) {
    const val = errors[key];
    if (!val) {
      continue;
    }
    const currentPath = prefix ? `${prefix}.${key}` : key;
    if (typeof val === "object" && val !== null) {
      if ("type" in val || "message" in val) {
        return currentPath;
      }
      const nested = getFirstErrorKey(
        val as Record<string, unknown>,
        currentPath,
      );
      if (nested) {
        return nested;
      }
      return currentPath;
    }
    return currentPath;
  }
  return null;
}

/**
 * Focuses the first invalid form control in the DOM.
 * Accepts either an errors object from react-hook-form or a container element.
 * Queries for elements matching the first error key by name or id, or [aria-invalid="true"].
 */
export function focusFirstError(
  errorsOrContainer?:
    | FieldErrors
    | Record<string, unknown>
    | HTMLElement
    | Document
    | null,
  container?: HTMLElement | Document | null,
): HTMLElement | null {
  if (typeof document === "undefined") {
    return null;
  }

  let root: HTMLElement | Document = document;
  let errors: Record<string, unknown> | null = null;

  if (errorsOrContainer) {
    if (isElementOrDocument(errorsOrContainer)) {
      root = errorsOrContainer;
    } else {
      errors = errorsOrContainer as Record<string, unknown>;
    }
  }

  if (container && isElementOrDocument(container)) {
    root = container;
  }

  // 1. If errors object is provided, search by first error key name or id
  if (errors) {
    const firstKey = getFirstErrorKey(errors);
    if (firstKey) {
      const escapedKey = firstKey.replace(/"/g, '\\"');
      const candidates = [`[name="${escapedKey}"]`, `[id="${escapedKey}"]`];

      if (firstKey.includes(".")) {
        const leaf = firstKey.split(".").pop();
        if (leaf) {
          const escapedLeaf = leaf.replace(/"/g, '\\"');
          candidates.push(`[name="${escapedLeaf}"]`, `[id="${escapedLeaf}"]`);
        }
      }

      for (const selector of candidates) {
        try {
          const el = root.querySelector<HTMLElement>(selector);
          if (el && typeof el.focus === "function") {
            safeFocus(el);
            return el;
          }
        } catch {
          // Ignore invalid query selectors
        }
      }
    }
  }

  // 2. Query DOM for [aria-invalid="true"]
  try {
    const invalidEl = root.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (invalidEl && typeof invalidEl.focus === "function") {
      safeFocus(invalidEl);
      return invalidEl;
    }
  } catch {
    // Ignore invalid query selectors
  }

  return null;
}
