import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { DataValue } from "./data-value";
import { DirectionProvider } from "../direction-provider";

describe("DataValue component", () => {
  it("renders with mnv-data and gst-data CSS classes", () => {
    const html = renderToString(
      <DirectionProvider direction="rtl">
        <DataValue>۱۲,۳۴۵</DataValue>
      </DirectionProvider>,
    );
    expect(html).toContain("mnv-data");
    expect(html).toContain("gst-data");
    expect(html).toContain("۱۲");
    expect(html).toContain("۳۴۵");
  });

  it("renders tabular variant", () => {
    const html = renderToString(
      <DirectionProvider direction="rtl">
        <DataValue tabular>۰۹۱۲۳۴۵۶۷۸۹</DataValue>
      </DirectionProvider>,
    );
    expect(html).toContain("mnv-data--tabular");
  });
});
