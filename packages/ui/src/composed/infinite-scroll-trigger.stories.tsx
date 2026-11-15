import type { Meta, StoryObj } from "@storybook/react-vite";

import { DirectionProvider } from "../direction-provider.js";
import { InfiniteScrollTrigger } from "./infinite-scroll-trigger.js";

const meta = {
  title: "Composed/InfiniteScrollTrigger",
  component: InfiniteScrollTrigger,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof InfiniteScrollTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

const labels = {
  loadMoreLabel: "بارگذاری موارد بیشتر",
  loadingLabel: "در حال بارگذاری",
  retryLabel: "تلاش دوباره",
};

export const Idle: Story = {
  args: {
    hasMore: true,
    loading: false,
    onLoadMore: () => {},
    loadingLabel: "Loading",
    loadMoreLabel: "Load more",
  },
  render: () => (
    <DirectionProvider direction="rtl">
      <InfiniteScrollTrigger
        hasMore
        loading={false}
        onLoadMore={() => {}}
        {...labels}
      />
    </DirectionProvider>
  ),
};

export const Loading: Story = {
  args: {
    hasMore: true,
    loading: true,
    onLoadMore: () => {},
    loadingLabel: "Loading",
    loadMoreLabel: "Load more",
  },
  render: () => (
    <DirectionProvider direction="rtl">
      <InfiniteScrollTrigger
        hasMore
        loading
        onLoadMore={() => {}}
        {...labels}
      />
    </DirectionProvider>
  ),
};

export const Failed: Story = {
  args: {
    hasMore: true,
    loading: false,
    failed: true,
    onLoadMore: () => {},
    loadingLabel: "Loading",
    loadMoreLabel: "Load more",
  },
  render: () => (
    <DirectionProvider direction="rtl">
      <InfiniteScrollTrigger
        hasMore
        loading={false}
        failed
        onLoadMore={() => {}}
        {...labels}
      />
    </DirectionProvider>
  ),
};

export const Exhausted: Story = {
  args: {
    hasMore: false,
    loading: false,
    onLoadMore: () => {},
    loadingLabel: "Loading",
    loadMoreLabel: "Load more",
  },
  render: () => (
    <DirectionProvider direction="rtl">
      <InfiniteScrollTrigger
        hasMore={false}
        loading={false}
        onLoadMore={() => {}}
        {...labels}
      />
    </DirectionProvider>
  ),
};
