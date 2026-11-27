import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Vite discovers some dependencies only while stories load. Scanning every
// story and MDX entry up front pre-bundles them before the first test, so a
// cold cache (CI) does not hit "optimized dependencies changed. reloading".
// The server/ folder is left out: its font imports need assets that are
// not in the repository checkout.
const scanEntries = [
  "src/**/*.{ts,tsx,mdx}",
  "../../packages/ui/src/*.{ts,tsx,mdx}",
  "../../packages/ui/src/{composed,motion,loading,lib,primitives}/**/*.{ts,tsx,mdx}",
];

// Storybook runs its stories through the Vitest browser addon; see the
// Storybook Vitest addon docs for the project shape.
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        optimizeDeps: { entries: scanEntries },
        plugins: [
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
