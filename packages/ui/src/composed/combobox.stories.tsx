import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Combobox } from "./combobox.js";
import { ComboboxAsync } from "./combobox-async.js";

const meta = {
  title: "Composed/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

const iranCities = [
  { value: "tehran", label: "تهران", group: "استان تهران" },
  { value: "damavand", label: "دماوند", group: "استان تهران" },
  { value: "shiraz", label: "شیراز", group: "استان فارس" },
  { value: "marvdasht", label: "مرودشت", group: "استان فارس" },
  { value: "isfahan", label: "اصفهان", group: "استان اصفهان" },
  { value: "kashan", label: "کاشان", group: "استان اصفهان" },
  { value: "tabriz", label: "تبریز", group: "استان آذربایجان شرقی" },
  { value: "mashhad", label: "مشهد", group: "استان خراسان رضوی" },
];

export const Default: Story = {
  render: () => {
    const [val, setVal] = useState("tehran");
    return (
      <div className="w-80">
        <Combobox
          options={iranCities}
          value={val}
          onChange={setVal}
          placeholder="انتخاب شهر…"
        />
        <div className="mt-4 text-xs text-muted-foreground">
          مقدار انتخاب شده: {val}
        </div>
      </div>
    );
  },
};

export const English: Story = {
  render: () => {
    const [val, setVal] = useState("fr");
    const countries = [
      { value: "ir", label: "Iran" },
      { value: "fr", label: "France" },
      { value: "de", label: "Germany" },
      { value: "jp", label: "Japan" },
    ];
    return (
      <div className="w-80" dir="ltr">
        <Combobox
          options={countries}
          value={val}
          onChange={setVal}
          locale="en-US"
        />
        <div className="mt-4 text-xs text-muted-foreground">
          Selected value: {val}
        </div>
      </div>
    );
  },
};

export const StrictMode: Story = {
  render: () => {
    const [val, setVal] = useState("");
    return (
      <div className="w-80">
        <Combobox
          options={["سیب", "موز", "پرتقال", "هلو", "توت فرنگی"]}
          value={val}
          onChange={setVal}
          strict
          placeholder="فقط گزینه‌های مجاز…"
        />
        <div className="mt-4 text-xs text-muted-foreground">
          در صورت خروج از فیلد بدون انتخاب معتبر، مقدار به حالت قبل بازمی‌گردد.
        </div>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <div>
        <span className="text-xs text-muted-foreground mb-1 block">
          کوچک (sm)
        </span>
        <Combobox size="sm" options={iranCities} placeholder="اندازه کوچک…" />
      </div>
      <div>
        <span className="text-xs text-muted-foreground mb-1 block">
          متوسط (md - پیش‌فرض)
        </span>
        <Combobox size="md" options={iranCities} placeholder="اندازه متوسط…" />
      </div>
      <div>
        <span className="text-xs text-muted-foreground mb-1 block">
          بزرگ (lg)
        </span>
        <Combobox size="lg" options={iranCities} placeholder="اندازه بزرگ…" />
      </div>
    </div>
  ),
};

export const AsyncSearch: Story = {
  render: () => {
    const loadRemote = async (query: string, signal: AbortSignal) => {
      // simulate network latency
      await new Promise((res, rej) => {
        const timeout = setTimeout(res, 500);
        signal.addEventListener("abort", () => {
          clearTimeout(timeout);
          rej(new DOMException("Aborted", "AbortError"));
        });
      });

      return [
        { value: `res-${query}-1`, label: `نتیجه ۱ برای «${query}»` },
        { value: `res-${query}-2`, label: `نتیجه ۲ برای «${query}»` },
        { value: `res-${query}-3`, label: `نتیجه ۳ برای «${query}»` },
      ];
    };

    return (
      <div className="w-80">
        <ComboboxAsync
          loadOptions={loadRemote}
          placeholder="جست‌وجوی سروری…"
          minChars={2}
          debounce={300}
        />
      </div>
    );
  },
};

export const AsyncErrorState: Story = {
  render: () => {
    const loadError = async () => {
      await new Promise((res) => setTimeout(res, 400));
      throw new Error("500 Internal Server Error");
    };

    return (
      <div className="w-80">
        <ComboboxAsync
          loadOptions={loadError}
          placeholder="جست‌وجو با خطای سرور…"
          errorText="خطا در برقراری ارتباط با سرویس‌دهنده"
        />
      </div>
    );
  },
};
