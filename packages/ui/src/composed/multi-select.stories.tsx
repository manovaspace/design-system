import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { DirectionProvider } from "../direction-provider.js";
import { MultiSelect, type MultiSelectOption } from "./multi-select.js";

const frameworks: MultiSelectOption[] = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
  { value: "angular", label: "Angular" },
  { value: "solid", label: "Solid" },
  { value: "qwik", label: "Qwik" },
];

const persianCities: MultiSelectOption[] = [
  { value: "tehran", label: "تهران" },
  { value: "mashhad", label: "مشهد" },
  { value: "isfahan", label: "اصفهان" },
  { value: "shiraz", label: "شیراز" },
  { value: "tabriz", label: "تبریز" },
  { value: "karaj", label: "کرج" },
  { value: "qom", label: "قم" },
  { value: "ahvaz", label: "اهواز" },
];

const meta = {
  title: "Composed/MultiSelect",
  component: MultiSelect,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div className="w-[340px] p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    options: frameworks,
    placeholder: "Select technologies...",
    locale: "en",
  },
};

export const PersianRtl: Story = {
  render: () => (
    <DirectionProvider direction="rtl">
      <div dir="rtl">
        <MultiSelect
          options={persianCities}
          placeholder="انتخاب شهرها..."
          locale="fa"
        />
      </div>
    </DirectionProvider>
  ),
};

export const WithPreselectedValues: Story = {
  args: {
    options: frameworks,
    defaultValue: ["react", "vue"],
    locale: "en",
  },
};

export const CollapsedExcessBadges: Story = {
  args: {
    options: frameworks,
    defaultValue: ["react", "vue", "svelte", "angular", "solid"],
    maxVisible: 2,
    locale: "en",
  },
};

export const CollapsedExcessPersian: Story = {
  render: () => (
    <DirectionProvider direction="rtl">
      <div dir="rtl">
        <MultiSelect
          options={persianCities}
          defaultValue={["tehran", "mashhad", "isfahan", "shiraz"]}
          maxVisible={2}
          locale="fa"
        />
      </div>
    </DirectionProvider>
  ),
};

export const MaxSelectionLimit: Story = {
  args: {
    options: frameworks,
    max: 2,
    placeholder: "Select maximum 2 items...",
    locale: "en",
  },
};

export const PlainStringOptions: Story = {
  args: {
    options: ["Design", "Engineering", "Marketing", "Product", "Sales"],
    placeholder: "Select departments...",
    locale: "en",
  },
};

export const Disabled: Story = {
  args: {
    options: frameworks,
    defaultValue: ["react", "vue"],
    disabled: true,
    locale: "en",
  },
};

export function ControlledInteractive() {
  const [selected, setSelected] = React.useState<string[]>([
    "tehran",
    "isfahan",
  ]);

  return (
    <DirectionProvider direction="rtl">
      <div dir="rtl" className="flex flex-col gap-3">
        <MultiSelect
          options={persianCities}
          value={selected}
          onChange={setSelected}
          locale="fa"
        />
        <div className="text-xs text-muted-foreground">
          انتخاب شده: {selected.join("، ") || "هیچ"}
        </div>
      </div>
    </DirectionProvider>
  );
}
