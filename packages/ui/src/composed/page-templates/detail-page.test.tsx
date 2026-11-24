import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Button } from "../../button.js";
import {
  DetailPage,
  type DetailPageLinkProps,
  DetailPageSection,
} from "./detail-page.js";

afterEach(() => {
  cleanup();
});

function RouterLink({ href, className, children }: DetailPageLinkProps) {
  return (
    <a href={href} className={className} data-router-link="true">
      {children}
    </a>
  );
}

const back = { label: "کالاها", href: "/items" };

describe("DetailPage", () => {
  it("renders the title as the h1", () => {
    render(
      <DetailPage title="برنج هاشمی" back={back}>
        <DetailPageSection title="مشخصات">متن</DetailPageSection>
      </DetailPage>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "برنج هاشمی" }),
    ).toBeTruthy();
  });

  it("renders the back link with href and label as a plain anchor by default", () => {
    render(
      <DetailPage title="برنج هاشمی" back={back}>
        <DetailPageSection title="مشخصات">متن</DetailPageSection>
      </DetailPage>,
    );

    const link = screen.getByRole("link", { name: "کالاها" });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/items");
    expect(link.getAttribute("data-router-link")).toBeNull();
  });

  it("renders the back link through linkComponent when given", () => {
    render(
      <DetailPage title="برنج هاشمی" back={back} linkComponent={RouterLink}>
        <DetailPageSection title="مشخصات">متن</DetailPageSection>
      </DetailPage>,
    );

    const link = screen.getByRole("link", { name: "کالاها" });
    expect(link.getAttribute("href")).toBe("/items");
    expect(link.getAttribute("data-router-link")).toBe("true");
  });

  it("renders the primary action in the header", () => {
    render(
      <DetailPage
        title="برنج هاشمی"
        back={back}
        primaryAction={<Button>ثبت گردش</Button>}
      >
        <DetailPageSection title="مشخصات">متن</DetailPageSection>
      </DetailPage>,
    );

    const action = screen.getByRole("button", { name: "ثبت گردش" });
    const header = action.closest("header");
    expect(header).not.toBeNull();
    expect(header?.contains(screen.getByRole("heading", { level: 1 }))).toBe(
      true,
    );
  });

  it("renders sections as regions named by their h2", () => {
    render(
      <DetailPage title="برنج هاشمی" back={back}>
        <DetailPageSection title="موجودی در انبارها">متن</DetailPageSection>
        <DetailPageSection title="مشخصات">متن</DetailPageSection>
      </DetailPage>,
    );

    expect(
      screen.getByRole("region", { name: "موجودی در انبارها" }),
    ).toBeTruthy();
    expect(screen.getByRole("region", { name: "مشخصات" })).toBeTruthy();
    expect(
      screen.getByRole("heading", { level: 2, name: "مشخصات" }),
    ).toBeTruthy();
  });

  it("renders the destructive section as the last child of the article", () => {
    const { container } = render(
      <DetailPage
        title="برنج هاشمی"
        back={back}
        destructive={{
          title: "حذف کالا",
          children: <Button variant="destructive">حذف کالا</Button>,
        }}
      >
        <DetailPageSection title="بخش اول">متن</DetailPageSection>
        <DetailPageSection title="بخش دوم">متن</DetailPageSection>
        <DetailPageSection title="بخش سوم">متن</DetailPageSection>
        <DetailPageSection title="بخش چهارم">متن</DetailPageSection>
        <DetailPageSection title="بخش پنجم">متن</DetailPageSection>
      </DetailPage>,
    );

    const article = screen.getByRole("article");
    expect(article.lastElementChild).toBe(
      container.querySelector('[data-slot="detail-page-destructive"]'),
    );
    const destructive = screen.getByRole("region", { name: "حذف کالا" });
    expect(destructive.getAttribute("data-slot")).toBe(
      "detail-page-destructive",
    );
    expect(article.lastElementChild).toBe(destructive);
  });

  it("renders a section action in the section header", () => {
    render(
      <DetailPage title="برنج هاشمی" back={back}>
        <DetailPageSection
          title="مشخصات"
          action={<Button variant="ghost">ویرایش</Button>}
        >
          متن
        </DetailPageSection>
      </DetailPage>,
    );

    const section = screen.getByRole("region", { name: "مشخصات" });
    expect(
      within(section).getByRole("button", { name: "ویرایش" }),
    ).toBeTruthy();
  });
});
