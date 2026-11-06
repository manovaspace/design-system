import { afterEach, describe, expect, it, vi } from "vitest";

if (typeof document === "undefined" || typeof Element === "undefined") {
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost",
  });
  globalThis.window = dom.window as unknown as Window & typeof globalThis;
  globalThis.document = dom.window.document;
  globalThis.navigator = dom.window.navigator;
  globalThis.Element = dom.window.Element;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.Node = dom.window.Node;
  globalThis.Event = dom.window.Event;
  globalThis.MouseEvent = dom.window.MouseEvent;
  globalThis.KeyboardEvent = dom.window.KeyboardEvent;
  globalThis.FocusEvent = dom.window.FocusEvent;
}

const { cleanup, fireEvent, render, screen } = await import(
  "@testing-library/react"
);
const { Rating } = await import("./rating.js");

describe("Rating", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders with slider role and ARIA attributes", () => {
    render(<Rating value={3} max={5} locale="en" />);

    const slider = screen.getByRole("slider");
    expect(slider.getAttribute("aria-valuenow")).toBe("3");
    expect(slider.getAttribute("aria-valuemin")).toBe("0");
    expect(slider.getAttribute("aria-valuemax")).toBe("5");
    expect(slider.getAttribute("aria-valuetext")).toBe("3 of 5 stars");

    const stars = slider.querySelectorAll("[data-slot='rating-star']");
    expect(stars.length).toBe(5);
  });

  it("renders correct star states (full vs empty)", () => {
    render(<Rating value={3} max={5} />);

    const slider = screen.getByRole("slider");
    const stars = slider.querySelectorAll("[data-slot='rating-star']");

    expect(stars[0]?.getAttribute("data-state")).toBe("full");
    expect(stars[1]?.getAttribute("data-state")).toBe("full");
    expect(stars[2]?.getAttribute("data-state")).toBe("full");
    expect(stars[3]?.getAttribute("data-state")).toBe("empty");
    expect(stars[4]?.getAttribute("data-state")).toBe("empty");
  });

  it("handles clicking on star to select rating", () => {
    const handleChange = vi.fn();
    render(<Rating onChange={handleChange} />);

    const slider = screen.getByRole("slider");
    const stars = slider.querySelectorAll("[data-slot='rating-star']");
    const targetStar = stars[3];
    expect(targetStar).toBeDefined();
    if (targetStar) {
      fireEvent.click(targetStar);
    }
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it("supports precision={0.5} for half-star ratings", () => {
    render(<Rating value={2.5} max={5} precision={0.5} />);

    const slider = screen.getByRole("slider");
    const stars = slider.querySelectorAll("[data-slot='rating-star']");

    expect(stars[0]?.getAttribute("data-state")).toBe("full");
    expect(stars[1]?.getAttribute("data-state")).toBe("full");
    expect(stars[2]?.getAttribute("data-state")).toBe("half");
    expect(stars[3]?.getAttribute("data-state")).toBe("empty");
    expect(stars[4]?.getAttribute("data-state")).toBe("empty");
  });

  it("navigates with keyboard in LTR (Right increases, Left decreases)", () => {
    const handleChange = vi.fn();
    render(<Rating defaultValue={2} locale="en" onChange={handleChange} />);

    const slider = screen.getByRole("slider");

    // Right increases
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(handleChange).toHaveBeenCalledWith(3);

    // Left decreases
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(handleChange).toHaveBeenCalledWith(2);

    // End sets to max
    fireEvent.keyDown(slider, { key: "End" });
    expect(handleChange).toHaveBeenCalledWith(5);

    // Home sets to 0
    fireEvent.keyDown(slider, { key: "Home" });
    expect(handleChange).toHaveBeenCalledWith(0);
  });

  it("navigates with keyboard in RTL (Left increases, Right decreases)", () => {
    const handleChange = vi.fn();
    render(<Rating defaultValue={2} locale="fa" onChange={handleChange} />);

    const slider = screen.getByRole("slider");
    expect(slider.getAttribute("dir")).toBe("rtl");

    // In RTL, ArrowLeft increases rating
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(handleChange).toHaveBeenCalledWith(3);

    // In RTL, ArrowRight decreases rating
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(handleChange).toHaveBeenCalledWith(2);
  });

  it("navigates with Up and Down arrows regardless of direction", () => {
    const handleChange = vi.fn();
    render(<Rating defaultValue={3} onChange={handleChange} />);

    const slider = screen.getByRole("slider");

    fireEvent.keyDown(slider, { key: "ArrowUp" });
    expect(handleChange).toHaveBeenCalledWith(4);

    fireEvent.keyDown(slider, { key: "ArrowDown" });
    expect(handleChange).toHaveBeenCalledWith(3);
  });

  it("supports readOnly mode", () => {
    const handleChange = vi.fn();
    render(<Rating value={3} readOnly onChange={handleChange} />);

    const slider = screen.getByRole("slider");
    expect(slider.getAttribute("aria-readonly")).toBe("true");

    const stars = slider.querySelectorAll("[data-slot='rating-star']");
    const targetStar = stars[4];
    if (targetStar) {
      fireEvent.click(targetStar);
    }
    expect(handleChange).not.toHaveBeenCalled();

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("supports disabled mode", () => {
    const handleChange = vi.fn();
    render(<Rating value={3} disabled onChange={handleChange} />);

    const slider = screen.getByRole("slider");
    expect(slider.getAttribute("aria-disabled")).toBe("true");
    expect(slider.getAttribute("tabindex")).toBe("-1");

    const stars = slider.querySelectorAll("[data-slot='rating-star']");
    const targetStar = stars[4];
    if (targetStar) {
      fireEvent.click(targetStar);
    }
    expect(handleChange).not.toHaveBeenCalled();
  });
});
