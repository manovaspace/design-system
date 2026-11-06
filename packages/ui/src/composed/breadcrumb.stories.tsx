import type { Meta, StoryObj } from "@storybook/react-vite";

import { DirectionProvider } from "../direction-provider.js";
import { Breadcrumb } from "./breadcrumb.js";

const meta = {
  title: "Composed/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultItems = [
  { label: "Home", href: "/" },
  { label: "Components", href: "/components" },
  { label: "Navigation", href: "/components/navigation" },
  { label: "Breadcrumb" },
];

export const Default: Story = {
  args: {
    items: defaultItems,
  },
};

export const SlashSeparator: Story = {
  args: {
    items: defaultItems,
    separator: "/",
  },
};

export const WithoutLinks: Story = {
  args: {
    items: [
      { label: "Dashboard" },
      { label: "Invoices" },
      { label: "INV-2024-001" },
    ],
  },
};

export const PersianRtl: Story = {
  render: () => (
    <DirectionProvider direction="rtl">
      <div dir="rtl" className="p-4">
        <Breadcrumb
          items={[
            { label: "خانه", href: "/" },
            { label: "محصولات", href: "/products" },
            { label: "الکترونیک", href: "/products/electronics" },
            { label: "لپ‌تاپ گیمینگ" },
          ]}
        />
      </div>
    </DirectionProvider>
  ),
};
