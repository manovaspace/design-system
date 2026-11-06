import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button, buttonVariants } from "./button.js";

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

  it("supports brand variant with brand tokens and shadows", () => {
    const classes = buttonVariants({ variant: "brand" });
    expect(classes).toContain("bg-[var(--color-brand)]");
    expect(classes).toContain("text-[var(--color-brand-foreground)]");
    expect(classes).toContain("hover:bg-[var(--color-brand)]/90");
    expect(classes).toContain("shadow-[var(--shadow-control)]");
    expect(classes).toContain("active:shadow-[var(--shadow-press)]");
  });

  it("includes active press scale styling in base button classes", () => {
    const classes = buttonVariants();
    expect(classes).toContain("active:[transform:var(--press)]");
  });

  it("renders with brand variant", () => {
    render(<Button variant="brand">Action</Button>);
    const button = screen.getByRole("button", { name: "Action" });
    expect(button.getAttribute("data-variant")).toBe("brand");
    expect(button.className).toContain("bg-[var(--color-brand)]");
  });
});
