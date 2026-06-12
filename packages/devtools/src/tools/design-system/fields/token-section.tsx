"use client";

import {
  ChevronRightIcon,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  cn,
  iconProps,
} from "@manovaspace/ui";
import { type ReactNode, useState } from "react";

type TokenSectionProps = {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
};

export function TokenSection({
  title,
  description,
  defaultOpen = false,
  children,
  className,
}: TokenSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      data-open={open ? "true" : "false"}
      className={cn("orbit-token-section group/token-section", className)}
    >
      <div aria-hidden className="orbit-token-section-glow" />

      <CollapsibleTrigger className="orbit-token-section-trigger">
        <span
          className={cn(
            "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border border-border/70",
            "bg-[color-mix(in_oklch,var(--background)_80%,transparent)]",
            "shadow-[inset_0_1px_0_color-mix(in_oklch,var(--foreground)_6%,transparent)]",
            "transition-[border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            "group-hover/token-section:border-[color-mix(in_oklch,var(--primary)_24%,var(--border))]",
            "group-hover/token-section:shadow-[0_0_14px_-4px_color-mix(in_oklch,var(--primary)_35%,transparent)]",
            open &&
              "border-[color-mix(in_oklch,var(--primary)_30%,var(--border))] shadow-[0_0_16px_-4px_color-mix(in_oklch,var(--primary)_40%,transparent)]",
          )}
        >
          <ChevronRightIcon
            {...iconProps({ size: "sm" })}
            className={cn(
              "text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
              open && "rotate-90 text-foreground",
            )}
          />
        </span>

        <div className="min-w-0 flex-1 pt-0.5">
          <p className="orbit-token-section-heading">{title}</p>
          {description ? (
            <p className="orbit-token-section-description">{description}</p>
          ) : null}
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent keepMounted={false}>
        <div className="orbit-token-section-body">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
