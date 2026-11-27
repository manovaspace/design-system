import {
  CONTRAST_LEVELS,
  type ContrastLevel,
  DENSITY_SCALES,
  type DensityScale,
  MOTION_SCALES,
  type MotionScale,
  resolveBrandTokens,
  SHAPE_SCALES,
  type ShapeScale,
  toFlattenedHexTokens,
} from "@manovaspace/tokens";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ColorSwatch,
  Field,
  Input,
  TokenProvider,
} from "@manovaspace/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";

const PRESETS = [
  { label: "Manova Blue", hex: "#2563eb" },
  { label: "Fryto Crimson", hex: "#b82132" },
  { label: "Emerald", hex: "#059669" },
  { label: "Amber", hex: "#d97706" },
  { label: "Violet", hex: "#7c3aed" },
] as const;

function BrandPlayground() {
  const [primary, setPrimary] = useState("#2563eb");
  const [shape, setShape] = useState<ShapeScale>("default");
  const [density, setDensity] = useState<DensityScale>("default");
  const [motion, setMotion] = useState<MotionScale>("standard");
  const [contrast, setContrast] = useState<ContrastLevel>("standard");

  const resolved = useMemo(
    () =>
      resolveBrandTokens({
        seed: { primary },
        shape,
        density,
        motion,
        contrast,
      }),
    [primary, shape, density, motion, contrast],
  );

  const flatLight = useMemo(
    () => toFlattenedHexTokens(resolved, { scheme: "light", contrast }),
    [resolved, contrast],
  );

  return (
    <TokenProvider brandTokens={resolved}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-4">
          <div className="space-y-1">
            <label htmlFor="brand-seed" className="block text-xs font-medium">
              seed.primary
            </label>
            <div className="flex items-center gap-2">
              <input
                id="brand-seed"
                type="color"
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
                className="h-10 w-12 cursor-pointer rounded border border-input bg-transparent p-0.5"
              />
              <code dir="ltr" className="text-xs text-muted-foreground">
                {primary}
              </code>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <Button
                key={p.hex}
                size="sm"
                variant={primary === p.hex ? "default" : "outline"}
                onClick={() => setPrimary(p.hex)}
              >
                {p.label}
              </Button>
            ))}
          </div>

          <label className="space-y-1 text-xs">
            <span className="block font-medium">shape</span>
            <select
              value={shape}
              onChange={(e) => setShape(e.target.value as ShapeScale)}
              className="h-10 rounded-lg border border-input bg-card px-2 text-xs"
            >
              {SHAPE_SCALES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs">
            <span className="block font-medium">density</span>
            <select
              value={density}
              onChange={(e) => setDensity(e.target.value as DensityScale)}
              className="h-10 rounded-lg border border-input bg-card px-2 text-xs"
            >
              {DENSITY_SCALES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs">
            <span className="block font-medium">motion</span>
            <select
              value={motion}
              onChange={(e) => setMotion(e.target.value as MotionScale)}
              className="h-10 rounded-lg border border-input bg-card px-2 text-xs"
            >
              {MOTION_SCALES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs">
            <span className="block font-medium">contrast</span>
            <select
              value={contrast}
              onChange={(e) => setContrast(e.target.value as ContrastLevel)}
              className="h-10 rounded-lg border border-input bg-card px-2 text-xs"
            >
              {CONTRAST_LEVELS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <Badge variant="default">WCAG AA passed</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Live UI preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Account name" required hint="Derived from M3 HCT">
                <Input placeholder="Manova Workspace" />
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="destructive">Destructive</Button>
                <Button disabled>Disabled</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resolved M3 hex tokens ({contrast})</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-xs">
              {[
                ["primary", flatLight.colors.primary],
                ["onPrimary", flatLight.colors["primary-foreground"]],
                [
                  "primaryContainer",
                  flatLight.colors["md-sys-color-primary-container"],
                ],
                [
                  "secondaryContainer",
                  flatLight.colors["md-sys-color-secondary-container"],
                ],
                ["surface", flatLight.colors["md-sys-color-surface"]],
                ["outline", flatLight.colors["md-sys-color-outline"]],
                ["chart-1", flatLight.colors["chart-1"]],
                ["chart-2", flatLight.colors["chart-2"]],
              ].map(([label, hex]) => (
                <div key={label} className="flex items-center gap-2">
                  <ColorSwatch value={hex} size="sm" />
                  <span dir="ltr" className="text-muted-foreground">
                    {label}: {hex}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </TokenProvider>
  );
}

const meta = {
  title: "Foundations/Brand playground",
  component: BrandPlayground,
  tags: ["autodocs"],
} satisfies Meta<typeof BrandPlayground>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {};
