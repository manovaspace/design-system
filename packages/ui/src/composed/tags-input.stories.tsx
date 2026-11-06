import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { DirectionProvider } from "../direction-provider.js";
import { TagsInput } from "./tags-input.js";

const meta = {
  title: "Composed/TagsInput",
  component: TagsInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div className="w-[360px] p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TagsInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Type and press Enter...",
    locale: "en",
  },
};

export const PersianRtl: Story = {
  render: () => (
    <DirectionProvider direction="rtl">
      <div dir="rtl">
        <TagsInput
          placeholder="برچسب بنویسید و اینتر بزنید..."
          defaultValue={["فناوری", "طراحی"]}
          locale="fa"
        />
      </div>
    </DirectionProvider>
  ),
};

export const WithMaxCounterPersian: Story = {
  render: () => (
    <DirectionProvider direction="rtl">
      <div dir="rtl">
        <TagsInput
          max={5}
          defaultValue={["فرانت‌اند", "ری‌اکت"]}
          placeholder="حداکثر ۵ برچسب..."
          locale="fa"
        />
      </div>
    </DirectionProvider>
  ),
};

export const WithMaxCounterEnglish: Story = {
  args: {
    max: 4,
    defaultValue: ["react", "typescript"],
    placeholder: "Max 4 tags...",
    locale: "en",
  },
};

export const CustomSeparators: Story = {
  args: {
    separators: [";", "|"],
    placeholder: "Separated by ; or |",
    locale: "en",
  },
};

export const HashtagsValidator: Story = {
  args: {
    validate: (tag: string) => {
      const trimmed = tag.trim();
      if (!trimmed) return null;
      return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
    },
    placeholder: "Type tags (auto #hashtag)...",
    locale: "en",
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: ["readonly", "tags"],
    disabled: true,
    locale: "en",
  },
};

export function ControlledInteractive() {
  const [tags, setTags] = React.useState<string[]>(["توسعه وب", "سیستم طراحی"]);

  return (
    <DirectionProvider direction="rtl">
      <div dir="rtl" className="flex flex-col gap-3">
        <TagsInput
          max={6}
          value={tags}
          onChange={setTags}
          placeholder="افزودن برچسب جدید..."
          locale="fa"
        />
        <div className="text-xs text-muted-foreground">
          تعداد برچسب‌ها: {tags.length} — {tags.join("، ") || "بدون برچسب"}
        </div>
      </div>
    </DirectionProvider>
  );
}
