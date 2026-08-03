import { defineLibraryConfig } from "@manovaspace/build";

// CSS / font assets are copied by package scripts (build:css), not tsup.
export default defineLibraryConfig({
  entry: ["src/index.ts"],
});
