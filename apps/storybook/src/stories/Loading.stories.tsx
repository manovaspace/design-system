import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Spinner,
} from "@manovaspace/ui";
import {
  LoadingOverlay,
  LoadingScreen,
  LoadingStatus,
} from "@manovaspace/ui/loading";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

const meta = {
  title: "Components/Loading",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const SkeletonShapes: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex items-center gap-3">
        <Skeleton className="size-12 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  ),
};

export const SpinnerSizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner size="sm" label="Loading small" />
      <Spinner size="md" label="Loading medium" />
      <Spinner size="lg" label="Loading large" />
    </div>
  ),
};

export const LoadingScreenStory: Story = {
  name: "LoadingScreen",
  render: () => (
    <LoadingScreen
      className="min-h-[320px] rounded-lg border"
      logo={
        <div className="flex size-16 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground">
          O
        </div>
      }
      label="Loading application"
      description="Preparing your workspace"
    />
  ),
};

export const LoadingOverlayStory: Story = {
  name: "LoadingOverlay",
  render: () => (
    <LoadingOverlay visible label="Saving changes">
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Content stays mounted under the overlay.
          </p>
        </CardContent>
      </Card>
    </LoadingOverlay>
  ),
};

function LoadingStatusDemo() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="flex max-w-sm flex-col gap-4">
      <button
        type="button"
        className="rounded-md border px-3 py-2 text-sm"
        onClick={() => setLoading((value) => !value)}
      >
        Toggle loading ({loading ? "on" : "off"})
      </button>
      <LoadingStatus loading={loading} label="Loading content">
        <Card>
          <CardHeader>
            <CardTitle>Loaded content</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Spinner shows after 300ms when loading is on; content returns
              immediately when loading stops.
            </p>
          </CardContent>
        </Card>
      </LoadingStatus>
    </div>
  );
}

export const LoadingStatusStory: Story = {
  name: "LoadingStatus",
  render: () => <LoadingStatusDemo />,
};
