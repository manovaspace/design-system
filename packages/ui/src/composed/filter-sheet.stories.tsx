import type { Meta, StoryObj } from "@storybook/react-vite";
import type { JSX } from "react";
import { useState } from "react";

import { Button } from "../button.js";
import { DirectionProvider } from "../direction-provider.js";
import { FilterSheet, type FilterSheetField } from "./filter-sheet.js";

const meta = {
  title: "Components/Selection/FilterSheet",
  component: FilterSheet,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof FilterSheet>;

export default meta;
type Story = StoryObj;

const englishCopy = {
  title: "Filters",
  closeLabel: "Close filters",
  backLabel: "Back",
  open: "Open filters",
  freeShipping: "Free shipping",
  freeShippingDescription: "Only items shipped at no cost",
  city: "City",
  allCities: "All cities",
  searchCity: "Search city",
  sort: "Sort",
  relevance: "Relevance",
  tags: "Tags",
  brand: "Brand",
  price: "Price range",
  priceBody: "A custom page can hold any controls, such as a range slider.",
  reset: "Reset",
  apply: "Show 52 results",
  done: "Done",
  cityOptions: ["Tehran", "Mashhad", "Shiraz"],
  sortOptions: ["Newest", "Cheapest"],
  tagOptions: ["New", "On sale", "In stock"],
};

const persianCopy: typeof englishCopy = {
  title: "فیلترها",
  closeLabel: "بستن فیلترها",
  backLabel: "بازگشت",
  open: "باز کردن فیلترها",
  freeShipping: "ارسال رایگان",
  freeShippingDescription: "فقط کالاهایی که بدون هزینه ارسال می‌شوند",
  city: "شهر",
  allCities: "همه شهرها",
  searchCity: "جست‌وجوی شهر",
  sort: "مرتب‌سازی",
  relevance: "مرتبط‌ترین",
  tags: "برچسب‌ها",
  brand: "برند",
  price: "بازه قیمت",
  priceBody: "صفحه سفارشی می‌تواند هر کنترلی مثل نوار لغزان داشته باشد.",
  reset: "پاک کردن",
  apply: "نمایش ۵۲ نتیجه",
  done: "انجام شد",
  cityOptions: ["تهران", "مشهد", "شیراز"],
  sortOptions: ["جدیدترین", "ارزانترین"],
  tagOptions: ["جدید", "در حراجی", "موجود"],
};

type DemoState = {
  freeShipping: boolean;
  city: string | null;
  sort: string | null;
  tags: string[];
};

const emptyState: DemoState = {
  freeShipping: false,
  city: null,
  sort: null,
  tags: [],
};

/** Every field kind in one sheet, with local state. */
function FilterSheetDemo({ rtl = false }: { rtl?: boolean }): JSX.Element {
  const copy = rtl ? persianCopy : englishCopy;
  const [open, setOpen] = useState(true);
  const [state, setState] = useState<DemoState>(emptyState);

  const cityOptions = [
    { value: "tehran", label: copy.cityOptions[0] ?? "" },
    { value: "mashhad", label: copy.cityOptions[1] ?? "" },
    { value: "shiraz", label: copy.cityOptions[2] ?? "" },
  ];
  const sortOptions = [
    { value: "newest", label: copy.sortOptions[0] ?? "" },
    { value: "cheapest", label: copy.sortOptions[1] ?? "" },
  ];
  const tagOptions = [
    { value: "new", label: copy.tagOptions[0] ?? "" },
    { value: "sale", label: copy.tagOptions[1] ?? "" },
    { value: "stock", label: copy.tagOptions[2] ?? "" },
  ];

  const fields: FilterSheetField[] = [
    {
      id: "free-shipping",
      kind: "toggle",
      label: copy.freeShipping,
      description: copy.freeShippingDescription,
      checked: state.freeShipping,
      onCheckedChange: (checked) =>
        setState((current) => ({ ...current, freeShipping: checked })),
    },
    {
      id: "city",
      kind: "single",
      label: copy.city,
      options: cityOptions,
      value: state.city,
      onValueChange: (value) =>
        setState((current) => ({ ...current, city: value })),
      allLabel: copy.allCities,
      search: { placeholder: copy.searchCity },
    },
    {
      id: "sort",
      kind: "single",
      label: copy.sort,
      options: sortOptions,
      value: state.sort,
      onValueChange: (value) =>
        setState((current) => ({ ...current, sort: value })),
      allLabel: copy.relevance,
    },
    {
      id: "tags",
      kind: "multi",
      label: copy.tags,
      options: tagOptions,
      values: state.tags,
      onValuesChange: (values) =>
        setState((current) => ({ ...current, tags: values })),
    },
    {
      id: "brand",
      kind: "link",
      label: copy.brand,
      active: false,
      onPress: () => {},
    },
    {
      id: "price",
      kind: "page",
      label: copy.price,
      active: false,
      children: (
        <p className="text-sm text-muted-foreground">{copy.priceBody}</p>
      ),
    },
  ];

  const resetDisabled =
    !state.freeShipping &&
    state.city === null &&
    state.sort === null &&
    state.tags.length === 0;

  const content = (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        {copy.open}
      </Button>
      <FilterSheet
        open={open}
        onOpenChange={setOpen}
        title={copy.title}
        closeLabel={copy.closeLabel}
        backLabel={copy.backLabel}
        fields={fields}
        resetLabel={copy.reset}
        onReset={() => setState(emptyState)}
        resetDisabled={resetDisabled}
        applyLabel={copy.apply}
        doneLabel={copy.done}
      />
    </>
  );

  return rtl ? (
    <DirectionProvider direction="rtl">
      <div dir="rtl" className="p-4">
        {content}
      </div>
    </DirectionProvider>
  ) : (
    <div className="p-4">{content}</div>
  );
}

export const AllFieldKinds: Story = {
  render: () => <FilterSheetDemo />,
};

export const PersianRtl: Story = {
  render: () => <FilterSheetDemo rtl />,
};
