import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { Rating } from "./rating.js";

const meta = {
  title: "Composed/Rating",
  component: Rating,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Rating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: 4,
    max: 5,
  },
};

export const HalfStarPrecision: Story = {
  args: {
    defaultValue: 3.5,
    precision: 0.5,
    max: 5,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-center">
      <Rating defaultValue={4} size="sm" />
      <Rating defaultValue={4} size="md" />
      <Rating defaultValue={4} size="lg" />
    </div>
  ),
};

export const ReadOnly: Story = {
  args: {
    value: 4.5,
    precision: 0.5,
    readOnly: true,
  },
};

export const Disabled: Story = {
  args: {
    value: 3,
    disabled: true,
  },
};

export function Interactive() {
  const [rating, setRating] = React.useState<number>(4);

  return (
    <div className="flex flex-col items-center gap-3">
      <Rating value={rating} onChange={setRating} precision={0.5} size="lg" />
      <p className="text-sm text-muted-foreground">
        امتیاز ثبت‌شده: <strong className="text-foreground">{rating}</strong> از
        ۵
      </p>
    </div>
  );
}
