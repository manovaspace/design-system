import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ConfirmDialog } from "./confirm-dialog.js";

describe("ConfirmDialog", () => {
  it("opens from a trigger and confirms the requested action", () => {
    let confirmed = 0;
    render(
      <ConfirmDialog
        trigger={<button type="button">Delete item</button>}
        title="Delete item?"
        description="This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          confirmed += 1;
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete item" }));
    expect(screen.getByRole("alertdialog")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(confirmed).toBe(1);
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("closes without confirming when cancelled", () => {
    let confirmed = 0;
    render(
      <ConfirmDialog
        trigger={<button type="button">Remove</button>}
        title="Remove item?"
        confirmLabel="Remove"
        onConfirm={() => {
          confirmed += 1;
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(confirmed).toBe(0);
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });
});
