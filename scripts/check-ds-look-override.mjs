#!/usr/bin/env node
// Mirrors falak's `kit-look-override` rule for `packages/ui/src/composed/**/*.tsx`:
// composed components may pass layout classes only on kit primitives/controls
// (`Button`, `Input`, `Textarea`, `SelectTrigger`, `Card`, `Badge`, etc.).
// Pre-existing hits are allowlisted per fingerprint (file::JSX tag::look classes),
// so a fixed hit cannot be silently swapped for a new one in the same file.
// Regenerate with `bun scripts/check-ds-look-override.mjs --print-allowlist`.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMPOSED_DIR = path.join(ROOT, "packages/ui/src/composed");
const UI_SRC_DIR = path.join(ROOT, "packages/ui/src");

const NON_CONTROL_MODULES = new Set([
  "direction-provider",
  "locale-preference",
  "theme-provider",
  "token-provider",
  "icons",
  "icons-solid",
  "icons-brand",
  "index",
  "experimental",
]);

const LAYOUT_EXACT = new Set([
  "flex",
  "inline-flex",
  "grid",
  "inline-grid",
  "block",
  "inline-block",
  "inline",
  "contents",
  "hidden",
  "sr-only",
  "not-sr-only",
  "static",
  "fixed",
  "absolute",
  "relative",
  "sticky",
  "shrink",
  "grow",
  "truncate",
  "invisible",
  "visible",
  "container",
]);

const LAYOUT_PREFIX_RE =
  /^(?:w|min-w|max-w|size|min-h|max-h|aspect|flex|grid|col|row|gap|order|justify|items|content|self|place|shrink|grow|basis|m[stbelrxy]?|space-[xy]|z|overflow|inset|top|bottom|start|end|left|right)-/;

/**
 * Removes every leading variant (`hover:`, `md:`, `[&>svg]:`, `data-[state=open]:`,
 * `group-hover:`, `aria-invalid:` ...). A variant is a segment ending in `:` at
 * bracket depth 0; colons inside `[...]` belong to the arbitrary value.
 */
function stripVariants(token) {
  let base = token;
  for (;;) {
    let depth = 0;
    let cut = -1;
    for (let i = 0; i < base.length; i++) {
      const c = base[i];
      if (c === "[") depth++;
      else if (c === "]" && depth > 0) depth--;
      else if (c === ":" && depth === 0) {
        cut = i;
        break;
      }
    }
    if (cut < 0) return base;
    base = base.slice(cut + 1);
  }
}

/** True when a Tailwind utility class only affects layout/placement, never look. */
export function isLayoutClass(token) {
  if (!token) return true;
  let base = stripVariants(token);
  if (base.startsWith("!")) base = base.slice(1);
  if (base.endsWith("!")) base = base.slice(0, -1);
  if (base.startsWith("-")) base = base.slice(1);
  return LAYOUT_EXACT.has(base) || LAYOUT_PREFIX_RE.test(base);
}

function isKitControlImport(filePath, specifier, uiSrcDir = UI_SRC_DIR) {
  if (!specifier.startsWith(".")) return false;
  const resolved = path
    .resolve(path.dirname(filePath), specifier)
    .replace(/\.(?:js|jsx|ts|tsx)$/, "");
  const rel = path.relative(uiSrcDir, resolved).split(path.sep).join("/");
  if (rel.startsWith("..") || path.isAbsolute(rel)) return false;
  if (rel.startsWith("primitives/")) return true;
  if (rel.includes("/")) return false;
  return !NON_CONTROL_MODULES.has(rel);
}

function collectKitControlImports(sf, filePath, uiSrcDir = UI_SRC_DIR) {
  const names = new Set();
  const namespaces = new Set();
  for (const st of sf.statements) {
    if (
      !ts.isImportDeclaration(st) ||
      !ts.isStringLiteral(st.moduleSpecifier)
    ) {
      continue;
    }
    if (!isKitControlImport(filePath, st.moduleSpecifier.text, uiSrcDir)) {
      continue;
    }
    const clause = st.importClause;
    if (!clause || clause.isTypeOnly) continue;
    if (clause.name) names.add(clause.name.text);
    if (clause.namedBindings) {
      if (ts.isNamedImports(clause.namedBindings)) {
        for (const el of clause.namedBindings.elements) {
          if (!el.isTypeOnly) names.add(el.name.text);
        }
      } else if (ts.isNamespaceImport(clause.namedBindings)) {
        namespaces.add(clause.namedBindings.name.text);
      }
    }
  }
  return { names, namespaces };
}

function extractClassStrings(node, sf, raw, out) {
  if (!node) return;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    const start = node.getStart(sf) + 1;
    out.push({ text: raw.slice(start, node.end - 1), start });
    return;
  }
  if (ts.isTemplateExpression(node)) {
    const headStart = node.head.getStart(sf) + 1;
    out.push({
      text: raw.slice(headStart, node.head.end - 2),
      start: headStart,
    });
    for (const span of node.templateSpans) {
      extractClassStrings(span.expression, sf, raw, out);
      const litStart = span.literal.getStart(sf) + 1;
      const litEnd = ts.isTemplateTail(span.literal)
        ? span.literal.end - 1
        : span.literal.end - 2;
      out.push({ text: raw.slice(litStart, litEnd), start: litStart });
    }
    return;
  }
  if (ts.isConditionalExpression(node)) {
    extractClassStrings(node.whenTrue, sf, raw, out);
    extractClassStrings(node.whenFalse, sf, raw, out);
    return;
  }
  if (ts.isBinaryExpression(node)) {
    if (node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
      extractClassStrings(node.right, sf, raw, out);
    } else {
      extractClassStrings(node.left, sf, raw, out);
      extractClassStrings(node.right, sf, raw, out);
    }
    return;
  }
  if (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isTypeAssertionExpression(node) ||
    ts.isNonNullExpression(node) ||
    ts.isSatisfiesExpression(node)
  ) {
    extractClassStrings(node.expression, sf, raw, out);
    return;
  }
  if (ts.isObjectLiteralExpression(node)) {
    // clsx object form: { "rounded-lg": cond, hidden: cond } - keys are classes, values are conditions.
    for (const prop of node.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      const key = prop.name;
      if (ts.isIdentifier(key)) {
        out.push({ text: key.text, start: key.getStart(sf) });
      } else if (
        ts.isStringLiteral(key) ||
        ts.isNoSubstitutionTemplateLiteral(key)
      ) {
        const start = key.getStart(sf) + 1;
        out.push({ text: raw.slice(start, key.end - 1), start });
      }
    }
    return;
  }
  if (ts.isArrayLiteralExpression(node)) {
    for (const el of node.elements) {
      extractClassStrings(
        ts.isSpreadElement(el) ? el.expression : el,
        sf,
        raw,
        out,
      );
    }
    return;
  }
  if (ts.isCallExpression(node)) {
    if (
      ts.isPropertyAccessExpression(node.expression) &&
      (node.expression.name.text === "join" ||
        node.expression.name.text === "filter")
    ) {
      extractClassStrings(node.expression.expression, sf, raw, out);
    } else {
      for (const arg of node.arguments) {
        extractClassStrings(arg, sf, raw, out);
      }
    }
  }
}

function lineStarts(src) {
  const starts = [0];
  for (let i = 0; i < src.length; i++) if (src[i] === "\n") starts.push(i + 1);
  return starts;
}

function locate(starts, index) {
  let lo = 0;
  let hi = starts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (starts[mid] <= index) lo = mid;
    else hi = mid - 1;
  }
  return { line: lo + 1, col: index - starts[lo] + 1 };
}

/** Scans one composed TSX file for look overrides on kit primitives/controls. */
export function scanComposedLookOverride(raw, filePath, uiSrcDir = UI_SRC_DIR) {
  const sf = ts.createSourceFile(
    filePath,
    raw,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const { names, namespaces } = collectKitControlImports(
    sf,
    filePath,
    uiSrcDir,
  );
  if (names.size === 0 && namespaces.size === 0) return [];
  const isKitTag = (tag) => {
    if (ts.isIdentifier(tag)) return names.has(tag.text);
    if (ts.isPropertyAccessExpression(tag)) {
      return (
        ts.isIdentifier(tag.expression) && namespaces.has(tag.expression.text)
      );
    }
    return false;
  };
  const starts = lineStarts(raw);
  const hits = [];
  const visit = (node) => {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      isKitTag(node.tagName)
    ) {
      const tagName = node.tagName.getText(sf);
      for (const attr of node.attributes.properties) {
        if (
          ts.isJsxAttribute(attr) &&
          attr.name.getText(sf) === "className" &&
          attr.initializer
        ) {
          const segments = [];
          if (ts.isStringLiteral(attr.initializer)) {
            const start = attr.initializer.getStart(sf) + 1;
            segments.push({
              text: raw.slice(start, attr.initializer.end - 1),
              start,
            });
          } else if (
            ts.isJsxExpression(attr.initializer) &&
            attr.initializer.expression
          ) {
            extractClassStrings(attr.initializer.expression, sf, raw, segments);
          }
          const found = [];
          for (const seg of segments) {
            for (const m of seg.text.matchAll(/\S+/g)) {
              if (!isLayoutClass(m[0])) {
                const { line, col } = locate(starts, seg.start + m.index);
                found.push({ tag: tagName, className: m[0], line, col });
              }
            }
          }
          // `look` = all look classes of this element, sorted; part of the allowlist fingerprint.
          const look = found
            .map((h) => h.className)
            .sort()
            .join(" ");
          for (const h of found) hits.push({ ...h, look });
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return hits;
}
const PRE_EXISTING_REASON = "pre-existing; migrate per ADR-078";
const MIN_REASON_LENGTH = 10;

// Legacy composed look-override allowlist, keyed by fingerprint
// `<rel file>::<JSX tag>::<sorted look classes>` (no line numbers).
// Shrink toward {} as composed components move styling into kit variants/recipes.
// Regenerate: bun scripts/check-ds-look-override.mjs --print-allowlist
export const COMPOSED_LOOK_OVERRIDE_ALLOW = {
  "combobox-async.tsx::PopoverContent::p-1": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "combobox-async.tsx::Spinner::text-muted-foreground": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "combobox.tsx::PopoverContent::p-1": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "confirm-dialog.tsx::AlertDialogAction::bg-destructive bg-primary hover:bg-destructive-hover hover:bg-primary-hover text-destructive-foreground text-primary-foreground":
    {
      reason: "pre-existing; migrate per ADR-078",
    },
  "date-picker.tsx::Button::rounded-full text-muted-foreground": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "date-picker.tsx::PopoverContent::p-2": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "date-time-picker.tsx::Button::font-normal text-muted-foreground text-start":
    {
      reason: "pre-existing; migrate per ADR-078",
    },
  "date-time-picker.tsx::PopoverContent::p-3": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "decimal-input.tsx::Badge::font-normal select-none text-xs": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "decimal-input.tsx::Input::font-[family-name:var(--font-data)] text-start tracking-[-0.02em]":
    {
      reason: "pre-existing; migrate per ADR-078",
    },
  "edit-field-sheet.tsx::DialogContent::p-6": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "edit-field-sheet.tsx::DialogHeader::p-0 pb-2": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "edit-field-sheet.tsx::SheetContent::p-6 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] rounded-t-[var(--radius-xl)]":
    {
      reason: "pre-existing; migrate per ADR-078",
    },
  "edit-field-sheet.tsx::SheetHeader::p-0 pb-2": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "entity-browser/entity-filter-bar.tsx::Badge::font-data px-1.5 tabular-nums":
    {
      reason: "pre-existing; migrate per ADR-078",
    },
  "entity-browser/entity-filter-bar.tsx::Badge::font-normal pe-1 ps-2.5": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "entity-browser/entity-filter-bar.tsx::Button::hover:bg-background hover:text-foreground text-muted-foreground":
    {
      reason: "pre-existing; migrate per ADR-078",
    },
  "entity-browser/entity-filter-bar.tsx::Button::text-muted-foreground": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "entity-browser/entity-filter-bar.tsx::SheetContent::border-0 border-t h-dvh p-0 p-0 rounded-none rounded-t-xl":
    {
      reason: "pre-existing; migrate per ADR-078",
    },
  "entity-browser/entity-filter-bar.tsx::SheetFooter::border-border border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]":
    {
      reason: "pre-existing; migrate per ADR-078",
    },
  "entity-browser/entity-filter-bar.tsx::SheetHeader::border-b border-border px-4 py-4":
    {
      reason: "pre-existing; migrate per ADR-078",
    },
  "entity-browser/entity-search-field.tsx::Button::-translate-y-1/2 text-muted-foreground":
    {
      reason: "pre-existing; migrate per ADR-078",
    },
  "entity-browser/entity-search-field.tsx::Input::pe-11 ps-9": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "entity-browser/entity-table-states.tsx::TableCell::py-10 py-10 text-center text-center text-destructive text-muted-foreground text-sm text-sm":
    {
      reason: "pre-existing; migrate per ADR-078",
    },
  "entity-browser/entity-table-states.tsx::TableCell::py-3": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "entity-browser/entity-table-states.tsx::TableRow::hover:bg-transparent": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "field.tsx::Label::text-start": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "filter-pill-bar.tsx::SheetContent::p-0": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "filter-pill-bar.tsx::SheetHeader::border-b border-border px-4 py-4": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "filter-sheet.tsx::Button::text-primary": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "filter-sheet.tsx::SheetContent::h-dvh md:h-[min(100dvh,48rem)] md:rounded-t-xl p-0":
    {
      reason: "pre-existing; migrate per ADR-078",
    },
  "filter-sheet.tsx::SheetTitle::font-semibold outline-hidden text-base text-foreground":
    {
      reason: "pre-existing; migrate per ADR-078",
    },
  "hint-tooltip.tsx::TooltipContent::text-center": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "msisdn-input.tsx::Input::font-[family-name:var(--font-data)] gst-data gst-data--tabular gst-numeric gst-numeric--tabular tabular-nums text-start":
    {
      reason: "pre-existing; migrate per ADR-078",
    },
  "multi-select.tsx::PopoverContent::bg-popover border border-border p-1 rounded-[var(--radius-lg)] shadow-md text-popover-foreground":
    {
      reason: "pre-existing; migrate per ADR-078",
    },
  "otp-input.tsx::Input::font-[family-name:var(--font-data)] font-semibold gst-data gst-data--tabular gst-numeric gst-numeric--tabular tabular-nums text-center text-lg tracking-[0.35em]":
    {
      reason: "pre-existing; migrate per ADR-078",
    },
  "page-templates/form-sheet.tsx::DialogContent::border-0 h-dvh max-md:pb-[var(--form-sheet-keyboard-inset,0px)] md:border md:border-border md:h-auto md:rounded-[var(--radius-xl)] md:rtl:-translate-x-[-50%] md:translate-x-[-50%] md:translate-y-[-50%] p-0 rounded-none rtl:translate-x-0 translate-x-0 translate-y-0":
    {
      reason: "pre-existing; migrate per ADR-078",
    },
  "page-templates/form-sheet.tsx::DialogDescription::text-muted-foreground text-sm":
    {
      reason: "pre-existing; migrate per ADR-078",
    },
  "page-templates/form-sheet.tsx::DialogHeader::border-b border-border px-4 py-3":
    {
      reason: "pre-existing; migrate per ADR-078",
    },
  "page-templates/form-sheet.tsx::DialogTitle::font-semibold text-base text-foreground":
    {
      reason: "pre-existing; migrate per ADR-078",
    },
  "page-templates/list-page.tsx::Button::font-medium hover:bg-transparent hover:text-foreground text-muted-foreground text-xs underline underline-offset-2":
    {
      reason: "pre-existing; migrate per ADR-078",
    },
  "page-templates/list-page.tsx::SheetContent::md:rounded-t-xl p-0": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "page-templates/list-page.tsx::SheetTitle::font-semibold text-base text-foreground":
    {
      reason: "pre-existing; migrate per ADR-078",
    },
  "pagination.tsx::Button::font-medium font-semibold p-0 pointer-events-none shadow-xs text-sm":
    {
      reason: "pre-existing; migrate per ADR-078",
    },
  "pagination.tsx::Button::p-0": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "progressive-dialog/progressive-dialog.tsx::DialogContent::p-0": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "progressive-dialog/progressive-dialog.tsx::DialogHeader::border-b border-border px-4 py-3":
    {
      reason: "pre-existing; migrate per ADR-078",
    },
  "progressive-dialog/progressive-dialog.tsx::DialogTitle::font-semibold text-base text-foreground":
    {
      reason: "pre-existing; migrate per ADR-078",
    },
  "progressive-dialog/progressive-dialog.tsx::Progress::h-1": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "progressive-dialog/progressive-dialog.tsx::SheetContent::border-0 h-dvh p-0":
    {
      reason: "pre-existing; migrate per ADR-078",
    },
  "shell/nav-mobile-sheet.tsx::SheetContent::p-0": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "shell/nav-mobile-sheet.tsx::SheetFooter::border-border border-t p-4": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "shell/nav-mobile-sheet.tsx::SheetHeader::border-b border-border px-4 py-4": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "shell/nav-tree.tsx::Badge::px-1.5 py-0 tabular-nums text-[10px]": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "wheel-date-picker.tsx::SheetContent::bg-background text-foreground": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "wheel-date-picker.tsx::SheetFooter::pb-4 px-4": {
    reason: "pre-existing; migrate per ADR-078",
  },
  "workspace-switcher.tsx::Spinner::text-primary": {
    reason: "pre-existing; migrate per ADR-078",
  },
};

/** Fingerprint of one hit; stable across edits above the element. */
export function lookFingerprint(rel, hit) {
  return `${rel}::${hit.tag}::${hit.look}`;
}

function collectComposedFiles(dir = COMPOSED_DIR) {
  const out = [];
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.name.endsWith(".tsx")) continue;
      if (/\.(?:test|stories)\.tsx$/.test(entry.name)) continue;
      out.push(full);
    }
  };
  walk(dir);
  return out.sort();
}

export function evaluateComposedLookOverrides(
  files = collectComposedFiles(),
  allowMap = COMPOSED_LOOK_OVERRIDE_ALLOW,
  { composedDir = COMPOSED_DIR, uiSrcDir = UI_SRC_DIR } = {},
) {
  const errors = [];
  const byFingerprint = new Map();

  for (const file of files) {
    const rel = path.relative(composedDir, file).split(path.sep).join("/");
    const raw = fs.readFileSync(file, "utf8");
    for (const hit of scanComposedLookOverride(raw, file, uiSrcDir)) {
      const fp = lookFingerprint(rel, hit);
      if (!byFingerprint.has(fp)) byFingerprint.set(fp, []);
      byFingerprint.get(fp).push({ file: rel, ...hit });
    }
  }

  const failing = [];
  let allowed = 0;
  for (const fp of [...byFingerprint.keys()].sort()) {
    const hits = byFingerprint.get(fp);
    if (Object.hasOwn(allowMap, fp)) {
      allowed += hits.length;
    } else {
      failing.push(...hits);
    }
  }

  for (const fp of Object.keys(allowMap).sort()) {
    if (!byFingerprint.has(fp)) {
      errors.push(`${fp}: stale allowlist entry (no current hit); remove it`);
    }
    const reason = allowMap[fp]?.reason;
    if (
      typeof reason !== "string" ||
      reason.trim().length < MIN_REASON_LENGTH
    ) {
      errors.push(
        `${fp}: allowlist reason must be a non-empty string of at least ${MIN_REASON_LENGTH} characters`,
      );
    }
  }

  return {
    failing,
    allowed,
    errors,
    fingerprints: [...byFingerprint.keys()].sort(),
  };
}

/** Allowlist object for every current fingerprint, all with the migration reason. */
export function buildAllowlist(fingerprints) {
  const out = {};
  for (const fp of fingerprints) out[fp] = { reason: PRE_EXISTING_REASON };
  return out;
}

if (import.meta.main) {
  const argv = process.argv.slice(2);
  if (argv.includes("--print-allowlist")) {
    const { fingerprints } = evaluateComposedLookOverrides(
      collectComposedFiles(),
      {},
    );
    console.log(JSON.stringify(buildAllowlist(fingerprints), null, 2));
    process.exit(0);
  }
  const reportOnly = argv.includes("--report");
  const { failing, allowed, errors, fingerprints } =
    evaluateComposedLookOverrides();
  if (reportOnly) {
    const counts = new Map();
    for (const f of failing) {
      counts.set(f.file, (counts.get(f.file) ?? 0) + 1);
    }
    for (const [file, count] of [...counts.entries()].sort()) {
      console.log(`${file}: ${count}`);
    }
    console.log(`Total unallowed hits: ${failing.length}`);
    process.exit(0);
  }
  for (const e of errors) {
    console.error(`check-ds (kit-look-override): ${e}`);
  }
  for (const f of failing) {
    console.error(
      `check-ds (kit-look-override): packages/ui/src/composed/${f.file}:${f.line}:${f.col}: <${f.tag}> class "${f.className}" overrides look (fingerprint ${lookFingerprint(f.file, f)})`,
    );
  }
  if (errors.length > 0 || failing.length > 0) {
    process.exit(1);
  }
  console.log(
    `check-ds (kit-look-override): ok (${allowed} allowlisted hits, ${fingerprints.length} fingerprints)`,
  );
}
