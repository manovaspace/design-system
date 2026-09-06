import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Alert, AlertDescription, AlertTitle } from "./alert.js";

describe("Alert", () => {
  it("exposes destructive feedback as an alert region", () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Save failed</AlertTitle>
        <AlertDescription>Try again.</AlertDescription>
      </Alert>,
    );

    expect(screen.getByRole("alert").textContent).toBe("Save failedTry again.");
  });
});
