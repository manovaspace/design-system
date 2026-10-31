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

  it("renders an error action inline with the message", () => {
    setViewport(true);
    const onClick = vi.fn();
    renderDialog({
      error: "Insufficient stock",
      errorAction: { label: "Retry", onClick },
    });
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Insufficient stock");
    const retry = screen.getByRole("button", { name: "Retry" });
    expect(alert.contains(retry)).toBe(true);
    fireEvent.click(retry);
    expect(onClick).toHaveBeenCalledTimes(1);

    // The step content and the primary action stay where they were.
    expect(screen.getByText("Step body")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Continue" })).toBeTruthy();
  });

  it("marks the error row busy and disables the action while pending", () => {
    setViewport(true);
    const { rerender, props } = renderDialog({
      error: "Insufficient stock",
      errorAction: { label: "Retry", onClick: vi.fn() },
    });
    expect(screen.getByRole("alert").getAttribute("aria-busy")).toBeNull();
    expect(
      (screen.getByRole("button", { name: "Retry" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);

    rerender(
      <ProgressiveDialog
        {...props}
        error="Insufficient stock"
        errorAction={{ label: "Retry", onClick: vi.fn(), pending: true }}
      />,
    );
    expect(screen.getByRole("alert").getAttribute("aria-busy")).toBe("true");
    expect(
      (screen.getByRole("button", { name: "Retry" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  it("keeps the error until the caller clears it", () => {
    setViewport(true);
    const { rerender, props } = renderDialog({
      error: "Insufficient stock",
      errorAction: { label: "Retry", onClick: vi.fn() },
    });
    rerender(<ProgressiveDialog {...props} stepIndex={1} />);
    expect(screen.getByRole("alert").textContent).toContain(
      "Insufficient stock",
    );
    rerender(<ProgressiveDialog {...props} stepIndex={1} error={null} />);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();
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

describe("ProgressiveDialog segmented progress", () => {
  const filledParts = () =>
    Array.from(
      document.querySelectorAll(
        '[data-slot="progressive-dialog-step-part"][data-filled="true"]',
      ),
    ).length;

  const statesByStep = () =>
    Array.from(
      document.querySelectorAll('[data-slot="progressive-dialog-step-bar"]'),
    ).map((bar) =>
      Array.from(
        bar.querySelectorAll('[data-slot="progressive-dialog-step-part"]'),
      ).map((part) => part.getAttribute("data-state")),
    );

  it("gives every step its own bar and keeps the labels current", () => {
    setViewport(true);
    renderDialog({ progress: "segments", stepIndex: 1 });
    const progress = document.querySelector(
      '[data-slot="progressive-dialog-progress"]',
    ) as HTMLElement;
    expect(progress.dataset.progress).toBe("segments");
    expect(
      document.querySelectorAll('[data-slot="progressive-dialog-step-bar"]')
        .length,
    ).toBe(steps.length);
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(
      screen.getByText("Items").closest("li")?.getAttribute("aria-current"),
    ).toBe("step");
  });

  it("marks completed, current and future steps with data-state", () => {
    setViewport(true);
    renderDialog({ progress: "segments", stepIndex: 1 });
    expect(statesByStep()).toEqual([["done"], ["current"], ["todo"]]);
    // `data-filled` stays for compatibility alongside the new state.
    expect(filledParts()).toBe(2);
  });

  it("applies the step state to every part and keeps partial fills", () => {
    setViewport(true);
    renderDialog({
      progress: "segments",
      stepIndex: 1,
      steps: [
        { id: "source", label: "Source", parts: { completed: 2, total: 2 } },
        { id: "items", label: "Items", parts: { completed: 1, total: 3 } },
        { id: "review", label: "Review", parts: { completed: 0, total: 2 } },
      ],
    });
    expect(statesByStep()).toEqual([
      ["done", "done"],
      ["current", "current", "current"],
      ["todo", "todo"],
    ]);
    // source is done, one current page is filled, review has not started
    expect(filledParts()).toBe(3);
  });

  it("fills past steps fully and leaves future steps empty", () => {
    setViewport(true);
    renderDialog({ progress: "segments", stepIndex: 1 });
    const parts = document.querySelectorAll(
      '[data-slot="progressive-dialog-step-part"]',
    );
    expect(parts.length).toBe(steps.length);
    expect(filledParts()).toBe(2);
  });

  it("splits a step's bar into one piece per part", () => {
    setViewport(true);
    renderDialog({
      progress: "segments",
      stepIndex: 1,
      steps: [
        { id: "source", label: "Source" },
        { id: "items", label: "Items", parts: { completed: 2, total: 3 } },
        { id: "review", label: "Review" },
      ],
    });
    const parts = document.querySelectorAll(
      '[data-slot="progressive-dialog-step-part"]',
    );
    // source (1) + items (3 pieces) + review (1)
    expect(parts.length).toBe(5);
    // source filled, two of three item pages filled, review empty
    expect(filledParts()).toBe(3);
  });

  it("keeps the unified bar by default", () => {
    setViewport(true);
    renderDialog({ stepIndex: 1 });
    expect(screen.getByRole("progressbar", { name: "Progress" })).toBeTruthy();
  });

  it("returns focus to the content when the focus key changes inside a step", () => {
    setViewport(true);
    const { rerender, props } = renderDialog({
      stepIndex: 1,
      focusKey: "item-1",
    });
    const content = document.querySelector(
      '[data-slot="progressive-dialog-content"]',
    ) as HTMLElement;
    rerender(<ProgressiveDialog {...props} stepIndex={1} focusKey="item-2" />);
    expect(document.activeElement).toBe(content);
  });
});
