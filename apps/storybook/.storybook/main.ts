import path from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import { mergeConfig } from "vite";

const storybookDir = path.dirname(fileURLToPath(import.meta.url));
const packagesDir = path.resolve(storybookDir, "../../../packages");

const config: StorybookConfig = {
  stories: [
    "../../../packages/ui/src/**/*.stories.@(ts|tsx)",
    "../src/**/*.stories.@(ts|tsx)",
    "../src/**/*.mdx",
  ],
  typescript: {
    reactDocgen: "react-docgen-typescript",
  },
  features: {
    componentsManifest: true,
  },

  addons: [
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-themes"),
    getAbsolutePath("@storybook/addon-mcp"),
  ],

  // Production builds compose the product Storybooks (for example Falak) into
  // one site. Dev and plain builds leave this unset, so no ref is configured.
  ...(process.env.STORYBOOK_FALAK_URL
    ? {
        refs: {
          falak: { title: "Falak", url: process.env.STORYBOOK_FALAK_URL },
        },
      }
    : {}),

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
            find: "@manovaspace/ui/experimental",
            replacement: path.join(packagesDir, "ui/src/experimental.ts"),
          },
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
  return path.dirname(
    fileURLToPath(import.meta.resolve(`${value}/package.json`)),
  );
}
