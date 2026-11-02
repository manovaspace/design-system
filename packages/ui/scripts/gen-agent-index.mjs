#!/usr/bin/env node
/**
 * Build-time agent index for @manovaspace/ui.
 *
 * Source of truth: the committed API Extractor reports in `etc/*.api.md`
 * (names, kinds, signatures) plus component source JSDoc (one-line purpose,
 * @default, @deprecated/@experimental/@internal tags). Nothing is invented:
 * an export without a JSDoc sentence gets an empty purpose.
 *
 * Output: `dist/agents/index.md`, a compressed pipe-delimited index grouped by
 * the source folder that owns each export. The file is capped at 8 KB; the
 * build fails rather than shipping an index an agent cannot load.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export const MAX_AGENT_INDEX_BYTES = 8192;

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(HERE, "..");
const DEFAULT_REPORTS_DIR = path.join(PACKAGE_ROOT, "etc");
const DEFAULT_SRC_DIR = path.join(PACKAGE_ROOT, "src");
const DEFAULT_OUTPUT = path.join(PACKAGE_ROOT, "dist/agents/index.md");

/** Report file -> public import path. Order is also the tie-break order. */
const REPORT_PATHS = [
  ["ui.api.md", "@manovaspace/ui", "index.ts"],
  ["ui-experimental.api.md", "@manovaspace/ui/experimental", "experimental.ts"],
  ["ui-motion.api.md", "@manovaspace/ui/motion", "motion/index.tsx"],
  ["ui-icons.api.md", "@manovaspace/ui/icons", "icons.ts"],
  ["ui-icons-solid.api.md", "@manovaspace/ui/icons/solid", "icons-solid.ts"],
  ["ui-icons-brand.api.md", "@manovaspace/ui/icons/brand", "icons-brand.ts"],
  ["ui-loading.api.md", "@manovaspace/ui/loading", "loading/index.ts"],
  ["ui-server.api.md", "@manovaspace/ui/server", "server/index.ts"],
];

const AREA_ORDER = [
  "Layout",
  "Forms",
  "Navigation",
  "Feedback",
  "Data",
  "Motion",
  "Icons",
  "Loading",
  "Server",
  "Utilities",
  "Components",
  "Experimental",
];

const HEADER = [
  "# @manovaspace/ui agent index (generated; do not edit)",
  "# Read before writing UI; match names, props and paths.",
  "# Format: Names|kind|purpose|props|path. @ui=@manovaspace/ui; subpaths @ui/<name>.",
  "# Props: name:type[?][=default]; +N = more.",
  "# Run `o audit usage SYMBOL` before changing a shared component.",
  "# Icons grouped; import by name.",
];

function readFile(file) {
  return fs.readFileSync(file, "utf8");
}

function parseTs(file, text) {
  return ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

function leadingText(text, node) {
  return text.slice(node.getFullStart(), node.getStart());
}

function readApiTags(leading) {
  const tags = new Set();
  for (const tag of [
    "public",
    "deprecated",
    "experimental",
    "internal",
    "beta",
    "alpha",
  ]) {
    if (new RegExp(`@${tag}\\b`).test(leading)) tags.add(tag);
  }
  const note = (leading.match(/@deprecated\s+([^\n]+)/)?.[1] ?? "")
    .replace(/\(undocumented\)/g, "")
    .replace(/\*\//g, "")
    .trim();
  return { tags, note };
}

function field(text) {
  return String(text).replace(/\s*\|\s*/g, " / ");
}

function compactType(text) {
  return field(
    text
      .replace(/\s+/g, " ")
      .replace(/React_2\./g, "")
      .replace(/React\./g, "")
      .replace(/class_variance_authority_types\./g, "")
      .replace(/lucide_react\./g, "")
      .replace(/\s*\|\s*undefined/g, "")
      .trim(),
  );
}

function propName(name) {
  if (!name) return "";
  if (
    ts.isIdentifier(name) ||
    ts.isStringLiteral(name) ||
    ts.isNumericLiteral(name)
  ) {
    return name.text;
  }
  return name.getText();
}

function collectProps(node, sf, declarations, seen = new Set()) {
  if (!node) return [];
  if (ts.isTypeLiteralNode(node)) return [...node.members];
  if (ts.isIntersectionTypeNode(node)) {
    return node.types.flatMap((part) =>
      collectProps(part, sf, declarations, seen),
    );
  }
  if (ts.isParenthesizedTypeNode(node)) {
    return collectProps(node.type, sf, declarations, seen);
  }
  if (ts.isUnionTypeNode(node)) {
    return node.types.flatMap((part) =>
      collectProps(part, sf, declarations, seen),
    );
  }
  if (ts.isTypeReferenceNode(node)) {
    const name = node.typeName.getText(sf).replace(/^.*\./, "");
    if (declarations.has(name) && !seen.has(name)) {
      seen.add(name);
      const decl = declarations.get(name);
      if (ts.isTypeAliasDeclaration(decl)) {
        return collectProps(decl.type, sf, declarations, seen);
      }
      if (ts.isInterfaceDeclaration(decl)) {
        return [...decl.members];
      }
    }
    return (node.typeArguments ?? []).flatMap((arg) =>
      collectProps(arg, sf, declarations, seen),
    );
  }
  return [];
}

function propsFromMembers(members, sf) {
  const seen = new Set();
  const out = [];
  for (const member of members) {
    if (!ts.isPropertySignature(member) || !member.name) continue;
    const name = propName(member.name);
    if (!name || seen.has(name)) continue;
    seen.add(name);
    out.push({
      name,
      optional: Boolean(member.questionToken),
      type: member.type ? compactType(member.type.getText(sf)) : "unknown",
    });
  }
  return out;
}

function parseApiReport(text, importPath) {
  const code = text.match(/```ts\r?\n([\s\S]*?)```/)?.[1] ?? "";
  const sf = parseTs("report.ts", code);
  const declarations = new Map();
  for (const stmt of sf.statements) {
    if (ts.isTypeAliasDeclaration(stmt) || ts.isInterfaceDeclaration(stmt)) {
      declarations.set(stmt.name.text, stmt);
    }
  }

  const entries = [];
  for (const stmt of sf.statements) {
    const leading = leadingText(code, stmt);
    const { tags, note } = readApiTags(leading);

    if (ts.isExportDeclaration(stmt) && !stmt.moduleSpecifier) {
      if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
        for (const element of stmt.exportClause.elements) {
          entries.push({
            name: element.name.text,
            kind: "value",
            importPath,
            tags,
            note,
            props: [],
          });
        }
      }
      continue;
    }

    if (ts.isFunctionDeclaration(stmt) && stmt.name) {
      const typeNode = stmt.parameters[0]?.type;
      entries.push({
        name: stmt.name.text,
        kind: "function",
        importPath,
        tags,
        note,
        props: propsFromMembers(collectProps(typeNode, sf, declarations), sf),
      });
      continue;
    }

    if (ts.isVariableStatement(stmt)) {
      for (const declaration of stmt.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) continue;
        entries.push({
          name: declaration.name.text,
          kind: "const",
          importPath,
          tags,
          note,
          props: propsFromMembers(
            collectProps(declaration.type, sf, declarations),
            sf,
          ),
        });
      }
      continue;
    }

    if (ts.isTypeAliasDeclaration(stmt)) {
      entries.push({
        name: stmt.name.text,
        kind: "type",
        importPath,
        tags,
        note,
        props: [],
      });
      continue;
    }

    if (ts.isInterfaceDeclaration(stmt)) {
      entries.push({
        name: stmt.name.text,
        kind: "interface",
        importPath,
        tags,
        note,
        props: [],
      });
      continue;
    }

    if (ts.isClassDeclaration(stmt) && stmt.name) {
      entries.push({
        name: stmt.name.text,
        kind: "class",
        importPath,
        tags,
        note,
        props: [],
      });
      continue;
    }

    if (ts.isEnumDeclaration(stmt)) {
      entries.push({
        name: stmt.name.text,
        kind: "enum",
        importPath,
        tags,
        note,
        props: [],
      });
    }
  }

  return entries;
}

function walkFiles(dir, out) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      walkFiles(full, out);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(entry.name)) continue;
    if (/\.(test|stories)\.(ts|tsx)$/.test(entry.name)) continue;
    if (entry.name.endsWith(".d.ts")) continue;
    out.push(full);
  }
  return out;
}

function resolveSpecifier(specifier, fromFile) {
  if (!specifier.startsWith(".")) return null;
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    base.replace(/\.js$/, ".ts"),
    base.replace(/\.js$/, ".tsx"),
    base,
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function isExportedStatement(stmt) {
  return Boolean(
    stmt.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
    ),
  );
}

function statementName(stmt) {
  if (
    ts.isFunctionDeclaration(stmt) ||
    ts.isTypeAliasDeclaration(stmt) ||
    ts.isInterfaceDeclaration(stmt) ||
    ts.isClassDeclaration(stmt) ||
    ts.isEnumDeclaration(stmt)
  ) {
    return stmt.name?.text ?? null;
  }
  if (ts.isVariableStatement(stmt)) {
    const declaration = stmt.declarationList.declarations[0];
    return declaration && ts.isIdentifier(declaration.name)
      ? declaration.name.text
      : null;
  }
  return null;
}

function buildSourceExportMap(entryFile) {
  const map = new Map();
  if (!entryFile || !fs.existsSync(entryFile)) return map;
  const seen = new Set();
  const walk = (file) => {
    if (!file || seen.has(file)) return;
    seen.add(file);
    const text = readFile(file);
    const sf = parseTs(file, text);
    for (const stmt of sf.statements) {
      if (ts.isExportDeclaration(stmt)) {
        const target = stmt.moduleSpecifier
          ? resolveSpecifier(stmt.moduleSpecifier.text, file)
          : file;
        if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
          for (const element of stmt.exportClause.elements) {
            map.set(element.name.text, {
              file: target,
              localName: element.propertyName?.text ?? element.name.text,
            });
          }
        } else if (!stmt.exportClause && target) {
          walk(target);
        }
        continue;
      }
      if (isExportedStatement(stmt)) {
        const name = statementName(stmt);
        if (name) map.set(name, { file, localName: name });
      }
    }
  };
  walk(entryFile);
  return map;
}

function buildSourceIndexes(srcDir) {
  const fileCache = new Map();
  const declarationCache = new Map();
  const typeIndex = new Map();
  const globalIndex = new Map();

  const getFile = (file) => {
    if (!fileCache.has(file)) {
      fileCache.set(file, parseTs(file, readFile(file)));
    }
    return fileCache.get(file);
  };

  const getDeclarations = (file) => {
    if (!declarationCache.has(file)) {
      const sf = getFile(file);
      const declarations = new Map();
      for (const stmt of sf.statements) {
        const name = statementName(stmt);
        if (name) declarations.set(name, stmt);
      }
      declarationCache.set(file, declarations);
    }
    return declarationCache.get(file);
  };

  for (const file of walkFiles(srcDir, [])) {
    const sf = getFile(file);
    for (const stmt of sf.statements) {
      const name = statementName(stmt);
      if (name) {
        const previous = globalIndex.get(name);
        if (!previous || previous.file.includes("primitives")) {
          globalIndex.set(name, { file, stmt, localName: name });
        }
      }
      if (
        (ts.isTypeAliasDeclaration(stmt) || ts.isInterfaceDeclaration(stmt)) &&
        stmt.name
      ) {
        // Root declarations win over primitives with the same name.
        const key = stmt.name.text;
        const previous = typeIndex.get(key);
        if (!previous || previous.file.includes("primitives")) {
          typeIndex.set(key, { file, stmt });
        }
      }
    }
  }

  return { getFile, getDeclarations, typeIndex, globalIndex };
}

function commentText(comment) {
  if (!comment) return "";
  if (typeof comment === "string") return comment;
  return comment.map((part) => part.text ?? "").join("");
}

function jsDocFor(stmt) {
  return ts
    .getJSDocCommentsAndTags(stmt)
    .find((doc) => doc && doc.kind === ts.SyntaxKind.JSDoc);
}

function jsDocDescription(stmt) {
  const doc = jsDocFor(stmt);
  return firstSentence(commentText(doc?.comment));
}

function jsDocTag(stmt, tagName) {
  const tag = ts
    .getJSDocTags(stmt)
    .find((candidate) => candidate.tagName.text === tagName);
  return tag ? commentText(tag.comment).trim() : undefined;
}

function firstSentence(text) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const match = clean.match(/^(.+?[.!?])(?:\s|$)/);
  return (match ? match[1] : clean).trim();
}

function collectDefaults(typeIndex, propsTypeName) {
  const defaults = new Map();
  if (!propsTypeName) return defaults;
  const found = typeIndex.get(propsTypeName);
  if (!found) return defaults;

  const record = (member) => {
    if (!ts.isPropertySignature(member) || !member.name) return;
    const value = jsDocTag(member, "default");
    if (value) defaults.set(propName(member.name), value);
  };

  const visit = (node) => {
    if (!node) return;
    if (ts.isTypeLiteralNode(node)) {
      node.members.forEach(record);
      return;
    }
    if (ts.isIntersectionTypeNode(node) || ts.isUnionTypeNode(node)) {
      node.types.forEach(visit);
      return;
    }
    if (ts.isParenthesizedTypeNode(node)) {
      visit(node.type);
      return;
    }
    if (ts.isTypeReferenceNode(node)) {
      const name = node.typeName
        .getText(found.stmt.getSourceFile())
        .replace(/^.*\./, "");
      const next = typeIndex.get(name);
      if (next && next !== found) {
        if (ts.isTypeAliasDeclaration(next.stmt)) visit(next.stmt.type);
        if (ts.isInterfaceDeclaration(next.stmt))
          next.stmt.members.forEach(record);
      }
    }
  };

  if (ts.isInterfaceDeclaration(found.stmt)) {
    found.stmt.members.forEach(record);
  } else {
    visit(found.stmt.type);
  }
  return defaults;
}

function propsTypeNameFromReport(stmt, sf) {
  const typeNode = ts.isFunctionDeclaration(stmt)
    ? stmt.parameters[0]?.type
    : ts.isVariableStatement(stmt)
      ? stmt.declarationList.declarations[0]?.type
      : undefined;
  if (!typeNode) return null;
  if (ts.isTypeReferenceNode(typeNode)) {
    return typeNode.typeName.getText(sf).replace(/^.*\./, "");
  }
  const nested = (node) => {
    if (!node) return null;
    if (ts.isTypeReferenceNode(node)) {
      const name = node.typeName.getText(sf).replace(/^.*\./, "");
      if (name.endsWith("Props")) return name;
    }
    let result = null;
    ts.forEachChild(node, (child) => {
      result = result ?? nested(child);
    });
    return result;
  };
  return nested(typeNode);
}

function sourceRelative(srcDir, file) {
  if (!file) return "";
  const relative = path.relative(srcDir, file);
  return relative.startsWith("..") ? "" : relative.split(path.sep).join("/");
}

function iconImportPath(sourceRel, importPath) {
  if (sourceRel.endsWith("icons-solid.ts"))
    return "@manovaspace/ui/icons/solid";
  if (sourceRel.endsWith("icons-brand.ts"))
    return "@manovaspace/ui/icons/brand";
  if (sourceRel.endsWith("icons.ts")) return "@manovaspace/ui/icons";
  return importPath;
}

function canonicalImportPath(entry, sourceRel) {
  if (entry.importPath === "@manovaspace/ui/experimental") {
    return "@manovaspace/ui/experimental";
  }
  if (entry.isIcon) return iconImportPath(sourceRel, entry.importPath);
  if (sourceRel.startsWith("motion/")) return "@manovaspace/ui/motion";
  if (sourceRel.startsWith("loading/")) return "@manovaspace/ui/loading";
  if (sourceRel.startsWith("server/")) return "@manovaspace/ui/server";
  return entry.importPath;
}

function areaFor(sourceRel, importPath, isIcon) {
  if (isIcon) return "Icons";
  if (sourceRel.startsWith("motion/") || importPath.endsWith("/motion")) {
    return "Motion";
  }
  if (sourceRel.startsWith("loading/") || importPath.endsWith("/loading")) {
    return "Loading";
  }
  if (sourceRel.startsWith("server/") || importPath.endsWith("/server")) {
    return "Server";
  }
  if (sourceRel.startsWith("lib/")) return "Utilities";
  if (sourceRel.startsWith("composed/entity-browser/")) return "Data";
  if (
    sourceRel.startsWith("composed/shell/") ||
    /(^|\/)(nav-|mobile-|shell)/.test(sourceRel)
  ) {
    return "Navigation";
  }
  if (
    /(^|\/)(form|input|textarea|checkbox|switch|select|toggle|slider|date-time|decimal|msisdn|otp|selectable)/.test(
      sourceRel,
    )
  ) {
    return "Forms";
  }
  if (
    /(^|\/)(alert|toast|spinner|skeleton|progress|empty-state|field-feedback|hint-tooltip|badge)/.test(
      sourceRel,
    )
  ) {
    return "Feedback";
  }
  if (
    /(^|\/)(card|page-shell|table|tabs|sheet|dialog|popover|dropdown|collapsible|scroll|avatar|pagination)/.test(
      sourceRel,
    )
  ) {
    return "Layout";
  }
  return "Components";
}

function collectEntries({ reportsDir, srcDir }) {
  const sourceIndexes = buildSourceIndexes(srcDir);
  const byName = new Map();

  for (const [reportFile, importPath, entryFile] of REPORT_PATHS) {
    const reportPath = path.join(reportsDir, reportFile);
    if (!fs.existsSync(reportPath)) continue;
    const sourceMap = buildSourceExportMap(path.join(srcDir, entryFile));
    const entries = parseApiReport(readFile(reportPath), importPath);

    for (const entry of entries) {
      let source = sourceMap.get(entry.name) ?? null;
      let sourceStmt = source?.file
        ? (sourceIndexes.getDeclarations(source.file)?.get(source.localName) ??
          null)
        : null;
      if (!sourceStmt) {
        const global = sourceIndexes.globalIndex.get(entry.name);
        if (global) {
          source = { file: global.file, localName: global.localName };
          sourceStmt = global.stmt;
        }
      }
      const sourceRel = sourceRelative(srcDir, source?.file);

      const description = sourceStmt ? jsDocDescription(sourceStmt) : "";
      const deprecatedTag = sourceStmt
        ? jsDocTag(sourceStmt, "deprecated")
        : undefined;
      const experimentalTag = sourceStmt
        ? jsDocTag(sourceStmt, "experimental")
        : undefined;
      const internalTag = sourceStmt
        ? jsDocTag(sourceStmt, "internal")
        : undefined;

      const isIcon =
        importPath.includes("/icons") ||
        /(^|\/)icons(-solid|-brand)?\.ts$/.test(sourceRel);
      const tags = new Set(entry.tags);
      if (deprecatedTag !== undefined) tags.add("deprecated");
      if (experimentalTag !== undefined) tags.add("experimental");
      if (internalTag !== undefined) tags.add("internal");
      if (tags.has("internal")) continue;

      let kind = entry.kind;
      if (kind === "value" && sourceStmt) {
        if (ts.isFunctionDeclaration(sourceStmt)) kind = "function";
        else if (ts.isVariableStatement(sourceStmt)) kind = "const";
        else if (ts.isTypeAliasDeclaration(sourceStmt)) kind = "type";
        else if (ts.isInterfaceDeclaration(sourceStmt)) kind = "interface";
      }
      if (isIcon) kind = "icon";

      let propsTypeName = null;
      if (sourceStmt) {
        const sf = sourceIndexes.getFile(source.file);
        propsTypeName = propsTypeNameFromReport(sourceStmt, sf);
      }
      const defaults = collectDefaults(sourceIndexes.typeIndex, propsTypeName);

      const canonical = {
        name: entry.name,
        kind,
        purpose: description,
        props: entry.props,
        defaults,
        importPath: canonicalImportPath({ ...entry, isIcon }, sourceRel),
        area: areaFor(sourceRel, importPath, isIcon),
        isIcon,
        deprecated: tags.has("deprecated"),
        deprecatedNote: deprecatedTag || entry.note || "",
        experimental: tags.has("experimental"),
        sourceRel,
        rank: REPORT_PATHS.findIndex(([file]) => file === reportFile),
      };

      const previous = byName.get(canonical.name);
      if (!previous || preferEntry(canonical, previous)) {
        byName.set(canonical.name, canonical);
      }
    }
  }

  return [...byName.values()];
}

function preferEntry(candidate, previous) {
  if (candidate.isIcon !== previous.isIcon) return candidate.isIcon;
  const candidateSpecific = candidate.importPath !== "@manovaspace/ui";
  const previousSpecific = previous.importPath !== "@manovaspace/ui";
  if (candidateSpecific !== previousSpecific) return candidateSpecific;
  return candidate.rank < previous.rank;
}

function shortPath(importPath) {
  return importPath.replace("@manovaspace/ui", "@ui");
}

function compareByName(a, b) {
  return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
}

function compareByKey(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function formatProps(entry) {
  const defaults = entry.defaults ?? new Map();
  let props = entry.props.map((prop) => {
    const type =
      prop.type.length > 56 ? `${prop.type.slice(0, 55)}…` : prop.type;
    const fallback = defaults.get(prop.name);
    return `${prop.name}${prop.optional ? "?" : ""}:${type}${
      fallback ? `=${field(fallback)}` : ""
    }`;
  });

  if (props.length > 8) {
    props = [...props.slice(0, 6), `+${props.length - 6}`];
  }
  return props.join(",");
}

function detailLine(entry) {
  const purpose = field(
    entry.purpose.length > 56
      ? `${entry.purpose.slice(0, 55)}…`
      : entry.purpose,
  );
  const flags = [
    entry.deprecated
      ? `DEPRECATED${entry.deprecatedNote ? `: ${field(entry.deprecatedNote)}` : ""}`
      : "",
    entry.experimental ? "EXPERIMENTAL" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const purposeWithFlags = [flags, purpose].filter(Boolean).join(" — ");
  return [
    entry.name,
    entry.kind,
    purposeWithFlags,
    formatProps(entry),
    shortPath(entry.importPath),
  ].join("|");
}

function groupLine(entries, kind, purpose = "") {
  return [
    entries.map((entry) => entry.name).join(","),
    kind,
    field(purpose),
    "",
    shortPath(entries[0].importPath),
  ].join("|");
}

function render(entries, { detailNames = null } = {}) {
  const lines = [...HEADER, ""];
  const areas = new Map();
  for (const entry of entries) {
    const area = entry.experimental ? "Experimental" : entry.area;
    if (!areas.has(area)) areas.set(area, []);
    areas.get(area).push(entry);
  }

  const shouldDetail = (entry) => {
    // Experimental exports stay grouped by kind and import path: they are
    // outside the promise and their full prop lists do not fit the 8 KB cap.
    if (entry.deprecated) return true;
    if (entry.experimental) return false;
    if (detailNames) return detailNames.has(entry.name);
    return Boolean(entry.purpose || entry.props.length > 0);
  };

  for (const area of AREA_ORDER) {
    const areaEntries = areas.get(area);
    if (!areaEntries?.length) continue;
    lines.push(`## ${area}`);

    if (area === "Icons") {
      const packs = new Map();
      for (const entry of areaEntries) {
        if (!packs.has(entry.importPath)) packs.set(entry.importPath, []);
        packs.get(entry.importPath).push(entry);
      }
      for (const [importPath, packEntries] of [...packs.entries()].sort()) {
        lines.push(
          [
            "Icons",
            "icon",
            `${packEntries.length} icons; import by name`,
            "",
            shortPath(importPath),
          ].join("|"),
        );
      }
      lines.push("");
      continue;
    }

    const types = areaEntries.filter(
      (entry) => entry.kind === "type" || entry.kind === "interface",
    );
    const values = areaEntries.filter(
      (entry) => entry.kind !== "type" && entry.kind !== "interface",
    );

    for (const kind of ["type", "interface"]) {
      const sameKind = types.filter((entry) => entry.kind === kind);
      if (!sameKind.length) continue;
      sameKind.sort(compareByName);
      lines.push(groupLine(sameKind, kind));
    }

    const detailed = [];
    const grouped = [];
    for (const entry of values) {
      if (shouldDetail(entry)) detailed.push(entry);
      else grouped.push(entry);
    }

    detailed.sort(compareByName);
    for (const entry of detailed) lines.push(detailLine(entry));

    const groups = new Map();
    for (const entry of grouped) {
      const key = `${entry.kind}|${entry.importPath}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(entry);
    }
    for (const [, group] of [...groups.entries()].sort(([a], [b]) =>
      compareByKey(a, b),
    )) {
      group.sort(compareByName);
      lines.push(groupLine(group, group[0].kind));
    }

    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

function detailScore(entry) {
  return (
    (entry.purpose && entry.props.length > 0 ? 5000 : 0) +
    (entry.purpose ? 1000 : 0) +
    Math.min(entry.props.length, 20) * 10
  );
}

function applyCuts(entries, { maxBytes }) {
  const cuts = [];
  let text = render(entries);
  if (Buffer.byteLength(text) <= maxBytes) return { text, cuts };

  cuts.push(
    "cap reached: grouped exports by area/kind and kept props for a priority set",
  );

  // Cap forces a sparse index: every name stays, but only a deterministic
  // priority set keeps its props. MobileBottomTabBar is pinned because the
  // index is expected to answer its props without opening Storybook.
  const detailNames = new Set(["MobileBottomTabBar"]);
  text = render(entries, { detailNames });
  if (Buffer.byteLength(text) > maxBytes) {
    throw new Error(
      `agent index is ${Buffer.byteLength(text)} bytes, over the ${maxBytes}-byte cap; ` +
        "shorten descriptions or add a grouping rule before shipping",
    );
  }

  const candidates = entries
    .filter(
      (entry) =>
        !entry.isIcon &&
        entry.kind !== "type" &&
        entry.kind !== "interface" &&
        !entry.deprecated &&
        !entry.experimental &&
        (entry.purpose || entry.props.length > 0) &&
        !detailNames.has(entry.name),
    )
    .sort((a, b) => detailScore(b) - detailScore(a) || compareByName(a, b));

  const added = [];
  for (const entry of candidates) {
    detailNames.add(entry.name);
    const next = render(entries, { detailNames });
    if (Buffer.byteLength(next) <= maxBytes) {
      text = next;
      added.push(entry.name);
    } else {
      detailNames.delete(entry.name);
    }
  }

  const alwaysDetailed = entries.filter((entry) => entry.deprecated).length;
  cuts.push(
    `kept detail for ${detailNames.size} prioritized + ${alwaysDetailed} deprecated; ` +
      `grouped experimental and the rest, including ${candidates.length - added.length} documented exports`,
  );
  return { text, cuts };
}

export function generateAgentIndex(options = {}) {
  const reportsDir = options.reportsDir ?? DEFAULT_REPORTS_DIR;
  const srcDir = options.srcDir ?? DEFAULT_SRC_DIR;
  const maxBytes = options.maxBytes ?? MAX_AGENT_INDEX_BYTES;
  const entries = collectEntries({ reportsDir, srcDir });
  const { text, cuts } = applyCuts(entries, { maxBytes });
  return {
    text,
    bytes: Buffer.byteLength(text, "utf8"),
    entries,
    cuts,
  };
}

export function writeAgentIndex(options = {}) {
  const outputPath = options.outputPath ?? DEFAULT_OUTPUT;
  const result = generateAgentIndex(options);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, result.text);
  return { ...result, outputPath };
}

const isCli =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isCli) {
  try {
    const result = writeAgentIndex();
    console.log(
      `agent index: ${result.outputPath} (${result.bytes} bytes, ${result.entries.length} exports)`,
    );
    for (const cut of result.cuts) console.log(`agent index cut: ${cut}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
