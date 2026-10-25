import { describe, expect, it } from "vitest";
import { buttonVariants } from "./primitives/button.js";

describe("buttonVariants", () => {
  it("supports solid variant with border, background, and hover", () => {
    const classes = buttonVariants({ variant: "solid" });
    expect(classes).toContain("bg-secondary");
    expect(classes).toContain("text-secondary-foreground");
    expect(classes).toContain("border-border");
    expect(classes).toContain("hover:bg-secondary-hover");
  });

  it("supports secondary variant with border and background", () => {
    const classes = buttonVariants({ variant: "secondary" });
    expect(classes).toContain("bg-secondary");
    expect(classes).toContain("border-border");
  });

  it("supports default variant as primary solid", () => {
    const classes = buttonVariants({ variant: "default" });
    expect(classes).toContain("bg-primary");
    expect(classes).toContain("text-primary-foreground");
    expect(classes).toContain("hover:bg-primary-hover");
  });
});
