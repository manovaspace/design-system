import { describe, expect, it } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  buildAllowlist,
  evaluateComposedLookOverrides,
  isLayoutClass,
  lookFingerprint,
  scanComposedLookOverride,
} from "./check-ds-look-override.mjs";

const VALID_REASON = "legacy badge styling pending migration";

/** Temp workspace with one composed file named widget.tsx. */
function makeWorkspace(src) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ds-look-"));
  const uiSrcDir = path.join(tmpDir, "packages/ui/src");
  const composedDir = path.join(uiSrcDir, "composed");
  fs.mkdirSync(composedDir, { recursive: true });
  const file = path.join(composedDir, "widget.tsx");
  const write = (text) => fs.writeFileSync(file, text);
  write(src);
  return {
    file,
    composedDir,
    uiSrcDir,
    write,
    opts: { composedDir, uiSrcDir },
    cleanup: () => fs.rmSync(tmpDir, { recursive: true, force: true }),
  };
}

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

  it("accepts size, min/max height, aspect, visibility and container utilities", () => {
    expect(isLayoutClass("size-4")).toBe(true);
    expect(isLayoutClass("min-h-0")).toBe(true);
    expect(isLayoutClass("max-h-60")).toBe(true);
    expect(isLayoutClass("aspect-square")).toBe(true);
    expect(isLayoutClass("invisible")).toBe(true);
    expect(isLayoutClass("visible")).toBe(true);
    expect(isLayoutClass("container")).toBe(true);
  });

  it("strips any leading variant chain before deciding", () => {
    expect(isLayoutClass("hover:hidden")).toBe(true);
    expect(isLayoutClass("data-[state=open]:hidden")).toBe(true);
    expect(isLayoutClass("[&>svg]:size-4")).toBe(true);
    expect(isLayoutClass("group-hover:flex")).toBe(true);
    expect(isLayoutClass("focus-visible:w-full")).toBe(true);
    expect(isLayoutClass("md:hover:gap-2")).toBe(true);
    expect(isLayoutClass("[&::-webkit-search-cancel-button]:hidden")).toBe(
      true,
    );
    expect(isLayoutClass("-mt-2")).toBe(true);
    expect(isLayoutClass("hover:-mt-2")).toBe(true);
    expect(isLayoutClass("!hidden")).toBe(true);
  });

  it("rejects look overrides", () => {
    expect(isLayoutClass("bg-primary")).toBe(false);
    expect(isLayoutClass("text-destructive")).toBe(false);
    expect(isLayoutClass("border-border")).toBe(false);
    expect(isLayoutClass("rounded-lg")).toBe(false);
    expect(isLayoutClass("shadow-sm")).toBe(false);
    expect(isLayoutClass("h-10")).toBe(false);
    expect(isLayoutClass("h-[52px]")).toBe(false);
    expect(isLayoutClass("px-3")).toBe(false);
    expect(isLayoutClass("p-0")).toBe(false);
    expect(isLayoutClass("text-xs")).toBe(false);
    expect(isLayoutClass("font-semibold")).toBe(false);
    expect(isLayoutClass("hover:bg-accent")).toBe(false);
    expect(isLayoutClass("[&>svg]:text-red-500")).toBe(false);
    expect(isLayoutClass("!rounded-lg")).toBe(false);
    expect(isLayoutClass("data-[state=open]:bg-muted")).toBe(false);
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
    expect(hits.every((h) => h.look === "bg-muted border-destructive")).toBe(
      true,
    );
  });

  it("detects look classes in clsx object form", () => {
    const src = `
      import { Button } from "../button.js";
      import { cn } from "../lib/utils.js";
      export function X({ x }: { x: boolean }) {
        return <Button className={cn({ "rounded-lg": x, "w-full": x, hidden: !x })} />;
      }
    `;
    const hits = scanComposedLookOverride(src, sampleFile);
    expect(hits.map((h) => h.className)).toEqual(["rounded-lg"]);
  });

  it("detects look classes in template literals", () => {
    const src = `
      import { Button } from "../button.js";
      export function X({ x }: { x: boolean }) {
        return <Button className={\`w-full bg-muted \${x ? "text-xs" : ""}\`} />;
      }
    `;
    const hits = scanComposedLookOverride(src, sampleFile);
    expect(hits.map((h) => h.className)).toEqual(["bg-muted", "text-xs"]);
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
});

describe("evaluateComposedLookOverrides (fingerprint allowlist)", () => {
  const src = `import { Badge } from "../badge.js";
export function W() { return <Badge className="bg-muted text-xs" />; }
`;

  it("accepts a fingerprint that matches every current hit", () => {
    const ws = makeWorkspace(src);
    const fp = "widget.tsx::Badge::bg-muted text-xs";
    const res = evaluateComposedLookOverrides(
      [ws.file],
      { [fp]: { reason: VALID_REASON } },
      ws.opts,
    );
    expect(res.failing).toHaveLength(0);
    expect(res.errors).toHaveLength(0);
    expect(res.allowed).toBe(2);
    ws.cleanup();
  });

  it("fails unallowlisted hits", () => {
    const ws = makeWorkspace(src);
    const res = evaluateComposedLookOverrides([ws.file], {}, ws.opts);
    expect(res.failing).toHaveLength(2);
    expect(res.errors).toHaveLength(0);
    ws.cleanup();
  });

  it("fails a stale entry that matches no current hit", () => {
    const ws = makeWorkspace(src);
    const res = evaluateComposedLookOverrides(
      [ws.file],
      {
        "widget.tsx::Badge::bg-muted text-xs": { reason: VALID_REASON },
        "widget.tsx::Badge::bg-gone": { reason: VALID_REASON },
      },
      ws.opts,
    );
    expect(res.failing).toHaveLength(0);
    expect(res.errors).toHaveLength(1);
    expect(res.errors[0]).toContain("stale allowlist entry");
    ws.cleanup();
  });

  it("fails when one fixed hit is swapped for a new hit in the same file", () => {
    const ws = makeWorkspace(`import { Badge } from "../badge.js";
import { Button } from "../button.js";
export function W() {
  return (<><Badge className="bg-muted" /><Button className="rounded-lg" /></>);
}
`);
    const allow = {
      "widget.tsx::Badge::bg-muted": { reason: VALID_REASON },
      "widget.tsx::Button::rounded-lg": { reason: VALID_REASON },
    };
    expect(
      evaluateComposedLookOverrides([ws.file], allow, ws.opts).failing,
    ).toHaveLength(0);

    // Badge hit fixed to bg-accent: a new hit in the same file must not ride the old allowance.
    ws.write(`import { Badge } from "../badge.js";
import { Button } from "../button.js";
export function W() {
  return (<><Badge className="bg-accent" /><Button className="rounded-lg" /></>);
}
`);
    const res = evaluateComposedLookOverrides([ws.file], allow, ws.opts);
    expect(res.failing).toHaveLength(1);
    expect(res.failing[0].className).toBe("bg-accent");
    expect(res.errors).toHaveLength(1);
    expect(res.errors[0]).toContain("widget.tsx::Badge::bg-muted");
    ws.cleanup();
  });

  it("fails an empty or too-short reason", () => {
    const ws = makeWorkspace(src);
    const fp = "widget.tsx::Badge::bg-muted text-xs";
    for (const reason of ["", "   ", "too short"]) {
      const res = evaluateComposedLookOverrides(
        [ws.file],
        { [fp]: { reason } },
        ws.opts,
      );
      expect(res.errors.some((e) => e.includes("reason"))).toBe(true);
    }
    const missing = evaluateComposedLookOverrides(
      [ws.file],
      { [fp]: {} },
      ws.opts,
    );
    expect(missing.errors.some((e) => e.includes("reason"))).toBe(true);
    ws.cleanup();
  });

  it("builds allowlist entries with the migration reason", () => {
    expect(buildAllowlist(["a.tsx::Badge::bg-muted"])).toEqual({
      "a.tsx::Badge::bg-muted": { reason: "pre-existing; migrate per ADR-078" },
    });
    expect(lookFingerprint("a.tsx", { tag: "Badge", look: "bg-muted" })).toBe(
      "a.tsx::Badge::bg-muted",
    );
  });

  it("keeps the committed allowlist in sync with the composed sources", () => {
    const res = evaluateComposedLookOverrides();
    expect(res.failing).toHaveLength(0);
    expect(res.errors).toHaveLength(0);
  });
});
