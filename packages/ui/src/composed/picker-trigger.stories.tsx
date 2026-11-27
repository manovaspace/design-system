import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { UserIcon } from "../icons.js";
import { Field } from "./field.js";
import { PickerTrigger } from "./picker-trigger.js";

const meta = {
  title: "Components/Selection/PickerTrigger",
  component: PickerTrigger,
  tags: ["autodocs"],
  args: {
    placeholder: "Select vendor...",
    onClick: fn(),
  },
} satisfies Meta<typeof PickerTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: (args) => (
    <div className="flex w-72 flex-col gap-4">
      <Field label="Empty trigger">
        <PickerTrigger
          placeholder="Select vendor..."
          icon={<UserIcon className="size-3.5" />}
          onClick={args.onClick}
        />
      </Field>
      <Field label="Selected value (touch)">
        <PickerTrigger
          size="touch"
          icon={<UserIcon className="size-3.5" />}
          label="Fryto Kitchen"
          changeLabel="Change"
          placeholder="Select vendor..."
          onClick={args.onClick}
        />
      </Field>
      <Field label="Disabled">
        <PickerTrigger
          disabled
          placeholder="Select vendor..."
          icon={<UserIcon className="size-3.5" />}
        />
      </Field>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Empty trigger/ });
    await userEvent.click(trigger);
    expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
