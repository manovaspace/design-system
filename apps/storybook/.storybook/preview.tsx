import type { BrandTokensInput, ContrastLevel } from "@manovaspace/tokens";
import {
  DirectionProvider,
  ThemeProvider,
  TokenProvider,
} from "@manovaspace/ui";
import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react-vite";
import { useEffect } from "react";

import "../src/styles.css";

const BRAND_SEEDS: Record<string, string | undefined> = {
  manova: undefined,
  fryto: "#b82132",
  teal: "#0d9488",
};

function StoryEnvironment({
  direction,
  contrast,
  brand,
  children,
}: {
  direction: "ltr" | "rtl";
  contrast: ContrastLevel;
  brand: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const root = document.documentElement;
    if (contrast === "standard") {
      delete root.dataset.contrast;
    } else {
      root.dataset.contrast = contrast;
    }
  }, [contrast]);

  const seedPrimary = BRAND_SEEDS[brand];
  const brandTokens: BrandTokensInput | undefined =
    seedPrimary || contrast !== "standard"
      ? {
          seed: { primary: seedPrimary ?? "#2563eb" },
          contrast,
        }
      : undefined;

  return (
    <div dir={direction}>
      <TokenProvider brandTokens={brandTokens}>
        <DirectionProvider direction={direction}>
          <ThemeProvider>{children}</ThemeProvider>
        </DirectionProvider>
      </TokenProvider>
    </div>
  );
}

const preview: Preview = {
  parameters: {
    a11y: {
      test: "error",
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
    },
    layout: "padded",
    options: {
      storySort: {
        order: [
          "Introduction",
          "Foundations",
          [
            "Color roles",
            "Typography",
            "Spacing",
            "Shape",
            "Elevation",
            "Motion",
            "Icons",
            "Density",
            "Brand playground",
            "Charts & email hex",
          ],
          "Guidelines",
          [
            "Forms",
            "Content & microcopy",
            "Accessibility",
            "RTL & locale",
            "Data display",
            "Corner cases",
          ],
          "Components",
          [
            "Actions",
            "Inputs",
            "Selection",
            "Navigation",
            "Containment",
            "Feedback",
            "Data display",
          ],
          "Patterns",
          ["Entity browser", "Field groups", "Wizards"],
          "Templates",
          ["ListPage", "DetailPage", "FormSheet", "SummaryPage"],
          "Falak",
        ],
      },
    },
    viewport: {
      options: {
        reflow320: {
          name: "Reflow 320 (200% zoom)",
          styles: { width: "320px", height: "640px" },
        },
        phone: {
          name: "Phone 390",
          styles: { width: "390px", height: "844px" },
        },
        tablet: {
          name: "Tablet 768",
          styles: { width: "768px", height: "1024px" },
        },
        laptop: {
          name: "Laptop 1024",
          styles: { width: "1024px", height: "768px" },
        },
        desktop: {
          name: "Desktop 1440",
          styles: { width: "1440px", height: "900px" },
        },
        // Legacy alias: ProgressiveDialog.stories.tsx uses defaultViewport "mobile".
        mobile: { name: "Mobile", styles: { width: "375px", height: "667px" } },
      },
    },
  },
  globalTypes: {
    direction: {
      name: "Direction",
      description: "RTL / LTR",
      defaultValue: "ltr",
      toolbar: {
        icon: "globe",
        items: [
          { value: "ltr", title: "LTR" },
          { value: "rtl", title: "RTL" },
        ],
        dynamicTitle: true,
      },
    },
    contrast: {
      name: "Contrast",
      description: "WCAG / M3 contrast level",
      defaultValue: "standard",
      toolbar: {
        icon: "contrast",
        items: [
          { value: "standard", title: "Standard contrast" },
          { value: "medium", title: "Medium contrast" },
          { value: "high", title: "High contrast" },
        ],
        dynamicTitle: true,
      },
    },
    brand: {
      name: "Brand",
      description: "Seed brand preview",
      defaultValue: "manova",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "manova", title: "Manova (#2563eb)" },
          { value: "fryto", title: "Fryto (#b82132)" },
          { value: "teal", title: "Teal (#0d9488)" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const direction = (context.globals.direction ?? "ltr") as "ltr" | "rtl";
      const contrast = (context.globals.contrast ??
        "standard") as ContrastLevel;
      const brand = String(context.globals.brand ?? "manova");

      return (
        <StoryEnvironment
          direction={direction}
          contrast={contrast}
          brand={brand}
        >
          <Story />
        </StoryEnvironment>
      );
    },
    withThemeByClassName({
      themes: {
        light: "",
        dark: "dark",
      },
      defaultTheme: "light",
      parentSelector: "html",
    }),
  ],
};

export default preview;
