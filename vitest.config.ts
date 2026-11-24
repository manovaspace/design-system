import { defineConfig } from "vitest/config";

// Root config: delegate to each workspace package's own vitest config so
// `npx vitest --run` from the repo root runs the whole suite (each project
// keeps its own environment/plugins). `pool: 'forks'` + `singleFork` +
// `isolate: false` lets all files share one worker process and one jsdom
// environment, which is a large speedup for this jsdom-heavy suite.
export default defineConfig({
  test: {
    projects: ["packages/*"],
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
    isolate: false,
  },
});