import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";

const { cleanup, render, screen } = await import("@testing-library/react");
const { DirectionProvider } = await import("../direction-provider.js");
const { PickerTrigger } = await import("./picker-trigger.js");

afterEach(() => {
  cleanup();
});

describe("PickerTrigger", () => {
  it("renders placeholder with muted text when label is absent", () => {
    render(<PickerTrigger placeholder="انتخاب مشتری" />);

    const button = screen.getByRole("button", { name: "انتخاب مشتری" });
    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("data-slot")).toBe("picker-trigger");

    const labelEl = screen.getByText("انتخاب مشتری");
    expect(labelEl.className).toContain("text-muted-foreground");
  });

  it("renders label instead of placeholder when label is provided", () => {
    render(<PickerTrigger label="شرکت مانوا" placeholder="انتخاب مشتری" />);

    expect(screen.getByText("شرکت مانوا")).toBeDefined();
    expect(screen.queryByText("انتخاب مشتری")).toBeNull();
    expect(screen.getByText("شرکت مانوا").className).not.toContain(
      "text-muted-foreground",
    );
  });

  it("renders optional icon and changeLabel", () => {
    render(
      <PickerTrigger
        icon={<span data-testid="picker-icon">I</span>}
        label="آیتم انتخاب‌شده"
        placeholder="انتخاب"
        changeLabel="تغییر"
      />,
    );

    const icon = screen.getByTestId("picker-icon");
    expect(icon.parentElement?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByText("تغییر")).toBeDefined();
  });

  it("supports default (h-10) and touch (h-11) sizes", () => {
    const { rerender } = render(<PickerTrigger placeholder="Pick" />);
    const button = screen.getByRole("button", { name: "Pick" });
    expect(button.className).toContain("h-10");
    expect(button.className).not.toContain("h-11");

    rerender(<PickerTrigger placeholder="Pick" size="touch" />);
    expect(button.className).toContain("h-11");
    expect(button.className).not.toContain("h-10");
  });

  it("applies disabled and invalid states", () => {
    const { rerender } = render(<PickerTrigger placeholder="Pick" disabled />);
    const button = screen.getByRole("button", {
      name: "Pick",
    }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.className).toContain("opacity-50");
    expect(button.className).toContain("pointer-events-none");

    rerender(<PickerTrigger placeholder="Pick" aria-invalid="true" />);
    expect(button.getAttribute("aria-invalid")).toBe("true");
    expect(button.className).toContain("border-destructive");
  });

  it("forwards ref to HTMLButtonElement", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<PickerTrigger ref={ref} placeholder="Pick" />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.getAttribute("data-slot")).toBe("picker-trigger");
  });

  it("flips chevron only when nearest DirectionProvider is rtl", () => {
    const { container } = render(
      <DirectionProvider direction="rtl">
        <DirectionProvider direction="ltr">
          <PickerTrigger placeholder="LTR inside RTL" />
        </DirectionProvider>
        <PickerTrigger placeholder="RTL" />
      </DirectionProvider>,
    );

    const svgs = container.querySelectorAll("svg");
    expect(svgs).toHaveLength(2);
    expect(svgs[0]?.getAttribute("class") ?? "").not.toContain("-scale-x-100");
    expect(svgs[1]?.getAttribute("class") ?? "").toContain("-scale-x-100");
  });
});
