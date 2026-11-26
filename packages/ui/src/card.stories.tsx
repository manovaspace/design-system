import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card.js";

const meta = {
  title: "Components/Containment/Card",
  component: Card,
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Monthly report</CardTitle>
        <CardDescription>Summary for Mehr 1405</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          All branches submitted verified inventory counts.
        </p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline">Export</Button>
        <Button>Approve</Button>
      </CardFooter>
    </Card>
  ),
};
