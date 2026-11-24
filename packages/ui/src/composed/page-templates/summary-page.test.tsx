import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Row } from "../row-list.js";
import { Stat } from "../stat.js";
import { SummaryPage } from "./summary-page.js";

afterEach(() => {
  cleanup();
});

const links = {
  title: "بخش‌ها",
  children: (
    <>
      <Row asChild chevron>
        <a href="/items">کالاها</a>
      </Row>
      <Row asChild chevron>
        <a href="/locations">انبارها</a>
      </Row>
    </>
  ),
};

describe("SummaryPage", () => {
  it("exposes the section with its aria-label as accessible name", () => {
    render(<SummaryPage aria-label="خانه انبار" links={links} />);

    expect(screen.getByRole("region", { name: "خانه انبار" })).toBeTruthy();
  });

  it("renders stats, then attention, then links in DOM order", () => {
    const { container } = render(
      <SummaryPage
        aria-label="خانه انبار"
        stats={<Stat label="کالاها" value="۱۲۸" />}
        attention={{
          title: "نیازمند اقدام",
          emptyMessage: "موردی نیست.",
          children: <Row>شکر سفید</Row>,
        }}
        links={links}
      />,
    );

    const stats = container.querySelector('[data-slot="summary-page-stats"]');
    const attention = screen.getByRole("region", { name: "نیازمند اقدام" });
    const linksRegion = screen.getByRole("region", { name: "بخش‌ها" });
    expect(stats).not.toBeNull();
    if (stats === null) {
      throw new Error("stats grid missing");
    }
    expect(
      stats.compareDocumentPosition(attention) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      attention.compareDocumentPosition(linksRegion) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("names the attention section by its h2", () => {
    render(
      <SummaryPage
        aria-label="خانه انبار"
        attention={{
          title: "نیازمند اقدام",
          emptyMessage: "موردی نیست.",
          children: <Row>شکر سفید</Row>,
        }}
        links={links}
      />,
    );

    const heading = screen.getByRole("heading", {
      level: 2,
      name: "نیازمند اقدام",
    });
    expect(heading).toBeTruthy();
    expect(screen.getByRole("region", { name: "نیازمند اقدام" })).toBeTruthy();
  });

  it("shows emptyMessage and no list when attention is empty", () => {
    render(
      <SummaryPage
        aria-label="خانه انبار"
        attention={{
          title: "نیازمند اقدام",
          emptyMessage: "همه‌چیز مرتب است. موردی برای رسیدگی نیست.",
        }}
        links={links}
      />,
    );

    const attention = screen.getByRole("region", { name: "نیازمند اقدام" });
    expect(
      within(attention).getByText("همه‌چیز مرتب است. موردی برای رسیدگی نیست."),
    ).toBeTruthy();
    expect(within(attention).queryByRole("list")).toBeNull();
  });

  it("renders one listitem per attention row", () => {
    render(
      <SummaryPage
        aria-label="خانه انبار"
        attention={{
          title: "نیازمند اقدام",
          emptyMessage: "موردی نیست.",
          children: (
            <>
              <Row>روغن آفتابگردان</Row>
              <Row>شکر سفید</Row>
              <Row>برنج هاشمی</Row>
            </>
          ),
        }}
        links={links}
      />,
    );

    const attention = screen.getByRole("region", { name: "نیازمند اقدام" });
    expect(within(attention).getByRole("list")).toBeTruthy();
    expect(within(attention).getAllByRole("listitem")).toHaveLength(3);
  });

  it("renders the links as a list of links", () => {
    render(<SummaryPage aria-label="خانه انبار" links={links} />);

    const linksRegion = screen.getByRole("region", { name: "بخش‌ها" });
    expect(within(linksRegion).getByRole("list")).toBeTruthy();
    const items = within(linksRegion).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    const link = within(linksRegion).getByRole("link", { name: "کالاها" });
    expect(link.getAttribute("href")).toBe("/items");
  });

  it("lays stats out in 2 columns, 4 from lg", () => {
    const { container } = render(
      <SummaryPage
        aria-label="خانه انبار"
        stats={
          <>
            <Stat label="کالاها" value="۱۲۸" />
            <Stat label="کم‌موجودی" value="۷" />
          </>
        }
        links={links}
      />,
    );

    const grid = container.querySelector('[data-slot="summary-page-stats"]');
    expect(grid).not.toBeNull();
    expect(grid?.className).toContain("grid-cols-2");
    expect(grid?.className).toContain("lg:grid-cols-4");
  });

  it("renders neither stats nor attention when omitted", () => {
    const { container } = render(
      <SummaryPage aria-label="خانه انبار" links={links} />,
    );

    expect(
      container.querySelector('[data-slot="summary-page-stats"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-slot="summary-page-attention"]'),
    ).toBeNull();
    expect(
      screen
        .getAllByRole("heading", { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual(["بخش‌ها"]);
  });
});
