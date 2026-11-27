import {
  CONTRAST_LEVELS,
  type ContrastLevel,
  contrastRatio,
  resolveBrandTokens,
  toFlattenedHexTokens,
} from "@manovaspace/tokens";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@manovaspace/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";

const CHART_SERIES = [
  { key: "chart-1", label: "Revenue", values: [72, 85, 64, 92, 88] },
  { key: "chart-2", label: "COGS", values: [42, 48, 39, 51, 46] },
  { key: "chart-3", label: "Margin", values: [30, 37, 25, 41, 42] },
  { key: "chart-4", label: "Tax", values: [14, 18, 13, 21, 19] },
  { key: "chart-5", label: "Refunds", values: [8, 6, 11, 7, 5] },
] as const;

const MONTHS = ["Far", "Ord", "Kho", "Tir", "Mor"] as const;

function ChartAndEmailShowcase() {
  const [seed, setSeed] = useState("#2563eb");
  const [scheme, setScheme] = useState<"light" | "dark">("light");
  const [contrast, setContrast] = useState<ContrastLevel>("standard");

  const resolved = useMemo(
    () =>
      resolveBrandTokens({
        seed: { primary: seed },
        contrast,
      }),
    [seed, contrast],
  );

  const flat = useMemo(
    () => toFlattenedHexTokens(resolved, { scheme, contrast }),
    [resolved, scheme, contrast],
  );

  const cardBg = flat.colors.card ?? "#ffffff";
  const pageBg = flat.colors.background ?? "#ffffff";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: "Manova", hex: "#2563eb" },
            { label: "Fryto", hex: "#b82132" },
            { label: "Teal", hex: "#0d9488" },
          ].map((preset) => (
            <Button
              key={preset.hex}
              size="sm"
              variant={seed === preset.hex ? "default" : "outline"}
              onClick={() => setSeed(preset.hex)}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <div className="flex gap-1.5">
          {(["light", "dark"] as const).map((mode) => (
            <Button
              key={mode}
              size="sm"
              variant={scheme === mode ? "default" : "outline"}
              onClick={() => setScheme(mode)}
            >
              {mode}
            </Button>
          ))}
        </div>

        <div className="flex gap-1.5">
          {CONTRAST_LEVELS.map((lvl) => (
            <Button
              key={lvl}
              size="sm"
              variant={contrast === lvl ? "default" : "outline"}
              onClick={() => setContrast(lvl)}
            >
              {lvl}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          className="min-w-0"
          style={{
            backgroundColor: cardBg,
            color: flat.colors["card-foreground"],
          }}
        >
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
              <span>Colour-blind-safe chart palette (--chart-1..5)</span>
              <Badge variant="outline">{contrast}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="grid grid-cols-5 gap-2 rounded-lg border border-border/60 p-2 sm:gap-3 sm:p-3"
              style={{ backgroundColor: pageBg }}
            >
              {MONTHS.map((month, colIdx) => (
                <div key={month} className="flex flex-col items-center gap-2">
                  <div className="flex h-36 w-full items-end justify-center gap-0.5 sm:gap-1">
                    {CHART_SERIES.map((series) => {
                      const hex = flat.colors[series.key] ?? "#000000";
                      const value = series.values[colIdx] ?? 20;
                      return (
                        <div
                          key={series.key}
                          title={`${series.label}: ${value}`}
                          className="w-1.5 rounded-t-sm sm:w-2.5"
                          style={{
                            height: `${value}%`,
                            backgroundColor: hex,
                          }}
                        />
                      );
                    })}
                  </div>
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: flat.colors["muted-foreground"] }}
                  >
                    {month}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {CHART_SERIES.map((series) => {
                const hex = flat.colors[series.key] ?? "#000000";
                const vsCard = contrastRatio(hex, cardBg).toFixed(2);
                const vsBg = contrastRatio(hex, pageBg).toFixed(2);
                return (
                  <div
                    key={series.key}
                    dir="ltr"
                    className="flex min-w-0 flex-wrap items-center justify-between gap-1 rounded-md border border-border/60 px-2.5 py-2 text-xs"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <span
                        className="inline-block size-3 shrink-0 rounded-full"
                        style={{ backgroundColor: hex }}
                      />
                      <span>
                        --{series.key} ({series.label})
                      </span>
                    </span>
                    <code className="text-[11px] opacity-80">
                      {hex} · {vsCard}:1 / {vsBg}:1
                    </code>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-base">
              Email / PDF flattened hex export (no var(...))
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Static inline-hex invoice email preview using resolved #rrggbb values */}
            <div
              style={{
                backgroundColor: flat.colors.background,
                color: flat.colors.foreground,
                border: `1px solid ${flat.colors.border}`,
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  backgroundColor: flat.colors.card,
                  color: flat.colors["card-foreground"],
                  border: `1px solid ${flat.colors.border}`,
                  borderRadius: "8px",
                  padding: "16px",
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span style={{ fontWeight: 700, fontSize: "15px" }}>
                    Receipt #INV-4092
                  </span>
                  <span
                    dir="ltr"
                    style={{
                      backgroundColor: flat.colors["status-success"],
                      color: flat.colors["status-success-foreground"],
                      borderRadius: "9999px",
                      padding: "2px 10px",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    Paid
                  </span>
                </div>
                <p
                  style={{
                    color: flat.colors["muted-foreground"],
                    fontSize: "13px",
                    marginTop: "8px",
                  }}
                >
                  Static HTML email and PDF renderers require flattened #rrggbb
                  values instead of CSS custom properties.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span
                    style={{
                      backgroundColor: flat.colors.primary,
                      color: flat.colors["primary-foreground"],
                      borderRadius: "8px",
                      padding: "8px 14px",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    Download PDF
                  </span>
                  <span
                    dir="ltr"
                    style={{
                      color: flat.colors["status-warning"],
                      fontSize: "12px",
                    }}
                  >
                    {Object.keys(flat.colors).length} hex tokens
                  </span>
                </div>
              </div>
            </div>

            <pre
              dir="ltr"
              className="max-h-40 overflow-auto rounded-md border border-border bg-surface-sunken p-3 text-[11px]"
            >
              {JSON.stringify(
                {
                  primary: flat.colors.primary,
                  "primary-foreground": flat.colors["primary-foreground"],
                  background: flat.colors.background,
                  card: flat.colors.card,
                  border: flat.colors.border,
                  "chart-1..5": [
                    flat.colors["chart-1"],
                    flat.colors["chart-2"],
                    flat.colors["chart-3"],
                    flat.colors["chart-4"],
                    flat.colors["chart-5"],
                  ],
                },
                null,
                2,
              )}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const meta = {
  title: "Foundations/Charts & email hex",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ChartPaletteAndEmailExport: Story = {
  render: () => <ChartAndEmailShowcase />,
};
