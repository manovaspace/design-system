import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Row, RowList } from "./row-list.js";

describe("RowList and Row", () => {
  afterEach(() => {
    cleanup();
  });

  describe("RowList", () => {
    it("renders ul with role='list'", () => {
      render(
        <RowList data-testid="list">
          <Row>Item 1</Row>
        </RowList>,
      );

      const list = screen.getByTestId("list");
      expect(list.tagName.toLowerCase()).toBe("ul");
      expect(list.getAttribute("role")).toBe("list");
      expect(list.getAttribute("data-slot")).toBe("row-list");
    });

    it("adds data-variant='flush' when variant='flush'", () => {
      render(
        <RowList variant="flush" data-testid="flush-list">
          <Row>Item 1</Row>
        </RowList>,
      );

      const list = screen.getByTestId("flush-list");
      expect(list.getAttribute("data-variant")).toBe("flush");
    });

    it("defaults to variant='inset'", () => {
      render(
        <RowList data-testid="inset-list">
          <Row>Item 1</Row>
        </RowList>,
      );

      const list = screen.getByTestId("inset-list");
      expect(list.getAttribute("data-variant")).toBe("inset");
    });
  });

  describe("Row", () => {
    it("renders li with role='listitem' and no inline border or rounded classes", () => {
      render(<Row data-testid="row">Item 1</Row>);

      const row = screen.getByTestId("row");
      expect(row.tagName.toLowerCase()).toBe("li");
      expect(row.className).toContain("ui-row");
      expect(row.className).not.toMatch(/\brounded(-|\b)/);
      expect(row.className).not.toMatch(/\bborder(-|\b)/);
      expect(row.className).not.toMatch(/\bshadow(-|\b)/);
    });

    it("with selected renders a check icon and aria-current='true'", () => {
      render(
        <Row selected data-testid="selected-row">
          Selected item
        </Row>,
      );

      const row = screen.getByTestId("selected-row");
      expect(row.getAttribute("aria-current")).toBe("true");
      expect(row.getAttribute("data-selected")).toBe("true");

      const checkIcon = row.querySelector('[data-slot="row-check"]');
      expect(checkIcon).toBeTruthy();
    });

    it("with chevron renders an element with the mirrored-icon attribute", () => {
      render(
        <Row chevron data-testid="chevron-row">
          Chevron item
        </Row>,
      );

      const row = screen.getByTestId("chevron-row");
      const chevron = row.querySelector('[data-slot="row-chevron"]');
      expect(chevron).toBeTruthy();
      expect(
        chevron?.hasAttribute("data-mirrored-icon") ||
          chevron?.hasAttribute("data-mirrored"),
      ).toBe(true);
    });

    it("with asChild keeps the li and renders the anchor as a row action inside it", () => {
      const { container } = render(
        <RowList>
          <Row
            asChild
            chevron
            selected
            leading={<span data-testid="avatar">AV</span>}
            data-testid="link-row"
          >
            <a href="/items/42" data-testid="link-action">
              <span>Link item</span>
            </a>
          </Row>
        </RowList>,
      );

      const list = container.querySelector("ul");
      const item = list?.firstElementChild;
      expect(item?.tagName.toLowerCase()).toBe("li");
      expect(item?.getAttribute("data-testid")).toBe("link-row");
      expect(item?.getAttribute("data-interactive")).toBe("true");
      expect(item?.getAttribute("data-has-leading")).toBe("true");
      expect(item?.getAttribute("data-selected")).toBe("true");
      // aria-current moves to the action in interactive modes
      expect(item?.hasAttribute("aria-current")).toBe(false);

      const link = screen.getByTestId("link-action");
      expect(link.tagName.toLowerCase()).toBe("a");
      expect(link.getAttribute("href")).toBe("/items/42");
      expect(link.getAttribute("data-slot")).toBe("row-action");
      expect(link.classList.contains("ui-row__action")).toBe(true);
      expect(link.getAttribute("aria-current")).toBe("true");
      expect(link.querySelector("span")?.textContent).toBe("Link item");

      // leading, check and chevron are siblings of the action, not descendants
      expect(link.querySelector('[data-testid="avatar"]')).toBeNull();
      expect(link.querySelector('[data-slot="row-check"]')).toBeNull();
      expect(link.querySelector('[data-slot="row-chevron"]')).toBeNull();
      expect(item?.querySelector('[data-testid="avatar"]')).toBeTruthy();
      expect(item?.querySelector('[data-slot="row-check"]')).toBeTruthy();
      expect(item?.querySelector('[data-slot="row-chevron"]')).toBeTruthy();
    });

    it("keeps every direct child of the ul an li in static, pressable and link modes", () => {
      const { container } = render(
        <RowList>
          <Row>Static</Row>
          <Row onPress={() => {}}>Pressable</Row>
          <Row asChild>
            <a href="/items/1">Open first item</a>
          </Row>
        </RowList>,
      );

      const children = Array.from(
        container.querySelector("ul")?.children ?? [],
      );
      expect(children).toHaveLength(3);
      for (const child of children) {
        expect(child.tagName.toLowerCase()).toBe("li");
        expect(child.hasAttribute("role")).toBe(false);
      }
    });

    it("pressable row renders a type=button action inside the li and calls onPress once on click", () => {
      const onPress = vi.fn();
      render(
        <RowList>
          <Row onPress={onPress} data-testid="press-row" chevron>
            Pressable item
          </Row>
        </RowList>,
      );

      const item = screen.getByTestId("press-row");
      expect(item.tagName.toLowerCase()).toBe("li");
      expect(item.getAttribute("data-interactive")).toBe("true");
      const button = item.querySelector("button");
      expect(button).toBeTruthy();
      expect(button?.getAttribute("type")).toBe("button");
      expect(button?.getAttribute("data-slot")).toBe("row-action");
      expect(button?.classList.contains("ui-row__action")).toBe(true);

      fireEvent.click(screen.getByRole("button", { name: "Pressable item" }));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("disabled pressable row disables the button, sets data-disabled and blocks onPress", () => {
      const onPress = vi.fn();
      render(
        <RowList>
          <Row onPress={onPress} disabled data-testid="disabled-row">
            Disabled item
          </Row>
        </RowList>,
      );

      const item = screen.getByTestId("disabled-row");
      expect(item.getAttribute("data-disabled")).toBe("true");
      const button = screen.getByRole("button", { name: "Disabled item" });
      expect(button.hasAttribute("disabled")).toBe(true);
      fireEvent.click(button);
      expect(onPress).not.toHaveBeenCalled();
    });

    it("keeps a trailing button outside the action and does not trigger onPress", () => {
      const onPress = vi.fn();
      const onTrailing = vi.fn();
      render(
        <RowList>
          <Row
            onPress={onPress}
            trailing={
              <button type="button" onClick={onTrailing}>
                Remove
              </button>
            }
          >
            Row with action
          </Row>
        </RowList>,
      );

      const trailingButton = screen.getByRole("button", { name: "Remove" });
      const action = screen.getByRole("button", { name: "Row with action" });
      expect(action.contains(trailingButton)).toBe(false);
      expect(trailingButton.closest("li")).toBeTruthy();

      fireEvent.click(trailingButton);
      expect(onTrailing).toHaveBeenCalledTimes(1);
      expect(onPress).not.toHaveBeenCalled();
    });

    it("puts aria-current on the li in static mode", () => {
      render(
        <RowList>
          <Row selected data-testid="static-selected">
            Static selected
          </Row>
        </RowList>,
      );

      expect(
        screen.getByTestId("static-selected").getAttribute("aria-current"),
      ).toBe("true");
    });

    it("puts aria-current on the action in pressable mode", () => {
      render(
        <RowList>
          <Row selected onPress={() => {}} data-testid="pressable-selected">
            Pressable selected
          </Row>
        </RowList>,
      );

      const item = screen.getByTestId("pressable-selected");
      expect(item.hasAttribute("aria-current")).toBe(false);
      expect(
        screen
          .getByRole("button", { name: "Pressable selected" })
          .getAttribute("aria-current"),
      ).toBe("true");
    });

    it("warns once in development for role='button' and passes the role through", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      try {
        render(
          <RowList>
            <Row role="button" data-testid="role-row-1">
              Role one
            </Row>
            <Row role="button" data-testid="role-row-2">
              Role two
            </Row>
          </RowList>,
        );

        const messages = warn.mock.calls.map((call) => String(call[0]));
        expect(messages).toHaveLength(1);
        expect(messages[0]).toBe(
          'Row: role="button" removes the list item role. Use onPress or asChild for an interactive row.',
        );
        expect(screen.getByTestId("role-row-1").getAttribute("role")).toBe(
          "button",
        );
      } finally {
        warn.mockRestore();
      }
    });

    it("does not warn for a row without a role", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      try {
        render(
          <RowList>
            <Row>No role</Row>
          </RowList>,
        );
        expect(warn).not.toHaveBeenCalled();
      } finally {
        warn.mockRestore();
      }
    });

    it("sets data-has-leading when leading is provided", () => {
      render(
        <Row leading={<span>Icon</span>} data-testid="leading-row">
          Text
        </Row>,
      );

      const row = screen.getByTestId("leading-row");
      expect(row.getAttribute("data-has-leading")).toBe("true");
      expect(row.querySelector('[data-slot="row-leading"]')).toBeTruthy();
    });

    it("renders trailing content", () => {
      render(
        <Row
          trailing={<span data-testid="badge">12</span>}
          data-testid="trailing-row"
        >
          Text
        </Row>,
      );

      const row = screen.getByTestId("trailing-row");
      expect(row.querySelector('[data-testid="badge"]')).toBeTruthy();
    });
  });
});
