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
});
