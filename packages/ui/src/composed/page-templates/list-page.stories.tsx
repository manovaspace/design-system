import type { Meta, StoryObj } from "@storybook/react-vite";
import type { JSX } from "react";
import { useState } from "react";

import { Button } from "../../button.js";
import { PlusIcon } from "../../icons.js";
import { cn } from "../../lib/utils.js";
import { TableCell, TableHead, TableHeader, TableRow } from "../../table.js";
import { EmptyState } from "../empty-state.js";
import { EntityDataTable } from "../entity-browser/entity-data-table.js";
import {
  entityTableCellClass,
  entityTableEndEdgeCellClass,
  entityTableHeaderRowClass,
  entityTableStartEdgeCellClass,
} from "../entity-browser/entity-table-layout.js";
import { Row, RowList } from "../row-list.js";
import {
  ListPage,
  type ListPageFilterChip,
  type ListPageFilters,
  type ListPageInset,
  type ListPageName,
  type ListPageSortOption,
  type ListPageVariant,
  type ListPageWidth,
} from "./list-page.js";

const meta = {
  title: "Templates/ListPage",
  component: ListPage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  globals: {
    direction: "rtl",
  },
} satisfies Meta<typeof ListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

type WarehouseKey = "main" | "north";

type WarehouseItem = {
  id: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  warehouse: WarehouseKey;
};

const WAREHOUSE_LABELS: Record<WarehouseKey, string> = {
  main: "مرکزی",
  north: "شمال",
};

const WAREHOUSE_ITEMS: WarehouseItem[] = [
  {
    id: "1",
    name: "شکر سفید",
    unit: "کیلوگرم",
    stock: 240,
    minStock: 100,
    warehouse: "main",
  },
  {
    id: "2",
    name: "روغن آفتابگردان",
    unit: "لیتر",
    stock: 36,
    minStock: 40,
    warehouse: "main",
  },
  {
    id: "3",
    name: "برنج هاشمی",
    unit: "کیلوگرم",
    stock: 520,
    minStock: 200,
    warehouse: "main",
  },
  {
    id: "4",
    name: "برنج طارم",
    unit: "کیلوگرم",
    stock: 88,
    minStock: 100,
    warehouse: "north",
  },
  {
    id: "5",
    name: "عدس پلویی",
    unit: "کیلوگرم",
    stock: 150,
    minStock: 80,
    warehouse: "main",
  },
  {
    id: "6",
    name: "لوبیا چیتی",
    unit: "کیلوگرم",
    stock: 42,
    minStock: 60,
    warehouse: "north",
  },
  {
    id: "7",
    name: "روغن زیتون",
    unit: "لیتر",
    stock: 18,
    minStock: 24,
    warehouse: "main",
  },
  {
    id: "8",
    name: "سرکه سفید",
    unit: "لیتر",
    stock: 95,
    minStock: 50,
    warehouse: "north",
  },
  {
    id: "9",
    name: "رب گوجه‌فرنگی",
    unit: "کیلوگرم",
    stock: 310,
    minStock: 150,
    warehouse: "main",
  },
  {
    id: "10",
    name: "نمک تصفیه‌شده",
    unit: "کیلوگرم",
    stock: 70,
    minStock: 40,
    warehouse: "north",
  },
  {
    id: "11",
    name: "آرد گندم",
    unit: "کیلوگرم",
    stock: 480,
    minStock: 300,
    warehouse: "main",
  },
  {
    id: "12",
    name: "چای دبش",
    unit: "کیلوگرم",
    stock: 27,
    minStock: 30,
    warehouse: "north",
  },
];

function toWarehouseKey(value: string | null): WarehouseKey | null {
  return value === "main" || value === "north" ? value : null;
}

function isLowStock(item: WarehouseItem): boolean {
  return item.stock <= item.minStock;
}

function toPersian(value: number): string {
  return value.toLocaleString("fa-IR");
}

function noop() {
  return undefined;
}

const EMPTY_CONTENT = (
  <EmptyState
    title="هنوز کالایی ثبت نشده"
    description="کالاها را این‌جا ثبت کنید تا موجودی‌شان را دنبال کنید."
    action={
      <Button type="button" onClick={noop}>
        افزودن کالا
      </Button>
    }
  />
);

const TABLE_HEADER = (
  <TableHeader>
    <TableRow className={entityTableHeaderRowClass}>
      <TableHead
        className={cn(entityTableCellClass, entityTableStartEdgeCellClass)}
      >
        کالا
      </TableHead>
      <TableHead className={entityTableCellClass}>انبار</TableHead>
      <TableHead
        className={cn(
          entityTableCellClass,
          entityTableEndEdgeCellClass,
          "text-end",
        )}
      >
        موجودی
      </TableHead>
    </TableRow>
  </TableHeader>
);

type SortKey = "newest" | "oldest" | "name" | "stock";

const SORT_KEYS: readonly SortKey[] = ["newest", "oldest", "name", "stock"];

const SORT_OPTIONS: ListPageSortOption[] = [
  { value: "newest", label: "جدیدترین" },
  { value: "oldest", label: "قدیمی‌ترین" },
  { value: "name", label: "نام کالا" },
  { value: "stock", label: "بیشترین موجودی" },
];

// Ids are issued in entry order, so a higher id is a newer item.
const SORT_COMPARATORS: Record<
  SortKey,
  (a: WarehouseItem, b: WarehouseItem) => number
> = {
  newest: (a, b) => Number(b.id) - Number(a.id),
  oldest: (a, b) => Number(a.id) - Number(b.id),
  name: (a, b) => a.name.localeCompare(b.name, "fa"),
  stock: (a, b) => b.stock - a.stock,
};

function toSortKey(value: string): SortKey {
  return SORT_KEYS.find((key) => key === value) ?? "newest";
}

type DemoProps = {
  /** Visible heading. Without it the list is named by `aria-label` only. */
  title?: string;
  description?: string;
  /** Unique per list on one page. */
  searchId?: string;
  items?: readonly WarehouseItem[];
  initialSearch?: string;
  initialWarehouse?: WarehouseKey | null;
  initialLowOnly?: boolean;
  initialInStockOnly?: boolean;
  withFilters?: boolean;
  withClearAll?: boolean;
  variant?: ListPageVariant;
  width?: ListPageWidth;
  inset?: ListPageInset;
  isLoading?: boolean;
  isError?: boolean;
};

function WarehouseListDemo({
  title,
  description,
  searchId = "warehouse-items-search",
  items = WAREHOUSE_ITEMS,
  initialSearch = "",
  initialWarehouse = null,
  initialLowOnly = false,
  initialInStockOnly = false,
  withFilters = false,
  withClearAll = false,
  variant = "default",
  width = "default",
  inset = "page",
  isLoading = false,
  isError = false,
}: DemoProps): JSX.Element {
  const [search, setSearch] = useState(initialSearch);
  const [warehouse, setWarehouse] = useState<WarehouseKey | null>(
    initialWarehouse,
  );
  const [lowOnly, setLowOnly] = useState(initialLowOnly);
  const [inStockOnly, setInStockOnly] = useState(initialInStockOnly);
  const [sortKey, setSortKey] = useState<SortKey>("newest");

  const query = search.trim();
  const visible = items
    .filter(
      (item) =>
        (query === "" || item.name.includes(query)) &&
        (warehouse === null || item.warehouse === warehouse) &&
        (!lowOnly || isLowStock(item)) &&
        (!inStockOnly || item.stock > 0),
    )
    .sort(SORT_COMPARATORS[sortKey]);

  const nameProps: ListPageName = title
    ? { title }
    : { "aria-label": "کالاها" };

  const chips: ListPageFilterChip[] = [];
  if (warehouse !== null) {
    chips.push({
      id: "warehouse",
      label: `انبار: ${WAREHOUSE_LABELS[warehouse]}`,
      onRemove: () => setWarehouse(null),
    });
  }
  if (lowOnly) {
    chips.push({
      id: "low",
      label: "فقط کم‌موجودی",
      onRemove: () => setLowOnly(false),
    });
  }
  if (inStockOnly) {
    chips.push({
      id: "in-stock",
      label: "دارای موجودی",
      onRemove: () => setInStockOnly(false),
    });
  }

  const hasActiveFilters = query !== "" || chips.length > 0;

  function clearAll() {
    setSearch("");
    setWarehouse(null);
    setLowOnly(false);
    setInStockOnly(false);
  }

  const filters: ListPageFilters | undefined = withFilters
    ? {
        label: "فیلترها",
        chips,
        removeChipLabel: "حذف فیلتر",
        clearAll: withClearAll
          ? { label: "پاک کردن همه", onClear: clearAll }
          : undefined,
        formatCount: toPersian,
        sheet: {
          fields: [
            {
              id: "warehouse",
              kind: "single",
              label: "انبار",
              options: [
                { value: "main", label: WAREHOUSE_LABELS.main },
                { value: "north", label: WAREHOUSE_LABELS.north },
              ],
              value: warehouse,
              onValueChange: (value) => setWarehouse(toWarehouseKey(value)),
              allLabel: "همه انبارها",
            },
            {
              id: "low",
              kind: "toggle",
              label: "فقط کم‌موجودی",
              description: "کالاهایی که به حداقل موجودی رسیده‌اند",
              checked: lowOnly,
              onCheckedChange: setLowOnly,
            },
            {
              id: "in-stock",
              kind: "toggle",
              label: "دارای موجودی",
              checked: inStockOnly,
              onCheckedChange: setInStockOnly,
            },
          ],
          closeLabel: "بستن فیلترها",
          backLabel: "بازگشت",
          resetLabel: "پاک کردن",
          onReset: clearAll,
          resetDisabled: !hasActiveFilters,
          applyLabel: `نمایش ${toPersian(visible.length)} کالا`,
          doneLabel: "تمام",
        },
      }
    : undefined;

  return (
    <ListPage
      {...nameProps}
      description={description}
      addAction={{
        label: "افزودن کالا",
        icon: <PlusIcon />,
        onClick: noop,
      }}
      search={{
        id: searchId,
        label: "جستجوی کالا",
        placeholder: `جستجو در ${toPersian(visible.length)} کالا`,
        value: search,
        onValueChange: setSearch,
        clearLabel: "پاک کردن جستجو",
      }}
      sort={{
        label: "مرتب‌سازی",
        options: SORT_OPTIONS,
        value: sortKey,
        onValueChange: (value) => setSortKey(toSortKey(value)),
        closeLabel: "بستن",
      }}
      filters={filters}
      variant={variant}
      width={width}
      inset={inset}
    >
      <EntityDataTable
        colSpan={3}
        header={TABLE_HEADER}
        state={{
          isLoading,
          isError,
          isEmpty: visible.length === 0,
          hasActiveFilters,
          loadErrorMessage: "فهرست بارگیری نشد. دوباره تلاش کنید.",
          emptyMessage: "کالایی پیدا نشد.",
          emptyContent: EMPTY_CONTENT,
          emptyFilteredMessage: "کالایی با این فیلترها پیدا نشد.",
          clearFiltersLabel: "پاک کردن فیلترها",
          onClearFilters: clearAll,
          loadingRows: 5,
        }}
        mobile={
          <RowList>
            {visible.map((item) => (
              <Row
                key={item.id}
                trailing={
                  <span className="text-sm tabular-nums">
                    {toPersian(item.stock)} {item.unit}
                  </span>
                }
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">
                    {item.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {WAREHOUSE_LABELS[item.warehouse]}
                  </span>
                </span>
              </Row>
            ))}
          </RowList>
        }
      >
        {visible.map((item) => (
          <TableRow key={item.id}>
            <TableCell
              className={cn(
                entityTableCellClass,
                entityTableStartEdgeCellClass,
                "font-medium text-foreground",
              )}
            >
              {item.name}
            </TableCell>
            <TableCell
              className={cn(entityTableCellClass, "text-muted-foreground")}
            >
              {WAREHOUSE_LABELS[item.warehouse]}
            </TableCell>
            <TableCell
              className={cn(
                entityTableCellClass,
                entityTableEndEdgeCellClass,
                "text-end tabular-nums",
                isLowStock(item) && "text-destructive",
              )}
            >
              {toPersian(item.stock)} {item.unit}
            </TableCell>
          </TableRow>
        ))}
      </EntityDataTable>
    </ListPage>
  );
}

export const Default: Story = {
  render: () => <WarehouseListDemo />,
};

export const Loading: Story = {
  render: () => <WarehouseListDemo isLoading />,
};

export const Empty: Story = {
  render: () => <WarehouseListDemo items={[]} />,
};

const ErrorStory: Story = {
  render: () => <WarehouseListDemo isError />,
};

export { ErrorStory as Error };

export const Filtered: Story = {
  render: () => <WarehouseListDemo initialSearch="برنج" />,
};

export const WithActiveFilters: Story = {
  render: () => (
    <WarehouseListDemo withFilters initialWarehouse="main" initialLowOnly />
  ),
};

export const FilteredEmpty: Story = {
  render: () => <WarehouseListDemo withFilters initialSearch="سیب" />,
};

export const Titled: Story = {
  render: () => (
    <WarehouseListDemo
      title="کالاهای انبار مرکزی"
      description="کالاهای ثبت‌شده در انبار مرکزی و موجودی هر کدام."
      items={WAREHOUSE_ITEMS.filter((item) => item.warehouse === "main")}
    />
  ),
};

export const SeveralLists: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <WarehouseListDemo
        title="ورودی‌های امروز"
        searchId="incoming-items-search"
        items={WAREHOUSE_ITEMS.slice(0, 3)}
      />
      <WarehouseListDemo
        title="خروجی‌های امروز"
        searchId="outgoing-items-search"
        items={WAREHOUSE_ITEMS.slice(3, 6)}
      />
    </div>
  ),
};

export const Framed: Story = {
  render: () => <WarehouseListDemo withFilters variant="framed" />,
};

export const ClearAllChips: Story = {
  render: () => (
    <WarehouseListDemo
      withFilters
      withClearAll
      initialWarehouse="main"
      initialLowOnly
      initialInStockOnly
    />
  ),
};

export const ActiveCountBadge: Story = {
  render: () => (
    <WarehouseListDemo withFilters initialWarehouse="north" initialLowOnly />
  ),
};

export const WideWidth: Story = {
  render: () => <WarehouseListDemo width="wide" />,
};

const SHELL_ITEMS: readonly WarehouseItem[] = [0, 1, 2].flatMap((round) =>
  WAREHOUSE_ITEMS.map((item) => ({
    ...item,
    id: String(Number(item.id) + round * 100),
  })),
);

export const InsideAppShell: Story = {
  render: () => (
    <div className="min-h-screen bg-background p-4 [--entity-browser-sticky-top:3.5rem] [--list-page-gutter:1rem] sm:p-6 sm:[--list-page-gutter:1.5rem]">
      <header className="sticky top-0 z-30 -mx-[var(--list-page-gutter)] mb-4 flex h-14 items-center border-b border-border bg-background px-[var(--list-page-gutter)] text-sm font-medium text-foreground">
        انبار من
      </header>
      <WarehouseListDemo
        inset="shell"
        items={SHELL_ITEMS}
        withFilters
        initialInStockOnly
      />
    </div>
  ),
};
