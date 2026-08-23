"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
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
  CheckIcon,
  ChevronDownIcon,
  ClipboardDocumentIcon,
  GlobeAltIcon,
} from "../icons";
import { GlobeSolidIcon } from "../icons-solid";
import { copyTextToClipboard } from "../lib/clipboard";
import { cn } from "../lib/utils";
import { DataValue } from "./data-value";

export type SiteHostAction = "open" | "copy";

export type SiteHostVariant = "menu" | "copy" | "link" | "static";

export type SiteHostLabels = {
  /** Accessible label for the menu trigger. */
  menu: string;
  open: string;
  copy: string;
  copied: string;
};

export type SiteHostProps = {
  /** Hostname shown in the UI, e.g. `demo.platform.com`. */
  host: string;
  /** Full HTTPS URL used for open / copy. */
  siteUrl: string;
  labels: SiteHostLabels;
  variant?: SiteHostVariant;
  /** Menu variant only — default: open, copy */
  actions?: SiteHostAction[];
  showIcon?: boolean | "always" | "hover" | "never";
  icon?: ReactNode;
  /** `panel` — bordered readout for detail surfaces; `inline` — compact tables. */
  appearance?: "inline" | "panel";
  /** Prefix `https://` before the host (panel detail only by default). */
  showScheme?: boolean;
  /** Optional slug / root split for subdomain tenants. */
  displayParts?: SiteHostDisplayParts;
  stopPropagation?: boolean;
  className?: string;
  menuAlign?: "start" | "center" | "end";
};

/** Optional visual segmentation passed from tenant-aware wrappers. */
export type SiteHostDisplayParts =
  | { kind: "custom"; host: string }
  | { kind: "subdomain"; slug: string; rootLabel: string };

export const siteHostPresets = {
  adminTable: {
    variant: "menu",
    actions: ["open", "copy"],
    showIcon: "hover",
    appearance: "inline",
    showScheme: false,
    stopPropagation: true,
    menuAlign: "end",
  },
  adminDetail: {
    variant: "menu",
    actions: ["open", "copy"],
    showIcon: "always",
    appearance: "panel",
    showScheme: true,
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
} as const satisfies Record<string, Partial<SiteHostProps>>;

type ResolvedIconVisibility = "always" | "hover" | "never";

function isValidHost(host: string): boolean {
  return host.trim().length > 0;
}

function resolveIconVisibility(
  showIcon: SiteHostProps["showIcon"],
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
  variant: SiteHostVariant,
  actions: SiteHostAction[] | undefined,
): SiteHostAction[] {
  if (variant === "static") {
    return [];
  }
  if (variant === "link") {
    return ["open"];
  }
  if (variant === "copy") {
    return ["copy"];
  }
  return actions ?? ["open", "copy"];
}

function HostLabel({
  host,
  copyValue,
  showScheme = false,
  displayParts,
  wrap = false,
  className,
}: {
  host: string;
  copyValue: string;
  showScheme?: boolean;
  displayParts?: SiteHostDisplayParts;
  wrap?: boolean;
  className?: string;
}) {
  const hostTextClass = wrap
    ? "min-w-0 break-all font-medium"
    : "min-w-0 truncate font-medium";

  const hostReadout =
    displayParts?.kind === "subdomain" ? (
      <span
        className={cn(
          "min-w-0 max-w-full",
          wrap ? "block break-all" : "inline-flex items-baseline",
        )}
      >
        <DataValue
          tabular
          dir="ltr"
          copyValue={copyValue}
          className={cn(
            "max-w-full font-medium text-foreground",
            wrap ? "break-all" : "shrink-0",
          )}
        >
          {displayParts.slug}
        </DataValue>
        <span
          className={cn(
            "mnv-data mnv-data--tabular font-medium text-muted-foreground",
            hostTextClass,
          )}
          dir="ltr"
        >
          {displayParts.rootLabel}
        </span>
      </span>
    ) : (
      <DataValue
        tabular
        dir="ltr"
        copyValue={copyValue}
        className={cn(hostTextClass, "max-w-full text-foreground")}
      >
        {host}
      </DataValue>
    );

  return (
    <span
      dir="ltr"
      className={cn(
        "flex min-w-0 flex-1 gap-0.5 text-start text-sm",
        wrap ? "items-start leading-snug" : "items-center leading-none",
        className,
      )}
    >
      {showScheme ? (
        <span
          className="shrink-0 select-none font-normal text-muted-foreground"
          aria-hidden
        >
          https://
        </span>
      ) : null}
      {hostReadout}
    </span>
  );
}

function SiteHostPanelShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 items-start gap-2",
        "rounded-[var(--radius-lg)] border border-border bg-muted/40 p-2 shadow-xs",
        className,
      )}
    >
      <span
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border/80 bg-background text-muted-foreground shadow-xs"
        aria-hidden
      >
        <GlobeSolidIcon className="size-4" />
      </span>
      <div className="min-w-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

function wrapWithAppearance(
  appearance: SiteHostProps["appearance"],
  node: ReactNode,
  className?: string,
) {
  if (appearance === "panel") {
    return (
      <SiteHostPanelShell className={className}>{node}</SiteHostPanelShell>
    );
  }
  return node;
}

const triggerBaseClass = cn(
  "group/site-host inline-flex items-center gap-1.5 leading-none",
  "rounded-[var(--radius-md)] transition-colors",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
);

const inlineTriggerClassName = cn(triggerBaseClass, "px-1.5 py-0.5 -mx-1.5");

const panelTriggerClassName = cn(
  triggerBaseClass,
  "w-full min-w-0 items-start justify-between gap-2 px-1 py-0.5",
  "hover:bg-background/60 active:bg-background/80",
);

function SiteIconAffordance({
  visible,
  copied,
  menuOpen,
  customIcon,
  preferChevron = false,
}: {
  visible: ResolvedIconVisibility;
  copied: boolean;
  menuOpen?: boolean;
  customIcon?: ReactNode;
  preferChevron?: boolean;
}) {
  if (visible === "never") {
    return null;
  }

  const icon =
    customIcon ??
    (copied ? (
      <CheckIcon className="size-3.5" />
    ) : menuOpen != null || preferChevron ? (
      <ChevronDownIcon
        className={cn(
          "size-3.5 transition-transform",
          menuOpen && "rotate-180",
        )}
      />
    ) : (
      <GlobeSolidIcon className="size-3.5" />
    ));

  return (
    <span
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center text-muted-foreground transition-opacity",
        preferChevron ? "mt-0.5 self-start" : "self-center",
        visible === "hover" &&
          "opacity-50 group-hover/site-host:opacity-100 group-focus-visible/site-host:opacity-100",
        (copied || menuOpen) && "text-foreground opacity-100",
      )}
      aria-hidden="true"
    >
      {icon}
    </span>
  );
}

/**
 * Hostname readout with optional open-in-browser and copy-URL actions.
 * Display and clipboard use the full HTTPS URL; the visible label is the host.
 */
export function SiteHost({
  host,
  siteUrl,
  labels,
  variant = "menu",
  actions,
  showIcon = "hover",
  icon,
  appearance = "inline",
  showScheme = false,
  displayParts,
  stopPropagation = false,
  className,
  menuAlign = "end",
}: SiteHostProps) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const resetCopiedRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const valid = isValidHost(host);
  const enabledActions = resolveActions(variant, actions);
  const iconVisibility = resolveIconVisibility(showIcon);
  const isPanel = appearance === "panel";
  const triggerSurface = isPanel
    ? panelTriggerClassName
    : inlineTriggerClassName;
  const panelClassName = isPanel ? className : undefined;
  const triggerExtraClass = isPanel ? undefined : className;

  const hostLabel = (
    <HostLabel
      host={host}
      copyValue={siteUrl}
      showScheme={showScheme}
      displayParts={displayParts}
      wrap={isPanel}
    />
  );

  useEffect(() => {
    return () => {
      if (resetCopiedRef.current) {
        clearTimeout(resetCopiedRef.current);
      }
    };
  }, []);

  const copyToClipboard = useCallback(async () => {
    if (!siteUrl) {
      return;
    }
    const ok = await copyTextToClipboard(siteUrl);
    if (!ok) {
      return;
    }
    setCopied(true);
    if (resetCopiedRef.current) {
      clearTimeout(resetCopiedRef.current);
    }
    resetCopiedRef.current = setTimeout(() => setCopied(false), 2000);
  }, [siteUrl]);

  function stopIfNeeded(event: { stopPropagation: () => void }) {
    if (stopPropagation) {
      event.stopPropagation();
    }
  }

  if (!valid) {
    return (
      <span
        className={cn(
          "inline-flex items-center text-sm text-muted-foreground",
          className,
        )}
      >
        —
      </span>
    );
  }

  if (variant === "static") {
    return wrapWithAppearance(
      appearance,
      <span
        className={cn("inline-flex min-w-0 items-center", triggerExtraClass)}
      >
        {hostLabel}
      </span>,
      panelClassName,
    );
  }

  if (variant === "link") {
    return wrapWithAppearance(
      appearance,
      <a
        href={siteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          triggerSurface,
          "text-inherit hover:bg-muted/70 active:bg-muted",
          triggerExtraClass,
        )}
        onClick={stopIfNeeded}
        onPointerDown={stopIfNeeded}
      >
        {hostLabel}
      </a>,
      panelClassName,
    );
  }

  if (variant === "copy") {
    return wrapWithAppearance(
      appearance,
      <button
        type="button"
        onClick={(event) => {
          stopIfNeeded(event);
          void copyToClipboard();
        }}
        onPointerDown={stopIfNeeded}
        className={cn(
          triggerSurface,
          "cursor-copy hover:bg-muted/70 active:bg-muted",
          triggerExtraClass,
        )}
        aria-label={copied ? labels.copied : labels.copy}
      >
        {hostLabel}
        <SiteIconAffordance
          visible={iconVisibility}
          copied={copied}
          preferChevron={isPanel}
          customIcon={
            icon ??
            (copied ? (
              <CheckIcon className="size-3.5" />
            ) : (
              <ClipboardDocumentIcon className="size-3.5" />
            ))
          }
        />
      </button>,
      panelClassName,
    );
  }

  const showOpen = enabledActions.includes("open");
  const showCopy = enabledActions.includes("copy");

  return wrapWithAppearance(
    appearance,
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            triggerSurface,
            isPanel
              ? "cursor-pointer"
              : "cursor-pointer hover:bg-muted/70 active:bg-muted",
            triggerExtraClass,
          )}
          aria-label={labels.menu}
          onClick={stopIfNeeded}
          onPointerDown={stopIfNeeded}
        >
          {hostLabel}
          <SiteIconAffordance
            visible={iconVisibility}
            copied={copied}
            menuOpen={menuOpen}
            preferChevron={isPanel}
            customIcon={isPanel ? undefined : icon}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={menuAlign}
        className="w-48"
        onClick={stopIfNeeded}
        onPointerDown={stopIfNeeded}
      >
        {showOpen ? (
          <DropdownMenuItem asChild>
            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2"
            >
              <GlobeAltIcon className="size-4 text-primary" />
              {labels.open}
            </a>
          </DropdownMenuItem>
        ) : null}
        {showCopy ? (
          <DropdownMenuItem
            className="gap-2"
            onSelect={() => {
              void copyToClipboard();
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
    </DropdownMenu>,
    panelClassName,
  );
}
