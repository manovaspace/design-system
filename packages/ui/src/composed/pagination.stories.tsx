import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { DirectionProvider } from "../direction-provider.js";
import { Pagination } from "./pagination.js";

const meta = {
  title: "Composed/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    page: 1,
    pageSize: 10,
    total: 100,
    onChange: () => {},
  },
};

export const MiddlePageWithDots: Story = {
  args: {
    page: 6,
    pageSize: 10,
    total: 200,
    onChange: () => {},
  },
};

export const PersianRtl: Story = {
  render: () => (
    <DirectionProvider direction="rtl">
      <div dir="rtl" className="p-4">
        <Pagination
          page={3}
          pageSize={10}
          total={80}
          locale="fa"
          onChange={() => {}}
        />
      </div>
    </DirectionProvider>
  ),
};

export function Interactive() {
  const [page, setPage] = React.useState(1);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="text-sm text-muted-foreground">Current Page: {page}</div>
      <Pagination page={page} pageSize={10} total={120} onChange={setPage} />
    </div>
  );
}

export function InteractivePersian() {
  const [page, setPage] = React.useState(1);

  return (
    <DirectionProvider direction="rtl">
      <div dir="rtl" className="flex flex-col items-center gap-4 p-4">
        <div className="text-sm text-muted-foreground">صفحه فعلی: {page}</div>
        <Pagination
          page={page}
          pageSize={10}
          total={150}
          locale="fa"
          onChange={setPage}
        />
      </div>
    </DirectionProvider>
  );
}
