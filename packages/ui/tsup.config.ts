import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/**/*.tsx",
    "src/**/*.ts",
    "!src/**/*.test.ts",
    "!src/**/*.test.tsx",
  ],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: !process.argv.includes("--watch"),
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "radix-ui",
    "lucide-react",
    "react-icons",
    "react-icons/fa6",
    "react-icons/si",
    "framer-motion",
    "next-themes",
    "@manovaspace/tokens",
  ],
  bundle: false,
  treeshake: false,
});
