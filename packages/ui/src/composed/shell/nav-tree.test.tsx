import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentType, ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Badge } from "../../badge.js";
import { type NavItemConfig, NavTree } from "./nav-tree.js";

afterEach(() => {
  cleanup();
});

describe("NavTree", () => {
  const sampleItems: NavItemConfig[] = [
    {
      href: "/dashboard",
      label: "Dashboard",
    },
    {
      href: "/orders",
      label: "Orders",
      badge: "12",
    },
    {
      href: "/settings",
      label: "Settings",
      subsections: [
        {
          href: "/settings/profile",
          label: "Profile",
        },
        {
          href: "/settings/security",
          label: "Security",
          badge: <Badge variant="destructive">Alert</Badge>,
        },
      ],
    },
  ];

  it("renders flat navigation links", () => {
    const handleNavigate = vi.fn();
    render(<NavTree items={sampleItems} onNavigate={handleNavigate} />);

    const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboardLink).toBeTruthy();
    expect(dashboardLink.getAttribute("href")).toBe("/dashboard");

    const ordersLink = screen.getByRole("link", { name: /Orders/ });
    expect(ordersLink).toBeTruthy();
    expect(ordersLink.getAttribute("href")).toBe("/orders");

    dashboardLink.addEventListener("click", (e) => e.preventDefault());
    fireEvent.click(dashboardLink);
    expect(handleNavigate).toHaveBeenCalledTimes(1);
  });

  it("renders collapsible section with subsections and toggles open/close on click", () => {
    const handleNavigate = vi.fn();
    render(<NavTree items={sampleItems} onNavigate={handleNavigate} />);

    const settingsButton = screen.getByRole("button", { name: /Settings/ });
    expect(settingsButton.getAttribute("aria-expanded")).toBe("false");

    // Click to open
    fireEvent.click(settingsButton);
    expect(settingsButton.getAttribute("aria-expanded")).toBe("true");

    const profileLink = screen.getByRole("link", { name: "Profile" });
    expect(profileLink).toBeTruthy();
    expect(profileLink.getAttribute("href")).toBe("/settings/profile");
    expect(
      profileLink
        .closest("ul")
        ?.parentElement?.parentElement?.hasAttribute("inert"),
    ).toBe(false);

    // Click subsection link triggers onNavigate
    profileLink.addEventListener("click", (e) => e.preventDefault());
    fireEvent.click(profileLink);
    expect(handleNavigate).toHaveBeenCalledTimes(1);

    // Click to collapse
    fireEvent.click(settingsButton);
    expect(settingsButton.getAttribute("aria-expanded")).toBe("false");
    expect(
      profileLink
        .closest("ul")
        ?.parentElement?.parentElement?.hasAttribute("inert"),
    ).toBe(true);
  });

  it("highlights active route and auto-expands collapsible section based on currentPath", () => {
    render(<NavTree items={sampleItems} currentPath="/settings/security" />);

    const settingsButton = screen.getByRole("button", { name: /Settings/ });
    expect(settingsButton.getAttribute("aria-expanded")).toBe("true");
    expect(settingsButton.className).toContain("border-primary");

    const securityLink = screen.getByRole("link", { name: /Security/ });
    expect(securityLink.getAttribute("aria-current")).toBe("page");
    expect(securityLink.className).toContain("border-primary");

    const profileLink = screen.getByRole("link", { name: "Profile" });
    expect(profileLink.getAttribute("aria-current")).toBeNull();
  });

  it("highlights active flat route based on exact match and nested route prefix", () => {
    const { rerender } = render(
      <NavTree items={sampleItems} currentPath="/dashboard" />,
    );

    const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboardLink.getAttribute("aria-current")).toBe("page");
    expect(dashboardLink.className).toContain("border-primary");

    // Nested route under flat item
    rerender(
      <NavTree items={sampleItems} currentPath="/dashboard/analytics" />,
    );
    expect(dashboardLink.getAttribute("aria-current")).toBe("page");

    // Unrelated route
    rerender(<NavTree items={sampleItems} currentPath="/other" />);
    expect(dashboardLink.getAttribute("aria-current")).toBeNull();
  });

  it("renders custom asLink component if provided", () => {
    const handleNavigate = vi.fn();
    const CustomLink: ComponentType<{
      href: string;
      className?: string;
      children: ReactNode;
      onClick?: () => void;
      "aria-current"?: "page" | undefined;
    }> = ({
      href,
      className,
      children,
      onClick,
      "aria-current": ariaCurrent,
    }) => (
      <a
        data-testid="custom-router-link"
        href={href}
        className={className}
        onClick={(e) => {
          e.preventDefault();
          onClick?.();
        }}
        aria-current={ariaCurrent}
      >
        {children}
      </a>
    );

    render(
      <NavTree
        items={sampleItems}
        asLink={CustomLink}
        currentPath="/dashboard"
        onNavigate={handleNavigate}
      />,
    );

    const customLinks = screen.getAllByTestId("custom-router-link");
    expect(customLinks.length).toBeGreaterThan(0);
    const firstLink = customLinks[0];
    if (!firstLink) {
      throw new Error("Expected NavTree to render a custom router link");
    }

    expect(firstLink.getAttribute("href")).toBe("/dashboard");
    expect(firstLink.getAttribute("aria-current")).toBe("page");

    fireEvent.click(firstLink);
    expect(handleNavigate).toHaveBeenCalledTimes(1);
  });

  it("renders badges on items and subsections", () => {
    render(<NavTree items={sampleItems} currentPath="/settings/security" />);

    expect(screen.getByText("12")).toBeTruthy();
    expect(screen.getByText("Alert")).toBeTruthy();
  });

  it("renders action item triggering onClick and onNavigate", () => {
    const handleActionClick = vi.fn();
    const handleNavigate = vi.fn();

    const actionItems: NavItemConfig[] = [
      {
        href: "/logout",
        label: "Sign out",
        isAction: true,
        onClick: handleActionClick,
      },
    ];

    render(<NavTree items={actionItems} onNavigate={handleNavigate} />);

    const button = screen.getByRole("button", { name: "Sign out" });
    expect(button).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Sign out" })).toBeNull();

    fireEvent.click(button);
    expect(handleActionClick).toHaveBeenCalledTimes(1);
    expect(handleNavigate).toHaveBeenCalledTimes(1);
  });

  it("renders icons on items and applies active class to icon when active", () => {
    const MockIcon = ({ className }: { className?: string }) => (
      <svg data-testid="mock-icon" className={className} />
    );

    const itemsWithIcon: NavItemConfig[] = [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: MockIcon,
      },
    ];

    const { rerender } = render(
      <NavTree items={itemsWithIcon} currentPath="/other" />,
    );

    const initialIcon = screen.getByTestId("mock-icon");
    expect(initialIcon).toBeTruthy();
    expect(initialIcon.getAttribute("class")).not.toContain("text-primary");

    rerender(<NavTree items={itemsWithIcon} currentPath="/dashboard" />);
    const activeIcon = screen.getByTestId("mock-icon");
    expect(activeIcon.getAttribute("class")).toContain("text-primary");
  });

  it("handles root path '/' without falsely matching subroutes", () => {
    const rootItems: NavItemConfig[] = [
      {
        href: "/",
        label: "Home",
      },
      {
        href: "/about",
        label: "About",
      },
    ];

    const { rerender } = render(
      <NavTree items={rootItems} currentPath="/about" />,
    );

    const homeLink = screen.getByRole("link", { name: "Home" });
    const aboutLink = screen.getByRole("link", { name: "About" });

    expect(homeLink.getAttribute("aria-current")).toBeNull();
    expect(aboutLink.getAttribute("aria-current")).toBe("page");

    rerender(<NavTree items={rootItems} currentPath="/" />);
    expect(homeLink.getAttribute("aria-current")).toBe("page");
    expect(aboutLink.getAttribute("aria-current")).toBeNull();
  });
});
