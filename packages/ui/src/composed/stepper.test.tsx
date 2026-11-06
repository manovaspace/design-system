import { afterEach, describe, expect, it, vi } from "vitest";

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
  globalThis.HTMLButtonElement = dom.window.HTMLButtonElement;
  globalThis.Node = dom.window.Node;
}

const { cleanup, fireEvent, render, screen } = await import(
  "@testing-library/react"
);
const { DirectionProvider } = await import("../direction-provider.js");
const { Stepper } = await import("./stepper.js");

describe("Stepper", () => {
  afterEach(() => {
    cleanup();
  });

  const sampleSteps = [
    { label: "Account Info", description: "Create username" },
    { label: "Verification", description: "Verify phone number" },
    {
      label: "Company Profile",
      description: "Optional details",
      optional: true,
    },
    { label: "Done", description: "Review and complete" },
  ];

  it("renders steps with appropriate states based on current index", () => {
    const { container } = render(<Stepper steps={sampleSteps} current={1} />);

    // Step 0 is completed (< 1): should render CheckIcon SVG
    const stepItems = container.querySelectorAll("li");
    expect(stepItems.length).toBe(4);

    expect(stepItems[0]?.querySelector("svg")).toBeTruthy();
    expect(stepItems[0]?.getAttribute("aria-current")).toBeNull();

    // Step 1 is current: should render number "2" and aria-current="step"
    expect(stepItems[1]?.getAttribute("aria-current")).toBe("step");
    expect(stepItems[1]?.textContent).toContain("2");
    expect(stepItems[1]?.querySelector("svg")).toBeNull();

    // Step 2 is pending (> 1): should render number "3" and optional label
    expect(stepItems[2]?.getAttribute("aria-current")).toBeNull();
    expect(stepItems[2]?.textContent).toContain("3");
    expect(stepItems[2]?.textContent).toContain("(Optional)");

    // Step 3 is pending (> 1)
    expect(stepItems[3]?.textContent).toContain("4");
  });

  it("formats step numbers with persianizeDigits for Persian locale", () => {
    const { container } = render(
      <Stepper
        steps={[
          { label: "مرحله اول" },
          { label: "مرحله دوم" },
          { label: "مرحله سوم", optional: true },
        ]}
        current={1}
        locale="fa"
      />,
    );

    const stepItems = container.querySelectorAll("li");
    // Step 1 is current -> Persian digit ۲
    expect(stepItems[1]?.textContent).toContain("۲");
    // Step 2 is pending -> Persian digit ۳ and (اختیاری)
    expect(stepItems[2]?.textContent).toContain("۳");
    expect(stepItems[2]?.textContent).toContain("(اختیاری)");
  });

  it("calls onStepClick when step is clicked in interactive mode", () => {
    const handleStepClick = vi.fn();
    render(
      <Stepper steps={sampleSteps} current={1} onStepClick={handleStepClick} />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Step 1: Account Info/i }),
    );
    expect(handleStepClick).toHaveBeenCalledWith(0);

    fireEvent.click(
      screen.getByRole("button", { name: /Step 3: Company Profile/i }),
    );
    expect(handleStepClick).toHaveBeenCalledWith(2);
  });

  it("renders vertically when orientation='vertical'", () => {
    const { container } = render(
      <Stepper steps={sampleSteps} current={2} orientation="vertical" />,
    );

    const ol = container.querySelector("ol");
    expect(ol?.className).toContain("flex-col");
  });

  it("sets correct connector colors for completed and pending segments", () => {
    const { container } = render(<Stepper steps={sampleSteps} current={2} />);

    const connectors = container.querySelectorAll(
      "[data-slot='stepper-connector']",
    );
    expect(connectors.length).toBe(3);

    // First two connectors correspond to completed transitions (0 -> 1, 1 -> 2)
    expect(connectors[0]?.className).toContain("bg-primary");
    expect(connectors[1]?.className).toContain("bg-primary");

    // Third connector is pending (2 -> 3)
    expect(connectors[2]?.className).toContain("bg-border");
  });

  it("respects RTL direction from DirectionProvider", () => {
    const { container } = render(
      <DirectionProvider direction="rtl">
        <Stepper steps={sampleSteps} current={0} />
      </DirectionProvider>,
    );

    const nav = container.querySelector("nav");
    expect(nav?.getAttribute("dir")).toBe("rtl");
  });
});
