import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { DirectionProvider } from "../direction-provider.js";
import { MagnifyingGlassIcon, UserIcon } from "../icons.js";
import { Input } from "../input.js";
import { LocalePreferenceProvider } from "../locale-preference.js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select.js";
import { Textarea } from "../textarea.js";
import { AmountInput } from "./amount-input.js";
import { Combobox } from "./combobox.js";
import { DatePicker } from "./date-picker.js";
import { Field } from "./field.js";
import { PickerTrigger } from "./picker-trigger.js";
import { SearchInput } from "./search-input.js";
import { WheelDatePicker } from "./wheel-date-picker.js";

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
    children: <Input id="password-error" type="password" />,
  },
};

export const WithHint: Story = {
  args: {
    label: "Phone number",
    htmlFor: "phone-hint",
    hint: "Digits only, without spaces or the country code.",
    children: <Input id="phone-hint" type="tel" placeholder="09123456789" />,
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

type MatrixState = "default" | "invalid" | "disabled" | "readonly";
type MatrixSize = "default" | "touch";

const MATRIX_OPTIONS = [
  { value: "tehran", label: "Tehran" },
  { value: "shiraz", label: "Shiraz" },
  { value: "isfahan", label: "Isfahan" },
];

function FieldMatrixSection({ dir }: { dir: "ltr" | "rtl" }) {
  const isRtl = dir === "rtl";
  const states: MatrixState[] = ["default", "invalid", "disabled", "readonly"];
  const sizes: MatrixSize[] = ["default", "touch"];

  return (
    <DirectionProvider direction={dir}>
      <section
        dir={dir}
        className="space-y-6 rounded-xl border border-border bg-background p-6 text-foreground"
      >
        <header className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-base font-semibold">
            {isRtl ? "ماتریس کنترل‌های فرم (RTL)" : "Field control matrix (LTR)"}
          </h2>
          <span className="text-xs text-muted-foreground uppercase">{dir}</span>
        </header>

        {sizes.map((size) => (
          <div key={size} className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Size: {size}
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {states.map((state) => {
                const isDisabled = state === "disabled";
                const isReadOnly = state === "readonly";
                const error =
                  state === "invalid"
                    ? isRtl
                      ? "این فیلد نامعتبر است"
                      : "This field is invalid"
                    : undefined;
                const hint =
                  state === "default"
                    ? isRtl
                      ? "متن راهنما"
                      : "Helper hint"
                    : undefined;

                return (
                  <div
                    key={state}
                    className="space-y-3 rounded-lg border border-border/60 bg-card p-3"
                  >
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {state}
                    </div>

                    <Field label="Input" hint={hint} error={error}>
                      <Input
                        size={size}
                        disabled={isDisabled}
                        readOnly={isReadOnly}
                        defaultValue={isReadOnly ? "Readonly value" : undefined}
                        placeholder="Input..."
                      />
                    </Field>

                    <Field label="Input + addons" hint={hint} error={error}>
                      <Input
                        size={size}
                        disabled={isDisabled}
                        readOnly={isReadOnly}
                        defaultValue={isReadOnly ? "Readonly" : undefined}
                        placeholder="Search..."
                        startAddon={<MagnifyingGlassIcon className="size-4" />}
                        endAddon={<span className="text-xs">IRR</span>}
                      />
                    </Field>

                    <Field
                      label="Textarea"
                      hint={hint}
                      error={error}
                      counter="24 / 140"
                    >
                      <Textarea
                        size={size}
                        disabled={isDisabled}
                        readOnly={isReadOnly}
                        defaultValue={isReadOnly ? "Readonly notes" : undefined}
                        placeholder="Notes..."
                      />
                    </Field>

                    {!isReadOnly && (
                      <>
                        <Field label="Select" hint={hint} error={error}>
                          <Select disabled={isDisabled}>
                            <SelectTrigger size={size} className="w-full">
                              <SelectValue placeholder="Choose..." />
                            </SelectTrigger>
                            <SelectContent>
                              {MATRIX_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>

                        <Field
                          label="Combobox (input)"
                          hint={hint}
                          error={error}
                        >
                          <Combobox
                            size={size}
                            disabled={isDisabled}
                            options={MATRIX_OPTIONS}
                            locale={isRtl ? "fa-IR" : "en-US"}
                          />
                        </Field>

                        <Field
                          label="Combobox (button)"
                          hint={hint}
                          error={error}
                        >
                          <Combobox
                            trigger="button"
                            size={size}
                            disabled={isDisabled}
                            options={MATRIX_OPTIONS}
                            locale={isRtl ? "fa-IR" : "en-US"}
                          />
                        </Field>

                        <Field label="DatePicker" hint={hint} error={error}>
                          <DatePicker
                            size={size}
                            disabled={isDisabled}
                            locale={isRtl ? "fa" : "en"}
                            value="2026-11-15"
                            onValueChange={() => undefined}
                          />
                        </Field>

                        <Field
                          label="WheelDatePicker"
                          hint={hint}
                          error={error}
                        >
                          <WheelDatePicker
                            size={size}
                            disabled={isDisabled}
                            value="2026-09-20"
                            onValueChange={() => undefined}
                          />
                        </Field>

                        <Field label="PickerTrigger" hint={hint} error={error}>
                          <PickerTrigger
                            size={size}
                            disabled={isDisabled}
                            icon={<UserIcon className="size-3.5" />}
                            label={
                              state === "default" ? "Selected item" : undefined
                            }
                            placeholder="Select item..."
                            changeLabel="Change"
                          />
                        </Field>
                      </>
                    )}

                    <Field label="AmountInput" hint={hint} error={error}>
                      <AmountInput
                        size={size}
                        disabled={isDisabled}
                        readOnly={isReadOnly}
                        value={1250000}
                        words={false}
                        locale={isRtl ? "fa-IR" : "en-US"}
                      />
                    </Field>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </DirectionProvider>
  );
}

export const Matrix: Story = {
  name: "Field matrix",
  parameters: {
    layout: "padded",
  },
  args: {
    children: null,
  },
  render: () => (
    <LocalePreferenceProvider
      storageKey="story-field-matrix"
      locales={["en", "fa"]}
      defaultLocale="en"
    >
      <div className="space-y-8">
        <FieldMatrixSection dir="ltr" />
        <FieldMatrixSection dir="rtl" />
      </div>
    </LocalePreferenceProvider>
  ),
};
