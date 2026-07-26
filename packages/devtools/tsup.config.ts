import { defineReactLibraryConfig } from "@manovaspace/build";

export default defineReactLibraryConfig({
  entry: {
    index: "src/index.ts",
    "slot/index": "src/slot/index.tsx",
    "slot/index.prod": "src/slot/index.prod.tsx",
    "next/theme-route": "src/next/theme-route.ts",
  },
  external: ["next/server", "@manovaspace/tokens", "@manovaspace/ui"],
});
