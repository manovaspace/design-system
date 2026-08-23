"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import {
  ChatBubbleLeftIcon,
  CheckIcon,
  ChevronDownIcon,
  ClipboardDocumentIcon,
  DevicePhoneMobileIcon,
} from "../icons";
import { copyTextToClipboardSync } from "../lib/clipboard";
import {
  formatPhoneCopy,
  formatPhoneDisplay,
  formatPhoneSmsHref,
  formatPhoneTelHref,
  isValidIranMobile,
} from "../lib/phone";
import { cn } from "../lib/utils";
import { DataValue } from "./data-value";

export type PhoneAction = "call" | "copy" | "sms";

export type PhoneNumberVariant = "menu" | "copy" | "link" | "static";

export type PhoneNumberLabels = {
  /** Accessible label for the menu trigger. */
  menu: string;
  call: string;
  copy: string;
  copied: string;
  sms: string;
};

export type PhoneNumberProps = {
  /** Canonical Latin MSISDN, e.g. 09123456789 */
  phone: string;
  labels: PhoneNumberLabels;
  variant?: PhoneNumberVariant;
  /** Menu variant only — default: call, copy, sms */
  actions?: PhoneAction[];
  showIcon?: boolean | "always" | "hover" | "never";
  icon?: ReactNode;
  /** Prevent row-click handlers in data tables. */
  stopPropagation?: boolean;
  className?: string;
  menuAlign?: "start" | "center" | "end";
};

export const phoneNumberPresets = {
  adminTable: {
    variant: "menu",
    actions: ["call", "copy", "sms"],
    showIcon: "hover",
    stopPropagation: true,
    menuAlign: "end",
  },
  adminDetail: {
    variant: "menu",
    actions: ["call", "copy", "sms"],
    showIcon: "always",
    menuAlign: "end",
  },
  profile: {
    variant: "menu",
    actions: ["call", "copy", "sms"],
    showIcon: "always",
    menuAlign: "end",
  },
  field: {
    variant: "copy",
    showIcon: "hover",
  },
  readOnly: {
    variant: "static",
    showIcon: "never",
  },
  link: {
    variant: "link",
    showIcon: "never",
  },
} as const satisfies Record<string, Partial<PhoneNumberProps>>;

type ResolvedIconVisibility = "always" | "hover" | "never";

function resolveIconVisibility(
  showIcon: PhoneNumberProps["showIcon"],
): ResolvedIconVisibility {
  if (showIcon === true || showIcon === "always") {
    return "always";
  }
  if (showIcon === false || showIcon === "never") {
    return "never";
  }
  return "hover";
}

function resolveActions(
  variant: PhoneNumberVariant,
  actions: PhoneAction[] | undefined,
): PhoneAction[] {
  if (variant === "static") {
    return [];
  }
  if (variant === "link") {
    return ["call"];
  }
  if (variant === "copy") {
    return ["copy"];
  }
  return actions ?? ["call", "copy", "sms"];
}

function PhoneFigure({
  display,
  copyValue,
  className,
}: {
  display: string;
  copyValue: string;
  className?: string;
}) {
  return (
    <DataValue
      tabular
      dir="ltr"
      copyValue={copyValue}
      className={cn("inline-flex items-center leading-none", className)}
    >
      {display}
    </DataValue>
  );
}

function PhoneIconAffordance({
  visible,
  copied,
  menuOpen,
  customIcon,
}: {
  visible: ResolvedIconVisibility;
  copied: boolean;
  menuOpen?: boolean;
  customIcon?: ReactNode;
}) {
  if (visible === "never") {
    return null;
  }

  const icon =
    customIcon ??
    (copied ? (
      <CheckIcon className="size-3.5" />
    ) : menuOpen != null ? (
      <ChevronDownIcon
        className={cn(
          "size-3.5 transition-transform",
          menuOpen && "rotate-180",
        )}
      />
    ) : (
      <DevicePhoneMobileIcon className="size-3.5" />
    ));

  return (
    <span
      className={cn(
        "inline-flex size-4 shrink-0 translate-y-[0.08em] items-center justify-center self-center text-muted-foreground transition-opacity",
        visible === "hover" &&
          "opacity-50 group-hover/phone-number:opacity-100 group-focus-visible/phone-number:opacity-100",
        (copied || menuOpen) && "text-foreground opacity-100",
      )}
      aria-hidden="true"
    >
      {icon}
    </span>
  );
}

const triggerClassName = cn(
  "group/phone-number inline-flex items-center gap-1 leading-none",
  "rounded-[var(--radius-md)] px-1.5 py-0.5 -mx-1.5",
  "transition-colors",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
);

/**
 * Iranian MSISDN readout with optional call / copy / SMS actions.
 * Display: Persian digits (Vazirmatn tabular). Clipboard: Latin MSISDN.
 */
export function PhoneNumber({
  phone,
  labels,
  variant = "menu",
  actions,
  showIcon = "hover",
  icon,
  stopPropagation = false,
  className,
  menuAlign = "end",
}: PhoneNumberProps) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const resetCopiedRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const valid = isValidIranMobile(phone);
  const display = useMemo(() => formatPhoneDisplay(phone), [phone]);
  const copyValue = useMemo(() => formatPhoneCopy(phone), [phone]);
  const telHref = useMemo(() => formatPhoneTelHref(phone), [phone]);
  const smsHref = useMemo(() => formatPhoneSmsHref(phone), [phone]);
  const enabledActions = resolveActions(variant, actions);
  const iconVisibility = resolveIconVisibility(showIcon);

  useEffect(() => {
    return () => {
      if (resetCopiedRef.current) {
        clearTimeout(resetCopiedRef.current);
      }
    };
  }, []);

  const copyToClipboard = useCallback(() => {
    if (!copyValue) {
      return;
    }
    if (!copyTextToClipboardSync(copyValue)) {
      return;
    }
    setCopied(true);
    if (resetCopiedRef.current) {
      clearTimeout(resetCopiedRef.current);
    }
    resetCopiedRef.current = setTimeout(() => setCopied(false), 2000);
  }, [copyValue]);

  function stopIfNeeded(event: { stopPropagation: () => void }) {
    if (stopPropagation) {
      event.stopPropagation();
    }
  }

  if (!valid) {
    return (
      <span
        className={cn(
          "inline-flex items-center text-muted-foreground",
          className,
        )}
      >
        —
      </span>
    );
  }

  if (variant === "static") {
    return (
      <span className={cn("inline-flex items-center", className)}>
        <PhoneFigure display={display} copyValue={copyValue} />
      </span>
    );
  }

  if (variant === "link") {
    return (
      <a
        href={telHref}
        className={cn(
          triggerClassName,
          "text-inherit hover:bg-muted/70 active:bg-muted",
          className,
        )}
        onClick={stopIfNeeded}
        onPointerDown={stopIfNeeded}
      >
        <PhoneFigure display={display} copyValue={copyValue} />
      </a>
    );
  }

  if (variant === "copy") {
    return (
      <button
        type="button"
        onClick={(event) => {
          stopIfNeeded(event);
          copyToClipboard();
        }}
        onPointerDown={stopIfNeeded}
        className={cn(
          triggerClassName,
          "cursor-copy hover:bg-muted/70 active:bg-muted",
          className,
        )}
        aria-label={copied ? labels.copied : labels.copy}
      >
        <PhoneFigure display={display} copyValue={copyValue} />
        <PhoneIconAffordance
          visible={iconVisibility}
          copied={copied}
          customIcon={
            icon ??
            (copied ? (
              <CheckIcon className="size-3.5" />
            ) : (
              <ClipboardDocumentIcon className="size-3.5" />
            ))
          }
        />
      </button>
    );
  }

  const showCall = enabledActions.includes("call");
  const showCopy = enabledActions.includes("copy");
  const showSms = enabledActions.includes("sms");

  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            triggerClassName,
            "cursor-pointer hover:bg-muted/70 active:bg-muted",
            className,
          )}
          aria-label={labels.menu}
          onClick={stopIfNeeded}
          onPointerDown={stopIfNeeded}
        >
          <PhoneFigure display={display} copyValue={copyValue} />
          <PhoneIconAffordance
            visible={iconVisibility}
            copied={copied}
            menuOpen={menuOpen}
            customIcon={icon}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={menuAlign}
        className="w-48"
        onClick={stopIfNeeded}
        onPointerDown={stopIfNeeded}
      >
        {showCall ? (
          <DropdownMenuItem asChild>
            <a href={telHref} className="gap-2">
              <DevicePhoneMobileIcon className="size-4 text-primary" />
              {labels.call}
            </a>
          </DropdownMenuItem>
        ) : null}
        {showSms ? (
          <DropdownMenuItem asChild>
            <a href={smsHref} className="gap-2">
              <ChatBubbleLeftIcon className="size-4 text-primary" />
              {labels.sms}
            </a>
          </DropdownMenuItem>
        ) : null}
        {showCopy ? (
          <DropdownMenuItem
            className="gap-2"
            onSelect={(event) => {
              event.preventDefault();
              copyToClipboard();
            }}
          >
            {copied ? (
              <CheckIcon className="size-4 text-primary" />
            ) : (
              <ClipboardDocumentIcon className="size-4 text-primary" />
            )}
            {copied ? labels.copied : labels.copy}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
