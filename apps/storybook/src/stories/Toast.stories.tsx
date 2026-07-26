import { Button, toast, Toaster } from "@manovaspace/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/Toast",
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
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast({
            title: "Heads up",
            description: "Something happened.",
          })
        }
      >
        Default
      </Button>
      <Button
        variant="destructive"
        onClick={() =>
          toast({
            title: "Failed",
            description: "Could not complete the action.",
            variant: "destructive",
          })
        }
      >
        Destructive
      </Button>
    </div>
  ),
};
