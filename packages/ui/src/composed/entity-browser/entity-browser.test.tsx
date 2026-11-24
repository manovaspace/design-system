import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TableHead, TableHeader, TableRow } from "../../table.js";
import { EntityBrowser } from "./entity-browser.js";
import { EntityDataTable } from "./entity-data-table.js";
import { EntityFilterBar } from "./entity-filter-bar.js";
import type { EntityListQueryState } from "./entity-list-states.js";
import { EntityMobileMessage } from "./entity-mobile-states.js";
import { EntityPagination } from "./entity-pagination.js";
import { EntitySearchField } from "./entity-search-field.js";

afterEach(() => {
  cleanup();
});

describe("EntityBrowser suite", () => {
  describe("EntityBrowser", () => {
    it("marks the card body with data-slot='entity-browser-body' for the flush RowList gutter rule", () => {
      render(
        <EntityBrowser title="Body slot">
          <div data-testid="body-content">content</div>
        </EntityBrowser>,
      );

      const body = screen.getByTestId("body-content").parentElement;
      expect(body?.getAttribute("data-slot")).toBe("entity-browser-body");
    });

    it("defaults the body frame to card and renders frame='flat' without the card classes", () => {
      const { unmount } = render(
        <EntityBrowser aria-label="Card">
          <div data-testid="card-content">content</div>
        </EntityBrowser>,
      );
      const cardBody = screen.getByTestId("card-content").parentElement;
      expect(cardBody?.getAttribute("data-frame")).toBe("card");
      expect(cardBody?.classList.contains("border-border")).toBe(true);
      unmount();

      render(
        <EntityBrowser aria-label="Flat" frame="flat">
          <div data-testid="flat-content">content</div>
        </EntityBrowser>,
      );
      const flatBody = screen.getByTestId("flat-content").parentElement;
      expect(flatBody?.getAttribute("data-frame")).toBe("flat");
      expect(flatBody?.classList.contains("border-border")).toBe(false);
    });

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

      expect(
        screen
          .getByRole("region", { name: "کاربران" })
          .getAttribute("data-preset"),
      ).toBe("directory");
      expect(screen.queryByRole("main")).toBeNull();
      expect(screen.getByText("کاربران")).toBeTruthy();
      expect(screen.getByText("مدیریت و مشاهده کاربران سامانه")).toBeTruthy();
      expect(screen.getByRole("button", { name: "افزودن کاربر" })).toBeTruthy();
      expect(screen.getByTestId("toolbar")).toBeTruthy();
      expect(screen.getByTestId("content")).toBeTruthy();
      expect(screen.getByTestId("footer")).toBeTruthy();
    });

    it("renders no heading without a title and names the section by aria-label", () => {
      render(
        <EntityBrowser
          aria-label="فهرست کاربران"
          description="مدیریت کاربران"
          primaryAction={<button type="button">افزودن کاربر</button>}
        >
          <div data-testid="content">داده</div>
        </EntityBrowser>,
      );

      expect(screen.queryByRole("heading")).toBeNull();
      const region = screen.getByRole("region", { name: "فهرست کاربران" });
      expect(region).toBeTruthy();
      expect(screen.getByText("مدیریت کاربران")).toBeTruthy();
      expect(screen.getByRole("button", { name: "افزودن کاربر" })).toBeTruthy();
    });

    it("keeps resultMeta in the header row without a title, not in the command bar", () => {
      render(
        <EntityBrowser
          aria-label="Users"
          resultMeta={<span data-testid="meta">۱۲ مورد</span>}
          toolbar={<div data-testid="toolbar">toolbar</div>}
        >
          <div>content</div>
        </EntityBrowser>,
      );

      expect(screen.getAllByTestId("meta")).toHaveLength(1);
      expect(screen.getByTestId("toolbar")).toBeTruthy();
    });

    it("renders no header row when a title-less browser has no description, meta or action", () => {
      const { container } = render(
        <EntityBrowser aria-label="Users">
          <div data-testid="content">content</div>
        </EntityBrowser>,
      );

      expect(container.querySelector("h2")).toBeNull();
      expect(container.querySelector(".justify-between")).toBeNull();
      expect(screen.getByRole("region", { name: "Users" })).toBeTruthy();
    });

    it("does not make the command bar sticky by default", () => {
      render(
        <EntityBrowser
          aria-label="Users"
          toolbar={<div data-testid="toolbar">toolbar</div>}
        >
          <div>content</div>
        </EntityBrowser>,
      );

      const wrapper = screen.getByTestId("toolbar").parentElement;
      expect(wrapper?.className).not.toContain("sticky");
      expect(wrapper?.hasAttribute("data-sticky")).toBe(false);
    });

    it("pins the command bar with sticky classes when stickyToolbar is set", () => {
      render(
        <EntityBrowser
          aria-label="Users"
          stickyToolbar
          toolbar={<div data-testid="toolbar">toolbar</div>}
        >
          <div>content</div>
        </EntityBrowser>,
      );

      const wrapper = screen.getByTestId("toolbar").parentElement;
      expect(wrapper?.className).toContain("sticky");
      expect(wrapper?.className).toContain(
        "top-[var(--entity-browser-sticky-top,0px)]",
      );
      expect(wrapper?.getAttribute("data-sticky")).toBe("true");
    });

    it("keeps the title as the visible heading and section name when title is set", () => {
      render(
        <EntityBrowser title="Users" aria-label="ignored">
          <div>content</div>
        </EntityBrowser>,
      );

      expect(
        screen.getByRole("heading", { level: 2, name: "Users" }),
      ).toBeTruthy();
      expect(screen.getByRole("region", { name: "Users" })).toBeTruthy();
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

    it("sizes the clear button as a 44 px target at the inline end and reserves room for it", () => {
      render(
        <EntitySearchField
          id="search-input"
          label="جستجو"
          placeholder="جستجو..."
          value="test"
          onValueChange={() => {}}
          onClear={() => {}}
          clearLabel="پاک کردن"
        />,
      );

      const clearBtn = screen.getByRole("button", { name: "پاک کردن" });
      expect(clearBtn.className).toContain("size-11");
      expect(clearBtn.className).toContain("end-0");
      expect(clearBtn.className).toContain("-translate-y-1/2");
      const input = screen.getByRole("textbox");
      expect(input.className).toContain("pe-11");
      expect(input.className).not.toContain("pe-9");
    });
  });

  describe("EntityMobileMessage", () => {
    it("renders block content in a div so headings and blocks stay valid", () => {
      const { container } = render(
        <EntityMobileMessage>
          <h2>چیزی پیدا نشد</h2>
        </EntityMobileMessage>,
      );

      expect(container.firstElementChild?.tagName).toBe("DIV");
      expect(container.querySelector("p")).toBeNull();
      expect(
        screen.getByRole("heading", { name: "چیزی پیدا نشد" }),
      ).toBeTruthy();
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

    describe("mobile filters sheet", () => {
      afterEach(() => {
        vi.unstubAllGlobals();
      });

      function renderMobileBar(fullScreen?: boolean) {
        // jsdom has no matchMedia; stub a viewport below `sm`.
        vi.stubGlobal(
          "matchMedia",
          vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
          })),
        );
        render(
          <EntityFilterBar
            chips={[]}
            clearAllLabel="پاک کردن همه"
            onClearAll={() => {}}
            removeChipLabel="حذف فیلتر"
            filtersLabel="فیلترها"
            showResultsLabel="نمایش نتایج"
            fullScreen={fullScreen}
          >
            <button type="button">فیلتر وضعیت</button>
          </EntityFilterBar>,
        );
        fireEvent.click(screen.getByRole("button", { name: "فیلترها" }));
        return screen.getByRole("dialog");
      }

      it("keeps the capped bottom sheet by default", () => {
        const dialog = renderMobileBar();
        expect(dialog.className).toContain("max-h-[min(85dvh,640px)]");
        expect(dialog.className).toContain("rounded-t-xl");
      });

      it("fills the viewport when fullScreen", () => {
        const dialog = renderMobileBar(true);
        expect(dialog.className).toContain("h-dvh");
        expect(dialog.className).toContain("rounded-none");
        expect(dialog.className).not.toContain("max-h-[min(85dvh,640px)]");

        fireEvent.click(screen.getByRole("button", { name: "نمایش نتایج" }));
        expect(screen.queryByRole("dialog")).toBeNull();
      });
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

    describe("mobile breakpoint (tableFrom)", () => {
      const renderWithMobile = (tableFrom?: "md" | "lg") =>
        render(
          <EntityDataTable
            colSpan={2}
            header={header}
            state={defaultState}
            mobile={<div>کارت موبایل</div>}
            tableFrom={tableFrom}
          >
            <tr>
              <td>علی محمدی</td>
              <td>ویرایش</td>
            </tr>
          </EntityDataTable>,
        );

      it("switches from mobile rows to table at md by default", () => {
        const { container } = renderWithMobile();

        const mobileWrapper = container.querySelector(".md\\:hidden");
        expect(mobileWrapper?.textContent).toContain("کارت موبایل");
        expect(container.querySelector(".lg\\:hidden")).toBeNull();

        expect(container.querySelector(".hidden.md\\:block")).not.toBeNull();
        expect(container.querySelector(".lg\\:block")).toBeNull();

        const table = container.querySelector("table");
        expect(table?.classList.contains("hidden")).toBe(true);
        expect(table?.classList.contains("table-fixed")).toBe(true);
        expect(table?.classList.contains("md:table")).toBe(true);
        expect(table?.classList.contains("lg:table")).toBe(false);
      });

      it("switches from mobile rows to table at lg when tableFrom is lg", () => {
        const { container } = renderWithMobile("lg");

        const mobileWrapper = container.querySelector(".lg\\:hidden");
        expect(mobileWrapper?.textContent).toContain("کارت موبایل");

        expect(container.querySelector(".hidden.lg\\:block")).not.toBeNull();

        const table = container.querySelector("table");
        expect(table?.classList.contains("hidden")).toBe(true);
        expect(table?.classList.contains("table-fixed")).toBe(true);
        expect(table?.classList.contains("lg:table")).toBe(true);

        expect(container.querySelector(".md\\:hidden")).toBeNull();
        expect(container.querySelector(".md\\:block")).toBeNull();
        expect(container.innerHTML).not.toMatch(/md:/);
      });

      it("adds no breakpoint hiding classes without mobile", () => {
        const { container } = render(
          <EntityDataTable
            colSpan={2}
            header={header}
            state={defaultState}
            tableFrom="lg"
          >
            <tr>
              <td>علی محمدی</td>
            </tr>
          </EntityDataTable>,
        );

        expect(container.querySelector(".hidden")).toBeNull();
        expect(container.innerHTML).not.toMatch(/md:|lg:/);
        expect(container.querySelector("table")?.className).not.toContain(
          "table-fixed",
        );
      });
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
