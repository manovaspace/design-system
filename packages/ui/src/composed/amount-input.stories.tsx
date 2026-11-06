import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { AmountInput } from "./amount-input.js";

const meta = {
  title: "Composed/AmountInput",
  component: AmountInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof AmountInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: 1250000,
    unit: "تومان",
    placeholder: "مبلغ را وارد کنید",
  },
};

export const WithQuickChips: Story = {
  args: {
    defaultValue: 500000,
    quick: [100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000],
    unit: "تومان",
  },
};

export const WithLimits: Story = {
  args: {
    defaultValue: 50000,
    min: 100000,
    max: 20000000,
    quick: [100_000, 500_000, 1_000_000],
    unit: "تومان",
  },
};

export const EnglishLocale: Story = {
  args: {
    locale: "en",
    unit: "USD",
    defaultValue: 2500,
    quick: [500, 1000, 2500, 5000],
    placeholder: "Enter amount",
  },
};

export function Interactive() {
  const [amount, setAmount] = React.useState<number | null>(1250000);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="space-y-1.5">
        <label
          htmlFor="interactive-amount"
          className="text-sm font-medium text-foreground"
        >
          مبلغ واریزی
        </label>
        <AmountInput
          id="interactive-amount"
          value={amount}
          onChange={setAmount}
          quick={[100_000, 500_000, 1_000_000, 2_500_000]}
          min={50000}
          max={10000000}
        />
      </div>
      <div className="rounded-md border bg-muted/40 p-3 text-xs">
        <p className="font-semibold text-muted-foreground">
          مقدار ذخیره شده در برنامه (Numeric):
        </p>
        <code className="font-mono text-foreground">
          {JSON.stringify(amount)}
        </code>
      </div>
    </div>
  );
}
