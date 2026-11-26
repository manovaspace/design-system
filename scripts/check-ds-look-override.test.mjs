import { describe, expect, it } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  evaluateComposedLookOverrides,
  isLayoutClass,
  scanComposedLookOverride,
} from "./check-ds-look-override.mjs";

describe("isLayoutClass", () => {
  it("accepts layout and responsive/direction utilities", () => {
    expect(isLayoutClass("w-full")).toBe(true);
    expect(isLayoutClass("min-w-0")).toBe(true);
    expect(isLayoutClass("flex-1")).toBe(true);
    expect(isLayoutClass("gap-2")).toBe(true);
    expect(isLayoutClass("ms-auto")).toBe(true);
    expect(isLayoutClass("sm:w-48")).toBe(true);
    expect(isLayoutClass("rtl:me-2")).toBe(true);
    expect(isLayoutClass("truncate")).toBe(true);
  });

  it("rejects look overrides", () => {
    expect(isLayoutClass("bg-primary")).toBe(false);
    expect(isLayoutClass("text-destructive")).toBe(false);
    expect(isLayoutClass("border-border")).toBe(false);
    expect(isLayoutClass("rounded-lg")).toBe(false);
    expect(isLayoutClass("shadow-sm")).toBe(false);
    expect(isLayoutClass("h-10")).toBe(false);
    expect(isLayoutClass("px-3")).toBe(false);
    expect(isLayoutClass("font-semibold")).toBe(false);
    expect(isLayoutClass("hover:bg-accent")).toBe(false);
  });
});

describe("scanComposedLookOverride", () => {
  const sampleFile = path.resolve(
    "packages/ui/src/composed/example-widget.tsx",
  );

  it("allows layout classes on imported kit controls and flags look overrides", () => {
    const src = `
      import { Button } from "../button.js";
      import { Input } from "../input.js";
      import { cn } from "../lib/utils.js";

      export function ExampleWidget({ active }: { active: boolean }) {
        return (
          <div className="rounded-lg bg-card p-4">
            <Button className="w-full sm:w-auto mt-2" />
            <Input className={cn("flex-1", active && "border-destructive bg-muted")} />
          </div>
        );
      }
    `;

    const hits = scanComposedLookOverride(src, sampleFile);
    expect(hits).toHaveLength(2);
    expect(hits.map((h) => h.className)).toEqual([
      "border-destructive",
      "bg-muted",
    ]);
    expect(hits.every((h) => h.tag === "Input")).toBe(true);
  });

  it("ignores non-control local/helper imports", () => {
    const src = `
      import { CheckIcon } from "../icons.js";
      export function IconWrap() {
        return <CheckIcon className="size-4 text-primary" />;
      }
    `;
    expect(scanComposedLookOverride(src, sampleFile)).toEqual([]);
  });

  it("enforces allowlist counts including stale entries", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ds-look-"));
    const uiSrcDir = path.join(tmpDir, "packages/ui/src");
    const composedDir = path.join(uiSrcDir, "composed");
    fs.mkdirSync(composedDir, { recursive: true });
    const file = path.join(composedDir, "widget.tsx");
    fs.writeFileSync(
      file,
      `import { Badge } from "../badge.js";\nexport function W() { return <Badge className="bg-muted text-xs" />; }\n`,
    );

    const exact = evaluateComposedLookOverrides(
      [file],
      {
        "widget.tsx": {
          count: 2,
          reason: "legacy",
        },
      },
      { composedDir, uiSrcDir },
    );
    expect(exact.failing).toHaveLength(0);
    expect(exact.errors).toHaveLength(0);

    const stale = evaluateComposedLookOverrides(
      [file],
      {
        "widget.tsx": {
          count: 3,
          reason: "legacy",
        },
      },
      { composedDir, uiSrcDir },
    );
    expect(stale.errors).toHaveLength(1);
    expect(stale.errors[0]).toContain("stale allowlist");

    const unallowed = evaluateComposedLookOverrides(
      [file],
      {},
      { composedDir, uiSrcDir },
    );
    expect(unallowed.failing).toHaveLength(2);

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
