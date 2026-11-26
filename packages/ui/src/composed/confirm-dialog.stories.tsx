import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../button.js";
import { ConfirmDialog } from "./confirm-dialog.js";

const meta = {
  title: "Components/Containment/ConfirmDialog",
  component: ConfirmDialog,
  tags: ["autodocs"],
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj;

export const Destructive: Story = {
  render: () => (
    <ConfirmDialog
      trigger={<Button variant="destructive">Delete item</Button>}
      title="Delete item?"
      description="This action cannot be undone."
      confirmLabel="Delete"
      cancelLabel="Cancel"
      variant="destructive"
      onConfirm={() => undefined}
    />
  ),
};
