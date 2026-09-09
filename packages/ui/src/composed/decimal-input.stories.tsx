import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { DecimalInput } from "./decimal-input.js";

const meta = {
  title: "Composed/DecimalInput",
  component: DecimalInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof DecimalInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "1234.56",
    placeholder: "0.00",
    onValueChange: () => {},
  },
};

export const WithUnitLabel: Story = {
  args: {
    value: "75.250",
    unitLabel: "kg",
    placeholder: "0.000",
    onValueChange: () => {},
  },
};

export const IntegerOnly: Story = {
  args: {
    value: "1500",
    integer: true,
    unitLabel: "units",
    placeholder: "0",
    onValueChange: () => {},
  },
};

export const AllowNegative: Story = {
  args: {
    value: "-12.5",
    allowNegative: true,
    unitLabel: "delta",
    placeholder: "0.0",
    onValueChange: () => {},
  },
};

export const AutoLocked: Story = {
  args: {
    value: "499.00",
    autoLocked: true,
    unitLabel: "toman",
    placeholder: "0",
    onValueChange: () => {},
  },
};

export function Interactive() {
  const [value, setValue] = React.useState("1250000");

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="space-y-1.5">
        <label
          htmlFor="amount-input"
          className="text-sm font-medium text-foreground"
        >
          Amount (Toman)
        </label>
        <DecimalInput
          id="amount-input"
          value={value}
          onValueChange={setValue}
          unitLabel="toman"
          placeholder="0"
        />
      </div>
      <div className="rounded-md border bg-muted/40 p-3 text-xs">
        <p className="font-semibold text-muted-foreground">
          Internal State (Latin):
        </p>
        <code className="font-mono text-foreground">
          {JSON.stringify(value)}
        </code>
      </div>
    </div>
  );
}
