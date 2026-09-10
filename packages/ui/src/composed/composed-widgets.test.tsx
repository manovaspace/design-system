import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DirectionProvider } from "../direction-provider.js";
import {
  formatPhoneCopy,
  formatPhoneDisplay,
  formatPhoneE164,
  formatPhoneSmsHref,
  formatPhoneTelHref,
  isValidIranMobile,
  normalizePhoneDigits,
  persianizePhoneDigits,
} from "../lib/phone.js";
import { TooltipProvider } from "../tooltip.js";
import {
  CopyableMoney,
  CopyableMoneyLine,
  FieldDescription,
  FieldGroup,
  FieldMessage,
  HintTooltip,
  PhoneNumber,
  phoneNumberPresets,
} from "./index.js";

describe("composed-widgets", () => {
  afterEach(() => {
    cleanup();
  });

  describe("Phone helpers", () => {
    it("normalizes digits and validates Iranian mobile numbers", () => {
      expect(normalizePhoneDigits("۰۹۱۲-۳۴۵-۶۷۸۹")).toBe("09123456789");
      expect(isValidIranMobile("09123456789")).toBe(true);
      expect(isValidIranMobile("۰۹۱۲۳۴۵۶۷۸۹")).toBe(true);
      expect(isValidIranMobile("02188776655")).toBe(false);
      expect(isValidIranMobile("123")).toBe(false);
    });

    it("formats phone numbers for display, copy, e164, tel, and sms", () => {
      const phone = "09123456789";
      expect(persianizePhoneDigits(phone)).toBe("۰۹۱۲۳۴۵۶۷۸۹");
      expect(formatPhoneDisplay(phone)).toBe("۰۹۱۲۳۴۵۶۷۸۹");
      expect(formatPhoneCopy(phone)).toBe("09123456789");
      expect(formatPhoneE164(phone)).toBe("+989123456789");
      expect(formatPhoneTelHref(phone)).toBe("tel:+989123456789");
      expect(formatPhoneSmsHref(phone)).toBe("sms:+989123456789");
    });
  });

  describe("CopyableMoney", () => {
    it("renders formatted money figure and copies raw value on click", async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: { writeText: writeTextMock },
      });
      window.isSecureContext = true;

      render(
        <CopyableMoney
          value={15000000}
          display="۱۵٬۰۰۰٬۰۰۰"
          copyLabel="کپی مبلغ"
          copiedLabel="کپی شد"
        />,
      );

      const button = screen.getByRole("button", { name: "کپی مبلغ" });
      expect(button).toBeDefined();
      expect(screen.getByText("۱۵٬۰۰۰٬۰۰۰")).toBeDefined();

      await act(async () => {
        fireEvent.click(button);
      });

      expect(writeTextMock).toHaveBeenCalledWith("15000000");
      expect(button.getAttribute("aria-label")).toBe("کپی شد");
    });

    it("renders plain span when copiable is false", () => {
      render(
        <CopyableMoney
          value={250000}
          display="۲۵۰٬۰۰۰"
          copyLabel="کپی"
          copiedLabel="کپی شد"
          copiable={false}
        />,
      );

      expect(screen.queryByRole("button")).toBeNull();
      expect(screen.getByText("۲۵۰٬۰۰۰")).toBeDefined();
    });

    it("renders CopyableMoneyLine with lead and trail elements", () => {
      render(
        <CopyableMoneyLine
          lead="مبلغ کل:"
          trail="تومان"
          value={500000}
          display="۵۰۰٬۰۰۰"
          copyLabel="کپی"
          copiedLabel="کپی شد"
        />,
      );

      expect(screen.getByText("مبلغ کل:")).toBeDefined();
      expect(screen.getByText("۵۰۰٬۰۰۰")).toBeDefined();
      expect(screen.getByText("تومان")).toBeDefined();
    });
  });

  describe("PhoneNumber", () => {
    const labels = {
      menu: "عملیات شماره",
      call: "تماس",
      copy: "کپی شماره",
      copied: "شماره کپی شد",
      sms: "ارسال پیامک",
    };

    it("renders static variant with Persian digits in LTR direction", () => {
      render(
        <DirectionProvider direction="rtl">
          <PhoneNumber phone="09123456789" labels={labels} variant="static" />
        </DirectionProvider>,
      );

      const el = screen.getByText("۰۹۱۲۳۴۵۶۷۸۹");
      expect(el).toBeDefined();
      expect(el.getAttribute("dir")).toBe("ltr");
    });

    it("renders em dash for invalid phone number", () => {
      render(<PhoneNumber phone="not-a-number" labels={labels} />);
      expect(screen.getByText("—")).toBeDefined();
    });

    it("renders link variant with tel: href", () => {
      render(
        <PhoneNumber phone="09123456789" labels={labels} variant="link" />,
      );

      const link = screen.getByRole("link");
      expect(link.getAttribute("href")).toBe("tel:+989123456789");
      expect(screen.getByText("۰۹۱۲۳۴۵۶۷۸۹")).toBeDefined();
    });

    it("renders copy variant and copies on click", () => {
      const execCommandMock = vi.fn().mockReturnValue(true);
      document.execCommand = execCommandMock;

      render(
        <PhoneNumber phone="09123456789" labels={labels} variant="copy" />,
      );

      const button = screen.getByRole("button", { name: labels.copy });
      fireEvent.click(button);
      expect(execCommandMock).toHaveBeenCalledWith("copy");
      expect(button.getAttribute("aria-label")).toBe(labels.copied);
    });

    it("renders menu variant trigger with Persian phone display", () => {
      render(
        <PhoneNumber
          phone="09123456789"
          labels={labels}
          variant="menu"
          actions={["call", "sms", "copy"]}
        />,
      );

      // Radix DropdownMenu portals don't fully render in JSDOM;
      // assert the trigger button and Persian display are present.
      const trigger = screen.getByRole("button", { name: labels.menu });
      expect(trigger).toBeDefined();
      expect(screen.getByText("۰۹۱۲۳۴۵۶۷۸۹")).toBeDefined();
    });

    it("exports phoneNumberPresets with defined properties", () => {
      expect(phoneNumberPresets.adminTable.variant).toBe("menu");
      expect(phoneNumberPresets.adminDetail.showIcon).toBe("always");
      expect(phoneNumberPresets.field.variant).toBe("copy");
      expect(phoneNumberPresets.readOnly.variant).toBe("static");
      expect(phoneNumberPresets.link.variant).toBe("link");
    });
  });

  describe("FieldFeedback", () => {
    it("renders FieldGroup and FieldDescription with correct data-slot", () => {
      render(
        <FieldGroup>
          <label htmlFor="test-input">تلفن</label>
          <input id="test-input" />
          <FieldDescription>شماره همراه خود را وارد کنید</FieldDescription>
        </FieldGroup>,
      );

      const group = document.querySelector('[data-slot="field-group"]');
      expect(group).not.toBeNull();

      const desc = screen.getByText("شماره همراه خود را وارد کنید");
      expect(desc.getAttribute("data-slot")).toBe("field-description");
    });

    it("renders FieldMessage error with alert role and callout appearance", () => {
      render(
        <FieldMessage variant="error" appearance="callout">
          شماره همراه معتبر نیست
        </FieldMessage>,
      );

      const alert = screen.getByRole("alert");
      expect(alert.textContent).toContain("شماره همراه معتبر نیست");
      expect(alert.getAttribute("data-appearance")).toBe("callout");
      expect(alert.getAttribute("data-variant")).toBe("error");
    });

    it("renders FieldMessage warning with status role", () => {
      render(
        <FieldMessage variant="warning">
          اعتبار این شماره به زودی پایان می‌یابد
        </FieldMessage>,
      );

      const status = screen.getByRole("status");
      expect(status.textContent).toContain(
        "اعتبار این شماره به زودی پایان می‌یابد",
      );
      expect(status.getAttribute("data-variant")).toBe("warning");
    });

    it("renders null when FieldMessage children are null or empty", () => {
      const { container } = render(<FieldMessage>{""}</FieldMessage>);
      expect(container.firstChild).toBeNull();
    });
  });

  describe("HintTooltip", () => {
    it("renders trigger element within TooltipProvider", () => {
      render(
        <TooltipProvider>
          <HintTooltip label="راهنمای سریع">
            <button type="button">کلیک کنید</button>
          </HintTooltip>
        </TooltipProvider>,
      );

      const button = screen.getByRole("button", { name: "کلیک کنید" });
      expect(button).toBeDefined();
    });
  });
});
