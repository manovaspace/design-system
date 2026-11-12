import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

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

    it("with asChild renders the child element directly, avoiding li > a nesting violation", () => {
      const { container } = render(
        <Row
          asChild
          chevron
          selected
          leading={<span data-testid="avatar">AV</span>}
        >
          <a href="/items/42" data-testid="link-row">
            <span>Link item</span>
          </a>
        </Row>,
      );

      const link = screen.getByTestId("link-row");
      expect(link.tagName.toLowerCase()).toBe("a");
      expect(link.getAttribute("href")).toBe("/items/42");
      expect(link.className).toContain("ui-row");
      expect(link.getAttribute("data-has-leading")).toBe("true");
      expect(link.getAttribute("data-selected")).toBe("true");
      expect(link.getAttribute("aria-current")).toBe("true");

      // Verify no extra li element was rendered wrapping the a
      expect(container.querySelector("li")).toBeNull();
      // Leading, check and chevron are inside the a element
      expect(link.querySelector('[data-testid="avatar"]')).toBeTruthy();
      expect(link.querySelector('[data-slot="row-check"]')).toBeTruthy();
      expect(link.querySelector('[data-slot="row-chevron"]')).toBeTruthy();
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
