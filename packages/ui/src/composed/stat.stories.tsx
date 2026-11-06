import type { Meta, StoryObj } from "@storybook/react-vite";

import { Stat } from "./stat.js";

const meta = {
  title: "Composed/Stat",
  component: Stat,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Stat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "کل درآمد",
    value: 125000000,
    description: "مجموع تراکنش‌های ۳۰ روز گذشته",
    delta: {
      value: 14.8,
      label: "نسبت به ماه قبل",
      trend: "up",
    },
  },
};

export const NegativeTrend: Story = {
  args: {
    label: "کاربران فعال روزانه",
    value: 4820,
    description: "میانگین هفته جاری",
    delta: {
      value: -3.5,
      label: "نسبت به هفته قبل",
      trend: "down",
    },
  },
};

export const NeutralTrend: Story = {
  args: {
    label: "نرخ تبدیل سبد خرید",
    value: "۲.۴٪",
    description: "ثابت طی سه دوره اخیر",
    delta: {
      value: 0,
      label: "بدون تغییر",
      trend: "neutral",
    },
  },
};

export const EnglishLocale: Story = {
  args: {
    label: "Total Revenue",
    value: "$142,500.00",
    description: "Last 30 days of recurring billing",
    delta: {
      value: 12.3,
      label: "vs previous month",
      trend: "up",
    },
    locale: "en",
  },
};

export function MetricGrid() {
  return (
    <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
      <Stat
        label="فروش ماهانه"
        value={89400000}
        delta={{ value: 18.2, label: "رشد ماهانه" }}
      />
      <Stat
        label="سفارش‌های جدید"
        value={1240}
        delta={{ value: -2.1, label: "کاهش جزئی" }}
      />
      <Stat
        label="رضایت مشتریان"
        value="۹۸.۵٪"
        delta={{ value: 0.5, label: "بهبود کیفیت" }}
      />
    </div>
  );
}
