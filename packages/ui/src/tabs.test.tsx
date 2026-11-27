import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Tabs, TabsList, TabsTrigger } from "./tabs.js";

describe("TabsTrigger", () => {
  it("uses the contrast-checked muted foreground, not an opacity blend", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    const inactive = screen.getByRole("tab", { name: "B" });
    expect(inactive.className).toContain("text-muted-foreground");
    expect(inactive.className).not.toContain("text-foreground/60");
  });
});
