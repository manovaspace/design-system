import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { WheelDatePicker } from "./wheel-date-picker.js";

const meta = {
  title: "Components/WheelDatePicker",
  component: WheelDatePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof WheelDatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

function WheelDatePickerDemo(
  props: Partial<React.ComponentProps<typeof WheelDatePicker>>,
) {
  const [value, setValue] = useState<string | undefined>(props.value);

  return (
    <div className="w-72">
      <WheelDatePicker {...props} value={value} onValueChange={setValue} />
    </div>
  );
}

export const Default: Story = {
  render: () => <WheelDatePickerDemo />,
};

export const WithLimits: Story = {
  render: () => (
    <WheelDatePickerDemo min="2026-01-01" max="2026-12-29" value="2026-09-20" />
  ),
};
