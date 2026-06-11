"use client";

import {
  applyFamilyAnchorColor,
  brandAnchorStep,
  type OrbitTokensRaw,
} from "@manovaspace/tokens";
import {
  Badge,
  Button,
  ColorSwatch,
  cn,
  Dialog,
  DialogContent,
  DialogTitle,
  InformationCircleIcon,
  Input,
  iconProps,
  XMarkIcon,
} from "@manovaspace/ui";
import { useState } from "react";

import {
  COLOR_FAMILY_META,
  getColorFamilyUsages,
  getUsageTeaser,
  groupUsages,
} from "../color-family-meta.js";
import { isHexColor } from "../token-mutations.js";

type BrandColorFamilyRowProps = {
  family: string;
  tokens: OrbitTokensRaw;
  onChange: (tokens: OrbitTokensRaw) => void;
};

export function BrandColorFamilyRow({
  family,
  tokens,
  onChange,
}: BrandColorFamilyRowProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const step = brandAnchorStep(family);
  const anchorHex = tokens.color[family]?.[step] ?? "#000000";
  const scale = tokens.color[family];
  const meta = COLOR_FAMILY_META[family];
  const usages = getColorFamilyUsages(tokens, family);
  const { visible, extra } = getUsageTeaser(usages, meta?.highlights ?? [], 2);

  const setAnchor = (hex: string) => {
    onChange({
      ...tokens,
      color: applyFamilyAnchorColor(tokens.color, family, hex),
    });
  };

  const openDetails = () => setDetailsOpen(true);

  return (
    <>
      <div className="orbit-brand-color-row">
        <div className="flex items-center gap-2.5">
          <ColorSwatch
            value={anchorHex}
            size="lg"
            className="border-border/80 shadow-inner"
            title={anchorHex}
          />
          <div className="min-w-0 flex-1 orbit-brand-color-row__identity">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-medium text-foreground">
                {meta?.title ?? family}
              </p>
              <Badge
                variant="outline"
                className="h-4 px-1.5 text-[0.55rem] font-normal"
              >
                {step}
              </Badge>
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {meta?.role ?? `color.${family}`}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
            aria-label={`Details for ${meta?.title ?? family}`}
            onClick={openDetails}
          >
            <InformationCircleIcon {...iconProps({ size: "sm" })} />
          </Button>
        </div>

        {meta?.paletteOnly && usages.length === 0 ? (
          <p className="text-xs text-muted-foreground">Reserve palette</p>
        ) : visible.length > 0 ? (
          <p className="max-md:hidden truncate text-xs text-muted-foreground">
            <span className="text-foreground/80">{visible.join(" · ")}</span>
            {extra > 0 ? (
              <Button
                type="button"
                variant="link"
                size="xs"
                className="ms-1 h-auto p-0 text-xs"
                onClick={openDetails}
              >
                +{extra} more
              </Button>
            ) : null}
          </p>
        ) : null}

        <div className="orbit-brand-color-row__editor">
          {isHexColor(anchorHex) ? (
            <input
              type="color"
              value={anchorHex}
              onChange={(e) => setAnchor(e.target.value)}
              className="size-8 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0"
              aria-label={`${meta?.title ?? family} anchor color`}
            />
          ) : null}
          <Input
            value={anchorHex}
            onChange={(e) => setAnchor(e.target.value)}
            className="orbit-token-field__input h-8 flex-1 font-mono"
            spellCheck={false}
            aria-label={`${meta?.title ?? family} hex`}
          />
        </div>

        {scale ? (
          <div className="orbit-brand-color-row__scale max-md:hidden">
            {Object.entries(scale).map(([s, hex]) => (
              <ColorSwatch
                key={s}
                value={hex}
                size="xs"
                title={`${family}-${s}`}
                className={cn(
                  "max-w-4 flex-1",
                  s === step && "ring-1 ring-foreground ring-offset-1",
                )}
              />
            ))}
          </div>
        ) : null}
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0">
          <div
            className="h-16 rounded-t-2xl border-b border-border/60"
            style={{
              background: scale
                ? `linear-gradient(90deg, ${Object.values(scale).join(", ")})`
                : anchorHex,
            }}
          />
          <div className="flex flex-col gap-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle>{meta?.title ?? family}</DialogTitle>
                <p className="font-mono text-xs text-muted-foreground">
                  color.{family} · anchor {step}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-7"
                aria-label="Close"
                onClick={() => setDetailsOpen(false)}
              >
                <XMarkIcon {...iconProps({ size: "sm" })} />
              </Button>
            </div>

            {meta?.summary ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {meta.summary}
              </p>
            ) : null}

            {usages.length > 0 ? (
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Semantic usage
                </p>
                {Object.entries(groupUsages(usages)).map(([group, items]) => (
                  <div key={group}>
                    <p className="mb-1.5 text-xs font-medium text-foreground/90">
                      {group}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {items.map((item) => (
                        <Badge
                          key={item}
                          variant="secondary"
                          className="text-xs font-normal"
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : meta?.paletteOnly ? (
              <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                Not linked yet. Reference in{" "}
                <span className="text-foreground">Semantic</span> as{" "}
                <code className="rounded bg-muted px-1 font-mono text-xs">
                  {`{color.${family}.${step}}`}
                </code>
                .
              </p>
            ) : null}

            {scale ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Full scale
                </p>
                <div className="grid grid-cols-11 gap-1">
                  {Object.entries(scale).map(([s, hex]) => (
                    <div key={s} className="flex flex-col items-center gap-1">
                      <ColorSwatch
                        value={hex}
                        size="sm"
                        className={cn(
                          "w-full",
                          s === step && "ring-2 ring-primary ring-offset-1",
                        )}
                      />
                      <span className="font-mono text-[0.625rem] text-muted-foreground">
                        {s}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
