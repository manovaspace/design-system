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

const STICKY_DEMO_ROWS = [
  "علی محمدی",
  "نرگس احمدی",
  "رضا کریمی",
  "مریم حسینی",
  "حسین رضایی",
  "زهرا موسوی",
  "امیر جعفری",
  "سارا نوری",
  "محمد صادقی",
  "فاطمه اکبری",
  "پریسا تهرانی",
  "کامران ملکی",
];

export const StickyToolbar: Story = {
  args: {
    title: "کاربران",
    description: "مدیریت و مشاهده کاربران سامانه",
    stickyToolbar: true,
    primaryAction: <Button type="button">افزودن کاربر</Button>,
    toolbar: <div className="p-2 text-sm">نوار ابزار</div>,
    resultMeta: <span className="text-sm">۱۲ مورد</span>,
    children: (
      <div className="flex flex-col gap-px">
        {STICKY_DEMO_ROWS.map((row) => (
          <div key={row} className="p-4 text-sm">
            {row}
          </div>
        ))}
      </div>
    ),
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
