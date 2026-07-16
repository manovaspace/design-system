import { DirectionProvider, ThemeProvider, TokenProvider } from "@manovaspace/ui";
import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react-vite";

import "../src/styles.css";

const preview: Preview = {
  parameters: {
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
    viewport: {
      options: {
        mobile: { name: "Mobile", styles: { width: "375px", height: "667px" } },
        tablet: {
          name: "Tablet",
          styles: { width: "768px", height: "1024px" },
        },
        laptop: {
          name: "Laptop",
          styles: { width: "1024px", height: "768px" },
        },
        desktop: {
          name: "Desktop",
          styles: { width: "1280px", height: "800px" },
        },
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
  },
  decorators: [
    (Story, context) => {
      const direction = (context.globals.direction ?? "ltr") as "ltr" | "rtl";

      return (
        <div dir={direction}>
          <TokenProvider>
            <DirectionProvider direction={direction}>
              <ThemeProvider>
                <Story />
              </ThemeProvider>
            </DirectionProvider>
          </TokenProvider>
        </div>
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
