import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { Button } from "../../button.js";
import {
  ProgressiveDialog,
  type ProgressiveDialogProgress,
} from "./progressive-dialog.js";

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
  progress?: ProgressiveDialogProgress;
  error?: string;
  retryLabel?: string;
  onClose: () => void;
};

function ProgressiveDialogDemo({
  initialStep,
  pending = false,
  progress,
  error,
  retryLabel,
  onClose,
}: DemoProps) {
  const [open, setOpen] = useState(true);
  const [stepIndex, setStepIndex] = useState(initialStep);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const isLast = stepIndex === steps.length - 1;
  const message = error && error !== dismissed ? error : null;

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
        progress={progress}
        onBack={() => setStepIndex((index) => Math.max(0, index - 1))}
        primaryAction={{
          label: isLast ? "Submit" : "Continue",
          onClick: () =>
            setStepIndex((index) => Math.min(steps.length - 1, index + 1)),
          pending,
        }}
        error={message}
        errorAction={
          message && retryLabel
            ? { label: retryLabel, onClick: () => setDismissed(message) }
            : null
        }
        labels={labels}
      >
        <p>Content for the {steps[stepIndex]?.label} step goes here.</p>
      </ProgressiveDialog>
    </>
  );
}

const meta = {
  title: "Components/Containment/ProgressiveDialog",
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
    expect(
      dialog.getByText("Source").closest("li")?.getAttribute("aria-current"),
    ).toBe("step");

    const continueBtn = dialog.getByRole("button", { name: "Continue" });
    await waitFor(() =>
      expect(getComputedStyle(continueBtn).pointerEvents).not.toBe("none"),
    );
    await userEvent.click(continueBtn);
    await waitFor(() =>
      expect(
        dialog.getByText("Items").closest("li")?.getAttribute("aria-current"),
      ).toBe("step"),
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

export const WithErrorAction: Story = {
  args: {
    initialStep: 2,
    progress: "segments",
    error: "Insufficient stock for Rice.",
    retryLabel: "Retry",
  },
  play: async () => {
    const dialog = within(document.body);
    expect(
      dialog.getByText("Details").closest("li")?.getAttribute("aria-current"),
    ).toBe("step");
    const states = Array.from(
      document.querySelectorAll('[data-slot="progressive-dialog-step-bar"]'),
    ).map((bar) =>
      Array.from(
        bar.querySelectorAll('[data-slot="progressive-dialog-step-part"]'),
      ).map((part) => part.getAttribute("data-state")),
    );
    expect(states).toEqual([["done"], ["done"], ["current"], ["todo"]]);

    const alert = dialog.getByRole("alert");
    expect(alert.textContent).toContain("Insufficient stock for Rice.");
    const retryBtn = dialog.getByRole("button", { name: "Retry" });
    expect(alert.contains(retryBtn)).toBe(true);
    expect(dialog.getByRole("button", { name: "Continue" })).toBeTruthy();

    await waitFor(() =>
      expect(getComputedStyle(retryBtn).pointerEvents).not.toBe("none"),
    );
    await userEvent.click(retryBtn);
    await waitFor(() => expect(dialog.queryByRole("alert")).toBeNull());
  },
};

export const MobileFullScreen: Story = {
  args: { initialStep: 1 },
  globals: {
    viewport: { value: "mobile", isRotated: false },
  },
};
