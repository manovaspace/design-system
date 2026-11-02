import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as ts from "typescript";
import { describe, expect, it } from "vitest";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(HERE, "..");
const SRC = path.join(PACKAGE_ROOT, "src");
const STABLE_LIST = path.join(PACKAGE_ROOT, "api/stable-exports.json");

/** Public entry points; `.` and `./experimental` are the ones the 1.0 promise covers. */
const PUBLIC_ENTRIES = [
  "index.ts",
  "experimental.ts",
  "icons.ts",
  "icons-solid.ts",
  "icons-brand.ts",
  "motion/index.tsx",
  "loading/index.ts",
  "server/index.ts",
];

/** Removed in 1.0 — no consumer imported them, and internal use was migrated. */
const REMOVED = [
  "normalizeDigits",
  "formatPhoneDisplay",
  "formatPhoneCopy",
  "EntityListStates",
  "SelectGroupLabel",
  "SelectIcon",
  "SelectList",
];

/** Implementation details: not exported from any public entry. */
const INTERNAL = [
  "collapseChevronClassName",
  "MOBILE_TAB_INDICATOR_WIDTH_PX",
  "mobileTabIndicatorInset",
  "PartitionedFilterBarChildren",
  "partitionFilterBarChildren",
];

function parse(file: string): ts.SourceFile {
  const text = fs.readFileSync(file, "utf8");
  return ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

function exportNames(file: string): string[] {
  const sf = parse(file);
  const names: string[] = [];
  for (const stmt of sf.statements) {
    if (ts.isExportDeclaration(stmt)) {
      if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
        for (const element of stmt.exportClause.elements) {
          names.push(element.name.text);
        }
      }
      continue;
    }

    const exported = ts.canHaveModifiers(stmt)
      ? ts
          .getModifiers(stmt)
          ?.some(
            (modifier: ts.Modifier) =>
              modifier.kind === ts.SyntaxKind.ExportKeyword,
          )
      : false;
    if (!exported) continue;

    if (ts.isVariableStatement(stmt)) {
      for (const declaration of stmt.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) {
          names.push(declaration.name.text);
        }
      }
      continue;
    }

    if (
      ts.isFunctionDeclaration(stmt) ||
      ts.isClassDeclaration(stmt) ||
      ts.isTypeAliasDeclaration(stmt) ||
      ts.isInterfaceDeclaration(stmt) ||
      ts.isEnumDeclaration(stmt)
    ) {
      if (stmt.name) names.push(stmt.name.text);
    }
  }
  return names;
}

function readStableList(): string[] {
  return JSON.parse(fs.readFileSync(STABLE_LIST, "utf8")) as string[];
}

const rootExports = exportNames(path.join(SRC, "index.ts"));
const experimentalExports = exportNames(path.join(SRC, "experimental.ts"));
const stableExports = readStableList();
const publicExports = PUBLIC_ENTRIES.flatMap((entry) =>
  exportNames(path.join(SRC, entry)),
);

describe("1.0 API surface", () => {
  it("root exports exactly the checked-in stable list", () => {
    expect([...rootExports].sort()).toEqual([...stableExports].sort());
  });

  it("keeps the stable list sorted and unique", () => {
    expect(stableExports).toEqual([...new Set(stableExports)].sort());
  });

  it("keeps root and experimental exports disjoint", () => {
    const root = new Set(rootExports);
    expect(experimentalExports.filter((name) => root.has(name))).toEqual([]);
  });

  it("exports no removed name from any public entry", () => {
    expect(REMOVED.filter((name) => publicExports.includes(name))).toEqual([]);
  });

  it("exports no internal name from the root or experimental entry", () => {
    expect(
      INTERNAL.filter(
        (name) =>
          rootExports.includes(name) || experimentalExports.includes(name),
      ),
    ).toEqual([]);
  });
});
