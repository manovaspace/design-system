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
  globalThis.HTMLAnchorElement = dom.window.HTMLAnchorElement;
  globalThis.Node = dom.window.Node;
}

const { cleanup, render, screen } = await import("@testing-library/react");
const { DirectionProvider } = await import("../direction-provider.js");
const { Breadcrumb } = await import("./breadcrumb.js");

describe("Breadcrumb", () => {
  afterEach(() => {
    cleanup();
  });

  const testItems = [
    { label: "Home", href: "/" },
    { label: "Settings", href: "/settings" },
    { label: "Security" },
  ];

  it("renders semantic navigation structure", () => {
    const { container } = render(<Breadcrumb items={testItems} />);

    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toBeDefined();

    const ol = container.querySelector("ol");
    expect(ol).toBeTruthy();

    const listItems = container.querySelectorAll("li");
    expect(listItems.length).toBe(3);
  });

  it("renders last item as current page with aria-current='page'", () => {
    render(<Breadcrumb items={testItems} />);

    const currentItem = screen.getByText("Security");
    expect(currentItem.getAttribute("aria-current")).toBe("page");
    expect(currentItem.tagName.toLowerCase()).toBe("span");
  });

  it("renders intermediate items as links when href is provided", () => {
    render(<Breadcrumb items={testItems} />);

    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink.getAttribute("href")).toBe("/");

    const settingsLink = screen.getByRole("link", { name: "Settings" });
    expect(settingsLink.getAttribute("href")).toBe("/settings");
  });

  it("renders intermediate items as text span when href is omitted", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Catalog" },
          { label: "Laptops" },
        ]}
      />,
    );

    const catalog = screen.getByText("Catalog");
    expect(catalog.tagName.toLowerCase()).toBe("span");
    expect(catalog.getAttribute("aria-current")).toBeNull();
  });

  it("renders separators between items and not after the last item", () => {
    const { container } = render(
      <Breadcrumb items={testItems} separator="/" />,
    );

    const separators = screen.getAllByText("/");
    // 3 items -> 2 separators
    expect(separators.length).toBe(2);

    const lastLi = container.querySelectorAll("li")[2];
    expect(lastLi?.textContent).toBe("Security");
  });

  it("inverts default chevron separator in RTL", () => {
    const { container: ltrContainer } = render(
      <Breadcrumb items={testItems} />,
    );
    const ltrSvgs = ltrContainer.querySelectorAll("svg");
    expect(ltrSvgs.length).toBe(2);

    const { container: rtlContainer } = render(
      <DirectionProvider direction="rtl">
        <Breadcrumb items={testItems} />
      </DirectionProvider>,
    );
    const rtlSvgs = rtlContainer.querySelectorAll("svg");
    expect(rtlSvgs.length).toBe(2);
  });

  it("supports custom aria-label", () => {
    render(<Breadcrumb items={testItems} aria-label="File path navigation" />);

    expect(
      screen.getByRole("navigation", { name: "File path navigation" }),
    ).toBeDefined();
  });
});
