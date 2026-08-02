import { defineUnbundledConfig } from "@manovaspace/build";

export default defineUnbundledConfig({
  entry: [
    "src/index.ts",
    "src/**/*.tsx",
    "src/**/*.ts",
    "!src/**/*.test.ts",
    "!src/**/*.test.tsx",
  ],
  external: [
    "radix-ui",
    "lucide-react",
    "react-icons",
    "react-icons/fa6",
    "react-icons/si",
    "framer-motion",
    "next-themes",
    "react-hook-form",
    "@manovaspace/tokens",
  ],
});
