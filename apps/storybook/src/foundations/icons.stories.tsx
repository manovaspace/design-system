import * as OutlineIcons from "@manovaspace/ui/icons";
import * as BrandIcons from "@manovaspace/ui/icons/brand";
import * as SolidIcons from "@manovaspace/ui/icons/solid";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

function IconPackSection({
  title,
  entries,
  mirrorDirectional,
}: {
  title: string;
  entries: Array<[string, IconComponent]>;
  mirrorDirectional?: boolean;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        {title} ({entries.length})
      </h3>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-2">
        {entries.map(([name, Icon]) => {
          const isDirectional =
            mirrorDirectional &&
            /ArrowLeft|ArrowRight|ChevronLeft|ChevronRight|CornerDownRight|SkipForward/.test(
              name,
            );
          return (
            <div
              key={name}
              className="flex items-center gap-2.5 rounded-md border border-border bg-card px-2.5 py-2"
            >
              <Icon
                className={
                  isDirectional
                    ? "size-4 shrink-0 text-foreground rtl:-scale-x-100"
                    : "size-4 shrink-0 text-foreground"
                }
              />
              <span
                dir="ltr"
                className="break-all text-xs text-muted-foreground"
              >
                {name}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function IconsGallery() {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();

  const filterEntries = (mod: Record<string, unknown>) =>
    Object.entries(mod).filter(
      ([name, val]) =>
        typeof val === "function" &&
        name.endsWith("Icon") &&
        (!needle || name.toLowerCase().includes(needle)),
    ) as Array<[string, IconComponent]>;

  return (
    <div className="space-y-6">
      <div className="max-w-xs">
        <input
          type="search"
          aria-label="Filter icons"
          placeholder="Filter icons..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground"
        />
      </div>
      <IconPackSection
        title="@manovaspace/ui/icons (outline)"
        entries={filterEntries(OutlineIcons)}
        mirrorDirectional
      />
      <IconPackSection
        title="@manovaspace/ui/icons/solid"
        entries={filterEntries(SolidIcons)}
      />
      <IconPackSection
        title="@manovaspace/ui/icons/brand"
        entries={filterEntries(BrandIcons)}
      />
    </div>
  );
}

const meta = {
  title: "Foundations/Icons",
  component: IconsGallery,
  tags: ["autodocs"],
} satisfies Meta<typeof IconsGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Catalog: Story = {};
