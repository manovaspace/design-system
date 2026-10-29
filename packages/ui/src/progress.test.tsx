import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Progress } from "./primitives/progress.js";

afterEach(cleanup);

const indicatorOf = (container: HTMLElement) =>
  container.querySelector('[data-slot="progress-indicator"]') as HTMLElement;

describe("Progress", () => {
  it("sizes the indicator so it grows from the inline start", () => {
    const { container } = render(<Progress value={40} />);
    const indicator = indicatorOf(container);
    expect(indicator.style.width).toBe("40%");
    // A translate would always fill from the physical left and read backwards
    // in RTL, so the indicator must not be positioned with a transform.
    expect(indicator.style.transform).toBe("");
  });

  it("keeps the same inline-start fill inside an RTL container", () => {
    const { container } = render(
      <div dir="rtl">
        <Progress value={75} />
      </div>,
    );
    expect(indicatorOf(container).style.width).toBe("75%");
  });

  it("clamps values to the 0-100 range", () => {
    const { container, rerender } = render(<Progress value={-20} />);
    expect(indicatorOf(container).style.width).toBe("0%");
    rerender(<Progress value={140} />);
    expect(indicatorOf(container).style.width).toBe("100%");
  });

  it("renders an empty track without a value", () => {
    const { container } = render(<Progress />);
    expect(indicatorOf(container).style.width).toBe("0%");
  });
});
