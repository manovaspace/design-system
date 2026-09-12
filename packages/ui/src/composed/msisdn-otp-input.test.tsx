import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  isValidIranMobile,
  normalizeDigits,
  normalizeIranMobile,
  normalizeIranMobileInput,
} from "../lib/phone.js";
import { MsisdnInput } from "./msisdn-input.js";
import { OtpInput } from "./otp-input.js";

describe("Phone & OTP Normalization Utilities", () => {
  it("normalizes Persian digits to Latin digits", () => {
    expect(normalizeDigits("۰۹۱۲۳۴۵۶۷۸۹")).toBe("09123456789");
    expect(normalizeDigits("۱۲۳۴۵۶")).toBe("123456");
  });

  it("canonicalizes various Iranian phone number formats to 09XXXXXXXXX", () => {
    expect(normalizeIranMobile("۰۹۱۲۰۰۰۰۰۰۱")).toBe("09120000001");
    expect(normalizeIranMobile("+989120000001")).toBe("09120000001");
    expect(normalizeIranMobile("00989120000001")).toBe("09120000001");
    expect(normalizeIranMobile("989120000001")).toBe("09120000001");
    expect(normalizeIranMobile("9120000001")).toBe("09120000001");
  });

  it("validates valid and invalid Iranian mobile numbers", () => {
    expect(isValidIranMobile("09120000001")).toBe(true);
    expect(isValidIranMobile("۰۹۱۲۰۰۰۰۰۰۱")).toBe(true);
    expect(isValidIranMobile("+989120000001")).toBe(true);
    expect(isValidIranMobile("02188888888")).toBe(false);
    expect(isValidIranMobile("091234")).toBe(false);
  });

  it("sanitizes per-keystroke input preserving leading plus", () => {
    expect(normalizeIranMobileInput("۰۹۱۲")).toBe("0912");
    expect(normalizeIranMobileInput("+۹۸۹۱۲")).toBe("+98912");
  });
});

describe("MsisdnInput Component", () => {
  it("renders Persian digits on screen when locale is fa and state is Latin", () => {
    render(
      <MsisdnInput value="09120000001" onValueChange={() => {}} locale="fa" />,
    );

    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("۰۹۱۲۰۰۰۰۰۰۱");
    expect(input.getAttribute("dir")).toBe("ltr");
    expect(input.className).toContain("tabular-nums");
  });

  it("renders Latin digits on screen when locale is en and state is Latin", () => {
    render(
      <MsisdnInput value="09120000001" onValueChange={() => {}} locale="en" />,
    );

    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("09120000001");
    expect(input.getAttribute("dir")).toBe("ltr");
    expect(input.className).toContain("tabular-nums");
  });

  it("emits normalized Latin digits when typing Persian numerals", () => {
    const onValueChange = vi.fn();
    render(<MsisdnInput value="" onValueChange={onValueChange} locale="fa" />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "۰۹۱۲۳۴۵۶۷۸۹" } });

    expect(onValueChange).toHaveBeenCalledWith("09123456789");
  });

  it("emits normalized Latin digits when typing English numerals", () => {
    const onValueChange = vi.fn();
    render(<MsisdnInput value="" onValueChange={onValueChange} locale="fa" />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "09123456789" } });

    expect(onValueChange).toHaveBeenCalledWith("09123456789");
  });
});

describe("OtpInput Component", () => {
  it("renders Persian digits on screen when locale is fa", () => {
    render(<OtpInput value="111111" onValueChange={() => {}} locale="fa" />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("۱۱۱۱۱۱");
    expect(input.className).toContain("tabular-nums");
  });

  it("renders Latin digits on screen when locale is en", () => {
    render(<OtpInput value="111111" onValueChange={() => {}} locale="en" />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("111111");
    expect(input.className).toContain("tabular-nums");
  });

  it("normalizes Persian numerals to Latin digits in onValueChange", () => {
    const onValueChange = vi.fn();
    render(<OtpInput value="" onValueChange={onValueChange} locale="fa" />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "۱۲۳۴۵۶" } });

    expect(onValueChange).toHaveBeenCalledWith("123456");
  });
});
