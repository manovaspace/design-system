import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "../button.js";
import { DirectionProvider } from "../direction-provider.js";
import { EditFieldSheet } from "./edit-field-sheet.js";

const meta = {
  title: "Composed/EditFieldSheet",
  component: EditFieldSheet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof EditFieldSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

function EditFieldSheetDemo(
  props: Partial<React.ComponentProps<typeof EditFieldSheet>>,
) {
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState(props.value ?? "Jane Doe");

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Edit Field</Button>
      <EditFieldSheet
        open={open}
        onOpenChange={setOpen}
        title="Edit Display Name"
        label="Full Name"
        value={value}
        requiredMessage="Please enter a name"
        saveFailedMessage="Failed to save changes. Please try again."
        onSave={async (next) => {
          await new Promise((resolve) => setTimeout(resolve, 800));
          setValue(next);
        }}
        saveLabel="Save Changes"
        cancelLabel="Cancel"
        closeLabel="Close"
        {...props}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <EditFieldSheetDemo />,
};

export const WithError: Story = {
  render: () => (
    <EditFieldSheetDemo
      validate={(val) =>
        val.length < 3 ? "Name must be at least 3 characters" : null
      }
      helper="Must match the name on official documents"
    />
  ),
};

export const Saving: Story = {
  render: () => (
    <EditFieldSheetDemo
      onSave={async () => {
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }}
    />
  ),
};

export const LongValue: Story = {
  render: () => (
    <EditFieldSheetDemo
      value="Dr. Alexander Montgomery Featherstonehaugh the Third, Senior Vice President of Innovation"
      maxLength={200}
    />
  ),
};

export const PersianRtl: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    const [name, setName] = useState("علیرضا جعفرتاش");

    return (
      <DirectionProvider direction="rtl">
        <div dir="rtl">
          <Button onClick={() => setOpen(true)}>ویرایش نام</Button>
          <EditFieldSheet
            open={open}
            onOpenChange={setOpen}
            title="ویرایش نام"
            label="نام و نام خانوادگی"
            value={name}
            helper="نامی که در فاکتورها و رسیدها نمایش داده می‌شود"
            requiredMessage="نام نمی‌تواند خالی باشد"
            saveFailedMessage="خطا در ذخیره نام. دوباره تلاش کنید."
            onSave={async (next) => {
              await new Promise((resolve) => setTimeout(resolve, 600));
              setName(next);
            }}
            saveLabel="ذخیره"
            cancelLabel="انصراف"
            closeLabel="بستن"
            dir="rtl"
          />
        </div>
      </DirectionProvider>
    );
  },
};
