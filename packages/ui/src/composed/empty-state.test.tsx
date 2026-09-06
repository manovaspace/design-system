import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "./empty-state.js";

describe("EmptyState", () => {
  it("renders an accessible empty result with an optional action", () => {
    render(
      <EmptyState
        title="No projects"
        description="Create a project to get started."
        action={<button type="button">Create project</button>}
      />,
    );

    expect(screen.getByRole("status").textContent).toContain("No projects");
    expect(screen.getByRole("button", { name: "Create project" })).toBeTruthy();
  });
});
