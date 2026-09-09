import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DataValue, FieldMessage, PhoneNumber } from "./index.js";

describe("locale-aware composed values", () => {
  it("renders grouped Persian digits while keeping numeric direction stable", () => {
    render(<DataValue value={1234567.89} locale="fa-IR" />);

    const value = screen.getByText("۱٬۲۳۴٬۵۶۷٫۸۹");
    expect(value.getAttribute("dir")).toBe("ltr");
    expect(value.className).toContain("font-[family-name:var(--font-data)]");
  });

  it("renders phone values as display text without changing the canonical value", () => {
    render(<PhoneNumber value="۰۹۱۲۱۲۳۴۵۶۷" locale="fa-IR" />);

    expect(screen.getByText("۰۹۱۲۱۲۳۴۵۶۷").getAttribute("dir")).toBe("ltr");
  });

  it("exposes field feedback with an appropriate live-region role", () => {
    render(<FieldMessage variant="error">Invalid amount</FieldMessage>);

    expect(screen.getByRole("alert").textContent).toBe("Invalid amount");
  });

  it("renders with unit suffix and prefix correctly", () => {
    render(
      <DataValue value={15.5} unit="kg" unitPosition="suffix" locale="en-US" />,
    );
    expect(screen.getByText("kg")).toBeDefined();
    expect(screen.getByText("15.5")).toBeDefined();

    render(
      <DataValue value={1000} unit="$" unitPosition="prefix" locale="en-US" />,
    );
    expect(screen.getByText("$")).toBeDefined();
  });
});
