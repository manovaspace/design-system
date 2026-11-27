import type { Meta, StoryObj } from "@storybook/react-vite";

import { DataValue } from "./data-value.js";
import { FieldMessage } from "./field-feedback.js";
import { PhoneNumber } from "./phone-number.js";

const meta = {
  title: "Components/Data display/DataValue & PhoneNumber",
  component: DataValue,
  tags: ["autodocs"],
} satisfies Meta<typeof DataValue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PersianReadouts: Story = {
  render: () => (
    <div className="flex flex-col gap-4" dir="rtl">
      <DataValue value={1234567.89} locale="fa-IR" unit="تومان" />
      <PhoneNumber value="09121234567" locale="fa-IR" />
      <FieldMessage variant="error">مقدار واردشده معتبر نیست.</FieldMessage>
    </div>
  ),
};
