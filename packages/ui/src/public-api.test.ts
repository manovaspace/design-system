import { describe, expect, it } from "vitest";

import {
  entityColEssential,
  entityColExtended,
  entityColStandard,
} from "./index.js";

describe("public package API", () => {
  it("exports the entity table column priority helpers from the package root", () => {
    expect(entityColEssential).toBe("");
    expect(entityColStandard).toBe("hidden lg:table-cell");
    expect(entityColExtended).toBe("hidden xl:table-cell");
  });
});
