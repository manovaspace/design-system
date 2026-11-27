import fs from "node:fs";
import path from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AmountInput } from "./composed/amount-input.js";
import { DecimalInput } from "./composed/decimal-input.js";
import { MsisdnInput } from "./composed/msisdn-input.js";
import { PickerTrigger } from "./composed/picker-trigger.js";
import { DirectionProvider } from "./direction-provider.js";
import { CheckIcon, MagnifyingGlassIcon } from "./icons.js";
import { Button } from "./primitives/button.js";
import { Sheet, SheetContent, SheetTitle } from "./primitives/sheet.js";

describe("Phase 5 corner cases", () => {
  it("mirrors directional PickerTrigger chevron in RTL while keeping non-directional icons unflipped", () => {
    const { container } = render(
      <DirectionProvider direction="rtl">
        <div dir="rtl">
          <PickerTrigger
            placeholder="انتخاب"
            icon={<MagnifyingGlassIcon data-testid="search-icon" />}
          />
          <CheckIcon data-testid="check-icon" />
        </div>
      </DirectionProvider>,
    );

    const svgs = container.querySelectorAll("svg");
    const searchIcon = screen.getByTestId("search-icon");
    const checkIcon = screen.getByTestId("check-icon");
    const trailingChevron = Array.from<Element>(svgs).find(
      (svg) => svg !== searchIcon && svg !== checkIcon,
    );

    expect(trailingChevron?.getAttribute("class") ?? "").toContain(
      "-scale-x-100",
    );
    expect(searchIcon.getAttribute("class") ?? "").not.toContain(
      "-scale-x-100",
    );
    expect(checkIcon.getAttribute("class") ?? "").not.toContain("-scale-x-100");
  });

  it("supports logical start/end SheetContent docking", () => {
    render(
      <Sheet open>
        <SheetContent side="end" closeLabel="Close">
          <SheetTitle>Logical End Sheet</SheetTitle>
        </SheetContent>
      </Sheet>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("end-0");
    expect(dialog.className).toContain("border-s");
    expect(dialog.className).not.toContain("right-0");
  });

  it("normalizes Persian input digits to Latin/ASCII state across AmountInput, DecimalInput, and MsisdnInput", () => {
    const onAmountChange = vi.fn();
    const onDecimalChange = vi.fn();
    const onMsisdnChange = vi.fn();

    render(
      <div>
        <AmountInput
          mode="digits"
          value=""
          onValueChange={onAmountChange}
          aria-label="Amount"
        />
        <DecimalInput
          value=""
          onValueChange={onDecimalChange}
          aria-label="Decimal"
        />
        <MsisdnInput
          value=""
          onValueChange={onMsisdnChange}
          locale="fa"
          aria-label="Mobile"
        />
      </div>,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Amount" }), {
      target: { value: "۱۲۳۴۵۰" },
    });
    expect(onAmountChange).toHaveBeenLastCalledWith("123450");

    fireEvent.change(screen.getByRole("textbox", { name: "Decimal" }), {
      target: { value: "۱۲۳۴.۵" },
    });
    expect(onDecimalChange).toHaveBeenLastCalledWith("1234.5");

    fireEvent.change(screen.getByRole("textbox", { name: "Mobile" }), {
      target: { value: "۰۹۱۲۱۱۱۲۲۳۳" },
    });
    expect(onMsisdnChange).toHaveBeenLastCalledWith("09121112233");
  });

  it("enforces touch size classes and base forced-colors / sticky scroll-margin / reduced-motion CSS", () => {
    render(
      <div>
        <Button size="touch">Touch action</Button>
        <Button size="icon-touch" aria-label="Touch icon">
          +
        </Button>
      </div>,
    );

    expect(
      screen.getByRole("button", { name: "Touch action" }).className,
    ).toContain("h-11");
    expect(
      screen.getByRole("button", { name: "Touch icon" }).className,
    ).toContain("size-11");

    const stylesCss = fs.readFileSync(
      path.resolve(import.meta.dirname, "styles.css"),
      "utf8",
    );
    expect(stylesCss).toContain("scroll-margin-block-start:");
    expect(stylesCss).toContain("@media (forced-colors: active)");
    expect(stylesCss).toContain("@media (prefers-reduced-motion: reduce)");
  });
});
