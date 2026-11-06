import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { Input } from "../input.js";
import { Field } from "./field.js";
import { SearchInput } from "./search-input.js";

const meta = {
  title: "Composed/Field",
  component: Field,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Email address",
    htmlFor: "email-default",
    hint: "We will never share your email.",
    children: (
      <Input id="email-default" type="email" placeholder="you@example.com" />
    ),
  },
};

export const Required: Story = {
  args: {
    label: "Full Name",
    htmlFor: "name-required",
    required: true,
    hint: "As it appears on your passport or ID.",
    children: <Input id="name-required" placeholder="Alex Morgan" />,
  },
};

export const WithError: Story = {
  args: {
    label: "Password",
    htmlFor: "password-error",
    required: true,
    error: "Password must be at least 8 characters long.",
    hint: "This hint is hidden when an error is present.",
    children: <Input id="password-error" type="password" aria-invalid="true" />,
  },
};

export const WithSearchInput: Story = {
  args: {
    label: "Filter team members",
    htmlFor: "team-search",
    hint: "Search by name, role, or team handle.",
    children: <SearchInput id="team-search" placeholder="Type to filter..." />,
  },
};

export function Interactive() {
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState<string | undefined>(undefined);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setValue(next);
    if (next.length > 0 && next.length < 3) {
      setError("Username must be at least 3 characters.");
    } else {
      setError(undefined);
    }
  };

  return (
    <div className="w-80">
      <Field
        label="Username"
        htmlFor="interactive-user"
        required
        hint="Pick a unique handle (3+ characters)."
        error={error}
      >
        <Input
          id="interactive-user"
          value={value}
          onChange={handleChange}
          placeholder="e.g. jsmith"
        />
      </Field>
    </div>
  );
}
