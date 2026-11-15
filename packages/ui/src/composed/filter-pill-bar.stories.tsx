import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { DirectionProvider } from "../direction-provider.js";
import { FilterPillBar, type FilterPillGroup } from "./filter-pill-bar.js";
import { SearchInput } from "./search-input.js";

const meta = {
  title: "Composed/FilterPillBar",
  component: FilterPillBar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof FilterPillBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const statusOptions = [
  { value: "paid", label: "پرداخت‌شده" },
  { value: "unpaid", label: "پرداخت‌نشده" },
  { value: "partial", label: "پرداخت ناقص" },
];

const categoryOptions = [
  { value: "food", label: "خوراکی" },
  { value: "dairy", label: "لبنیات" },
  { value: "frozen", label: "منجمد" },
  { value: "drinks", label: "نوشیدنی" },
  { value: "cleaning", label: "شوینده" },
  { value: "hygiene", label: "بهداشتی" },
  { value: "stationery", label: "لوازم تحریر" },
  { value: "toys", label: "اسباب‌بازی" },
  { value: "garden", label: "باغبانی" },
  { value: "tools", label: "ابزار" },
];

function Interactive({ rtl = true }: { rtl?: boolean }) {
  const [status, setStatus] = React.useState<string | null>(null);
  const [category, setCategory] = React.useState<string | null>(null);
  const groups: FilterPillGroup[] = [
    {
      kind: "toggle",
      id: "status",
      label: "وضعیت",
      options: statusOptions,
      value: status,
      onChange: setStatus,
      allLabel: "همه",
    },
    {
      kind: "menu",
      id: "category",
      label: "دسته‌بندی",
      options: categoryOptions,
      value: category,
      onChange: setCategory,
      allLabel: "همه دسته‌ها",
      searchPlaceholder: "جست‌وجوی دسته‌بندی",
    },
  ];

  return (
    <DirectionProvider direction={rtl ? "rtl" : "ltr"}>
      <div className="flex max-w-md flex-col gap-3">
        <SearchInput placeholder={rtl ? "جست‌وجوی کالا" : "Search items"} />
        <FilterPillBar
          aria-label={rtl ? "فیلترها" : "Filters"}
          groups={groups}
          clearLabel={rtl ? "پاک کردن" : "Clear"}
          onClearAll={() => {
            setStatus(null);
            setCategory(null);
          }}
        />
      </div>
    </DirectionProvider>
  );
}

export const Default: Story = {
  args: {
    "aria-label": "Filters",
    groups: [],
  },
  render: () => <Interactive />,
};

export const LeftToRight: Story = {
  args: {
    "aria-label": "Filters",
    groups: [],
  },
  render: () => <Interactive rtl={false} />,
};

export const ToggleOnly: Story = {
  args: {
    "aria-label": "Status filter",
    groups: [],
  },
  render: function ToggleOnlyStory() {
    const [value, setValue] = React.useState<string | null>("unpaid");
    return (
      <DirectionProvider direction="rtl">
        <FilterPillBar
          aria-label="وضعیت"
          groups={[
            {
              kind: "toggle",
              id: "status",
              label: "وضعیت",
              options: statusOptions,
              value,
              onChange: setValue,
              allLabel: "همه",
            },
          ]}
        />
      </DirectionProvider>
    );
  },
};
