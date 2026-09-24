import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  COLLAPSE_CLOSE_DURATION_S,
  COLLAPSE_OPEN_DURATION_S,
  Collapse,
  collapseChevronClassName,
} from "./collapse.js";

describe("Collapse", () => {
  it("renders open and closed states without a runtime animation dependency", () => {
    const closed = renderToStaticMarkup(
      <Collapse open={false}>
        <span>Details</span>
      </Collapse>,
    );
    const open = renderToStaticMarkup(
      <Collapse open>
        <span>Details</span>
      </Collapse>,
    );

    expect(closed).toContain("grid-rows-[0fr]");
    expect(closed).toContain("opacity-0");
    expect(closed).toContain("duration-[240ms]");
    expect(closed).toContain("motion-reduce:transition-none");
    expect(closed).toContain("Details");

    expect(open).toContain("grid-rows-[1fr]");
    expect(open).toContain("opacity-100");
    expect(open).toContain("duration-[320ms]");
    expect(open).toContain("motion-reduce:transition-none");
    expect(open).toContain("Details");
  });

  it("exports matching animation duration constants in seconds", () => {
    expect(COLLAPSE_OPEN_DURATION_S).toBe(0.32);
    expect(COLLAPSE_CLOSE_DURATION_S).toBe(0.24);
  });

  it("produces correct chevron animation classes", () => {
    const openChevron = collapseChevronClassName(true);
    const closedChevron = collapseChevronClassName(false);

    expect(openChevron).toContain("transition-transform");
    expect(openChevron).toContain("duration-[320ms]");
    expect(openChevron).toContain("motion-reduce:transition-none");

    expect(closedChevron).toContain("transition-transform");
    expect(closedChevron).toContain("duration-[240ms]");
    expect(closedChevron).toContain("motion-reduce:transition-none");
  });
});
