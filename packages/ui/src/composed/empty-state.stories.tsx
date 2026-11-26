import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../button.js";
import { InformationCircleIcon } from "../icons.js";
import { EmptyState } from "./empty-state.js";

const meta = {
  title: "Components/Feedback/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <EmptyState
      icon={<InformationCircleIcon className="size-6" />}
      title="No projects yet"
      description="Create a project to start organizing your work."
      action={<Button>Create project</Button>}
    />
  ),
};
