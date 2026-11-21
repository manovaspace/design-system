import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import {
  FilterSheet,
  type FilterSheetField,
  type FilterSheetProps,
} from "./filter-sheet.js";

beforeAll(() => {
  if (typeof globalThis.ResizeObserver === "undefined") {
    globalThis.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
});

const cities = [
  { value: "tehran", label: "Tehran" },
  { value: "mashhad", label: "Mashhad" },
  { value: "shiraz", label: "Shiraz", description: "Fars province" },
];

function baseProps(
  overrides: Partial<FilterSheetProps> = {},
): FilterSheetProps {
  return {
    open: true,
    onOpenChange: vi.fn(),
    title: "Filters",
    closeLabel: "Close filters",
    backLabel: "Back",
    fields: [],
    resetLabel: "Reset",
    onReset: vi.fn(),
    applyLabel: "Show results",
    doneLabel: "Done",
    ...overrides,
  };
}

function renderSheet(
  fields: FilterSheetField[],
  overrides: Partial<FilterSheetProps> = {},
) {
  const props = baseProps({ fields, ...overrides });
  const utils = render(<FilterSheet {...props} />);
  return { ...utils, props };
}

function citySingle(
  overrides: Partial<Extract<FilterSheetField, { kind: "single" }>> = {},
): FilterSheetField {
  return {
    id: "city",
    kind: "single",
    label: "City",
    options: cities,
    value: null,
    onValueChange: vi.fn(),
    allLabel: "All cities",
    ...overrides,
  } as FilterSheetField;
}

describe("FilterSheet", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("lists every row on the list view with the title and footer", () => {
    renderSheet([
      {
        id: "free",
        kind: "toggle",
        label: "Free shipping",
        checked: false,
        onCheckedChange: vi.fn(),
      },
      citySingle(),
      {
        id: "tags",
        kind: "multi",
        label: "Tags",
        options: [{ value: "new", label: "New" }],
        values: [],
        onValuesChange: vi.fn(),
      },
      { id: "sort", kind: "link", label: "Sort", onPress: vi.fn() },
      {
        id: "range",
        kind: "page",
        label: "Range",
        active: false,
        children: null,
      },
    ]);

    expect(screen.getByRole("heading", { name: "Filters" })).toBeTruthy();
    expect(screen.getByRole("switch", { name: "Free shipping" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "City" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Tags" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Sort" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Range" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Close filters" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reset" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Show results" })).toBeTruthy();
  });

  it("flips a toggle row through its label and through its switch", () => {
    const onCheckedChange = vi.fn();
    renderSheet([
      {
        id: "free",
        kind: "toggle",
        label: "Free shipping",
        checked: false,
        onCheckedChange,
      },
    ]);

    fireEvent.click(screen.getByText("Free shipping"));
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);

    fireEvent.click(screen.getByRole("switch", { name: "Free shipping" }));
    expect(onCheckedChange).toHaveBeenCalledTimes(2);
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
  });

  it("opens a single sub-page with the field label as heading and a back button", () => {
    renderSheet([citySingle()]);

    fireEvent.click(screen.getByRole("button", { name: "City" }));

    expect(screen.getByRole("heading", { name: "City" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Back" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "All cities" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Shiraz/ })).toBeTruthy();
  });

  it("selecting an option calls onValueChange and returns to the list", () => {
    const onValueChange = vi.fn();
    renderSheet([citySingle({ onValueChange })]);

    fireEvent.click(screen.getByRole("button", { name: "City" }));
    fireEvent.click(screen.getByRole("button", { name: "Mashhad" }));

    expect(onValueChange).toHaveBeenCalledWith("mashhad");
    expect(screen.getByRole("heading", { name: "Filters" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Back" })).toBeNull();
  });

  it("the allLabel row picks null", () => {
    const onValueChange = vi.fn();
    renderSheet([citySingle({ value: "tehran", onValueChange })], {});

    fireEvent.click(screen.getByRole("button", { name: /Tehran/ }));
    fireEvent.click(screen.getByRole("button", { name: "All cities" }));

    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(screen.getByRole("heading", { name: "Filters" })).toBeTruthy();
  });

  it("omits the no-value row when allLabel is not given", () => {
    renderSheet([citySingle({ allLabel: undefined })]);

    fireEvent.click(screen.getByRole("button", { name: "City" }));

    expect(screen.queryByRole("button", { name: "All cities" })).toBeNull();
    expect(screen.getByRole("button", { name: "Mashhad" })).toBeTruthy();
  });

  it("a multi sub-page stays open and appends or removes values", () => {
    const onValuesChange = vi.fn();
    renderSheet([
      {
        id: "tags",
        kind: "multi",
        label: "Tags",
        options: [
          { value: "new", label: "New" },
          { value: "sale", label: "Sale" },
        ],
        values: ["sale"],
        onValuesChange,
      },
    ]);

    fireEvent.click(screen.getByRole("button", { name: /Tags/ }));
    fireEvent.click(screen.getByRole("button", { name: "New" }));
    expect(onValuesChange).toHaveBeenLastCalledWith(["sale", "new"]);
    expect(screen.getByRole("heading", { name: "Tags" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Sale" }));
    expect(onValuesChange).toHaveBeenLastCalledWith([]);
    expect(screen.getByRole("heading", { name: "Tags" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Sale" }).getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("shows the selected label as the summary when a single field is active", () => {
    renderSheet([citySingle({ value: "shiraz" })]);

    const row = screen.getByRole("button", { name: /City/ });
    expect(within(row).getByText("Shiraz")).toBeTruthy();
  });

  it("joins multi selections into the summary", () => {
    renderSheet([
      {
        id: "city",
        kind: "multi",
        label: "City",
        options: cities,
        values: ["tehran", "shiraz"],
        onValuesChange: vi.fn(),
      },
    ]);

    expect(screen.getByText("Tehran, Shiraz")).toBeTruthy();
  });

  it("client-side search filters options on the label", () => {
    renderSheet([citySingle({ search: { placeholder: "Search city" } })]);

    fireEvent.click(screen.getByRole("button", { name: "City" }));
    fireEvent.change(screen.getByRole("searchbox", { name: "Search city" }), {
      target: { value: "mash" },
    });

    expect(screen.getByRole("button", { name: "Mashhad" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Tehran" })).toBeNull();
    expect(screen.getByRole("button", { name: "All cities" })).toBeTruthy();
  });

  it("client-side search folds Persian letters and digits", () => {
    renderSheet([
      citySingle({
        options: [
          { value: "ali", label: "علی‌آباد" },
          { value: "uro", label: "ارومیه ۱۲" },
          { value: "tehran", label: "Tehran" },
        ],
        search: { placeholder: "Search city" },
      }),
    ]);

    fireEvent.click(screen.getByRole("button", { name: "City" }));
    const input = screen.getByRole("searchbox", { name: "Search city" });

    fireEvent.change(input, { target: { value: "علي اباد" } });
    expect(screen.getByRole("button", { name: "علی‌آباد" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Tehran" })).toBeNull();

    fireEvent.change(input, { target: { value: "۱۲" } });
    expect(screen.getByRole("button", { name: /ارومیه/ })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "علی‌آباد" })).toBeNull();
  });

  it("server-side search calls onValueChange and does not filter the options", () => {
    const onQueryChange = vi.fn();
    renderSheet([
      citySingle({
        search: {
          placeholder: "Search city",
          value: "",
          onValueChange: onQueryChange,
        },
      }),
    ]);

    fireEvent.click(screen.getByRole("button", { name: "City" }));
    fireEvent.change(screen.getByRole("searchbox", { name: "Search city" }), {
      target: { value: "tehr" },
    });

    expect(onQueryChange).toHaveBeenCalledWith("tehr");
    expect(screen.getByRole("button", { name: "Mashhad" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Tehran" })).toBeTruthy();
  });

  it("reset calls onReset and is disabled with resetDisabled", () => {
    const onReset = vi.fn();
    const { unmount } = renderSheet([citySingle()], { onReset });

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(onReset).toHaveBeenCalledTimes(1);
    unmount();

    renderSheet([citySingle()], { onReset, resetDisabled: true });
    const reset = screen.getByRole("button", { name: "Reset" });
    expect(reset.hasAttribute("disabled")).toBe(true);
    fireEvent.click(reset);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("apply calls onOpenChange(false)", () => {
    const onOpenChange = vi.fn();
    renderSheet([citySingle()], { onOpenChange });

    fireEvent.click(screen.getByRole("button", { name: "Show results" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("the close button on the list calls onOpenChange(false)", () => {
    const onOpenChange = vi.fn();
    renderSheet([citySingle()], { onOpenChange });

    fireEvent.click(screen.getByRole("button", { name: "Close filters" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("Escape in a sub-page returns to the list and keeps the sheet open", () => {
    const onOpenChange = vi.fn();
    renderSheet([citySingle()], { onOpenChange });

    fireEvent.click(screen.getByRole("button", { name: "City" }));
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    expect(screen.getByRole("heading", { name: "Filters" })).toBeTruthy();
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("a link row calls onPress and opens no sub-page", () => {
    const onPress = vi.fn();
    renderSheet([{ id: "sort", kind: "link", label: "Sort", onPress }]);

    fireEvent.click(screen.getByRole("button", { name: "Sort" }));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { name: "Filters" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Back" })).toBeNull();
  });

  it("a page row renders its children in the sub-page", () => {
    renderSheet([
      {
        id: "range",
        kind: "page",
        label: "Price range",
        active: false,
        children: <p>Custom range body</p>,
      },
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Price range" }));

    expect(screen.getByText("Custom range body")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Price range" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.getByRole("heading", { name: "Filters" })).toBeTruthy();
  });

  it("status replaces the option list and after renders below it", () => {
    renderSheet([
      citySingle({
        status: <p>Loading cities</p>,
        after: <p>Cities are updated daily</p>,
      }),
    ]);

    fireEvent.click(screen.getByRole("button", { name: "City" }));

    expect(screen.getByText("Loading cities")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Tehran" })).toBeNull();
    expect(screen.queryByRole("button", { name: "All cities" })).toBeNull();
    expect(screen.getByText("Cities are updated daily")).toBeTruthy();
  });

  it("reopening starts on the list", () => {
    const fields = [citySingle()];
    const { rerender, props } = renderSheet(fields);

    fireEvent.click(screen.getByRole("button", { name: "City" }));
    expect(screen.getByRole("button", { name: "Back" })).toBeTruthy();

    rerender(<FilterSheet {...props} open={false} />);
    rerender(<FilterSheet {...props} open />);

    expect(screen.getByRole("heading", { name: "Filters" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Back" })).toBeNull();
  });
});
