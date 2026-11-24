import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { PlusIcon } from "../../icons.js";
import {
  ListPage,
  type ListPageFilterChip,
  type ListPageProps,
  type ListPageSearch,
  type ListPageSort,
  type ListPageSortOption,
} from "./list-page.js";

const reducedMotion = vi.hoisted(() => ({ value: false }));

vi.mock("../../motion/hooks.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../motion/hooks.js")>();
  return { ...actual, useReducedMotion: () => reducedMotion.value };
});

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
  reducedMotion.value = false;
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

function renderPage(
  overrides: Partial<Omit<ListPageProps, "title" | "aria-label">> = {},
) {
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

const TITLE = "کالاهای انبار مرکزی";
const SORT_LABEL = "مرتب‌سازی";
const SORT_OPTIONS: ListPageSortOption[] = [
  { value: "newest", label: "جدیدترین" },
  { value: "oldest", label: "قدیمی‌ترین" },
  { value: "name", label: "نام کالا" },
  { value: "stock", label: "بیشترین موجودی" },
];

function searchProps(): ListPageSearch {
  return {
    id: "titled-items-search",
    label: "جستجوی کالا",
    placeholder: "جستجو در ۱۲ کالا",
    value: "",
    onValueChange: vi.fn(),
    clearLabel: "پاک کردن جستجو",
  };
}

function sortProps(onValueChange = vi.fn()): ListPageSort {
  return {
    label: SORT_LABEL,
    options: SORT_OPTIONS,
    value: "newest",
    onValueChange,
    closeLabel: "بستن",
  };
}

function renderTitled(
  extra: Partial<
    Pick<ListPageProps, "addAction" | "description" | "sort">
  > = {},
) {
  return render(
    <ListPage title={TITLE} search={searchProps()} {...extra}>
      <div>نتایج</div>
    </ListPage>,
  );
}

const HIDE_HEADER_CLASS = "max-lg:[&>[data-slot=entity-browser-header]]:hidden";
const CLEAR_FAB_CLASS =
  "max-lg:pb-[calc(var(--list-page-fab-clearance,6rem)+var(--fab-bottom-offset,0px))]";

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
    expect(section.className).toContain(CLEAR_FAB_CLASS);
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

  it("shows the title as h2 and names the section with it", () => {
    renderTitled({ addAction });

    expect(screen.getByRole("heading", { level: 2, name: TITLE })).toBeTruthy();
    expect(screen.getByRole("region", { name: TITLE })).toBeTruthy();
  });

  it("keeps the add action as a header button at every width when titled", () => {
    const { container } = renderTitled({ addAction });

    const buttons = screen.getAllByRole("button", { name: "افزودن کالا" });
    expect(buttons).toHaveLength(1);
    expect(buttons[0]?.classList.contains("hidden")).toBe(false);
    expect(
      container.querySelector('[data-slot="floating-action-button"]'),
    ).toBeNull();
    expect(screen.getByRole("region", { name: TITLE }).className).not.toContain(
      CLEAR_FAB_CLASS,
    );
  });

  it("does not hide the titled header row below lg, even without description", () => {
    renderTitled();

    const section = screen.getByRole("region", { name: TITLE });
    expect(section.className).not.toContain(HIDE_HEADER_CLASS);
  });

  it("renders no sort button without sort", () => {
    renderPage();

    expect(screen.queryByRole("button", { name: /مرتب/ })).toBeNull();
  });

  it("names the sort button with the current option and applies a choice from the sheet", async () => {
    const onValueChange = vi.fn();
    renderPage({ sort: sortProps(onValueChange) });

    const sortButton = screen.getByRole("button", {
      name: `${SORT_LABEL}: جدیدترین`,
    });
    expect(sortButton.getAttribute("aria-haspopup")).toBe("dialog");
    fireEvent.click(sortButton);

    const dialog = screen.getByRole("dialog", { name: SORT_LABEL });
    expect(
      within(dialog)
        .getByRole("button", { name: "جدیدترین" })
        .getAttribute("aria-current"),
    ).toBe("true");

    fireEvent.click(within(dialog).getByRole("button", { name: "نام کالا" }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("name");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function toPersianDigits(count: number): string {
  return String(count).replace(
    /\d/g,
    (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit,
  );
}

const WAREHOUSE_CHIP: ListPageFilterChip = {
  id: "warehouse",
  label: "انبار: مرکزی",
  onRemove: vi.fn(),
};
const LOW_CHIP: ListPageFilterChip = {
  id: "low",
  label: "فقط کم‌موجودی",
  onRemove: vi.fn(),
};

function openSort(label = `${SORT_LABEL}: جدیدترین`) {
  fireEvent.click(screen.getByRole("button", { name: label }));
  return screen.getByRole("dialog", { name: SORT_LABEL });
}

function ChipHarness() {
  const [ids, setIds] = useState(["warehouse", "low"]);
  const chips = [WAREHOUSE_CHIP, LOW_CHIP]
    .filter((chip) => ids.includes(chip.id))
    .map((chip) => ({
      ...chip,
      onRemove: () =>
        setIds((current) => current.filter((id) => id !== chip.id)),
    }));
  return (
    <ListPage
      aria-label={SECTION_NAME}
      search={searchProps()}
      filters={filtersProps(chips)}
    >
      <div>نتایج</div>
    </ListPage>
  );
}

describe("ListPage experimental props", () => {
  it("shows clear-all as the first chip-row item only with two or more chips", () => {
    const onClear = vi.fn();
    const clearAll = { label: "پاک کردن همه", onClear };
    const { unmount } = renderPage({
      filters: { ...filtersProps([WAREHOUSE_CHIP]), clearAll },
    });
    expect(screen.queryByRole("button", { name: "پاک کردن همه" })).toBeNull();
    unmount();

    renderPage({
      filters: { ...filtersProps([]), clearAll },
    });
    expect(screen.queryByRole("button", { name: "پاک کردن همه" })).toBeNull();
    cleanup();

    renderPage({
      filters: { ...filtersProps([WAREHOUSE_CHIP, LOW_CHIP]), clearAll },
    });
    const list = screen.getByRole("list", { name: "فیلترها" });
    const buttons = within(list).getAllByRole("button");
    expect(buttons[0]?.textContent).toBe("پاک کردن همه");
    fireEvent.click(buttons[0] as HTMLElement);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("sets data-variant and frames the search field and filter and sort buttons when framed", () => {
    const { container } = renderPage({
      variant: "framed",
      filters: filtersProps(),
      sort: sortProps(),
    });

    const root = container.querySelector('[data-slot="list-page"]');
    expect(root?.getAttribute("data-variant")).toBe("framed");

    const searchWrapper = screen
      .getByRole("textbox", { name: "جستجوی کالا" })
      .closest(".rounded-xl");
    expect(searchWrapper?.className).toContain("h-11");
    expect(searchWrapper?.className).toContain("border-border");
    expect(searchWrapper?.className).toContain("bg-card");
    expect(searchWrapper?.className).toContain("focus-within:border-primary");

    for (const button of [
      screen.getByRole("button", { name: "فیلترها" }),
      screen.getByRole("button", { name: `${SORT_LABEL}: جدیدترین` }),
    ]) {
      expect(button.className).toContain("rounded-xl");
      expect(button.className).toContain("border-border");
      expect(button.className).toContain("bg-card");
      expect(button.className).toContain("shadow-none");
    }
  });

  it("defaults data-variant to default with no framed classes", () => {
    const { container } = renderPage({ filters: filtersProps() });

    expect(
      container
        .querySelector('[data-slot="list-page"]')
        ?.getAttribute("data-variant"),
    ).toBe("default");
    expect(
      screen.getByRole("button", { name: "فیلترها" }).className,
    ).not.toContain("bg-card");
  });

  it("shows the formatted active count as an aria-hidden badge", () => {
    const formatCount = vi.fn((count: number) => toPersianDigits(count));
    const { container } = renderPage({
      filters: {
        ...filtersProps([WAREHOUSE_CHIP, LOW_CHIP, { ...LOW_CHIP, id: "x" }]),
        formatCount,
      },
    });

    const badge = container.querySelector(
      '[data-slot="list-page-filter-count"]',
    );
    expect(badge?.textContent).toBe("۳");
    expect(badge?.getAttribute("aria-hidden")).toBe("true");
    expect(formatCount).toHaveBeenCalledWith(3);
    expect(
      screen
        .getByRole("button", { name: "فیلترها" })
        .getAttribute("data-active"),
    ).toBe("true");
  });

  it("hides the badge at zero active filters", () => {
    const { container } = renderPage({ filters: filtersProps([]) });

    expect(
      container.querySelector('[data-slot="list-page-filter-count"]'),
    ).toBeNull();
  });

  it("uses activeCount instead of chips.length for the badge", () => {
    const { container } = renderPage({
      filters: {
        ...filtersProps([WAREHOUSE_CHIP]),
        activeCount: 5,
      },
    });

    expect(
      container.querySelector('[data-slot="list-page-filter-count"]')
        ?.textContent,
    ).toBe("5");
  });

  it("opens the sort sheet with focus on the selected option", async () => {
    renderPage({ sort: { ...sortProps(), value: "name" } });

    const dialog = openSort(`${SORT_LABEL}: نام کالا`);
    const selected = within(dialog).getByRole("button", { name: "نام کالا" });
    await waitFor(() => expect(document.activeElement).toBe(selected));
  });

  it("moves focus with arrow, Home and End keys, wraps, and never changes the value", async () => {
    const onValueChange = vi.fn();
    renderPage({ sort: sortProps(onValueChange) });

    const dialog = openSort();
    const option = (label: string) =>
      within(dialog).getByRole("button", { name: label });
    await waitFor(() =>
      expect(document.activeElement).toBe(option("جدیدترین")),
    );

    const press = (key: string) =>
      fireEvent.keyDown(document.activeElement as HTMLElement, { key });

    press("ArrowDown");
    expect(document.activeElement).toBe(option("قدیمی‌ترین"));
    press("ArrowDown");
    press("ArrowDown");
    expect(document.activeElement).toBe(option("بیشترین موجودی"));
    press("ArrowDown");
    expect(document.activeElement).toBe(option("جدیدترین"));
    press("ArrowUp");
    expect(document.activeElement).toBe(option("بیشترین موجودی"));
    press("Home");
    expect(document.activeElement).toBe(option("جدیدترین"));
    press("End");
    expect(document.activeElement).toBe(option("بیشترین موجودی"));

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("selects a focused option on activation and closes the sheet", async () => {
    const onValueChange = vi.fn();
    renderPage({ sort: sortProps(onValueChange) });

    const dialog = openSort();
    // jsdom does not turn Enter into a click; a native button fires click on Enter.
    fireEvent.click(within(dialog).getByRole("button", { name: "نام کالا" }));

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("name");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("gives exactly one sort option tabIndex 0: the selected one", () => {
    renderPage({ sort: { ...sortProps(), value: "stock" } });

    const dialog = openSort(`${SORT_LABEL}: بیشترین موجودی`);
    const tabIndexes = SORT_OPTIONS.map(
      (option) =>
        within(dialog).getByRole("button", { name: option.label }).tabIndex,
    );
    expect(tabIndexes).toEqual([-1, -1, -1, 0]);
  });

  it("falls back to the first option for tabIndex 0 when no option matches", () => {
    renderPage({ sort: { ...sortProps(), value: "missing" } });

    const dialog = openSort(SORT_LABEL);
    const tabIndexes = SORT_OPTIONS.map(
      (option) =>
        within(dialog).getByRole("button", { name: option.label }).tabIndex,
    );
    expect(tabIndexes).toEqual([0, -1, -1, -1]);
  });

  it("removes an exiting chip from the DOM after its leave animation", async () => {
    render(<ChipHarness />);

    fireEvent.click(
      screen.getByRole("button", { name: "حذف فیلتر: فقط کم‌موجودی" }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "حذف فیلتر: فقط کم‌موجودی" }),
      ).toBeNull(),
    );
    expect(
      screen.getByRole("button", { name: "حذف فیلتر: انبار: مرکزی" }),
    ).toBeTruthy();
  });

  it("removes an exiting chip without a transition under reduced motion", async () => {
    reducedMotion.value = true;
    render(<ChipHarness />);

    fireEvent.click(
      screen.getByRole("button", { name: "حذف فیلتر: فقط کم‌موجودی" }),
    );
    await waitFor(
      () =>
        expect(
          screen.queryByRole("button", { name: "حذف فیلتر: فقط کم‌موجودی" }),
        ).toBeNull(),
      { timeout: 500 },
    );
  });

  it("defaults width to default and inset to page", () => {
    const { container } = renderPage();

    const root = container.querySelector('[data-slot="list-page"]');
    expect(root?.getAttribute("data-width")).toBe("default");
    expect(root?.getAttribute("data-inset")).toBe("page");
    const section = screen.getByRole("region", { name: SECTION_NAME });
    expect(section.className).toContain(
      "pb-[var(--list-page-bottom-padding,1.5rem)]",
    );
    expect(section.className).not.toContain("-mt-[var(--list-page-gutter");
  });

  it("maps width to a max-width class and exposes data-width", () => {
    const { container, unmount } = renderPage({ width: "wide" });
    expect(
      container
        .querySelector('[data-slot="list-page"]')
        ?.getAttribute("data-width"),
    ).toBe("wide");
    const wide = screen.getByRole("region", { name: SECTION_NAME });
    expect(wide.className).toContain("max-w-7xl");
    expect(wide.className).not.toContain("max-w-6xl");
    unmount();

    renderPage({ width: "full" });
    const full = screen.getByRole("region", { name: SECTION_NAME });
    expect(full.className).toContain("max-w-none");
    expect(full.className).not.toContain("max-w-6xl");
  });

  it("uses the shell gutter for inset shell and drops horizontal padding", () => {
    const { container } = renderPage({ inset: "shell" });

    expect(
      container
        .querySelector('[data-slot="list-page"]')
        ?.getAttribute("data-inset"),
    ).toBe("shell");
    const section = screen.getByRole("region", { name: SECTION_NAME });
    expect(section.className).toContain("-mt-[var(--list-page-gutter,1rem)]");
    expect(section.className).toContain("lg:px-0");
    expect(section.className).not.toContain("lg:px-8");
    expect(section.className).toContain(
      "pb-[var(--list-page-bottom-padding,0px)]",
    );
  });

  it("clears the FAB with the fab clearance variable below lg", () => {
    renderPage({
      addAction: { ...addAction },
      inset: "shell",
    });

    const section = screen.getByRole("region", { name: SECTION_NAME });
    expect(section.className).toContain(
      "max-lg:pb-[calc(var(--list-page-fab-clearance,6rem)+var(--fab-bottom-offset,0px))]",
    );
  });

  it("calls filters.onOpenChange with true on open and false on close", () => {
    const onOpenChange = vi.fn();
    renderPage({ filters: { ...filtersProps(), onOpenChange } });

    fireEvent.click(screen.getByRole("button", { name: "فیلترها" }));
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    fireEvent.click(screen.getByRole("button", { name: "بستن فیلترها" }));
    expect(onOpenChange).toHaveBeenCalledTimes(2);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
});
