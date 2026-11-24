import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SheetActions } from "./sheet-actions.js";

afterEach(() => {
  cleanup();
});

describe("SheetActions", () => {
  it("renders the secondary before the primary in DOM order", () => {
    render(
      <SheetActions
        secondary={{ label: "Cancel", onClick: vi.fn() }}
        primary={{ label: "Save", onClick: vi.fn() }}
      />,
    );

    const secondary = screen.getByRole("button", { name: "Cancel" });
    const primary = screen.getByRole("button", { name: "Save" });
    expect(
      secondary.compareDocumentPosition(primary) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("gives the secondary the secondary variant", () => {
    render(
      <SheetActions
        secondary={{ label: "Cancel", onClick: vi.fn() }}
        primary={{ label: "Save", onClick: vi.fn() }}
      />,
    );

    const secondary = screen.getByRole("button", { name: "Cancel" });
    expect(secondary.getAttribute("data-variant")).toBe("secondary");
    expect(
      screen.getByRole("button", { name: "Save" }).getAttribute("data-variant"),
    ).toBe("default");
  });

  it("disables the pending primary and marks it busy", () => {
    render(
      <SheetActions
        primary={{ label: "Save", onClick: vi.fn(), pending: true }}
      />,
    );

    const primary = screen.getByRole("button", {
      name: "Save",
    }) as HTMLButtonElement;
    expect(primary.disabled).toBe(true);
    expect(primary.getAttribute("aria-busy")).toBe("true");
  });

  it("renders the error in an alert above the buttons", () => {
    render(
      <SheetActions
        secondary={{ label: "Cancel", onClick: vi.fn() }}
        primary={{ label: "Save", onClick: vi.fn() }}
        error="ذخیره نشد. دوباره تلاش کنید."
      />,
    );

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toBe("ذخیره نشد. دوباره تلاش کنید.");
    const primary = screen.getByRole("button", { name: "Save" });
    expect(
      alert.compareDocumentPosition(primary) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("renders a lone primary at full width with no secondary", () => {
    render(<SheetActions primary={{ label: "Save", onClick: vi.fn() }} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(1);
    expect(buttons[0]?.textContent).toBe("Save");
    expect(buttons[0]?.className).toContain("flex-1");
    expect(buttons[0]?.className).not.toContain("flex-[2]");
  });

  it("calls the primary onClick and defaults its type to button", () => {
    const onClick = vi.fn();
    render(<SheetActions primary={{ label: "Save", onClick }} />);

    const primary = screen.getByRole("button", { name: "Save" });
    expect(primary.getAttribute("type")).toBe("button");
    fireEvent.click(primary);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
