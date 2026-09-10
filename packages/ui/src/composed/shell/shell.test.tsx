import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  cleanup();
});

import {
  NavMobileSheet,
  NavRail,
  ShellHeader,
  useShellMenuState,
} from "./index.js";

describe("Adaptive Shell Components", () => {
  describe("NavRail", () => {
    it("renders desktop rail with children, brand, and footer", () => {
      render(
        <NavRail
          brand={<div data-testid="rail-brand">Orbit Gold</div>}
          footer={<div data-testid="rail-footer">v1.0.0</div>}
          className="custom-rail-class"
        >
          <nav>
            <a href="/dashboard">Dashboard</a>
            <a href="/trades">Trades</a>
          </nav>
        </NavRail>,
      );

      expect(screen.getByTestId("rail-brand")).toBeTruthy();
      expect(screen.getByText("Orbit Gold")).toBeTruthy();
      expect(screen.getByText("Dashboard")).toBeTruthy();
      expect(screen.getByText("Trades")).toBeTruthy();
      expect(screen.getByTestId("rail-footer")).toBeTruthy();

      const aside = screen.getByRole("complementary");
      expect(aside.className).toContain("custom-rail-class");
      expect(aside.className).toContain("hidden");
      expect(aside.className).toContain("md:flex");
    });

    it("renders loading skeleton state when isLoading is true", () => {
      render(
        <NavRail
          isLoading
          brand={<div data-testid="rail-brand">Orbit Gold</div>}
          footer={<div data-testid="rail-footer">Footer</div>}
        >
          <div>Nav Content</div>
        </NavRail>,
      );

      const skeletonAside = screen.getByTestId("nav-rail-skeleton");
      expect(skeletonAside).toBeTruthy();
      expect(skeletonAside.getAttribute("aria-busy")).toBe("true");
      expect(screen.queryByText("Nav Content")).toBeNull();
      expect(screen.getByTestId("rail-brand")).toBeTruthy();
      expect(screen.getByTestId("rail-footer")).toBeTruthy();
    });
  });

  describe("ShellHeader", () => {
    it("renders desktop header with title, label, brandMark, actions, and userCard", () => {
      render(
        <ShellHeader
          title="Overview"
          label="Trading Desk"
          brandMark={<span data-testid="brand-mark">Logo</span>}
          headerActions={<button type="button">Quick Trade</button>}
          userCard={<div data-testid="user-card">User Profile</div>}
          className="custom-header"
        />,
      );

      expect(screen.getByText("Overview")).toBeTruthy();
      expect(screen.getByText("Trading Desk")).toBeTruthy();
      expect(screen.getByTestId("brand-mark")).toBeTruthy();
      expect(screen.getByRole("button", { name: "Quick Trade" })).toBeTruthy();
      expect(screen.getByTestId("user-card")).toBeTruthy();

      const header = screen.getByRole("banner");
      expect(header.className).toContain("custom-header");
      expect(header.className).toContain("bg-primary");
    });

    it("triggers onMenuOpenChange when mobile menu button is clicked", () => {
      const handleMenuOpenChange = vi.fn();
      render(
        <ShellHeader
          title="Market"
          openMenuLabel="Open navigation menu"
          menuOpen={false}
          onMenuOpenChange={handleMenuOpenChange}
        />,
      );

      const menuButton = screen.getByRole("button", {
        name: "Open navigation menu",
      });
      expect(menuButton.getAttribute("aria-expanded")).toBe("false");

      fireEvent.click(menuButton);
      expect(handleMenuOpenChange).toHaveBeenCalledWith(true);
    });

    it("renders loading skeleton placeholders when isLoading is true", () => {
      render(
        <ShellHeader
          title="Market"
          isLoading
          brandMark={<span>Brand</span>}
          openMenuLabel="Open navigation menu"
        />,
      );

      expect(screen.getByTestId("shell-header-brand-skeleton")).toBeTruthy();
      expect(screen.getByTestId("shell-header-menu-skeleton")).toBeTruthy();
      expect(
        screen.queryByRole("button", { name: "Open navigation menu" }),
      ).toBeNull();
    });

    it("applies default variant styling when variant is default", () => {
      render(<ShellHeader title="Default Header" variant="default" />);

      const header = screen.getByRole("banner");
      expect(header.className).toContain("bg-background");
      expect(header.className).toContain("border-b");
    });

    it("renders attached menuSheet slot", () => {
      render(
        <ShellHeader
          title="With Sheet"
          menuSheet={<div data-testid="attached-sheet">Sheet Content</div>}
        />,
      );

      expect(screen.getByTestId("attached-sheet")).toBeTruthy();
    });
  });

  describe("useShellMenuState", () => {
    it("initializes to false and manages menu state changes", () => {
      const { result } = renderHook(() => useShellMenuState());
      expect(result.current[0]).toBe(false);

      act(() => {
        result.current[1](true);
      });
      expect(result.current[0]).toBe(true);

      act(() => {
        result.current[1](false);
      });
      expect(result.current[0]).toBe(false);
    });
  });

  describe("NavMobileSheet", () => {
    it("renders content when open is true and calls onOpenChange on dismiss", () => {
      const handleOpenChange = vi.fn();
      render(
        <NavMobileSheet
          id="mobile-nav"
          open={true}
          onOpenChange={handleOpenChange}
          title="Navigation Menu"
          description="Browse platform sections"
          userCard={<div data-testid="sheet-user">Trader 01</div>}
          footer={<button type="button">Logout</button>}
        >
          <nav data-testid="mobile-links">
            <a href="/orders">Orders</a>
          </nav>
        </NavMobileSheet>,
      );

      expect(screen.getByRole("dialog")).toBeTruthy();
      expect(screen.getByText("Navigation Menu")).toBeTruthy();
      expect(screen.getByText("Browse platform sections")).toBeTruthy();
      expect(screen.getByTestId("sheet-user")).toBeTruthy();
      expect(screen.getByTestId("mobile-links")).toBeTruthy();
      expect(screen.getByRole("button", { name: "Logout" })).toBeTruthy();

      const closeButton = screen.getByRole("button", { name: "Close" });
      fireEvent.click(closeButton);
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it("does not display dialog content when open is false", () => {
      render(
        <NavMobileSheet
          open={false}
          onOpenChange={() => {}}
          title="Hidden Menu"
        >
          <div>Hidden Links</div>
        </NavMobileSheet>,
      );

      expect(screen.queryByRole("dialog")).toBeNull();
      expect(screen.queryByText("Hidden Links")).toBeNull();
    });
  });
});
