import { describe, expect, test } from "bun:test";

import {
  apiReportsMatch,
  canonicalizeApiReport,
  formatApiReportDiff,
} from "./api-report.mjs";

describe("canonicalizeApiReport", () => {
  test("canonicalises the same union written in two orders", () => {
    const first =
      'export interface ButtonProps {\n    size?: "sm" | "lg" | "md" | null | undefined;\n}\n';
    const second =
      'export interface ButtonProps {\n    size?: "sm" | "md" | "lg" | null | undefined;\n}\n';

    expect(canonicalizeApiReport(first)).toBe(canonicalizeApiReport(second));
  });

  test("leaves a union with a non-literal member untouched", () => {
    const report =
      'export interface SwitchProps {\n    showIcon?: boolean | "always" | "hover" | "never";\n}\n';

    expect(canonicalizeApiReport(report)).toBe(report);
  });

  test("canonicalises nested unions inside a generic and an object type", () => {
    const report =
      'export type Examples = Record<"b" | "a", { size?: "z" | "y" | null; tone: "muted" | "destructive" | undefined }>;\n';

    expect(canonicalizeApiReport(report)).toBe(
      'export type Examples = Record<"a" | "b", { size?: "y" | "z" | null; tone: "destructive" | "muted" | undefined }>;\n',
    );
  });

  test("sorts literals by code unit, then null, then undefined", () => {
    const report = 'export type Value = "b" | undefined | "a" | null | "aa";\n';

    expect(canonicalizeApiReport(report)).toBe(
      'export type Value = "a" | "aa" | "b" | null | undefined;\n',
    );
  });
});

describe("apiReportsMatch", () => {
  test("accepts a reordered union", () => {
    expect(
      apiReportsMatch(
        'export type Size = "sm" | "md" | "lg";\n',
        'export type Size = "sm" | "lg" | "md";\n',
      ),
    ).toBe(true);
  });

  test("rejects a real API change such as an added property", () => {
    const before =
      'export interface ButtonProps {\n    size?: "sm" | "md";\n}\n';
    const after =
      'export interface ButtonProps {\n    size?: "sm" | "md";\n    tone?: "muted" | "destructive";\n}\n';

    expect(apiReportsMatch(after, before)).toBe(false);
    expect(
      formatApiReportDiff(before, after, "etc/ui.api.md", "temp/ui.api.md"),
    ).toContain("+    tone?:");
  });
});
