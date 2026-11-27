import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  BarList,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  Row,
  RowList,
  Skeleton,
  Stat,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@manovaspace/ui";
import { PickerTrigger } from "@manovaspace/ui/experimental";
import {
  ArrowLeftIcon,
  BellIcon,
  CheckIcon,
  ChevronRightIcon,
  HistoryIcon,
  MagnifyingGlassIcon,
  TrashIcon,
} from "@manovaspace/ui/icons";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Guidelines/Corner cases",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const RtlIconMirroring: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Directional icons (mirror in RTL)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
            <span>Next step</span>
            <ChevronRightIcon className="size-4 rtl:-scale-x-100" />
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
            <span>Back navigation</span>
            <ArrowLeftIcon className="size-4 rtl:-scale-x-100" />
          </div>
          <PickerTrigger
            placeholder="انتخاب دسته‌بندی…"
            icon={<MagnifyingGlassIcon className="size-4" />}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Semantic / temporal icons (never mirror)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 rounded-md border border-border p-3">
            <CheckIcon className="size-4 text-status-success" />
            <span>Checkmark</span>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-border p-3">
            <HistoryIcon className="size-4 text-muted-foreground" />
            <span>History / Clock</span>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-border p-3">
            <MagnifyingGlassIcon className="size-4 text-muted-foreground" />
            <span>Search</span>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-border p-3">
            <BellIcon className="size-4 text-muted-foreground" />
            <TrashIcon className="size-4 text-destructive" />
            <span>Bell / Trash</span>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
};

export const LongStringsAndDataStates: Story = {
  // a11y debt: heading-order (kit AlertTitle renders <h5>) — tracked, fix in follow-up
  parameters: { a11y: { test: "todo" } },
  render: () => (
    <div className="space-y-6">
      <div className="grid max-w-full gap-4 sm:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="truncate text-base">
              طولانی‌ترین عنوان فارسی برای بررسی کوتاه‌شدن متن درون کارت باریک در
              نمایش ۳۲۰ پیکسل
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <PickerTrigger
              label="SUPPLIER-NORTH-TEHRAN-WAREHOUSE-SUPER-LONG-UNBROKEN-SKU-CODE-2026-0001928374"
              placeholder="Select"
            />
            <RowList>
              <Row trailing={<Badge variant="outline">۱۲٬۴۵۰٬۰۰۰</Badge>}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    فاکتور شماره ۱۴۰۵-۹۸۷۶۵۴۳۲۱-خیلی-طولانی-برای-آزمایش-برش-متن
                  </p>
                  <p
                    dir="ltr"
                    className="truncate text-xs text-muted-foreground"
                  >
                    INV_2026_ULTRA_LONG_NON_WRAPPING_IDENTIFIER_ALPHA_BETA_GAMMA
                  </p>
                </div>
              </Row>
            </RowList>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-base">Stat & BarList states</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Stat
              label="درآمد خالص شعبه مرکزی تهران با توضیح اضافه طولانی"
              value="۱۴۸٬۹۲۰٬۰۰۰ تومان"
              delta={{ value: 12.4, trend: "up" }}
              locale="fa"
            />
            <BarList
              label="گزارش دسته‌بندی‌ها"
              items={[
                {
                  key: "long-en",
                  label:
                    "ULTRA_LONG_CATEGORY_NAME_WITHOUT_SPACES_FOR_OVERFLOW_GUARD",
                  value: 84,
                  valueLabel: "۸۴٪",
                },
                {
                  key: "long-fa",
                  label: "اقلام مصرفی آشپزخانه مرکزی شعبه غرب تهران",
                  value: 52,
                  valueLabel: "۵۲٪",
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Empty state</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<MagnifyingGlassIcon className="size-6" />}
              title="نتیجه‌ای یافت نشد"
              description="فیلترهای فعال را تغییر دهید یا عبارت دیگری جست‌وجو کنید."
              action={<Button size="sm">پاک‌کردن فیلتر</Button>}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Loading state</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-5/6" />
            <Skeleton className="h-8 w-2/3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Error state</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert variant="destructive">
              <AlertTitle>خطا در دریافت داده‌ها</AlertTitle>
              <AlertDescription>
                ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.
              </AlertDescription>
            </Alert>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>کد</TableHead>
                  <TableHead>وضعیت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell dir="ltr">TX-404</TableCell>
                  <TableCell>ناموفق</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  ),
};

export const TouchTargetsAndStickyFocus: Story = {
  render: () => (
    <div className="space-y-4">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur">
        <span className="truncate text-sm font-semibold">
          Sticky header (scroll-margin-block-start clears focus)
        </span>
        <Button size="sm" variant="outline" data-testid="compact-target">
          Compact 32px
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Target sizes (&gt;= 24px compact, &gt;= 44px touch)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button size="touch" data-testid="touch-target">
            Touch Primary (44px+)
          </Button>
          <Button
            size="icon-touch"
            variant="outline"
            aria-label="Touch Search"
            data-testid="touch-target"
          >
            <MagnifyingGlassIcon className="size-5" />
          </Button>
          <Button size="sm" variant="secondary" data-testid="compact-target">
            Desktop 32px
          </Button>
          <div className="w-full max-w-xs">
            <Input
              aria-label="Sticky clearance focus target"
              placeholder="Tab to focus safely below sticky bar"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  ),
};
