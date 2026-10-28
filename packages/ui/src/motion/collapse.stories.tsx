import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "../button.js";
import { ChevronDownIcon } from "../icons.js";
import { cn } from "../lib/utils.js";
import { Collapse, collapseChevronClassName } from "./collapse.js";

const meta = {
  title: "Motion/Collapse",
  component: Collapse,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Collapse>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { open: true },
  render: function InteractiveCollapse() {
    const [open, setOpen] = useState(true);

    return (
      <div className="w-72 rounded-[var(--radius-lg)] border border-border p-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-between"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
        >
          <span>{open ? "Collapse details" : "Expand details"}</span>
          <ChevronDownIcon
            className={cn(
              "size-4",
              collapseChevronClassName(open),
              open && "rotate-180",
            )}
            aria-hidden
          />
        </Button>
        <Collapse open={open} className="mt-2">
          <ul className="space-y-1 text-sm">
            <li className="rounded-md bg-muted/40 px-3 py-2">View customers</li>
            <li className="rounded-md bg-muted/40 px-3 py-2">
              Create pre-verified customer
            </li>
          </ul>
        </Collapse>
      </div>
    );
  },
};

export const ClosedByDefault: Story = {
  args: { open: false },
  render: function ClosedCollapse() {
    const [open, setOpen] = useState(false);

    return (
      <div className="w-72 rounded-[var(--radius-lg)] border border-border p-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-between"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
        >
          <span>{open ? "Collapse details" : "Expand details"}</span>
          <ChevronDownIcon
            className={cn(
              "size-4",
              collapseChevronClassName(open),
              open && "rotate-180",
            )}
            aria-hidden
          />
        </Button>
        <Collapse open={open} className="mt-2">
          <ul className="space-y-1 text-sm">
            <li className="rounded-md bg-muted/40 px-3 py-2">View customers</li>
            <li className="rounded-md bg-muted/40 px-3 py-2">
              Create pre-verified customer
            </li>
          </ul>
        </Collapse>
      </div>
    );
  },
};
