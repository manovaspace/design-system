import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../../button.js";
import { EntityBrowser } from "./entity-browser.js";

const meta = {
  title: "Composed/EntityBrowser",
  component: EntityBrowser,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof EntityBrowser>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithTitle: Story = {
  args: {
    title: "کاربران",
    description: "مدیریت و مشاهده کاربران سامانه",
    primaryAction: <Button type="button">افزودن کاربر</Button>,
    children: <div className="p-4 text-sm">لیست داده‌ها</div>,
  },
};

export const WithoutTitle: Story = {
  args: {
    "aria-label": "کاربران",
    description: "مدیریت و مشاهده کاربران سامانه",
    primaryAction: <Button type="button">افزودن کاربر</Button>,
    children: <div className="p-4 text-sm">لیست داده‌ها</div>,
  },
};
