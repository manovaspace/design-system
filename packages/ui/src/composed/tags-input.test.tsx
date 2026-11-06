import * as React from "react";
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
  globalThis.HTMLInputElement = dom.window.HTMLInputElement;
  globalThis.HTMLButtonElement = dom.window.HTMLButtonElement;
  globalThis.Node = dom.window.Node;
  globalThis.Event = dom.window.Event;
  globalThis.CustomEvent = dom.window.CustomEvent;
  globalThis.MouseEvent = dom.window.MouseEvent;
  globalThis.KeyboardEvent = dom.window.KeyboardEvent;
  globalThis.FocusEvent = dom.window.FocusEvent;
  globalThis.UIEvent = dom.window.UIEvent;
  globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

const { cleanup, fireEvent, render, screen } = await import(
  "@testing-library/react"
);
const { TagsInput } = await import("./tags-input.js");

describe("TagsInput", () => {
  afterEach(() => {
    cleanup();
  });

  it("adds tag on Enter key", () => {
    const handleChange = vi.fn();
    render(
      <TagsInput
        placeholder="Add tags..."
        onChange={handleChange}
        locale="en"
      />,
    );

    const input = screen.getByPlaceholderText("Add tags...");
    fireEvent.change(input, { target: { value: "typescript" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(handleChange).toHaveBeenCalledWith(["typescript"]);
    expect(screen.getByText("typescript")).toBeDefined();
    expect((input as HTMLInputElement).value).toBe("");
  });

  it("commits tag on typing comma separator or Persian comma", () => {
    const handleChange = vi.fn();
    render(<TagsInput onChange={handleChange} locale="en" />);

    const input = screen.getByRole("textbox");

    // English comma via keyDown
    fireEvent.change(input, { target: { value: "react" } });
    fireEvent.keyDown(input, { key: "," });
    expect(handleChange).toHaveBeenCalledWith(["react"]);

    // Persian comma via input change (IME / typing event)
    fireEvent.change(input, { target: { value: "nextjs،" } });
    expect(handleChange).toHaveBeenCalledWith(["react", "nextjs"]);
  });

  it("splits pasted string on separators [,،\\n] and adds valid tags", () => {
    const handleChange = vi.fn();
    render(<TagsInput onChange={handleChange} locale="en" />);

    const input = screen.getByRole("textbox");
    fireEvent.paste(input, {
      clipboardData: {
        getData: () => "react, vue، svelte\nangular",
      },
    });

    expect(handleChange).toHaveBeenCalledWith([
      "react",
      "vue",
      "svelte",
      "angular",
    ]);
    expect(screen.getByText("react")).toBeDefined();
    expect(screen.getByText("vue")).toBeDefined();
    expect(screen.getByText("svelte")).toBeDefined();
    expect(screen.getByText("angular")).toBeDefined();
  });

  it("removes last tag on Backspace when input is empty", () => {
    const handleChange = vi.fn();
    render(
      <TagsInput
        defaultValue={["alpha", "beta"]}
        onChange={handleChange}
        locale="en"
      />,
    );

    const input = screen.getByRole("textbox");
    expect((input as HTMLInputElement).value).toBe("");

    fireEvent.keyDown(input, { key: "Backspace" });
    expect(handleChange).toHaveBeenCalledWith(["alpha"]);
    expect(screen.queryByText("beta")).toBeNull();
    expect(screen.getByText("alpha")).toBeDefined();
  });

  it("removes tag via remove button with aria-label", () => {
    const handleChange = vi.fn();
    render(
      <TagsInput
        defaultValue={["طراحی"]}
        onChange={handleChange}
        locale="fa"
      />,
    );

    const removeButton = screen.getByRole("button", {
      name: "حذف طراحی",
    });
    expect(removeButton).toBeDefined();

    fireEvent.click(removeButton);
    expect(handleChange).toHaveBeenCalledWith([]);
    expect(screen.queryByText("طراحی")).toBeNull();
  });

  it("deduplicates tags and ignores empty or duplicate input", () => {
    const handleChange = vi.fn();
    render(
      <TagsInput
        defaultValue={["react"]}
        onChange={handleChange}
        locale="en"
      />,
    );

    const input = screen.getByRole("textbox");

    // Try adding duplicate
    fireEvent.change(input, { target: { value: "react" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(handleChange).not.toHaveBeenCalled();

    // Try adding whitespace only
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("displays counter and enforces max limit", () => {
    const handleChange = vi.fn();
    const { rerender } = render(
      <TagsInput
        max={3}
        defaultValue={["یک", "دو"]}
        onChange={handleChange}
        locale="fa"
      />,
    );

    // Persian counter: ۲ / ۳
    expect(screen.getByText("۲ / ۳")).toBeDefined();

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "سه" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(handleChange).toHaveBeenCalledWith(["یک", "دو", "سه"]);
    expect(screen.getByText("۳ / ۳")).toBeDefined();

    // Try adding 4th item -> blocked
    fireEvent.change(input, { target: { value: "چهار" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(handleChange).toHaveBeenCalledTimes(1);

    // English counter
    rerender(
      <TagsInput
        max={3}
        defaultValue={["a", "b", "c"]}
        onChange={handleChange}
        locale="en"
      />,
    );
    expect(screen.getByText("3 / 3")).toBeDefined();
  });

  it("supports custom validate function", () => {
    const handleChange = vi.fn();
    render(
      <TagsInput
        validate={(tag) => (tag.startsWith("#") ? tag : null)}
        onChange={handleChange}
        locale="en"
      />,
    );

    const input = screen.getByRole("textbox");

    // Invalid tag
    fireEvent.change(input, { target: { value: "invalid" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(handleChange).not.toHaveBeenCalled();

    // Valid tag
    fireEvent.change(input, { target: { value: "#valid" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(handleChange).toHaveBeenCalledWith(["#valid"]);
    expect(screen.getByText("#valid")).toBeDefined();
  });

  it("forwards ref to the HTMLInputElement", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<TagsInput ref={ref} />);

    expect(ref.current).toBeDefined();
    expect(ref.current?.tagName).toBe("INPUT");
  });
});
