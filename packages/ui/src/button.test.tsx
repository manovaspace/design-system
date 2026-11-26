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

  it("touch size is 44 px tall and icon-touch is 44 px square", () => {
    expect(buttonVariants({ size: "touch" })).toContain("h-11");
    expect(buttonVariants({ size: "icon-touch" })).toContain("size-11");
  });

  it("renders size touch with h-11 and data-size", () => {
    render(<Button size="touch">Tap</Button>);
    const button = screen.getByRole("button", { name: "Tap" });
    expect(button.getAttribute("data-size")).toBe("touch");
    expect(button.className).toContain("h-11");
  });

  it("renders size icon-touch with size-11", () => {
    render(
      <Button size="icon-touch" aria-label="Add">
        +
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Add" });
    expect(button.getAttribute("data-size")).toBe("icon-touch");
    expect(button.className).toContain("size-11");
  });

  it("uses M3 neutral disabled tokens (12% container, 38% content) instead of opacity dimming", () => {
    const def = buttonVariants({ variant: "default" });
    expect(def).toContain("disabled:bg-foreground/12");
    expect(def).toContain("disabled:text-foreground/38");
    expect(def).toContain("disabled:border-foreground/12");
    expect(def).toContain("disabled:opacity-100");
    expect(def).toContain("disabled:shadow-none");
    expect(def).not.toContain("disabled:opacity-50");

    const ghost = buttonVariants({ variant: "ghost" });
    expect(ghost).toContain("disabled:bg-transparent");
    expect(ghost).toContain("disabled:border-transparent");
    expect(ghost).toContain("disabled:text-foreground/38");

    const link = buttonVariants({ variant: "link" });
    expect(link).toContain("disabled:bg-transparent");
    expect(link).toContain("disabled:border-transparent");
    expect(link).toContain("disabled:text-foreground/38");

    render(
      <Button disabled variant="default">
        Save
      </Button>,
    );
    const btn = screen.getByRole("button", {
      name: "Save",
    }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    expect(btn.className).toContain("disabled:bg-foreground/12");
    expect(btn.className).toContain("disabled:text-foreground/38");
  });
});
