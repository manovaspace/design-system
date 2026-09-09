import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { focusFirstError } from "./focus-first-error.js";
import { useAppForm } from "./use-app-form.js";

describe("useAppForm", () => {
  const schema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    age: z.number().min(18, "Must be at least 18"),
  });

  type FormData = z.infer<typeof schema>;

  it("applies default validation modes (onSubmit, onChange revalidation, firstError criteria)", async () => {
    const { result } = renderHook(() =>
      useAppForm<FormData>({
        schema,
        defaultValues: {
          username: "a",
          email: "valid@example.com",
          age: 20,
        },
      }),
    );

    // Initial state: mode is "onSubmit", so errors are empty prior to submit
    expect(result.current.formState.errors.username).toBeUndefined();
    expect(result.current.formState.isValid).toBe(false);

    // Submit invalid form
    await act(async () => {
      await result.current.handleSubmit(
        () => {},
        () => {},
      )();
    });

    // Error is set on submit
    expect(result.current.formState.errors.username?.message).toBe(
      "Username must be at least 3 characters",
    );

    // Now reValidateMode: "onChange" kicks in — updating value clears error immediately
    await act(async () => {
      result.current.setValue("username", "alex", { shouldValidate: true });
    });

    expect(result.current.formState.errors.username).toBeUndefined();
  });

  it("validates fields with Zod schema and sets errors appropriately", async () => {
    const onValid = vi.fn();
    const onInvalid = vi.fn();

    const { result } = renderHook(() => {
      const form = useAppForm<FormData>({
        schema,
        defaultValues: {
          username: "jo",
          email: "invalid-email",
          age: 15,
        },
      });
      // Subscribe to formState.errors Proxy
      const _ = form.formState.errors;
      return form;
    });

    await act(async () => {
      await result.current.handleSubmit(onValid, onInvalid)();
    });

    expect(onValid).not.toHaveBeenCalled();
    expect(onInvalid).toHaveBeenCalled();

    const errors = result.current.formState.errors;
    expect(errors.username?.message).toBe(
      "Username must be at least 3 characters",
    );
    expect(errors.email?.message).toBe("Invalid email address");
    expect(errors.age?.message).toBe("Must be at least 18");
  });

  it("submits valid data when Zod validation passes", async () => {
    const onValid = vi.fn();
    const onInvalid = vi.fn();

    const { result } = renderHook(() => {
      const form = useAppForm<FormData>({
        schema,
        defaultValues: {
          username: "john_doe",
          email: "john@example.com",
          age: 25,
        },
      });
      const _ = form.formState.errors;
      return form;
    });

    await act(async () => {
      await result.current.handleSubmit(onValid, onInvalid)();
    });

    expect(onInvalid).not.toHaveBeenCalled();
    expect(onValid).toHaveBeenCalledWith(
      {
        username: "john_doe",
        email: "john@example.com",
        age: 25,
      },
      undefined,
    );
    expect(Object.keys(result.current.formState.errors)).toHaveLength(0);
  });

  it("allows custom mode overrides", () => {
    const { result } = renderHook(() =>
      useAppForm<FormData>({
        schema,
        mode: "onBlur",
        reValidateMode: "onSubmit",
        criteriaMode: "all",
      }),
    );

    expect(result.current).toBeDefined();
  });
});

describe("focusFirstError", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("focuses element matching the first error key by name", () => {
    const input1 = document.createElement("input");
    input1.name = "username";
    const input2 = document.createElement("input");
    input2.name = "email";

    container.appendChild(input1);
    container.appendChild(input2);

    const focused = focusFirstError(
      {
        email: {
          type: "required",
          message: "Email is required",
        },
      },
      container,
    );

    expect(focused).toBe(input2);
    expect(document.activeElement).toBe(input2);
  });

  it("focuses element matching the first error key by id", () => {
    const input1 = document.createElement("input");
    input1.id = "field-a";
    const input2 = document.createElement("input");
    input2.id = "field-b";

    container.appendChild(input1);
    container.appendChild(input2);

    const focused = focusFirstError(
      {
        "field-b": {
          type: "required",
          message: "Field B is required",
        },
      },
      container,
    );

    expect(focused).toBe(input2);
    expect(document.activeElement).toBe(input2);
  });

  it("focuses element with nested error path matching name or leaf", () => {
    const input = document.createElement("input");
    input.name = "user.profile.bio";

    container.appendChild(input);

    const focused = focusFirstError(
      {
        user: {
          profile: {
            bio: {
              type: "minLength",
              message: "Bio is too short",
            },
          },
        },
      },
      container,
    );

    expect(focused).toBe(input);
    expect(document.activeElement).toBe(input);
  });

  it("focuses element with [aria-invalid='true'] when passing container", () => {
    const input1 = document.createElement("input");
    input1.name = "first";
    const input2 = document.createElement("input");
    input2.name = "second";
    input2.setAttribute("aria-invalid", "true");

    container.appendChild(input1);
    container.appendChild(input2);

    const focused = focusFirstError(container);

    expect(focused).toBe(input2);
    expect(document.activeElement).toBe(input2);
  });

  it("falls back to [aria-invalid='true'] when error key does not match DOM name/id", () => {
    const input = document.createElement("input");
    input.setAttribute("aria-invalid", "true");

    container.appendChild(input);

    const focused = focusFirstError(
      {
        unknownKey: {
          type: "custom",
          message: "Error without matching name",
        },
      },
      container,
    );

    expect(focused).toBe(input);
    expect(document.activeElement).toBe(input);
  });

  it("safely makes non-naturally-focusable element focusable", () => {
    const customControl = document.createElement("div");
    customControl.setAttribute("aria-invalid", "true");

    container.appendChild(customControl);

    const focused = focusFirstError(container);

    expect(focused).toBe(customControl);
    expect(customControl.getAttribute("tabindex")).toBe("-1");
    expect(document.activeElement).toBe(customControl);
  });

  it("returns null when no invalid elements or errors exist", () => {
    const input = document.createElement("input");
    container.appendChild(input);

    expect(focusFirstError({}, container)).toBeNull();
    expect(focusFirstError(null, container)).toBeNull();
    expect(focusFirstError(container)).toBeNull();
  });
});
