import type { Meta, StoryObj } from "@storybook/react-vite";

import { CopyableMoney } from "./copyable-money.js";

const meta = {
  title: "Components/Data display/CopyableMoney",
  component: CopyableMoney,
  tags: ["autodocs"],
} satisfies Meta<typeof CopyableMoney>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-3" dir="rtl">
      <CopyableMoney
        value={1450000}
        display="۱٬۴۵۰٬۰۰۰ تومان"
        copyLabel="کپی مبلغ"
        copiedLabel="کپی شد"
      />
      <CopyableMoney
        value={250000}
        display="۲۵۰٬۰۰۰ تومان"
        copyLabel="کپی مبلغ"
        copiedLabel="کپی شد"
        copiable={false}
        showIcon={false}
      />
    </div>
  ),
};
