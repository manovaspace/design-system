import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "slot/index": "src/slot/index.tsx",
    "slot/index.prod": "src/slot/index.prod.tsx",
    "next/theme-route": "src/next/theme-route.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: !process.argv.includes("--watch"),
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "next/server",
    "@manovaspace/tokens",
    "@manovaspace/ui",
  ],
  treeshake: true,
});
