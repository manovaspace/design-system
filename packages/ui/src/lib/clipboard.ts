/**
 * Clipboard helpers for button and menu handlers.
 *
 * On insecure HTTP, `navigator.clipboard` is unavailable or rejects.
 * Listening for the `copy` event and setting `clipboardData` there is reliable
 * inside the same user-gesture tick.
 */

/** Synchronous copy — use from click / `DropdownMenuItem` `onSelect` handlers. */
export function copyTextToClipboardSync(text: string): boolean {
  if (typeof document === "undefined" || text === "") {
    return false;
  }

  let wrote = false;
  const onCopy = (event: Event) => {
    const clipboardEvent = event as ClipboardEvent;
    clipboardEvent.preventDefault();
    clipboardEvent.clipboardData?.setData("text/plain", text);
    wrote = true;
  };

  try {
    document.addEventListener("copy", onCopy);
    const ok = document.execCommand("copy");
    document.removeEventListener("copy", onCopy);
    return ok && wrote;
  } catch {
    document.removeEventListener("copy", onCopy);
    return false;
  }
}

/**
 * Async copy — prefers Clipboard API on secure contexts, then sync fallback.
 * Prefer `copyTextToClipboardSync` inside dropdown `onSelect` handlers.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  const canUseClipboardApi =
    typeof window !== "undefined" &&
    window.isSecureContext &&
    typeof navigator !== "undefined" &&
    typeof navigator.clipboard?.writeText === "function";

  if (canUseClipboardApi) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through.
    }
  }

  return copyTextToClipboardSync(text);
}
