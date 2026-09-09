import { describe, expect, it, vi } from "vitest";

if (typeof document === "undefined") {
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost",
  });
  globalThis.window = dom.window as unknown as Window & typeof globalThis;
  globalThis.document = dom.window.document;
  globalThis.navigator = dom.window.navigator;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.HTMLInputElement = dom.window.HTMLInputElement;
  globalThis.Node = dom.window.Node;
  globalThis.Event = dom.window.Event;
  globalThis.MouseEvent = dom.window.MouseEvent;
}

const { fireEvent, render, screen } = await import("@testing-library/react");
const { SelectableOptionCard } = await import("./selectable-option-card.js");

describe("SelectableOptionCard", () => {
  it("renders label and description", () => {
    render(
      <SelectableOptionCard
        name="plan"
        value="pro"
        selected={false}
        onSelect={() => {}}
        label="Pro Plan"
        description="For scaling teams"
      />,
    );

    expect(screen.getByText("Pro Plan")).toBeDefined();
    expect(screen.getByText("For scaling teams")).toBeDefined();
    const radio = screen.getByRole("radio", { name: /Pro Plan/ });
    expect(radio).toBeDefined();
    expect((radio as HTMLInputElement).checked).toBe(false);
  });

  it("renders icon and custom badge when provided", () => {
    render(
      <SelectableOptionCard
        name="plan"
        value="enterprise"
        selected={false}
        onSelect={() => {}}
        label="Enterprise"
        icon={<span data-testid="test-icon">icon</span>}
        badge={<span data-testid="test-badge">Popular</span>}
      />,
    );

    expect(screen.getByTestId("test-icon")).toBeDefined();
    expect(screen.getByTestId("test-badge").textContent).toBe("Popular");
  });

  it("triggers onSelect when radio is clicked", () => {
    const handleSelect = vi.fn();
    render(
      <SelectableOptionCard
        name="plan"
        value="starter"
        selected={false}
        onSelect={handleSelect}
        label="Starter"
      />,
    );

    const radio = screen.getByRole("radio", { name: /Starter/ });
    fireEvent.click(radio);
    expect(handleSelect).toHaveBeenCalledTimes(1);
  });

  it("shows check icon badge when selected is true and showSelectionBadge is true", () => {
    const { rerender } = render(
      <SelectableOptionCard
        name="plan"
        value="starter"
        selected={true}
        showSelectionBadge={true}
        onSelect={() => {}}
        label="Starter"
      />,
    );

    expect(screen.getByTestId("selection-badge")).toBeDefined();

    rerender(
      <SelectableOptionCard
        name="plan"
        value="starter"
        selected={true}
        showSelectionBadge={false}
        onSelect={() => {}}
        label="Starter"
      />,
    );

    expect(screen.queryByTestId("selection-badge")).toBeNull();
  });

  it("does not show check icon badge when unselected", () => {
    render(
      <SelectableOptionCard
        name="plan"
        value="starter"
        selected={false}
        showSelectionBadge={true}
        onSelect={() => {}}
        label="Starter"
      />,
    );

    expect(screen.queryByTestId("selection-badge")).toBeNull();
  });

  it("respects disabled attribute", () => {
    const handleSelect = vi.fn();
    render(
      <SelectableOptionCard
        name="plan"
        value="custom"
        selected={false}
        disabled={true}
        onSelect={handleSelect}
        label="Custom Plan"
      />,
    );

    const radio = screen.getByRole("radio", {
      name: /Custom Plan/,
    }) as HTMLInputElement;
    expect(radio.disabled).toBe(true);

    fireEvent.click(radio);
    expect(handleSelect).not.toHaveBeenCalled();
  });
});
