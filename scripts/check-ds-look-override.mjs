#!/usr/bin/env node
// Mirrors falak's `kit-look-override` rule for `packages/ui/src/composed/**/*.tsx`:
// composed components may pass layout classes only on kit primitives/controls
// (`Button`, `Input`, `Textarea`, `SelectTrigger`, `Card`, `Badge`, etc.).
// Pre-existing hits are allowlisted with exact counts so check:ds stays green
// while shrinking the allowlist to zero over time.
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
]);

const LAYOUT_PREFIX_RE =
  /^(?:w|min-w|max-w|flex|grid|col|row|gap|order|justify|items|content|self|place|shrink|grow|basis|m[stbelrxy]?|space-[xy]|z|overflow|inset|top|bottom|start|end|left|right)-/;

const LAYOUT_VARIANT_RE =
  /^(?:(?:sm|md|lg|xl|2xl|max-sm|max-md|max-lg|max-xl|max-2xl|rtl|ltr):)+/;

/** True when a Tailwind utility class only affects layout/placement, never look. */
export function isLayoutClass(token) {
  if (!token) return true;
  let base = token.replace(LAYOUT_VARIANT_RE, "");
  if (base.startsWith("!")) base = base.slice(1);
  if (base.endsWith("!")) base = base.slice(0, -1);
  if (base.startsWith("-")) base = base.slice(1);
  let depth = 0;
  for (let i = 0; i < base.length; i++) {
    if (base[i] === "[") depth++;
    else if (base[i] === "]" && depth > 0) depth--;
    else if (base[i] === ":" && depth === 0) return false;
  }
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
          for (const seg of segments) {
            for (const m of seg.text.matchAll(/\S+/g)) {
              if (!isLayoutClass(m[0])) {
                const { line, col } = locate(starts, seg.start + m.index);
                hits.push({
                  tag: tagName,
                  className: m[0],
                  line,
                  col,
                });
              }
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return hits;
}

// Legacy composed look-override allowlist (tracks #158; shrink toward 0 as composed
// components move styling into kit variants/recipes).
export const COMPOSED_LOOK_OVERRIDE_ALLOW = {
  "combobox-async.tsx": {
    count: 5,
    reason: "legacy Input/Button styling (#158)",
  },
  "combobox.tsx": { count: 3, reason: "legacy PopoverContent styling (#158)" },
  "confirm-dialog.tsx": {
    count: 6,
    reason: "legacy AlertDialog/Button styling (#158)",
  },
  "date-picker.tsx": {
    count: 5,
    reason: "legacy PopoverContent/Button styling (#158)",
  },
  "date-time-picker.tsx": {
    count: 4,
    reason: "legacy PopoverContent/Button styling (#158)",
  },
  "decimal-input.tsx": {
    count: 6,
    reason: "legacy Input/Badge styling (#158)",
  },
  "edit-field-sheet.tsx": {
    count: 9,
    reason: "legacy Dialog/Sheet/Button styling (#158)",
  },
  "entity-browser/entity-filter-bar.tsx": {
    count: 28,
    reason: "legacy Sheet/Button/Badge styling (#158)",
  },
  "entity-browser/entity-search-field.tsx": {
    count: 4,
    reason: "legacy Input styling (#158)",
  },
  "entity-browser/entity-table-states.tsx": {
    count: 11,
    reason: "legacy TableCell/Button styling (#158)",
  },
  "field.tsx": { count: 1, reason: "Label text-start override (#158)" },
  "filter-pill-bar.tsx": {
    count: 6,
    reason: "legacy Sheet/Button styling (#158)",
  },
  "filter-sheet.tsx": {
    count: 12,
    reason: "legacy Sheet/Button/Badge styling (#158)",
  },
  "hint-tooltip.tsx": {
    count: 1,
    reason: "legacy TooltipContent styling (#158)",
  },
  "infinite-scroll-trigger.tsx": {
    count: 1,
    reason: "legacy Button styling (#158)",
  },
  "msisdn-input.tsx": { count: 7, reason: "legacy Input styling (#158)" },
  "multi-select.tsx": {
    count: 7,
    reason: "legacy PopoverContent/Badge styling (#158)",
  },
  "otp-input.tsx": { count: 10, reason: "legacy Input styling (#158)" },
  "page-templates/form-sheet.tsx": {
    count: 26,
    reason: "legacy Dialog/Sheet/Button styling (#158)",
  },
  "page-templates/list-page.tsx": {
    count: 16,
    reason: "legacy Sheet/Button/Badge styling (#158)",
  },
  "pagination.tsx": { count: 11, reason: "legacy Button styling (#158)" },
  "progressive-dialog/progressive-dialog.tsx": {
    count: 14,
    reason: "legacy Dialog/Sheet/Button styling (#158)",
  },
  "search-input.tsx": { count: 2, reason: "legacy Input styling (#158)" },
  "sheet-actions.tsx": { count: 2, reason: "legacy Button styling (#158)" },
  "shell/nav-mobile-sheet.tsx": {
    count: 8,
    reason: "legacy Sheet/Button styling (#158)",
  },
  "shell/nav-tree.tsx": {
    count: 4,
    reason: "legacy Badge/Button styling (#158)",
  },
  "wheel-date-picker.tsx": {
    count: 5,
    reason: "legacy Sheet/Button styling (#158)",
  },
  "workspace-switcher.tsx": {
    count: 1,
    reason: "legacy DropdownMenuContent styling (#158)",
  },
};

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
  const failing = [];
  const errors = [];
  let allowed = 0;

  const byRel = new Map();
  for (const file of files) {
    const rel = path.relative(composedDir, file).split(path.sep).join("/");
    const raw = fs.readFileSync(file, "utf8");
    const hits = scanComposedLookOverride(raw, file, uiSrcDir);
    if (hits.length > 0) {
      byRel.set(rel, hits);
    }
  }

  const allKeys = new Set([...byRel.keys(), ...Object.keys(allowMap)]);
  for (const rel of [...allKeys].sort()) {
    const hits = byRel.get(rel) ?? [];
    const allow = allowMap[rel];
    if (!allow) {
      for (const h of hits) failing.push({ file: rel, ...h });
      continue;
    }
    if (hits.length > allow.count) {
      for (const h of hits) failing.push({ file: rel, ...h });
      continue;
    }
    if (hits.length < allow.count) {
      errors.push(
        `${rel}: stale allowlist (found ${hits.length}, expected ${allow.count}); lower count or remove entry`,
      );
    }
    allowed += hits.length;
  }

  return { failing, allowed, errors };
}

if (import.meta.main) {
  const reportOnly = process.argv.includes("--report");
  const { failing, allowed, errors } = evaluateComposedLookOverrides();
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
      `check-ds (kit-look-override): packages/ui/src/composed/${f.file}:${f.line}:${f.col}: <${f.tag}> class "${f.className}" overrides look`,
    );
  }
  if (errors.length > 0 || failing.length > 0) {
    process.exit(1);
  }
  console.log(`check-ds (kit-look-override): ok (${allowed} allowlisted)`);
}
