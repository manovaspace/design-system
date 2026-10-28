import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "../button.js";
import {
  MenuMorphGlyph,
  type MenuMorphGlyphProps,
} from "./menu-morph-glyph.js";

const meta = {
  title: "Motion/MenuMorphGlyph",
  component: MenuMorphGlyph,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: { open: false },
} satisfies Meta<typeof MenuMorphGlyph>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function InteractiveGlyph(args: MenuMorphGlyphProps) {
    const [open, setOpen] = useState<boolean>(args.open);
    return (
      <div className="flex flex-col items-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setOpen((v: boolean) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <MenuMorphGlyph open={open} />
        </Button>
        <p className="text-sm text-muted-foreground">
          Click to toggle hamburger ↔ X morph
        </p>
      </div>
    );
  },
};

export const Open: Story = {
  args: {
    open: true,
  },
};

export const Closed: Story = {
  args: {
    open: false,
  },
};
