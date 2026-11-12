import type { Meta, StoryObj } from "@storybook/react-vite";

import { DirectionProvider } from "../direction-provider.js";
import { Row, RowList } from "./row-list.js";

const meta = {
  title: "Composed/RowList",
  component: RowList,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof RowList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inset: Story = {
  render: () => (
    <div className="max-w-md mx-auto p-4 bg-background">
      <RowList variant="inset">
        <Row chevron>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Account Settings</span>
            <span className="text-xs text-muted-foreground">
              Manage profile and security
            </span>
          </div>
        </Row>
        <Row chevron>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Notifications</span>
            <span className="text-xs text-muted-foreground">
              Email and push preferences
            </span>
          </div>
        </Row>
        <Row
          trailing={
            <span className="text-xs text-muted-foreground">v1.4.0</span>
          }
        >
          <span className="text-sm font-medium">Version</span>
        </Row>
      </RowList>
    </div>
  ),
};

export const Flush: Story = {
  render: () => (
    <div className="max-w-md mx-auto p-4 bg-card">
      <RowList variant="flush">
        <Row chevron>
          <span className="text-sm font-medium">Edge to edge row 1</span>
        </Row>
        <Row chevron>
          <span className="text-sm font-medium">Edge to edge row 2</span>
        </Row>
        <Row>
          <span className="text-sm font-medium">Edge to edge row 3</span>
        </Row>
      </RowList>
    </div>
  ),
};

export const WithLeading: Story = {
  render: () => (
    <div className="max-w-md mx-auto p-4 bg-background">
      <RowList>
        <Row
          leading={
            <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
              JD
            </div>
          }
          chevron
        >
          <div className="flex flex-col">
            <span className="text-sm font-medium">Jane Doe</span>
            <span className="text-xs text-muted-foreground">
              jane@example.com
            </span>
          </div>
        </Row>
        <Row
          leading={
            <div className="size-8 rounded-full bg-status-success/10 text-status-success flex items-center justify-center text-xs font-semibold">
              AS
            </div>
          }
          chevron
        >
          <div className="flex flex-col">
            <span className="text-sm font-medium">Alex Smith</span>
            <span className="text-xs text-muted-foreground">
              alex@example.com
            </span>
          </div>
        </Row>
      </RowList>
    </div>
  ),
};

export const Selected: Story = {
  render: () => (
    <div className="max-w-md mx-auto p-4 bg-background">
      <RowList>
        <Row selected>
          <span className="text-sm font-medium">Standard Plan (Selected)</span>
        </Row>
        <Row>
          <span className="text-sm font-medium">Pro Plan</span>
        </Row>
        <Row>
          <span className="text-sm font-medium">Enterprise Plan</span>
        </Row>
      </RowList>
    </div>
  ),
};

export const LongText: Story = {
  render: () => (
    <div className="max-w-sm mx-auto p-4 bg-background">
      <RowList>
        <Row
          leading={
            <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs">
              📦
            </div>
          }
          trailing={
            <span className="text-xs text-muted-foreground shrink-0">
              12,000,000 T
            </span>
          }
          chevron
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">
              Very long item title that would overflow the container if not
              truncated properly
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Secondary description with extensive details about batch numbers
              and inventory
            </p>
          </div>
        </Row>
      </RowList>
    </div>
  ),
};

export const PersianRtl: Story = {
  render: () => (
    <DirectionProvider direction="rtl">
      <div dir="rtl" className="max-w-md mx-auto p-4 bg-background">
        <RowList>
          <Row
            leading={
              <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                ع‌ج
              </div>
            }
            chevron
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium">علیرضا جعفرتاش</span>
              <span className="text-xs text-muted-foreground">مدیر سیستم</span>
            </div>
          </Row>
          <Row
            selected
            trailing={
              <span className="text-xs text-muted-foreground">فعال</span>
            }
          >
            <span className="text-sm font-medium">انبار مرکزی تهران</span>
          </Row>
          <Row
            chevron
            trailing={
              <span className="text-xs text-muted-foreground">۲۴ عدد</span>
            }
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">
                روغن مایع خوراکی آفتابگردان ۵ لیتری لادن
              </p>
              <p className="text-xs text-muted-foreground truncate">
                قفسه سردخانه شماره ۳
              </p>
            </div>
          </Row>
        </RowList>
      </div>
    </DirectionProvider>
  ),
};
