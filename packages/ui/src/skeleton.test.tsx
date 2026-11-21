import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "./skeleton.js";

describe("Skeleton", () => {
  it("renders a neutral muted surface by default, not the accent", () => {
    const { container } = render(<Skeleton />);
    const element = container.querySelector('[data-slot="skeleton"]');
    expect(element).not.toBeNull();
    expect(element?.classList.contains("bg-muted")).toBe(true);
    expect(element?.classList.contains("bg-accent")).toBe(false);
  });
});
