import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { DatePicker } from "./date-picker.js";

const meta = {
  title: "Composed/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    onValueChange: () => undefined,
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Persian: Story = {
  args: {
    locale: "fa",
    label: "تاریخ تولد",
    value: "1990-05-21",
  },
};

export const English: Story = {
  args: {
    locale: "en",
    label: "Start date",
    value: "2026-11-15",
  },
};

export const WithMinDate: Story = {
  args: {
    locale: "en",
    label: "Due date",
    minDate: "2026-11-10",
    placeholder: "Select a due date",
  },
};

export function Clearable() {
  const [value, setValue] = React.useState("2026-11-15");

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <DatePicker
        locale="en"
        label="Delivery date"
        value={value}
        onValueChange={setValue}
        onClear={() => undefined}
        clearable
        minDate="2026-11-01"
      />
      <div className="rounded-md border bg-muted/40 p-3 text-xs">
        <p className="font-semibold text-muted-foreground">Stored value:</p>
        <code className="font-mono text-foreground">
          {JSON.stringify(value)}
        </code>
      </div>
    </div>
  );
}
