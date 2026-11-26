import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { WorkspaceSwitcher } from "./workspace-switcher.js";

const WORKSPACES = [
  { id: "fryto", name: "Fryto Central Kitchen", subtitle: "Production" },
  { id: "staging", name: "Fryto Staging", subtitle: "Sandbox" },
  { id: "warehouse", name: "Tehran North Depot", subtitle: "Branch" },
];

function WorkspaceSwitcherDemo() {
  const [currentId, setCurrentId] = useState("fryto");
  return (
    <div className="w-72">
      <WorkspaceSwitcher
        workspaces={WORKSPACES}
        currentId={currentId}
        onSwitch={setCurrentId}
        onCreate={() => undefined}
        labels={{
          trigger: "Switch workspace",
          list: "Workspaces",
          empty: "No workspaces",
          create: "New workspace",
        }}
      />
    </div>
  );
}

const meta = {
  title: "Components/Navigation/WorkspaceSwitcher",
  component: WorkspaceSwitcher,
  tags: ["autodocs"],
} satisfies Meta<typeof WorkspaceSwitcher>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <WorkspaceSwitcherDemo />,
};
