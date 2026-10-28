import { Button, ProgressiveDialog } from "@manovaspace/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

const steps = [
  { id: "source", label: "Source" },
  { id: "items", label: "Items" },
  { id: "details", label: "Details" },
  { id: "review", label: "Review" },
];

const labels = { close: "Close", back: "Back", steps: "Progress" };

type DemoProps = {
  initialStep: number;
  pending?: boolean;
  error?: string;
  onClose: () => void;
};

/** Holds the step in state so Continue and Back work as they would in a product. */
function ProgressiveDialogDemo({
  initialStep,
  pending = false,
  error,
  onClose,
}: DemoProps) {
  const [open, setOpen] = useState(true);
  const [stepIndex, setStepIndex] = useState(initialStep);
  const isLast = stepIndex === steps.length - 1;

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open wizard
      </Button>
      <ProgressiveDialog
        open={open}
        onClose={() => {
          onClose();
          setOpen(false);
        }}
        title="Transfer"
        steps={steps}
        stepIndex={stepIndex}
        onBack={() => setStepIndex((index) => Math.max(0, index - 1))}
        primaryAction={{
          label: isLast ? "Submit" : "Continue",
          onClick: () =>
            setStepIndex((index) => Math.min(steps.length - 1, index + 1)),
          pending,
        }}
        error={error}
        labels={labels}
      >
        <p>Content for the {steps[stepIndex]?.label} step goes here.</p>
      </ProgressiveDialog>
    </>
  );
}

const meta = {
  title: "Components/ProgressiveDialog",
  component: ProgressiveDialogDemo,
  tags: ["autodocs"],
  args: {
    initialStep: 0,
    onClose: fn(),
  },
} satisfies Meta<typeof ProgressiveDialogDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstStep: Story = {
  play: async ({ args }) => {
    const dialog = within(document.body);
    expect(dialog.getByRole("heading", { name: "Transfer" })).toBeTruthy();
    expect(dialog.getByText("Source").getAttribute("aria-current")).toBe(
      "step",
    );

    // Native click: userEvent's pointer check failed here, though the button
    // accepts a real click in Chrome.
    dialog.getByRole("button", { name: "Continue" }).click();
    await waitFor(() =>
      expect(dialog.getByText("Items").getAttribute("aria-current")).toBe(
        "step",
      ),
    );

    await userEvent.keyboard("{Escape}");
    expect(args.onClose).toHaveBeenCalledTimes(1);
  },
};

export const MiddleStep: Story = {
  args: { initialStep: 1 },
};

export const LastStepPending: Story = {
  args: { initialStep: 3, pending: true },
};

export const WithError: Story = {
  args: { initialStep: 3, error: "Insufficient stock for Rice." },
};

export const MobileFullScreen: Story = {
  args: { initialStep: 1 },
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};
