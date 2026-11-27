import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { DirectionProvider } from "../direction-provider.js";
import { CalendarIcon, MoonIcon, SunIcon } from "../icons.js";
import { SegmentedControl } from "./segmented-control.js";

const meta = {
  title: "Components/Selection/SegmentedControl",
  component: SegmentedControl,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

const viewOptions = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

export const Default: Story = {
  args: {
    options: viewOptions,
    defaultValue: "week",
  },
};

export const WithIcons: Story = {
  args: {
    options: [
      { value: "light", label: "Light", icon: <SunIcon /> },
      { value: "dark", label: "Dark", icon: <MoonIcon /> },
      { value: "system", label: "System", icon: <CalendarIcon /> },
    ],
    defaultValue: "dark",
  },
};

export const Sizes: Story = {
  args: {
    options: viewOptions,
    defaultValue: "week",
  },
  render: (args) => (
    <div className="flex flex-col items-center gap-4">
      <SegmentedControl {...args} size="sm" />
      <SegmentedControl {...args} size="md" />
      <SegmentedControl {...args} size="lg" />
    </div>
  ),
};

export const DisabledOption: Story = {
  args: {
    options: [
      { value: "free", label: "Free" },
      { value: "pro", label: "Pro" },
      { value: "enterprise", label: "Enterprise (Contact)", disabled: true },
    ],
    defaultValue: "pro",
  },
};

export const PersianRtl: Story = {
  args: {
    options: [
      { value: "daily", label: "روزانه" },
      { value: "weekly", label: "هفتگی" },
      { value: "monthly", label: "ماهانه" },
      { value: "yearly", label: "سالانه" },
    ],
    defaultValue: "weekly",
  },
  render: (args) => (
    <DirectionProvider direction="rtl">
      <div dir="rtl" className="p-4">
        <SegmentedControl {...args} />
      </div>
    </DirectionProvider>
  ),
};

export function InteractiveControlled() {
  const [value, setValue] = React.useState("pro");

  return (
    <div className="flex flex-col items-center gap-3">
      <SegmentedControl
        options={[
          { value: "starter", label: "Starter" },
          { value: "pro", label: "Pro" },
          { value: "enterprise", label: "Enterprise" },
        ]}
        value={value}
        onChange={setValue}
      />
      <div className="text-xs text-muted-foreground">
        Selected plan: {value}
      </div>
    </div>
  );
}
