import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DirectionProvider } from "../direction-provider.js";
import {
  WorkspaceSwitcher,
  type WorkspaceSwitcherItem,
  type WorkspaceSwitcherLabels,
} from "./workspace-switcher.js";

const workspaces: WorkspaceSwitcherItem[] = [
  { id: "alpha", name: "Alpha Works", subtitle: "Plan A" },
  { id: "beta", name: "Beta Works" },
  { id: "gamma", name: "Gamma Works", logoSrc: "/gamma.svg" },
];

const labels: WorkspaceSwitcherLabels = {
  trigger: "Switch workspace",
  list: "Workspaces",
  empty: "No workspaces yet",
  create: "Create workspace",
};

function renderSwitcher({
  items = workspaces,
  currentId = "alpha",
  onCreate,
}: {
  items?: WorkspaceSwitcherItem[];
  currentId?: string;
  onCreate?: () => void;
} = {}) {
  return render(
    <WorkspaceSwitcher
      workspaces={items}
      currentId={currentId}
      onSwitch={() => {}}
      labels={labels}
      onCreate={onCreate}
    />,
  );
}

function openList() {
  const trigger = screen.getByRole("button", { name: labels.trigger });
  fireEvent.click(trigger);
  return {
    trigger,
    listbox: screen.getByRole("listbox", { name: labels.list }),
  };
}

function options() {
  return screen.getAllByRole("option");
}

describe("WorkspaceSwitcher", () => {
  it("renders the current workspace inside a 44px trigger", () => {
    renderSwitcher();

    const trigger = screen.getByRole("button", { name: labels.trigger });
    expect(trigger.getAttribute("aria-haspopup")).toBe("listbox");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.className).toContain("min-h-11");
    expect(screen.getByText("Alpha Works")).toBeTruthy();
    expect(screen.getByText("Plan A")).toBeTruthy();
    expect(screen.getByText("AW")).toBeTruthy();
  });

  it("opens a labelled listbox and marks the current option selected", () => {
    renderSwitcher();
    const { trigger, listbox } = openList();

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-controls")).toBe(listbox.id);
    expect(listbox.className).toContain("outline-none");

    const items = options();
    expect(items).toHaveLength(3);
    expect(items[0]?.getAttribute("aria-selected")).toBe("true");
    expect(items[1]?.getAttribute("aria-selected")).toBe("false");
    expect(items[0]?.className).toContain("min-h-11");
    expect(listbox.getAttribute("aria-activedescendant")).toBe(items[0]?.id);
  });

  it("opens from the trigger with ArrowDown or Enter", () => {
    renderSwitcher();
    const trigger = screen.getByRole("button", { name: labels.trigger });

    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    let listbox = screen.getByRole("listbox", { name: labels.list });
    expect(listbox.getAttribute("aria-activedescendant")).toBe(
      options()[0]?.id,
    );

    fireEvent.keyDown(listbox, { key: "Escape" });
    expect(document.activeElement).toBe(trigger);

    fireEvent.keyDown(trigger, { key: "Enter" });
    listbox = screen.getByRole("listbox", { name: labels.list });
    expect(listbox.getAttribute("aria-activedescendant")).toBe(
      options()[0]?.id,
    );
  });

  it("moves with Arrow keys, Home and End, then selects with Enter", () => {
    const onSwitch = vi.fn();
    render(
      <WorkspaceSwitcher
        workspaces={workspaces}
        currentId="alpha"
        onSwitch={onSwitch}
        labels={labels}
      />,
    );
    const { trigger, listbox } = openList();

    fireEvent.keyDown(listbox, { key: "ArrowDown" });
    expect(listbox.getAttribute("aria-activedescendant")).toBe(
      options()[1]?.id,
    );

    fireEvent.keyDown(listbox, { key: "End" });
    expect(listbox.getAttribute("aria-activedescendant")).toBe(
      options()[2]?.id,
    );

    fireEvent.keyDown(listbox, { key: "Home" });
    expect(listbox.getAttribute("aria-activedescendant")).toBe(
      options()[0]?.id,
    );

    fireEvent.keyDown(listbox, { key: "ArrowUp" });
    expect(listbox.getAttribute("aria-activedescendant")).toBe(
      options()[2]?.id,
    );

    fireEvent.keyDown(listbox, { key: "Enter" });
    expect(onSwitch).toHaveBeenCalledWith("gamma");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("selects the active option with Space", () => {
    const onSwitch = vi.fn();
    render(
      <WorkspaceSwitcher
        workspaces={workspaces}
        currentId="alpha"
        onSwitch={onSwitch}
        labels={labels}
      />,
    );
    const { listbox } = openList();

    fireEvent.keyDown(listbox, { key: "ArrowDown" });
    fireEvent.keyDown(listbox, { key: " " });

    expect(onSwitch).toHaveBeenCalledWith("beta");
  });

  it("supports type-ahead", () => {
    renderSwitcher();
    const { listbox } = openList();

    fireEvent.keyDown(listbox, { key: "g" });

    expect(listbox.getAttribute("aria-activedescendant")).toBe(
      options()[2]?.id,
    );
  });

  it("closes on Escape and returns focus to the trigger", () => {
    renderSwitcher();
    const { trigger, listbox } = openList();

    fireEvent.keyDown(listbox, { key: "Escape" });

    expect(screen.queryByRole("listbox")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("selects an option with a pointer", () => {
    const onSwitch = vi.fn();
    render(
      <WorkspaceSwitcher
        workspaces={workspaces}
        currentId="alpha"
        onSwitch={onSwitch}
        labels={labels}
      />,
    );
    openList();

    fireEvent.click(screen.getByText("Beta Works"));

    expect(onSwitch).toHaveBeenCalledWith("beta");
  });

  it("runs the optional create action", () => {
    const onCreate = vi.fn();
    renderSwitcher({ onCreate });
    openList();

    fireEvent.click(screen.getByRole("button", { name: labels.create }));

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("renders a single workspace as a static label without a menu", () => {
    renderSwitcher({ items: workspaces.slice(0, 1) });

    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.getByText("Alpha Works")).toBeTruthy();
    const root = document.querySelector('[data-slot="workspace-switcher"]');
    expect(root?.getAttribute("data-state")).toBe("single");
  });

  it("renders an empty state without a menu", () => {
    renderSwitcher({ items: [] });

    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.getByText(labels.empty)).toBeTruthy();
    const root = document.querySelector('[data-slot="workspace-switcher"]');
    expect(root?.getAttribute("data-state")).toBe("empty");
  });

  it("mirrors the chevron and uses logical alignment in RTL", () => {
    render(
      <DirectionProvider direction="rtl">
        <WorkspaceSwitcher
          workspaces={workspaces}
          currentId="alpha"
          onSwitch={() => {}}
          labels={labels}
        />
      </DirectionProvider>,
    );

    const root = document.querySelector('[data-slot="workspace-switcher"]');
    expect(root?.getAttribute("dir")).toBe("rtl");

    const chevron = document.querySelector(
      '[data-slot="workspace-switcher-chevron"]',
    );
    expect(chevron?.getAttribute("class")).toContain("rotate-180");

    fireEvent.click(screen.getByRole("button", { name: labels.trigger }));

    const popup = document.querySelector(
      '[data-slot="workspace-switcher-popup"]',
    );
    expect(popup?.className).toContain("start-0");
    expect(
      popup?.querySelector('[data-slot="workspace-switcher-option"]'),
    ).toBeTruthy();
  });
});
