import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SRC_DIR = path.resolve(import.meta.dirname);
const PHYSICAL_RE =
  /(?<![-\w])(?:ml|mr|pl|pr|left|right|text-left|text-right|rounded-l|rounded-r|border-l|border-r)-[a-z0-9[\]/.:-]+/g;

// Only explicit physical-edge docking (Sheet left/right), Radix data-[side=left|right] slide animations,
// and Radix Toast horizontal swipe animations are allowed to reference physical left/right tokens.
const ALLOWED_TOKENS_BY_FILE: Record<string, string[]> = {
  "primitives/sheet.tsx": [
    "right-0",
    "border-l",
    "left-0",
    "border-r",
    "slide-out-to-right",
    "slide-in-from-right",
    "slide-out-to-left",
    "slide-in-from-left",
  ],
  "primitives/popover.tsx": ["slide-in-from-right-2", "slide-in-from-left-2"],
  "primitives/select.tsx": ["slide-in-from-right-2", "slide-in-from-left-2"],
  "primitives/dropdown-menu.tsx": [
    "slide-in-from-right-2",
    "slide-in-from-left-2",
  ],
  "primitives/toast.tsx": ["slide-out-to-right-full"],
};

function walkSourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkSourceFiles(full, out);
    } else if (
      (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) &&
      !entry.name.includes(".test.") &&
      !entry.name.includes(".stories.")
    ) {
      out.push(full);
    }
  }
  return out.sort();
}

describe("logical CSS properties only", () => {
  it("contains zero unexpected physical directional utility classes in packages/ui/src", () => {
    const violations: string[] = [];

    for (const file of walkSourceFiles(SRC_DIR)) {
      const rel = path.relative(SRC_DIR, file);
      const raw = fs.readFileSync(file, "utf8");
      const allowed = new Set(ALLOWED_TOKENS_BY_FILE[rel] ?? []);

      for (const line of raw.split("\n")) {
        // Ignore comments so prose notes do not trigger utility checks.
        const trimmed = line.trim();
        if (
          trimmed.startsWith("//") ||
          trimmed.startsWith("*") ||
          trimmed.startsWith("/*")
        ) {
          continue;
        }
        const matches = line.match(PHYSICAL_RE) ?? [];
        for (const token of matches) {
          if (!allowed.has(token)) {
            violations.push(`${rel}: ${token}`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
