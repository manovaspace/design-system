import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { PlusIcon } from "../../icons.js";
import {
  ListPage,
  type ListPageFilterChip,
  type ListPageProps,
} from "./list-page.js";

beforeAll(() => {
  if (typeof globalThis.ResizeObserver === "undefined") {
    globalThis.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
});

afterEach(() => {
  cleanup();
});

const SECTION_NAME = "کالاها";

function filtersProps(
  chips: ListPageFilterChip[] = [],
): NonNullable<ListPageProps["filters"]> {
  return {
    label: "فیلترها",
    chips,
    removeChipLabel: "حذف فیلتر",
    sheet: {
      fields: [
        {
          id: "low",
          kind: "toggle",
          label: "فقط کم‌موجودی",
          checked: false,
          onCheckedChange: vi.fn(),
        },
      ],
      closeLabel: "بستن فیلترها",
      backLabel: "بازگشت",
      resetLabel: "پاک کردن",
      onReset: vi.fn(),
      applyLabel: "نمایش نتایج",
      doneLabel: "تمام",
    },
  };
}

function renderPage(overrides: Partial<ListPageProps> = {}) {
  const props: ListPageProps = {
    "aria-label": SECTION_NAME,
    search: {
      id: "items-search",
      label: "جستجوی کالا",
      placeholder: "جستجو در ۱۲ کالا",
      value: "",
      onValueChange: vi.fn(),
      clearLabel: "پاک کردن جستجو",
    },
    children: <div>نتایج</div>,
    ...overrides,
  };
  return render(<ListPage {...props} />);
}

const addAction = {
  label: "افزودن کالا",
  icon: <PlusIcon />,
  onClick: vi.fn(),
};

describe("ListPage", () => {
  it("names the section with aria-label", () => {
    renderPage();

    expect(screen.getByRole("region", { name: SECTION_NAME })).toBeTruthy();
  });

  it("labels the search input with search.label and shows the placeholder", () => {
    renderPage();

    const input = screen.getByRole("textbox", { name: "جستجوی کالا" });
    expect(input.getAttribute("placeholder")).toBe("جستجو در ۱۲ کالا");
  });

  it("renders the sticky toolbar", () => {
    renderPage();

    const input = screen.getByRole("textbox", { name: "جستجوی کالا" });
    expect(input.closest('[data-sticky="true"]')).not.toBeNull();
  });

  it("renders a header add button hidden below lg and a FAB hidden from lg", () => {
    const onClick = vi.fn();
    renderPage({ addAction: { ...addAction, onClick } });

    const buttons = screen.getAllByRole("button", { name: "افزودن کالا" });
    expect(buttons).toHaveLength(2);

    const headerButton = buttons.find((button) =>
      button.classList.contains("lg:inline-flex"),
    );
    const fab = buttons.find(
      (button) => button.getAttribute("data-slot") === "floating-action-button",
    );
    expect(headerButton?.classList.contains("hidden")).toBe(true);
    expect(fab?.classList.contains("lg:hidden")).toBe(true);

    fireEvent.click(headerButton as HTMLElement);
    fireEvent.click(fab as HTMLElement);
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("renders no add controls without addAction", () => {
    const { container } = renderPage();

    expect(screen.queryByRole("button", { name: "افزودن کالا" })).toBeNull();
    expect(
      container.querySelector('[data-slot="floating-action-button"]'),
    ).toBeNull();
  });

  it("opens a filter sheet named by filters.label from the filter button", () => {
    renderPage({ filters: filtersProps() });

    const filterButton = screen.getByRole("button", { name: "فیلترها" });
    expect(filterButton.getAttribute("aria-haspopup")).toBe("dialog");
    fireEvent.click(filterButton);

    expect(screen.getByRole("dialog", { name: "فیلترها" })).toBeTruthy();
  });

  it("renders no chip row when chips is empty", () => {
    renderPage({ filters: filtersProps([]) });

    expect(screen.queryByRole("list", { name: "فیلترها" })).toBeNull();
    expect(
      screen
        .getByRole("button", { name: "فیلترها" })
        .getAttribute("data-active"),
    ).toBeNull();
  });

  it("renders one chip row with a remove button per chip", () => {
    const onRemoveWarehouse = vi.fn();
    const onRemoveLow = vi.fn();
    renderPage({
      filters: filtersProps([
        { id: "warehouse", label: "انبار: مرکزی", onRemove: onRemoveWarehouse },
        { id: "low", label: "فقط کم‌موجودی", onRemove: onRemoveLow },
      ]),
    });

    const rows = screen.getAllByRole("list", { name: "فیلترها" });
    expect(rows).toHaveLength(1);
    const chipButtons = within(rows[0] as HTMLElement).getAllByRole("button");
    expect(chipButtons).toHaveLength(2);

    fireEvent.click(
      screen.getByRole("button", { name: "حذف فیلتر: انبار: مرکزی" }),
    );
    expect(onRemoveWarehouse).toHaveBeenCalledTimes(1);
    expect(onRemoveLow).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "حذف فیلتر: فقط کم‌موجودی" }),
    ).toBeTruthy();
  });

  it("marks the filter button with data-active when chips exist", () => {
    renderPage({
      filters: filtersProps([
        { id: "low", label: "فقط کم‌موجودی", onRemove: vi.fn() },
      ]),
    });

    expect(
      screen
        .getByRole("button", { name: "فیلترها" })
        .getAttribute("data-active"),
    ).toBe("true");
  });

  it("gives chip remove buttons a visible keyboard focus ring", () => {
    renderPage({
      filters: filtersProps([
        { id: "low", label: "فقط کم‌موجودی", onRemove: vi.fn() },
      ]),
    });

    const chip = screen.getByRole("button", {
      name: "حذف فیلتر: فقط کم‌موجودی",
    });
    expect(chip.className).toContain("focus-visible:outline-2");
    expect(chip.className).toContain("focus-visible:outline-offset-2");
    expect(chip.className).toContain("focus-visible:outline-primary");
  });

  it("hides the header row below lg when there is no description", () => {
    renderPage({ addAction });

    const section = screen.getByRole("region", { name: SECTION_NAME });
    expect(section.className).toContain(
      "max-lg:[&>[data-slot=entity-browser-header]]:hidden",
    );
    expect(section.className).toContain(
      "max-lg:pb-[calc(6rem+var(--fab-bottom-offset,0px))]",
    );
  });

  it("keeps the header row visible when there is a description", () => {
    const { container } = renderPage({
      addAction,
      description: "کالاهای انبار مرکزی",
    });

    const section = screen.getByRole("region", { name: SECTION_NAME });
    expect(section.className).not.toContain(
      "max-lg:[&>[data-slot=entity-browser-header]]:hidden",
    );
    expect(
      container.querySelector('[data-slot="entity-browser-header"]'),
    ).not.toBeNull();
    expect(screen.getByText("کالاهای انبار مرکزی")).toBeTruthy();
  });

  it("renders the footer after the children", () => {
    renderPage({
      children: <div data-testid="results">نتایج</div>,
      footer: <div data-testid="footer">صفحه بعد</div>,
    });

    const results = screen.getByTestId("results");
    const footer = screen.getByTestId("footer");
    expect(
      results.compareDocumentPosition(footer) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
