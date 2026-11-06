import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { DirectionProvider } from "../direction-provider.js";
import { Stepper } from "./stepper.js";

const meta = {
  title: "Composed/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

const onboardingSteps = [
  { label: "Account", description: "Set your email & password" },
  { label: "Profile", description: "Personalize your space" },
  { label: "Workspace", description: "Invite teammates", optional: true },
  { label: "Ready", description: "Launch your project" },
];

export const Default: Story = {
  args: {
    steps: onboardingSteps,
    current: 1,
  },
};

export const FirstStep: Story = {
  args: {
    steps: onboardingSteps,
    current: 0,
  },
};

export const AllCompleted: Story = {
  args: {
    steps: onboardingSteps,
    current: 4,
  },
};

export const Vertical: Story = {
  args: {
    steps: onboardingSteps,
    current: 2,
    orientation: "vertical",
  },
};

export const PersianRtl: Story = {
  render: () => (
    <DirectionProvider direction="rtl">
      <div dir="rtl" className="w-[600px] p-6">
        <Stepper
          steps={[
            { label: "اطلاعات حساب", description: "ایمیل و رمز عبور" },
            { label: "تایید هویت", description: "کد پیامکی ارسال شد" },
            {
              label: "مشخصات کسب‌وکار",
              description: "نام شرکت و شناسه ملی",
              optional: true,
            },
            { label: "تکمیل ثبت‌نام", description: "ورود به داشبورد" },
          ]}
          current={1}
          locale="fa"
        />
      </div>
    </DirectionProvider>
  ),
};

export function Interactive() {
  const [current, setCurrent] = React.useState(1);

  return (
    <div className="flex flex-col items-center gap-6 w-[640px] p-4">
      <Stepper
        steps={onboardingSteps}
        current={current}
        onStepClick={setCurrent}
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={current <= 0}
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={current >= onboardingSteps.length}
          onClick={() =>
            setCurrent((c) => Math.min(onboardingSteps.length, c + 1))
          }
          className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
