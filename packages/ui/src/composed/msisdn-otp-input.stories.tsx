import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { Field } from "./field.js";
import { MsisdnInput } from "./msisdn-input.js";
import { OtpInput } from "./otp-input.js";

function PhoneAndOtpDemo({ locale }: { locale: "fa" | "en" }) {
  const [phone, setPhone] = useState("09123456789");
  const [otp, setOtp] = useState("123456");

  return (
    <div className="flex w-72 flex-col gap-4">
      <Field label="Mobile number" hint={`State: ${phone}`}>
        <MsisdnInput
          value={phone}
          onValueChange={setPhone}
          locale={locale}
          aria-label="Mobile number"
        />
      </Field>
      <Field label="Verification code" hint={`State: ${otp}`}>
        <OtpInput
          value={otp}
          onValueChange={setOtp}
          locale={locale}
          aria-label="Verification code"
        />
      </Field>
    </div>
  );
}

const meta = {
  title: "Components/Inputs/Msisdn & OTP",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const PersianDisplay: Story = {
  render: () => <PhoneAndOtpDemo locale="fa" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const phoneInput = canvas.getByRole("textbox", {
      name: "Mobile number",
    }) as HTMLInputElement;
    await userEvent.clear(phoneInput);
    await userEvent.type(phoneInput, "۰۹۱۲۱۱۱۲۲۳۳");
    expect(phoneInput.value).toBe("۰۹۱۲۱۱۱۲۲۳۳");
    expect(canvas.getByText("State: 09121112233")).toBeTruthy();
  },
};

export const EnglishDisplay: Story = {
  render: () => <PhoneAndOtpDemo locale="en" />,
};
