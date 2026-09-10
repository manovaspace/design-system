import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TableHead, TableHeader, TableRow } from "../../table.js";
import { EntityBrowser } from "./entity-browser.js";
import { EntityDataTable } from "./entity-data-table.js";
import { EntityFilterBar } from "./entity-filter-bar.js";
import type { EntityListQueryState } from "./entity-list-states.js";
import { EntityPagination } from "./entity-pagination.js";
import { EntitySearchField } from "./entity-search-field.js";

afterEach(() => {
  cleanup();
});

describe("EntityBrowser suite", () => {
  describe("EntityBrowser", () => {
    it("renders page chrome with title, description, actions, and children", () => {
      render(
        <EntityBrowser
          preset="directory"
          title="کاربران"
          description="مدیریت و مشاهده کاربران سامانه"
          primaryAction={<button type="button">افزودن کاربر</button>}
          toolbar={<div data-testid="toolbar">نوار ابزار</div>}
          footer={<div data-testid="footer">فوتر</div>}
        >
          <div data-testid="content">لیست داده‌ها</div>
        </EntityBrowser>,
      );

      expect(screen.getByRole("main").getAttribute("data-preset")).toBe(
        "directory",
      );
      expect(screen.getByText("کاربران")).toBeTruthy();
      expect(screen.getByText("مدیریت و مشاهده کاربران سامانه")).toBeTruthy();
      expect(screen.getByRole("button", { name: "افزودن کاربر" })).toBeTruthy();
      expect(screen.getByTestId("toolbar")).toBeTruthy();
      expect(screen.getByTestId("content")).toBeTruthy();
      expect(screen.getByTestId("footer")).toBeTruthy();
    });
  });

  describe("EntitySearchField", () => {
    it("renders search input, displays Persian digits, and emits Latin digits on change", () => {
      const onValueChange = vi.fn();
      const onClear = vi.fn();

      render(
        <EntitySearchField
          id="search-input"
          label="جستجو"
          placeholder="جستجوی نام یا شماره..."
          value="123"
          onValueChange={onValueChange}
          onClear={onClear}
          clearLabel="پاک کردن جستجو"
        />,
      );

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe("۱۲۳");

      fireEvent.change(input, { target: { value: "۱۲۳۴" } });
      expect(onValueChange).toHaveBeenCalledWith("1234");
    });

    it("clears on clear button click and Escape key", () => {
      const onClear = vi.fn();

      render(
        <EntitySearchField
          id="search-input"
          label="جستجو"
          placeholder="جستجو..."
          value="test"
          onValueChange={() => {}}
          onClear={onClear}
          clearLabel="پاک کردن"
        />,
      );

      const clearBtn = screen.getByRole("button", { name: "پاک کردن" });
      fireEvent.click(clearBtn);
      expect(onClear).toHaveBeenCalledTimes(1);

      const input = screen.getByRole("textbox");
      fireEvent.keyDown(input, { key: "Escape" });
      expect(onClear).toHaveBeenCalledTimes(2);
    });
  });

  describe("EntityFilterBar", () => {
    it("renders chips, invokes remove and clearAll callbacks", () => {
      const onRemoveChip = vi.fn();
      const onClearAll = vi.fn();

      render(
        <EntityFilterBar
          chips={[
            {
              key: "type",
              label: "همکار",
              onRemove: onRemoveChip,
            },
          ]}
          clearAllLabel="پاک کردن همه"
          onClearAll={onClearAll}
          removeChipLabel="حذف فیلتر"
          suffix={<span>۵ نتیجه</span>}
        >
          <EntitySearchField
            id="search"
            label="جستجو"
            placeholder="جستجو..."
            value=""
            onValueChange={() => {}}
            onClear={() => {}}
            clearLabel="پاک کردن"
          />
          <button type="button">فیلتر وضعیت</button>
        </EntityFilterBar>,
      );

      expect(screen.getByText("همکار")).toBeTruthy();
      expect(screen.getByText("۵ نتیجه")).toBeTruthy();

      const removeBtn = screen.getByRole("button", {
        name: "حذف فیلتر: همکار",
      });
      fireEvent.click(removeBtn);
      expect(onRemoveChip).toHaveBeenCalledTimes(1);

      const clearAllBtn = screen.getByRole("button", {
        name: "پاک کردن همه",
      });
      fireEvent.click(clearAllBtn);
      expect(onClearAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("EntityDataTable & state handling", () => {
    const defaultState: EntityListQueryState = {
      isLoading: false,
      isError: false,
      isEmpty: false,
      loadErrorMessage: "خطا در بارگذاری اطلاعات",
      emptyMessage: "هیچ موردی یافت نشد.",
      emptyFilteredMessage: "موردی با فیلترهای انتخابی یافت نشد.",
      clearFiltersLabel: "پاک کردن فیلترها",
    };

    const header = (
      <TableHeader>
        <TableRow>
          <TableHead>نام</TableHead>
          <TableHead>عملیات</TableHead>
        </TableRow>
      </TableHeader>
    );

    it("renders loading skeletons when isLoading is true", () => {
      const { container } = render(
        <EntityDataTable
          colSpan={2}
          header={header}
          state={{ ...defaultState, isLoading: true }}
        >
          <tr>
            <td>ردیف ۱</td>
          </tr>
        </EntityDataTable>,
      );

      expect(
        container.querySelectorAll(".animate-pulse").length,
      ).toBeGreaterThan(0);
    });

    it("renders error message when isError is true", () => {
      render(
        <EntityDataTable
          colSpan={2}
          header={header}
          state={{ ...defaultState, isError: true }}
        >
          <tr>
            <td>ردیف ۱</td>
          </tr>
        </EntityDataTable>,
      );

      expect(screen.getByText("خطا در بارگذاری اطلاعات")).toBeTruthy();
    });

    it("renders empty message when isEmpty is true without active filters", () => {
      render(
        <EntityDataTable
          colSpan={2}
          header={header}
          state={{ ...defaultState, isEmpty: true, hasActiveFilters: false }}
        >
          <tr>
            <td>ردیف ۱</td>
          </tr>
        </EntityDataTable>,
      );

      expect(screen.getByText("هیچ موردی یافت نشد.")).toBeTruthy();
    });

    it("renders filtered empty message and clear filters action", () => {
      const onClearFilters = vi.fn();
      render(
        <EntityDataTable
          colSpan={2}
          header={header}
          state={{
            ...defaultState,
            isEmpty: true,
            hasActiveFilters: true,
            onClearFilters,
          }}
        >
          <tr>
            <td>ردیف ۱</td>
          </tr>
        </EntityDataTable>,
      );

      expect(
        screen.getByText("موردی با فیلترهای انتخابی یافت نشد."),
      ).toBeTruthy();
      const clearBtn = screen.getByRole("button", {
        name: "پاک کردن فیلترها",
      });
      fireEvent.click(clearBtn);
      expect(onClearFilters).toHaveBeenCalledTimes(1);
    });

    it("renders table rows when data is present", () => {
      render(
        <EntityDataTable colSpan={2} header={header} state={defaultState}>
          <tr>
            <td>علی محمدی</td>
            <td>ویرایش</td>
          </tr>
        </EntityDataTable>,
      );

      expect(screen.getByText("علی محمدی")).toBeTruthy();
      expect(screen.getByText("ویرایش")).toBeTruthy();
    });
  });

  describe("EntityPagination", () => {
    it("renders pagination with localized page counts and manages page change buttons", () => {
      const onPageChange = vi.fn();

      const { rerender } = render(
        <EntityPagination
          page={1}
          totalPages={5}
          prevLabel="قبلی"
          nextLabel="بعدی"
          pageOf={({ page, total }) => `صفحه ${page} از ${total}`}
          onPageChange={onPageChange}
        />,
      );

      expect(screen.getByText("صفحه ۱ از ۵")).toBeTruthy();
      const prevBtn = screen.getByRole("button", { name: "قبلی" });
      const nextBtn = screen.getByRole("button", { name: "بعدی" });

      expect(prevBtn.hasAttribute("disabled")).toBe(true);
      expect(nextBtn.hasAttribute("disabled")).toBe(false);

      fireEvent.click(nextBtn);
      expect(onPageChange).toHaveBeenCalledWith(2);

      // Rerender at last page
      rerender(
        <EntityPagination
          page={5}
          totalPages={5}
          prevLabel="قبلی"
          nextLabel="بعدی"
          pageOf={({ page, total }) => `صفحه ${page} از ${total}`}
          onPageChange={onPageChange}
        />,
      );

      expect(screen.getByText("صفحه ۵ از ۵")).toBeTruthy();
      expect(
        screen.getByRole("button", { name: "قبلی" }).hasAttribute("disabled"),
      ).toBe(false);
      expect(
        screen.getByRole("button", { name: "بعدی" }).hasAttribute("disabled"),
      ).toBe(true);
    });
  });
});
