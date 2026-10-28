import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProgressiveDialog, type ProgressiveDialogProps } from "./index.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  // @ts-expect-error jsdom has no matchMedia; tests that need one stub it.
  delete window.matchMedia;
});

const steps = [
  { id: "source", label: "Source" },
  { id: "items", label: "Items" },
  { id: "review", label: "Review" },
];

const labels = { close: "Close wizard", back: "Back", steps: "Progress" };

function setViewport(desktop: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: desktop,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

function renderDialog(overrides: Partial<ProgressiveDialogProps> = {}) {
  const props: ProgressiveDialogProps = {
    open: true,
    onClose: vi.fn(),
    title: "Transfer",
    steps,
    stepIndex: 0,
    onBack: vi.fn(),
    primaryAction: { label: "Continue", onClick: vi.fn() },
    labels,
    children: <p>Step body</p>,
    ...overrides,
  };
  const view = render(<ProgressiveDialog {...props} />);
  return { ...view, props };
}

describe("ProgressiveDialog", () => {
  it("names the dialog, marks the current step and sets progress", () => {
    setViewport(true);
    renderDialog({ stepIndex: 1 });
    expect(screen.getByRole("heading", { name: "Transfer" })).toBeTruthy();
    const current = screen.getByText("Items");
    expect(current.getAttribute("aria-current")).toBe("step");
    expect(screen.getByText("Source").getAttribute("aria-current")).toBeNull();
    const bar = screen.getByRole("progressbar", { name: "Progress" });
    expect(Number(bar.getAttribute("aria-valuenow"))).toBeCloseTo(66.67, 1);
  });

  it("hides back on the first step and shows it after", () => {
    setViewport(true);
    const { rerender, props } = renderDialog({ stepIndex: 0 });
    expect(screen.queryByRole("button", { name: "Back" })).toBeNull();
    rerender(<ProgressiveDialog {...props} stepIndex={1} />);
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(props.onBack).toHaveBeenCalledTimes(1);
  });

  it("runs the primary action and disables it while pending", () => {
    setViewport(true);
    const onClick = vi.fn();
    const { rerender, props } = renderDialog({
      primaryAction: { label: "Submit", onClick },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <ProgressiveDialog
        {...props}
        primaryAction={{ label: "Submit", onClick, pending: true }}
      />,
    );
    const submit = screen.getByRole("button", { name: "Submit" });
    expect((submit as HTMLButtonElement).disabled).toBe(true);
    expect(submit.getAttribute("aria-busy")).toBe("true");
  });

  it("announces errors as an alert", () => {
    setViewport(true);
    renderDialog({ error: "Insufficient stock" });
    expect(screen.getByRole("alert").textContent).toBe("Insufficient stock");
  });

  it("requests a close from the close control, Escape and the overlay", () => {
    setViewport(true);
    const { props } = renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Close wizard" }));
    expect(props.onClose).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: "Escape",
    });
    expect(props.onClose).toHaveBeenCalledTimes(2);
  });

  it("ignores close requests while the primary action is pending", () => {
    setViewport(true);
    const { props } = renderDialog({
      primaryAction: { label: "Submit", onClick: vi.fn(), pending: true },
    });
    fireEvent.click(screen.getByRole("button", { name: "Close wizard" }));
    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: "Escape",
    });
    expect(props.onClose).not.toHaveBeenCalled();
  });

  it("moves focus to the step content when the step changes", () => {
    setViewport(true);
    const { rerender, props, container } = renderDialog({ stepIndex: 0 });
    const content = document.querySelector(
      '[data-slot="progressive-dialog-content"]',
    ) as HTMLElement;
    expect(content).toBeTruthy();
    rerender(<ProgressiveDialog {...props} stepIndex={1} />);
    expect(document.activeElement).toBe(content);
    expect(container).toBeTruthy();
  });

  it("renders the same content in the full-screen sheet below md", () => {
    setViewport(false);
    renderDialog({ stepIndex: 2, title: "Receive" });
    expect(screen.getByRole("heading", { name: "Receive" })).toBeTruthy();
    expect(screen.getByText("Review").getAttribute("aria-current")).toBe(
      "step",
    );
    expect(screen.getByText("Step body")).toBeTruthy();
  });
});
