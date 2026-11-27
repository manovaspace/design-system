import type { Meta, StoryObj } from "@storybook/react-vite";

import { Alert, AlertDescription, AlertTitle } from "./alert.js";

const meta = {
  title: "Components/Feedback/Alert",
  component: Alert,
  tags: ["autodocs"],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-4">
      <Alert>
        <AlertTitle>Info</AlertTitle>
        <AlertDescription>Your changes are ready to review.</AlertDescription>
      </Alert>
      <Alert variant="success">
        <AlertTitle>Published</AlertTitle>
        <AlertDescription>The latest version is live.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Save failed</AlertTitle>
        <AlertDescription>Check the form and try again.</AlertDescription>
      </Alert>
    </div>
  ),
};
