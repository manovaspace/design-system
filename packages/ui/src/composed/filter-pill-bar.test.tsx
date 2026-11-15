import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DirectionProvider } from "../direction-provider.js";
import { FilterPillBar, type FilterPillGroup } from "./filter-pill-bar.js";

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

const statusOptions = [
  { value: "paid", label: "پرداخت‌شده" },
  { value: "unpaid", label: "پرداخت‌نشده" },
];

const manyOptions = Array.from({ length: 10 }, (_, index) => ({
  value: `cat-${index}`,
  label: `Category ${index}`,
}));

function renderBar(
  groups: FilterPillGroup[],
  extra: Partial<Parameters<typeof FilterPillBar>[0]> = {},
  direction: "ltr" | "rtl" = "ltr",
) {
  return render(
    <DirectionProvider direction={direction}>
      <FilterPillBar aria-label="Filters" groups={groups} {...extra} />
    </DirectionProvider>,
  );
}

describe("FilterPillBar", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe("toggle groups", () => {
    it("exposes a labelled group with aria-pressed pills", () => {
      renderBar([
        {
          kind: "toggle",
          id: "status",
          label: "Status",
          options: statusOptions,
          value: "paid",
          onChange: vi.fn(),
          allLabel: "همه",
        },
      ]);

      const group = screen.getByRole("group", { name: "Status" });
      expect(
        within(group)
          .getByRole("button", { name: "همه" })
          .getAttribute("aria-pressed"),
      ).toBe("false");
      expect(
        within(group)
          .getByRole("button", { name: "پرداخت‌شده" })
          .getAttribute("aria-pressed"),
      ).toBe("true");
      expect(
        within(group)
          .getByRole("button", { name: "پرداخت‌نشده" })
          .getAttribute("aria-pressed"),
      ).toBe("false");
    });

    it("selects an option when it is not selected", () => {
      const onChange = vi.fn();
      renderBar([
        {
          kind: "toggle",
          id: "status",
          label: "Status",
          options: statusOptions,
          value: null,
          onChange,
          allLabel: "همه",
        },
      ]);

      fireEvent.click(screen.getByRole("button", { name: "پرداخت‌نشده" }));
      expect(onChange).toHaveBeenCalledWith("unpaid");
    });

    it("clears the value when the selected option is pressed again", () => {
      const onChange = vi.fn();
      renderBar([
        {
          kind: "toggle",
          id: "status",
          label: "Status",
          options: statusOptions,
          value: "unpaid",
          onChange,
          allLabel: "همه",
        },
      ]);

      fireEvent.click(screen.getByRole("button", { name: "پرداخت‌نشده" }));
      expect(onChange).toHaveBeenCalledWith(null);
    });

    it("clears the value from the leading all pill", () => {
      const onChange = vi.fn();
      renderBar([
        {
          kind: "toggle",
          id: "status",
          label: "Status",
          options: statusOptions,
          value: "paid",
          onChange,
          allLabel: "همه",
        },
      ]);

      fireEvent.click(screen.getByRole("button", { name: "همه" }));
      expect(onChange).toHaveBeenCalledWith(null);
    });

    it("omits the all pill when allLabel is not given", () => {
      renderBar([
        {
          kind: "toggle",
          id: "status",
          label: "Status",
          options: statusOptions,
          value: null,
          onChange: vi.fn(),
        },
      ]);

      expect(screen.queryByRole("button", { name: "همه" })).toBeNull();
      expect(screen.getAllByRole("button")).toHaveLength(2);
    });
  });

  describe("menu groups", () => {
    it("shows the group label when no value is set", () => {
      renderBar([
        {
          kind: "menu",
          id: "cat",
          label: "دسته‌بندی",
          options: statusOptions,
          value: null,
          onChange: vi.fn(),
          allLabel: "همه",
        },
      ]);

      const trigger = screen.getByRole("button", { name: "دسته‌بندی" });
      expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
      expect(trigger.getAttribute("data-active")).toBeNull();
    });

    it("shows the selected option label and an active look", () => {
      renderBar([
        {
          kind: "menu",
          id: "cat",
          label: "دسته‌بندی",
          options: statusOptions,
          value: "paid",
          onChange: vi.fn(),
          allLabel: "همه",
        },
      ]);

      const trigger = screen.getByRole("button", { name: "پرداخت‌شده" });
      expect(trigger.getAttribute("data-active")).toBe("true");
    });

    it("opens a picker and selects an option", () => {
      const onChange = vi.fn();
      renderBar([
        {
          kind: "menu",
          id: "status",
          label: "Status",
          options: statusOptions,
          value: null,
          onChange,
          allLabel: "All statuses",
        },
      ]);

      fireEvent.click(screen.getByRole("button", { name: "Status" }));
      const picker = screen.getByRole("radiogroup", { name: "Status" });
      fireEvent.click(
        within(picker).getByRole("radio", { name: "پرداخت‌نشده" }),
      );

      expect(onChange).toHaveBeenCalledWith("unpaid");
    });

    it("clears the value through the all option in the picker", () => {
      const onChange = vi.fn();
      renderBar([
        {
          kind: "menu",
          id: "status",
          label: "Status",
          options: statusOptions,
          value: "paid",
          onChange,
          allLabel: "All statuses",
        },
      ]);

      fireEvent.click(screen.getByRole("button", { name: "پرداخت‌شده" }));
      const picker = screen.getByRole("radiogroup", { name: "Status" });
      const all = within(picker).getByRole("radio", { name: "All statuses" });
      expect(all.getAttribute("aria-checked")).toBe("false");
      fireEvent.click(all);

      expect(onChange).toHaveBeenCalledWith(null);
    });

    it("filters options with a search field when there are more than 8", () => {
      renderBar([
        {
          kind: "menu",
          id: "cat",
          label: "Category",
          options: manyOptions,
          value: null,
          onChange: vi.fn(),
          allLabel: "All",
          searchPlaceholder: "Search categories",
        },
      ]);

      fireEvent.click(screen.getByRole("button", { name: "Category" }));
      const search = screen.getByRole("searchbox", {
        name: "Search categories",
      });
      fireEvent.change(search, { target: { value: "Category 7" } });

      const picker = screen.getByRole("radiogroup", { name: "Category" });
      // The all option stays visible; only the options are filtered.
      expect(within(picker).getAllByRole("radio")).toHaveLength(2);
      expect(within(picker).getByRole("radio", { name: "All" })).toBeDefined();
      expect(
        within(picker).getByRole("radio", { name: "Category 7" }),
      ).toBeDefined();
      expect(
        within(picker).queryByRole("radio", { name: "Category 3" }),
      ).toBeNull();
    });

    it("has no search field when there are 8 options or fewer", () => {
      renderBar([
        {
          kind: "menu",
          id: "status",
          label: "Status",
          options: statusOptions,
          value: null,
          onChange: vi.fn(),
          allLabel: "All",
        },
      ]);

      fireEvent.click(screen.getByRole("button", { name: "Status" }));
      expect(screen.queryByRole("textbox")).toBeNull();
    });
  });

  describe("clear all", () => {
    const groups = (value: string | null): FilterPillGroup[] => [
      {
        kind: "toggle",
        id: "status",
        label: "Status",
        options: statusOptions,
        value,
        onChange: vi.fn(),
        allLabel: "همه",
      },
    ];

    it("is hidden when no onClearAll is given", () => {
      renderBar(groups("paid"));
      expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
    });

    it("is hidden when no group has a value", () => {
      renderBar(groups(null), { onClearAll: vi.fn() });
      expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
    });

    it("shows the custom clear label and calls onClearAll", () => {
      const onClearAll = vi.fn();
      renderBar(groups("paid"), { onClearAll, clearLabel: "پاک کردن" });

      fireEvent.click(screen.getByRole("button", { name: "پاک کردن" }));
      expect(onClearAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("edge fade", () => {
    const groups: FilterPillGroup[] = [
      {
        kind: "toggle",
        id: "status",
        label: "Status",
        options: statusOptions,
        value: null,
        onChange: vi.fn(),
        allLabel: "همه",
      },
    ];

    function setMetrics(row: HTMLElement, scrollLeft: number) {
      Object.defineProperty(row, "scrollWidth", {
        configurable: true,
        value: 500,
      });
      Object.defineProperty(row, "clientWidth", {
        configurable: true,
        value: 200,
      });
      Object.defineProperty(row, "scrollLeft", {
        configurable: true,
        value: scrollLeft,
      });
      fireEvent.scroll(row);
    }

    it("fades only the end side at the start in LTR", () => {
      const { container } = renderBar(groups);
      const row = container.querySelector<HTMLElement>("[data-fade-right]");
      if (!row) throw new Error("scroll row missing");
      setMetrics(row, 0);

      expect(row.getAttribute("data-fade-left")).toBe("false");
      expect(row.getAttribute("data-fade-right")).toBe("true");
    });

    it("fades the start side at the start in RTL", () => {
      const { container } = renderBar(groups, {}, "rtl");
      const row = container.querySelector<HTMLElement>("[data-fade-right]");
      if (!row) throw new Error("scroll row missing");
      setMetrics(row, 0);

      expect(row.getAttribute("data-fade-left")).toBe("true");
      expect(row.getAttribute("data-fade-right")).toBe("false");
    });

    it("fades the end side at the far end of an RTL row", () => {
      const { container } = renderBar(groups, {}, "rtl");
      const row = container.querySelector<HTMLElement>("[data-fade-right]");
      if (!row) throw new Error("scroll row missing");
      setMetrics(row, -300);

      expect(row.getAttribute("data-fade-left")).toBe("false");
      expect(row.getAttribute("data-fade-right")).toBe("true");
    });

    it("fades nothing when all content fits", () => {
      const { container } = renderBar(groups);
      const row = container.querySelector<HTMLElement>("[data-fade-right]");
      if (!row) throw new Error("scroll row missing");
      Object.defineProperty(row, "scrollWidth", {
        configurable: true,
        value: 200,
      });
      Object.defineProperty(row, "clientWidth", {
        configurable: true,
        value: 200,
      });
      Object.defineProperty(row, "scrollLeft", {
        configurable: true,
        value: 0,
      });
      fireEvent.scroll(row);

      expect(row.getAttribute("data-fade-left")).toBe("false");
      expect(row.getAttribute("data-fade-right")).toBe("false");
    });
  });

  describe("selection scrolling", () => {
    it("scrolls the newly selected pill into view", () => {
      const onChange = vi.fn();
      const tree = (value: string | null) => (
        <DirectionProvider direction="ltr">
          <FilterPillBar
            aria-label="Filters"
            groups={[
              {
                kind: "toggle",
                id: "status",
                label: "Status",
                options: statusOptions,
                value,
                onChange,
                allLabel: "همه",
              },
            ]}
          />
        </DirectionProvider>
      );
      const { rerender } = render(tree(null));
      expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();

      rerender(tree("unpaid"));

      expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
        inline: "nearest",
        block: "nearest",
      });
    });
  });
});
