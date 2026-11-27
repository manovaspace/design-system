import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  buildDtcgDefaultDocument,
  dtcgDocumentToLegacyScales,
} from "./dtcg-document.js";
import type { DtcgDocument } from "./types.js";

const defaultJsonPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "default.json",
);

describe("src/default.json drift", () => {
  it("deep-equals buildDtcgDefaultDocument for the legacy scales it carries", () => {
    const committed = JSON.parse(
      readFileSync(defaultJsonPath, "utf8"),
    ) as DtcgDocument;
    const rebuilt = buildDtcgDefaultDocument(
      dtcgDocumentToLegacyScales(committed),
    );
    expect(rebuilt).toEqual(committed);
  });
});
