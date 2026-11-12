import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EditFieldSheet } from "./edit-field-sheet.js";

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  title: "Edit Name",
  label: "Full Name",
  value: "Jane Doe",
  requiredMessage: "Name is required",
  saveFailedMessage: "Could not save name",
  onSave: vi.fn().mockResolvedValue(undefined),
  saveLabel: "Save",
  cancelLabel: "Cancel",
  closeLabel: "Close",
};

describe("EditFieldSheet", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("input has maxLength, autoComplete, and is focused on open", () => {
    render(
      <EditFieldSheet {...defaultProps} maxLength={50} autoComplete="name" />,
    );

    const input = screen.getByLabelText(/Full Name/);
    expect(input.getAttribute("maxlength")).toBe("50");
    expect(input.getAttribute("autocomplete")).toBe("name");
    expect(document.activeElement).toBe(input);
  });

  it("Save is disabled when draft equals value", () => {
    render(<EditFieldSheet {...defaultProps} value="Jane Doe" />);

    const saveButton = screen.getByRole("button", { name: "Save" });
    expect(saveButton.hasAttribute("disabled")).toBe(true);

    const input = screen.getByLabelText(/Full Name/);
    fireEvent.change(input, { target: { value: "Jane Smith" } });
    expect(saveButton.hasAttribute("disabled")).toBe(false);
  });

  it("whitespace-only submit shows requiredMessage and does not call onSave", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <EditFieldSheet {...defaultProps} value="Jane Doe" onSave={onSave} />,
    );

    const input = screen.getByLabelText(/Full Name/);
    fireEvent.change(input, { target: { value: "    " } });

    // Submit the form
    const form = input.closest("form");
    expect(form).toBeTruthy();
    if (form) fireEvent.submit(form);

    expect(screen.getByText("Name is required")).toBeTruthy();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("onSave receives '  a   b ' as 'a b'", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <EditFieldSheet {...defaultProps} value="Original" onSave={onSave} />,
    );

    const input = screen.getByLabelText(/Full Name/);
    fireEvent.change(input, { target: { value: "  a   b " } });

    const form = input.closest("form");
    if (form) fireEvent.submit(form);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith("a b");
    });
  });

  it("resolved onSave calls onOpenChange(false)", async () => {
    const onOpenChange = vi.fn();
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <EditFieldSheet
        {...defaultProps}
        onOpenChange={onOpenChange}
        onSave={onSave}
      />,
    );

    const input = screen.getByLabelText(/Full Name/);
    fireEvent.change(input, { target: { value: "Jane Smith" } });

    const form = input.closest("form");
    if (form) fireEvent.submit(form);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith("Jane Smith");
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("rejected onSave keeps the sheet open, shows saveFailedMessage with role='alert', and keeps draft", async () => {
    const onOpenChange = vi.fn();
    const onSave = vi.fn().mockRejectedValue(new Error("Network failure"));

    render(
      <EditFieldSheet
        {...defaultProps}
        onOpenChange={onOpenChange}
        onSave={onSave}
      />,
    );

    const input = screen.getByLabelText(/Full Name/);
    fireEvent.change(input, { target: { value: "Jane Smith" } });

    const form = input.closest("form");
    if (form) fireEvent.submit(form);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith("Jane Smith");
    });

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Could not save name");
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect((input as HTMLInputElement).value).toBe("Jane Smith");
  });
});
