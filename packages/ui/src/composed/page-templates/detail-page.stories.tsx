import type { Meta, StoryObj } from "@storybook/react-vite";

import { Alert, AlertDescription } from "../../alert.js";
import { Button } from "../../button.js";
import { Skeleton } from "../../skeleton.js";
import { Row, RowList } from "../row-list.js";
import { DetailPage, DetailPageSection } from "./detail-page.js";

const meta = {
  title: "Templates/DetailPage",
  component: DetailPage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  globals: {
    direction: "rtl",
  },
} satisfies Meta<typeof DetailPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const back = { label: "کالاها", href: "/items" };

export const Default: Story = {
  render: () => (
    <DetailPage
      title="برنج هاشمی"
      description="کد ۱۰۴۲ · کیلوگرم"
      back={back}
      primaryAction={<Button>ثبت گردش</Button>}
      destructive={{
        title: "حذف کالا",
        children: (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              با حذف این کالا، سابقه گردش‌های آن نیز حذف می‌شود. این کار قابل
              بازگشت نیست.
            </p>
            <Button variant="destructive">حذف کالا</Button>
          </div>
        ),
      }}
    >
      <DetailPageSection title="موجودی در انبارها">
        <RowList>
          <Row
            trailing={
              <span className="text-sm text-muted-foreground">۴۵ کیلوگرم</span>
            }
          >
            <span className="text-sm font-medium">انبار مرکزی تهران</span>
          </Row>
          <Row
            trailing={
              <span className="text-sm text-muted-foreground">۱۲ کیلوگرم</span>
            }
          >
            <span className="text-sm font-medium">انبار شعبه شمال</span>
          </Row>
        </RowList>
      </DetailPageSection>
      <DetailPageSection
        title="مشخصات"
        action={<Button variant="ghost">ویرایش</Button>}
      >
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <dt className="text-muted-foreground">دسته‌بندی</dt>
          <dd className="text-foreground">غلات</dd>
          <dt className="text-muted-foreground">واحد شمارش</dt>
          <dd className="text-foreground">کیلوگرم</dd>
          <dt className="text-muted-foreground">حد سفارش</dt>
          <dd className="text-foreground">۲۰ کیلوگرم</dd>
        </dl>
      </DetailPageSection>
    </DetailPage>
  ),
};

export const Loading: Story = {
  render: () => (
    <DetailPage
      title="برنج هاشمی"
      description={<Skeleton className="h-4 w-40" />}
      back={back}
      primaryAction={<Skeleton className="h-11 w-28" />}
    >
      <DetailPageSection title="موجودی در انبارها">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      </DetailPageSection>
      <DetailPageSection title="مشخصات">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </DetailPageSection>
    </DetailPage>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <DetailPage
      title="برنج هاشمی"
      description="کد ۱۰۴۲ · کیلوگرم"
      back={back}
      primaryAction={<Button>ثبت گردش</Button>}
    >
      <DetailPageSection title="موجودی در انبارها">
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col items-start gap-3">
            <span>اطلاعات کالا بارگیری نشد.</span>
            <Button variant="outline">تلاش دوباره</Button>
          </AlertDescription>
        </Alert>
      </DetailPageSection>
      <DetailPageSection title="مشخصات">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <dt className="text-muted-foreground">دسته‌بندی</dt>
          <dd className="text-foreground">غلات</dd>
        </dl>
      </DetailPageSection>
    </DetailPage>
  ),
};
