import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select.js";

describe("SelectTrigger", () => {
  it("size touch sets data-size touch and the 44 px height class", () => {
    render(
      <Select>
        <SelectTrigger size="touch" aria-label="Unit">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = screen.getByRole("combobox", { name: "Unit" });
    expect(trigger.getAttribute("data-size")).toBe("touch");
    expect(trigger.className).toContain("data-[size=touch]:h-11");
  });

  it("keeps data-size default when size is unset", () => {
    render(
      <Select>
        <SelectTrigger aria-label="Plan">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = screen.getByRole("combobox", { name: "Plan" });
    expect(trigger.getAttribute("data-size")).toBe("default");
  });
});
