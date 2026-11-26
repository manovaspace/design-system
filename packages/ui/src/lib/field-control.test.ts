import { describe, expect, it } from "vitest";

import { fieldControlVariants, resolveFieldState } from "./field-control.js";

describe("fieldControlVariants", () => {
  it("applies default size, state, and adornment classes", () => {
    const classes = fieldControlVariants();
    expect(classes).toContain("h-10");
    expect(classes).toContain("ps-3");
    expect(classes).toContain("pe-3");
    expect(classes).toContain(
      "rounded-[var(--rounded-field,var(--radius-lg))]",
    );
    expect(classes).toContain("border-solid");
    expect(classes).toContain("border-[length:var(--border-line-field,1px)]");
    expect(classes).toContain("bg-[var(--bg-field,var(--color-card))]");
    expect(classes).toContain("shadow-[shadow:var(--shadow-field)]");
    expect(classes).toContain("focus-visible:border-ring");
    expect(classes).toContain("aria-invalid:border-destructive");
  });

  it("supports touch size", () => {
    const classes = fieldControlVariants({ size: "touch" });
    expect(classes).toContain("h-11");
    expect(classes).not.toContain("h-10");
  });

  it("supports invalid, disabled, and readonly states", () => {
    const invalid = fieldControlVariants({ state: "invalid" });
    expect(invalid).toContain("border-destructive");
    expect(invalid).toContain("focus-visible:border-destructive");

    const disabled = fieldControlVariants({ state: "disabled" });
    expect(disabled).toContain("opacity-50");
    expect(disabled).toContain("pointer-events-none");
    expect(disabled).toContain("cursor-not-allowed");

    const readonly = fieldControlVariants({ state: "readonly" });
    expect(readonly).toContain("bg-muted/50");
    expect(readonly).toContain("text-muted-foreground");
    expect(readonly).toContain("cursor-default");
  });

  it("supports start, end, and both adornments", () => {
    const start = fieldControlVariants({ adornment: "start" });
    expect(start).toContain("ps-9");
    expect(start).toContain("pe-3");

    const end = fieldControlVariants({ adornment: "end" });
    expect(end).toContain("ps-3");
    expect(end).toContain("pe-9");

    const both = fieldControlVariants({ adornment: "both" });
    expect(both).toContain("ps-9");
    expect(both).toContain("pe-9");
  });
});

describe("resolveFieldState", () => {
  it("defaults to 'default' when called with no options or false flags", () => {
    expect(resolveFieldState()).toBe("default");
    expect(resolveFieldState({})).toBe("default");
    expect(
      resolveFieldState({ disabled: false, readOnly: false, invalid: false }),
    ).toBe("default");
  });

  it("enforces priority: disabled > invalid > readOnly > default", () => {
    expect(
      resolveFieldState({ disabled: true, invalid: true, readOnly: true }),
    ).toBe("disabled");
    expect(
      resolveFieldState({ disabled: false, invalid: true, readOnly: true }),
    ).toBe("invalid");
    expect(
      resolveFieldState({ disabled: false, invalid: false, readOnly: true }),
    ).toBe("readonly");
  });
});
