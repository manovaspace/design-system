#!/usr/bin/env bun
/**
 * Generate API Extractor reports and compare them after canonicalising
 * string-literal union members.
 *
 * TypeScript does not guarantee the order of members in a union type, so
 * `cva`-inferred unions such as `"sm" | "md" | "lg"` can be emitted in a
 * different order on different runs. API Extractor's own comparison is
 * byte-for-byte, which made `check:api` flaky. This script always generates the
 * report into `temp/`, sorts every all-string-literal union (optionally with
 * `null`/`undefined` members) and only then compares with `etc/`.
 *
 * Usage:
 *   bun scripts/api-report.mjs check  -c api-extractor.json [...]
 *   bun scripts/api-report.mjs update -c api-extractor.json [...]
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";

const BOUNDARY_CHARS = new Set([
  ",",
  ";",
  ":",
  "=",
  "&",
  "?",
  "(",
  ")",
  "[",
  "]",
  "{",
  "}",
  "<",
  ">",
  "\n",
]);

const STRING_LITERAL = /^(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')$/;

/** Advance past a quoted string starting at `start`, honouring escapes. */
function skipQuoted(text, start) {
  const quote = text[start];
  let i = start + 1;
  while (i < text.length) {
    if (text[i] === "\\") {
      i += 2;
    } else if (text[i] === quote) {
      return i + 1;
    } else {
      i += 1;
    }
  }
  return text.length;
}

function memberKind(member) {
  if (member === "null") return { rank: 1 };
  if (member === "undefined") return { rank: 2 };
  if (STRING_LITERAL.test(member)) {
    return { rank: 0, value: member.slice(1, -1) };
  }
  return undefined;
}

function compareMembers(a, b) {
  const left = memberKind(a);
  const right = memberKind(b);
  if (left.rank !== right.rank) return left.rank - right.rank;
  if (left.rank !== 0) return 0;
  // Plain UTF-16 code-unit order (the "C" sense), not locale-dependent
  // `localeCompare`.
  if (left.value < right.value) return -1;
  if (left.value > right.value) return 1;
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function splitUnionMembers(core) {
  const members = [];
  let current = "";
  let i = 0;
  while (i < core.length) {
    const char = core[i];
    if (char === '"' || char === "'") {
      const end = skipQuoted(core, i);
      current += core.slice(i, end);
      i = end;
    } else if (char === "|") {
      members.push(current.trim());
      current = "";
      i += 1;
    } else {
      current += char;
      i += 1;
    }
  }
  members.push(current.trim());
  return members;
}

function canonicalizeFragment(fragment) {
  const leading = fragment.match(/^\s*/)?.[0] ?? "";
  const trailing = fragment.match(/\s*$/)?.[0] ?? "";
  const core = fragment.slice(
    leading.length,
    fragment.length - trailing.length,
  );
  const members = splitUnionMembers(core);
  if (members.length < 2) return fragment;
  if (!members.every((member) => memberKind(member) !== undefined)) {
    return fragment;
  }
  return leading + [...members].sort(compareMembers).join(" | ") + trailing;
}

function canonicalizeLine(line) {
  let result = "";
  let fragment = "";
  let i = 0;
  while (i < line.length) {
    const char = line[i];
    if (char === '"' || char === "'") {
      const end = skipQuoted(line, i);
      fragment += line.slice(i, end);
      i = end;
    } else if (BOUNDARY_CHARS.has(char)) {
      result += canonicalizeFragment(fragment) + char;
      fragment = "";
      i += 1;
    } else {
      fragment += char;
      i += 1;
    }
  }
  return result + canonicalizeFragment(fragment);
}

/**
 * Sort the members of every union that consists only of string literals plus
 * optional `null`/`undefined`. Strings are sorted in plain code-unit order,
 * followed by `null` and then `undefined`.
 *
 * @param {string} text
 * @returns {string}
 */
export function canonicalizeApiReport(text) {
  return text.split("\n").map(canonicalizeLine).join("\n");
}

/**
 * Compare two report texts after canonicalising both.
 *
 * @param {string} actual
 * @param {string} expected
 * @returns {boolean}
 */
export function apiReportsMatch(actual, expected) {
  return canonicalizeApiReport(actual) === canonicalizeApiReport(expected);
}

function diffLines(expectedLines, actualLines) {
  const n = expectedLines.length;
  const m = actualLines.length;
  const lengths = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      lengths[i][j] =
        expectedLines[i] === actualLines[j]
          ? lengths[i + 1][j + 1] + 1
          : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
    }
  }

  const operations = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (expectedLines[i] === actualLines[j]) {
      operations.push({ type: " ", text: expectedLines[i] });
      i += 1;
      j += 1;
    } else if (lengths[i + 1][j] >= lengths[i][j + 1]) {
      operations.push({ type: "-", text: expectedLines[i] });
      i += 1;
    } else {
      operations.push({ type: "+", text: actualLines[j] });
      j += 1;
    }
  }
  while (i < n) {
    operations.push({ type: "-", text: expectedLines[i] });
    i += 1;
  }
  while (j < m) {
    operations.push({ type: "+", text: actualLines[j] });
    j += 1;
  }
  return operations;
}

/**
 * Build a unified-style diff of two report texts.
 *
 * @param {string} expected
 * @param {string} actual
 * @param {string} expectedLabel
 * @param {string} actualLabel
 * @returns {string}
 */
export function formatApiReportDiff(
  expected,
  actual,
  expectedLabel,
  actualLabel,
) {
  const operations = diffLines(expected.split("\n"), actual.split("\n"));
  const changed = [];
  for (let index = 0; index < operations.length; index += 1) {
    if (operations[index].type !== " ") changed.push(index);
  }
  if (changed.length === 0) return "";

  const ranges = [];
  for (const index of changed) {
    const start = Math.max(0, index - 3);
    const end = Math.min(operations.length, index + 4);
    const previous = ranges.at(-1);
    if (previous && start <= previous.end) {
      previous.end = Math.max(previous.end, end);
    } else {
      ranges.push({ start, end });
    }
  }

  const output = [`--- ${expectedLabel}`, `+++ ${actualLabel}`];
  for (const range of ranges) {
    let oldStart = 1;
    let newStart = 1;
    for (let index = 0; index < range.start; index += 1) {
      if (operations[index].type !== "+") oldStart += 1;
      if (operations[index].type !== "-") newStart += 1;
    }
    let oldCount = 0;
    let newCount = 0;
    for (let index = range.start; index < range.end; index += 1) {
      if (operations[index].type !== "+") oldCount += 1;
      if (operations[index].type !== "-") newCount += 1;
    }
    output.push(
      `@@ -${oldStart},${oldCount} +${newStart},${newCount} @@`,
      ...operations
        .slice(range.start, range.end)
        .map((operation) => `${operation.type}${operation.text}`),
    );
  }
  return output.join("\n");
}

function findPackageJson(startFolder) {
  let folder = startFolder;
  for (;;) {
    const candidate = path.join(folder, "package.json");
    if (existsSync(candidate)) return candidate;
    const parent = path.dirname(folder);
    if (parent === folder) return undefined;
    folder = parent;
  }
}

function prepareConfig(configPath, reportFolderOverride) {
  const configObject = ExtractorConfig.loadFile(configPath);
  const configFolder = path.dirname(configPath);
  if (
    configObject.projectFolder &&
    configObject.projectFolder !== "<lookup>" &&
    !path.isAbsolute(configObject.projectFolder)
  ) {
    configObject.projectFolder = path.resolve(
      configFolder,
      configObject.projectFolder,
    );
  }
  if (reportFolderOverride) {
    configObject.apiReport.reportFolder = reportFolderOverride;
  }
  return ExtractorConfig.prepare({
    configObject,
    configObjectFullPath: configPath,
    packageJsonFullPath: findPackageJson(configFolder),
  });
}

function generateReports(configPath) {
  const baseConfig = prepareConfig(configPath);
  const etcFolder = baseConfig.reportFolder;
  const tempFolder = baseConfig.reportTempFolder;

  // `localBuild: true` keeps the report in `temp/`; pointing `reportFolder` at
  // the same folder stops API Extractor from copying over the `etc/` report
  // before we have canonicalised it.
  const tempConfig = prepareConfig(configPath, tempFolder);
  const result = Extractor.invoke(tempConfig, {
    localBuild: true,
    showDiagnostics: false,
    showVerboseMessages: false,
  });
  if (result.errorCount > 0 || result.warningCount > 0) {
    throw new Error(
      `API Extractor reported ${result.errorCount} error(s) and ${result.warningCount} warning(s) for ${configPath}`,
    );
  }

  return {
    etcFolder,
    reportConfigs: baseConfig.reportConfigs,
    tempFolder,
  };
}

function displayPath(filePath) {
  const relative = path.relative(process.cwd(), filePath);
  return relative.startsWith("..") ? filePath : relative;
}

async function main() {
  const [, , mode, ...args] = process.argv;
  if (mode !== "check" && mode !== "update") {
    console.error(
      "Usage: bun scripts/api-report.mjs <check|update> -c <api-extractor.json> [-c ...]",
    );
    process.exitCode = 1;
    return;
  }

  const configs = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "-c" || arg === "--config") {
      index += 1;
      if (index >= args.length) {
        console.error(`Missing value for ${arg}`);
        process.exitCode = 1;
        return;
      }
      configs.push(args[index]);
    } else if (arg.startsWith("--config=")) {
      configs.push(arg.slice("--config=".length));
    } else {
      console.error(`Unknown argument: ${arg}`);
      process.exitCode = 1;
      return;
    }
  }
  if (configs.length === 0) {
    console.error("At least one API Extractor config is required.");
    process.exitCode = 1;
    return;
  }

  let failed = false;
  for (const config of configs) {
    const configPath = path.resolve(process.cwd(), config);
    const { etcFolder, tempFolder, reportConfigs } =
      generateReports(configPath);

    for (const reportConfig of reportConfigs) {
      const tempPath = path.resolve(tempFolder, reportConfig.fileName);
      const etcPath = path.resolve(etcFolder, reportConfig.fileName);
      const actual = canonicalizeApiReport(await readFile(tempPath, "utf8"));

      if (mode === "update") {
        await mkdir(etcFolder, { recursive: true });
        await writeFile(etcPath, actual, "utf8");
        console.log(`Updated ${displayPath(etcPath)}`);
        continue;
      }

      let expected;
      try {
        expected = await readFile(etcPath, "utf8");
      } catch {
        console.error(`Missing API report: ${displayPath(etcPath)}`);
        failed = true;
        continue;
      }
      const canonicalExpected = canonicalizeApiReport(expected);
      if (actual === canonicalExpected) continue;

      failed = true;
      console.error(
        formatApiReportDiff(
          canonicalExpected,
          actual,
          displayPath(etcPath),
          displayPath(tempPath),
        ),
      );
      console.error(
        `\nAPI report changed: ${displayPath(etcPath)}\nRun \`bun run update:api\` to accept the new report.`,
      );
    }
  }

  if (failed) {
    process.exitCode = 1;
  } else if (mode === "check") {
    console.log("API reports are up to date.");
  }
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
