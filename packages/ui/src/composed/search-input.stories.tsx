import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { Badge } from "../badge.js";
import { DirectionProvider } from "../direction-provider.js";
import { SearchInput } from "./search-input.js";

const meta = {
  title: "Composed/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Search components…",
    className: "w-80",
  },
};

export const Persian: Story = {
  render: () => (
    <DirectionProvider direction="rtl">
      <div dir="rtl" className="w-80">
        <SearchInput locale="fa-IR" dir="rtl" />
      </div>
    </DirectionProvider>
  ),
};

export function ControlledWithClear() {
  const [query, setQuery] = React.useState("Initial query");

  return (
    <div className="flex w-80 flex-col gap-2">
      <SearchInput
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onClear={() => setQuery("")}
      />
      <p className="text-xs text-muted-foreground">
        Current query:{" "}
        <span className="font-mono text-foreground">{query || "(empty)"}</span>
      </p>
    </div>
  );
}

export function UncontrolledWithClear() {
  return (
    <div className="w-80">
      <SearchInput defaultValue="Uncontrolled query" onClear={() => {}} />
    </div>
  );
}

export const WithEndAddon: Story = {
  args: {
    defaultValue: "Settings",
    className: "w-80",
    onClear: () => {},
    endAddon: (
      <Badge
        variant="secondary"
        className="text-[10px] uppercase font-mono px-1 py-0"
      >
        ⌘K
      </Badge>
    ),
  },
};
