import type { Meta, StoryObj } from "@storybook/react-vite";
import type * as React from "react";

import { BarList } from "./bar-list.js";

const meta = {
  title: "Composed/BarList",
  component: BarList,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof BarList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Spend by category",
    items: [
      {
        key: "materials",
        label: "Materials",
        description: "12 receipts",
        value: 4200,
        valueLabel: "$4,200.00",
      },
      {
        key: "transport",
        label: "Transport",
        description: "8 receipts",
        value: 2100,
        valueLabel: "$2,100.00",
      },
      {
        key: "meals",
        label: "Meals",
        description: "5 receipts",
        value: 640,
        valueLabel: "$640.00",
      },
      {
        key: "software",
        label: "Software",
        description: "2 receipts",
        value: 120,
        valueLabel: "$120.00",
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    label: "Spend by category",
    items: [],
    emptyState: (
      <p className="text-sm text-muted-foreground">
        No receipts in this period.
      </p>
    ),
  },
};

export const Rtl: Story = {
  args: {
    label: "هزینه بر اساس دسته",
    items: [
      {
        key: "materials",
        label: "مواد اولیه",
        description: "۱۲ فیش",
        value: 4200,
        valueLabel: "۴٬۲۰۰٬۰۰۰ ریال",
      },
      {
        key: "transport",
        label: "حمل و نقل",
        description: "۸ فیش",
        value: 2100,
        valueLabel: "۲٬۱۰۰٬۰۰۰ ریال",
      },
      {
        key: "meals",
        label: "پذیرایی",
        description: "۵ فیش",
        value: 640,
        valueLabel: "۶۴۰٬۰۰۰ ریال",
      },
    ],
  },
  decorators: [
    (Story: () => React.ReactNode) => (
      <div dir="rtl" className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
};
