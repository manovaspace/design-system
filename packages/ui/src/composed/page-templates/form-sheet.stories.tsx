import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "../../button.js";
import { Input } from "../../input.js";
import { Field } from "../field.js";
import { FormSheet } from "./form-sheet.js";

const meta = {
  title: "Templates/FormSheet",
  component: FormSheet,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  globals: {
    direction: "rtl",
  },
  args: {
    open: true,
  },
} satisfies Meta<typeof FormSheet>;

export default meta;
type Story = StoryObj<{ open?: boolean }>;

type FieldSpec = {
  id: string;
  label: string;
  inputMode?: "text" | "numeric";
  placeholder?: string;
};

const ITEM_FIELDS: FieldSpec[] = [
  { id: "item-name", label: "نام کالا" },
  { id: "item-unit", label: "واحد", placeholder: "عدد، کیلوگرم، بسته" },
  {
    id: "item-opening",
    label: "موجودی اولیه",
    inputMode: "numeric",
    placeholder: "۰",
  },
];

const LONG_FIELDS: FieldSpec[] = [
  ...ITEM_FIELDS,
  { id: "item-code", label: "کد کالا" },
  { id: "item-category", label: "دسته‌بندی" },
  { id: "item-barcode", label: "بارکد", inputMode: "numeric" },
  { id: "item-supplier", label: "تأمین‌کننده" },
  { id: "item-min-stock", label: "حداقل موجودی", inputMode: "numeric" },
  { id: "item-max-stock", label: "حداکثر موجودی", inputMode: "numeric" },
  { id: "item-purchase-price", label: "قیمت خرید", inputMode: "numeric" },
  { id: "item-sale-price", label: "قیمت فروش", inputMode: "numeric" },
  { id: "item-shelf", label: "قفسه" },
  { id: "item-note", label: "یادداشت" },
];

type ItemFormSheetProps = {
  initialOpen?: boolean;
  fields?: FieldSpec[];
  pending?: boolean;
  error?: string;
};

function ItemFormSheet({
  initialOpen = true,
  fields = ITEM_FIELDS,
  pending = false,
  error,
}: ItemFormSheetProps) {
  const [open, setOpen] = useState(initialOpen);

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>افزودن کالا</Button>
      <FormSheet
        open={open}
        onOpenChange={setOpen}
        title="افزودن کالا"
        closeLabel="بستن"
        primaryAction={{
          label: "افزودن کالا",
          type: "submit",
          form: "item-form",
          pending,
        }}
        secondaryAction={{ label: "انصراف" }}
        error={error}
      >
        <form
          id="item-form"
          className="flex flex-col gap-4"
          onSubmit={(event) => event.preventDefault()}
        >
          {fields.map((field) => (
            <Field key={field.id} label={field.label}>
              <Input
                id={field.id}
                name={field.id}
                inputMode={field.inputMode}
                placeholder={field.placeholder}
              />
            </Field>
          ))}
        </form>
      </FormSheet>
    </div>
  );
}

export const Default: Story = {
  render: (args: { open?: boolean }) => (
    <ItemFormSheet initialOpen={args.open} />
  ),
};

export const Pending: Story = {
  render: (args: { open?: boolean }) => (
    <ItemFormSheet initialOpen={args.open} pending />
  ),
};

export const WithError: Story = {
  render: (args: { open?: boolean }) => (
    <ItemFormSheet
      initialOpen={args.open}
      error="ذخیره نشد. دوباره تلاش کنید."
    />
  ),
};

export const LongForm: Story = {
  render: (args: { open?: boolean }) => (
    <ItemFormSheet initialOpen={args.open} fields={LONG_FIELDS} />
  ),
};
