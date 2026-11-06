import { afterEach, describe, expect, it } from "vitest";

if (typeof document === "undefined" || typeof Element === "undefined") {
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost",
  });
  globalThis.window = dom.window as unknown as Window & typeof globalThis;
  globalThis.document = dom.window.document;
  globalThis.navigator = dom.window.navigator;
  globalThis.Element = dom.window.Element;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.Node = dom.window.Node;
  globalThis.Event = dom.window.Event;
}

const { cleanup, render, screen } = await import("@testing-library/react");
const { Stat } = await import("./stat.js");

describe("Stat", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders label, value, and description with data-slot attributes", () => {
    render(
      <Stat
        label="فروش کل"
        value={1250000}
        description="بر اساس تراکنش‌های تایید شده"
      />,
    );

    const label = screen.getByText("فروش کل");
    expect(label.getAttribute("data-slot")).toBe("stat-label");

    const value = screen.getByText("۱٬۲۵۰٬۰۰۰");
    expect(value.getAttribute("data-slot")).toBe("stat-value");

    const desc = screen.getByText("بر اساس تراکنش‌های تایید شده");
    expect(desc.getAttribute("data-slot")).toBe("stat-description");
  });

  it("renders Latin numbers when locale is English", () => {
    render(<Stat label="Total Revenue" value={1250000} locale="en" />);

    expect(screen.getByText("1,250,000")).toBeDefined();
  });

  it("supports ReactNode for custom value readout", () => {
    render(
      <Stat
        label="موجودی"
        value={<span data-testid="custom-value">۱۰۰ $</span>}
      />,
    );

    expect(screen.getByTestId("custom-value")).toBeDefined();
  });

  it("renders positive delta badge with upward trend indicator", () => {
    render(
      <Stat
        label="کاربران فعال"
        value={5000}
        delta={{ value: 12.5, label: "نسبت به ماه قبل" }}
      />,
    );

    const delta = screen
      .getByText("+۱۲٫۵%")
      .closest("[data-slot='stat-delta']");
    expect(delta).toBeDefined();
    expect(delta?.getAttribute("data-trend")).toBe("up");
    expect(delta?.className).toContain("text-status-success");

    expect(screen.getByText("نسبت به ماه قبل")).toBeDefined();
  });

  it("renders negative delta badge with downward trend indicator", () => {
    render(
      <Stat
        label="افت بازدید"
        value={100}
        delta={{ value: -4.2 }}
        locale="en"
      />,
    );

    const delta = screen.getByText("-4.2%").closest("[data-slot='stat-delta']");
    expect(delta).toBeDefined();
    expect(delta?.getAttribute("data-trend")).toBe("down");
    expect(delta?.className).toContain("text-status-danger");
  });

  it("renders neutral delta when trend is neutral or value is 0", () => {
    render(
      <Stat
        label="نرخ تبدیل"
        value="۳.۲٪"
        delta={{ value: 0, trend: "neutral" }}
      />,
    );

    const delta = screen.getByText("۰%").closest("[data-slot='stat-delta']");
    expect(delta).toBeDefined();
    expect(delta?.getAttribute("data-trend")).toBe("neutral");
    expect(delta?.className).toContain("text-muted-foreground");
  });

  it("renders custom icon in card header", () => {
    render(
      <Stat
        label="سفارش‌ها"
        value={42}
        icon={<span data-testid="test-icon">📦</span>}
      />,
    );

    expect(screen.getByTestId("test-icon")).toBeDefined();
    expect(
      screen.getByTestId("test-icon").closest("[data-slot='stat-icon']"),
    ).toBeDefined();
  });
});
