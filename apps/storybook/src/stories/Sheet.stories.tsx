import {
  Button,
  buttonVariants,
  cn,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@manovaspace/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/Sheet",
  component: Sheet,
  tags: ["autodocs"],
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger className={cn(buttonVariants({ variant: "outline" }))}>
        Open sheet
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Panel</SheetTitle>
          <SheetDescription>
            Edge-docked panel for filters, details, or mobile nav.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4">
          <Button variant="outline">Action</Button>
        </div>
      </SheetContent>
    </Sheet>
  ),
};
