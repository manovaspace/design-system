import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button.js";
import { Card, CardContent, CardHeader, CardTitle } from "./card.js";
import { Input } from "./input.js";

const meta = {
  title: "Components/Actions/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "outline",
        "ghost",
        "destructive",
        "link",
      ],
    },
    size: {
      control: "select",
      options: ["default", "xs", "sm", "lg", "touch", "icon"],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Get started",
  },
};

export const VariantsAndDisabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button disabled>Disabled default</Button>
        <Button variant="secondary" disabled>
          Disabled secondary
        </Button>
        <Button variant="outline" disabled>
          Disabled outline
        </Button>
        <Button variant="ghost" disabled>
          Disabled ghost
        </Button>
      </div>
    </div>
  ),
};

export const Touch: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button>Default (36 px)</Button>
      <Button size="touch">Touch (44 px)</Button>
    </div>
  ),
};

export const WithCard: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Example</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Input placeholder="Email" />
        <Button>Submit</Button>
      </CardContent>
    </Card>
  ),
};
