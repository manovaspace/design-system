import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MenuMorphGlyph } from "./menu-morph-glyph.js";

describe("MenuMorphGlyph", () => {
  it("uses CSS state classes for the open icon", () => {
    const html = renderToStaticMarkup(<MenuMorphGlyph open />);

    expect(html.match(/<line/g)).toHaveLength(3);
    expect(html).toContain("rotate-45");
    expect(html).toContain("opacity-0");
    expect(html).toContain("-rotate-45");
    expect(html).toContain("motion-reduce:transition-none");
  });

  it("uses CSS state classes for the closed icon", () => {
    const html = renderToStaticMarkup(<MenuMorphGlyph open={false} />);

    expect(html.match(/<line/g)).toHaveLength(3);
    expect(html).toContain("opacity-100");
    expect(html).not.toContain("rotate-45");
    expect(html).not.toContain("-rotate-45");
    expect(html).toContain("motion-reduce:transition-none");
  });

  it("applies custom className to svg element", () => {
    const html = renderToStaticMarkup(
      <MenuMorphGlyph
        open={false}
        className="custom-test-glyph text-primary"
      />,
    );

    expect(html).toContain("custom-test-glyph");
    expect(html).toContain("text-primary");
  });
});
