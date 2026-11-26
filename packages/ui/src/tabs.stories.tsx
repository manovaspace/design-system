import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs.js";

const meta = {
  title: "Components/Navigation/Tabs",
  component: Tabs,
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-80">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="text-sm text-muted-foreground">
        Workspace summary and active alerts.
      </TabsContent>
      <TabsContent value="members" className="text-sm text-muted-foreground">
        Team members and permissions.
      </TabsContent>
      <TabsContent value="settings" className="text-sm text-muted-foreground">
        Brand and locale configuration.
      </TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const membersTab = canvas.getByRole("tab", { name: "Members" });
    await userEvent.click(membersTab);
    expect(membersTab.getAttribute("aria-selected")).toBe("true");
    expect(canvas.getByText("Team members and permissions.")).toBeTruthy();
  },
};
