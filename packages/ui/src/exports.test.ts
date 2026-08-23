import { describe, expect, it } from "vitest";
import * as UI from "./index.js";
import * as Motion from "./motion/index.js";

describe("@manovaspace/ui exports", () => {
  it("exports framer motion primitives", () => {
    expect(UI.motion).toBeDefined();
    expect(UI.AnimatePresence).toBeDefined();
    expect(UI.useScroll).toBeDefined();
    expect(UI.useTransform).toBeDefined();
    expect(Motion.motion).toBeDefined();
    expect(Motion.AnimatePresence).toBeDefined();
  });

  it("exports required Lucide icons natively", () => {
    expect(UI.Search).toBeDefined();
    expect(UI.Menu).toBeDefined();
    expect(UI.Star).toBeDefined();
    expect(UI.Trash2).toBeDefined();
    expect(UI.RotateCcw).toBeDefined();
  });

  it("exports composed UI primitives", () => {
    expect(UI.DataValue).toBeDefined();
    expect(UI.FieldMessage).toBeDefined();
    expect(UI.FieldGroup).toBeDefined();
    expect(UI.PhoneNumber).toBeDefined();
    expect(UI.SiteHost).toBeDefined();
    expect(UI.CopyableMoney).toBeDefined();
    expect(UI.HintTooltip).toBeDefined();
    expect(UI.DropdownMenu).toBeDefined();
  });
});
