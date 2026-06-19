import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Avatar, AvatarFallback } from "./avatar.js";

describe("Avatar", () => {
  it("renders fallback when no image is provided", () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText("AB")).toBeTruthy();
  });
});
