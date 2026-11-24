import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FormSheet, type FormSheetProps } from "./form-sheet.js";

afterEach(() => {
  cleanup();
});

const title = "افزودن کالا";

function renderSheet(overrides: Partial<FormSheetProps> = {}) {
  const props: FormSheetProps = {
    open: true,
    onOpenChange: vi.fn(),
    title,
    closeLabel: "بستن",
    primaryAction: { label: "افزودن کالا", type: "submit", form: "item-form" },
    secondaryAction: { label: "انصراف" },
    children: (
      <form id="item-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          نام کالا
          <input name="name" />
        </label>
      </form>
    ),
    ...overrides,
  };
  const view = render(<FormSheet {...props} />);
  return { ...view, props };
}

function contentElement() {
  return document.querySelector('[data-slot="form-sheet"]') as HTMLElement;
}

describe("FormSheet", () => {
  it("names the dialog with the title", () => {
    renderSheet();
    expect(screen.getByRole("dialog", { name: title })).toBeTruthy();
  });

  it("labels the close button and requests a close from it", () => {
    const { props } = renderSheet();
    fireEvent.click(screen.getByRole("button", { name: "بستن" }));
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("requests a close on Escape", () => {
    const { props } = renderSheet();
    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: "Escape",
    });
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders the secondary before the primary in the footer", () => {
    renderSheet();
    const secondary = screen.getByRole("button", { name: "انصراف" });
    const primary = screen.getByRole("button", { name: "افزودن کالا" });
    expect(
      secondary.compareDocumentPosition(primary) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("closes from the secondary when it has no onClick", () => {
    const { props } = renderSheet();
    fireEvent.click(screen.getByRole("button", { name: "انصراف" }));
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls the secondary onClick instead of closing when it has one", () => {
    const onClick = vi.fn();
    const { props } = renderSheet({
      secondaryAction: { label: "انصراف", onClick },
    });
    fireEvent.click(screen.getByRole("button", { name: "انصراف" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(props.onOpenChange).not.toHaveBeenCalled();
  });

  it("ignores close requests while the primary action is pending", () => {
    const { props } = renderSheet({
      primaryAction: {
        label: "افزودن کالا",
        type: "submit",
        form: "item-form",
        pending: true,
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "بستن" }));
    fireEvent.click(screen.getByRole("button", { name: "انصراف" }));
    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: "Escape",
    });
    expect(props.onOpenChange).not.toHaveBeenCalled();
  });

  it("gives the submit button type submit and the form id", () => {
    renderSheet();
    const primary = screen.getByRole("button", { name: "افزودن کالا" });
    expect(primary.getAttribute("type")).toBe("submit");
    expect(primary.getAttribute("form")).toBe("item-form");
  });

  it("uses the description as the accessible description", () => {
    renderSheet({ description: "کالای تازه به انبار اضافه می‌شود." });
    const dialog = screen.getByRole("dialog", { name: title });
    const describedBy = dialog.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy ?? "")?.textContent).toBe(
      "کالای تازه به انبار اضافه می‌شود.",
    );
  });

  it("has no accessible description without a description prop", () => {
    renderSheet();
    const dialog = screen.getByRole("dialog", { name: title });
    expect(dialog.getAttribute("aria-describedby")).toBeNull();
  });

  it("renders the error in an alert", () => {
    renderSheet({ error: "ذخیره نشد. دوباره تلاش کنید." });
    expect(screen.getByRole("alert").textContent).toBe(
      "ذخیره نشد. دوباره تلاش کنید.",
    );
  });

  it("sets the full-screen classes on the content below md", () => {
    renderSheet();
    const content = contentElement();
    expect(content).toBeTruthy();
    expect(content.className).toContain("h-dvh");
    expect(content.className).toContain("w-full");
    expect(content.className).toContain("rounded-none");
    expect(content.className).toContain("max-md:pb-");
    expect(content.className).toContain("md:h-auto");
  });

  it("keeps the children in a scrolling body", () => {
    renderSheet();
    const field = screen.getByRole("textbox");
    const body = field.closest(".overflow-y-auto") as HTMLElement | null;
    expect(body).toBeTruthy();
    expect(body?.className).toContain("min-h-0");
    expect(body?.className).toContain("flex-1");
  });

  it("does not render a sheet when closed", () => {
    renderSheet({ open: false });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
