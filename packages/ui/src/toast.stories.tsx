import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button.js";
import { Toaster } from "./toaster.js";
import { toast } from "./use-toast.js";

const meta = {
  title: "Components/Feedback/Toast",
  component: Toaster,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() => toast({ title: "Saved", variant: "success" })}
      >
        Trigger success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast({
            title: "Notice",
            description: "Something happened.",
          })
        }
      >
        Trigger default
      </Button>
      <Button
        variant="destructive"
        onClick={() =>
          toast({
            title: "Request error",
            description: "Could not complete the action.",
            variant: "destructive",
          })
        }
      >
        Trigger destructive
      </Button>
    </div>
  ),
};
