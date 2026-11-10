import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sheet, SheetContent } from "./sheet.js";

describe("SheetContent", () => {
  it("renders default close label", () => {
    render(
      <Sheet open>
        <SheetContent>Content</SheetContent>
      </Sheet>,
    );
    expect(screen.getByRole("button", { name: "Close" })).toBeDefined();
  });

  it("renders custom string close label", () => {
    render(
      <Sheet open>
        <SheetContent closeLabel="Dismiss panel">Content</SheetContent>
      </Sheet>,
    );
    expect(screen.getByRole("button", { name: "Dismiss panel" })).toBeDefined();
  });

  it("renders ReactNode close label", () => {
    render(
      <Sheet open>
        <SheetContent closeLabel={<span>بستن</span>}>Content</SheetContent>
      </Sheet>,
    );
    expect(screen.getByRole("button", { name: "بستن" })).toBeDefined();
  });
});
