import { fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { DirectionProvider } from "../direction-provider.js";
import { CardNumber } from "./card-number.js";

const labels = {
  copy: "Copy card number",
  copied: "Card number copied",
};

describe("CardNumber", () => {
  it("renders grouped Persian digits in an LTR data island for static variant", () => {
    const html = renderToStaticMarkup(
      <DirectionProvider direction="rtl">
        <CardNumber
          cardNumber="6037991234567890"
          labels={labels}
          variant="static"
        />
      </DirectionProvider>,
    );

    expect(html).toContain('dir="ltr"');
    for (const group of ["۶۰۳۷", "۹۹۱۲", "۳۴۵۶", "۷۸۹۰"]) {
      expect(html).toContain(group);
    }
    expect(html).not.toContain("6037991234567890");
  });

  it("renders a copy button with an accessible label", () => {
    const html = renderToStaticMarkup(
      <CardNumber cardNumber="6037991234567890" labels={labels} />,
    );

    expect(html).toContain('aria-label="Copy card number"');
    for (const group of ["۶۰۳۷", "۹۹۱۲", "۳۴۵۶", "۷۸۹۰"]) {
      expect(html).toContain(group);
    }
  });

  it("renders an em dash for invalid card numbers", () => {
    const html = renderToStaticMarkup(
      <CardNumber cardNumber="invalid" labels={labels} />,
    );

    expect(html).toContain("—");
  });

  it("copies card number on click and updates aria-label", () => {
    const execCommandMock = vi.fn().mockImplementation((cmd: string) => {
      if (cmd === "copy") {
        document.dispatchEvent(new Event("copy"));
        return true;
      }
      return false;
    });
    document.execCommand = execCommandMock;

    render(
      <CardNumber
        cardNumber="6037991234567890"
        labels={labels}
        variant="copy"
      />,
    );

    const button = screen.getByRole("button", { name: labels.copy });
    fireEvent.click(button);
    expect(execCommandMock).toHaveBeenCalledWith("copy");
    expect(button.getAttribute("aria-label")).toBe(labels.copied);
  });

  it("respects stopPropagation prop on click and pointer down", () => {
    const outerClick = vi.fn();
    const outerPointerDown = vi.fn();

    render(
      // biome-ignore lint/a11y/noStaticElementInteractions: testing event propagation
      // biome-ignore lint/a11y/useKeyWithClickEvents: testing click propagation
      <div onClick={outerClick} onPointerDown={outerPointerDown}>
        <CardNumber
          cardNumber="6037991234567890"
          labels={labels}
          stopPropagation
        />
      </div>,
    );

    const button = screen.getByRole("button", { name: labels.copy });
    fireEvent.pointerDown(button);
    expect(outerPointerDown).not.toHaveBeenCalled();

    fireEvent.click(button);
    expect(outerClick).not.toHaveBeenCalled();
  });

  it("supports custom icon and showIcon visibility options", () => {
    const { container, rerender } = render(
      <CardNumber
        cardNumber="6037991234567890"
        labels={labels}
        showIcon="never"
      />,
    );

    expect(container.querySelector("svg")).toBeNull();

    rerender(
      <CardNumber
        cardNumber="6037991234567890"
        labels={labels}
        icon={<span data-testid="custom-card-icon">icon</span>}
      />,
    );

    expect(screen.getByTestId("custom-card-icon")).toBeDefined();
  });
});
