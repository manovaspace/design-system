import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "../../skeleton.js";
import { Row } from "../row-list.js";
import { Stat } from "../stat.js";
import { SummaryPage } from "./summary-page.js";

const meta = {
  title: "Templates/SummaryPage",
  component: SummaryPage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  globals: {
    direction: "rtl",
  },
} satisfies Meta<typeof SummaryPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const links = {
  title: "بخش‌ها",
  children: (
    <>
      <Row asChild chevron>
        <a href="/items">
          <span className="flex min-w-0 flex-col">
            <span className="text-sm font-medium">کالاها</span>
            <span className="text-xs text-muted-foreground">
              فهرست کالاها و مشخصات هر کالا
            </span>
          </span>
        </a>
      </Row>
      <Row asChild chevron>
        <a href="/locations">
          <span className="flex min-w-0 flex-col">
            <span className="text-sm font-medium">انبارها</span>
            <span className="text-xs text-muted-foreground">
              انبار مرکزی و قفسه‌های هر انبار
            </span>
          </span>
        </a>
      </Row>
      <Row asChild chevron>
        <a href="/transfers">
          <span className="flex min-w-0 flex-col">
            <span className="text-sm font-medium">گردش‌ها</span>
            <span className="text-xs text-muted-foreground">
              ورود، خروج و انتقال بین انبارها
            </span>
          </span>
        </a>
      </Row>
      <Row asChild chevron>
        <a href="/reports">
          <span className="flex min-w-0 flex-col">
            <span className="text-sm font-medium">گزارش‌ها</span>
            <span className="text-xs text-muted-foreground">
              موجودی، ارزش و تاریخچه کالاها
            </span>
          </span>
        </a>
      </Row>
    </>
  ),
};

export const Default: Story = {
  args: {
    "aria-label": "خانه انبار",
    stats: (
      <>
        <Stat label="کالاها" value="۱۲۸" />
        <Stat label="کم‌موجودی" value="۷" />
        <Stat label="گردش امروز" value="۲۳" />
        <Stat label="ارزش موجودی" value="۴۸٬۵۰۰٬۰۰۰ تومان" />
      </>
    ),
    attention: {
      title: "نیازمند اقدام",
      emptyMessage: "همه‌چیز مرتب است. موردی برای رسیدگی نیست.",
      children: (
        <>
          <Row>
            <span className="text-sm font-medium">
              روغن آفتابگردان — ۲ لیتر مانده
            </span>
          </Row>
          <Row>
            <span className="text-sm font-medium">شکر سفید — زیر حد سفارش</span>
          </Row>
        </>
      ),
    },
    links,
  },
};

export const NothingNeedsAttention: Story = {
  args: {
    "aria-label": "خانه انبار",
    stats: (
      <>
        <Stat label="کالاها" value="۱۲۸" />
        <Stat label="کم‌موجودی" value="۰" />
        <Stat label="گردش امروز" value="۲۳" />
        <Stat label="ارزش موجودی" value="۴۸٬۵۰۰٬۰۰۰ تومان" />
      </>
    ),
    attention: {
      title: "نیازمند اقدام",
      emptyMessage: "همه‌چیز مرتب است. موردی برای رسیدگی نیست.",
    },
    links,
  },
};

export const Loading: Story = {
  args: {
    "aria-label": "خانه انبار",
    stats: (
      <>
        <Stat label="کالاها" value={<Skeleton className="h-8 w-20" />} />
        <Stat label="کم‌موجودی" value={<Skeleton className="h-8 w-16" />} />
        <Stat label="گردش امروز" value={<Skeleton className="h-8 w-16" />} />
        <Stat label="ارزش موجودی" value={<Skeleton className="h-8 w-40" />} />
      </>
    ),
    attention: {
      title: "نیازمند اقدام",
      emptyMessage: "همه‌چیز مرتب است. موردی برای رسیدگی نیست.",
      children: (
        <>
          {[0, 1, 2].map((index) => (
            <Row key={index}>
              <div className="flex w-full flex-col gap-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </Row>
          ))}
        </>
      ),
    },
    links,
  },
};
