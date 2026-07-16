import path from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import { mergeConfig } from "vite";

const storybookDir = path.dirname(fileURLToPath(import.meta.url));
const packagesDir = path.resolve(storybookDir, "../../../packages");

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],

  addons: [
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-themes"),
    getAbsolutePath("@storybook/addon-mcp"),
  ],

  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },

  async viteFinal(config) {
    return mergeConfig(config, {
      base: process.env.STORYBOOK_BASE ?? "/",
      plugins: [tailwindcss()],
      resolve: {
        alias: [
          {
            find: "@manovaspace/ui",
            replacement: path.join(packagesDir, "ui/src"),
          },
          {
            find: "@manovaspace/ui/loading",
            replacement: path.join(packagesDir, "ui/src/loading"),
          },
        ],
        dedupe: ["react", "react-dom"],
      },
    });
  },
};

export default config;

function getAbsolutePath(value: string): string {
  return path.dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
