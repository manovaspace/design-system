#!/usr/bin/env node
// Screenshot and verify Storybook stories at 390/768/1440 widths.
// Usage: bun run storybook:shots [--no-build] [--filter <prefix|all>] [--directions rtl|ltr,rtl] [--smoke] [--check]
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, extname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STATIC_DIR = join(ROOT, "apps/storybook/storybook-static");
const OUT_DIR = join(ROOT, "storybook-shots");
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];
const SMOKE_IDS = new Set([
  "foundations-color-roles--m-3-roles",
  "foundations-brand-playground--interactive",
  "components-actions-button--variants-and-disabled",
  "components-inputs-field--matrix",
]);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".png": "image/png",
};

function parseArgs(argv) {
  const opts = {
    build: true,
    filter: "templates-",
    directions: ["rtl"],
    smoke: false,
    check: false,
  };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--no-build") opts.build = false;
    else if (argv[i] === "--smoke") opts.smoke = true;
    else if (argv[i] === "--check") opts.check = true;
    else if (argv[i] === "--filter" && argv[i + 1]) opts.filter = argv[++i];
    else if (argv[i] === "--directions" && argv[i + 1]) {
      opts.directions = argv[++i]
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);
    } else throw new Error(`unknown argument: ${argv[i]}`);
  }
  return opts;
}

function serveStatic(dir) {
  const server = createServer(async (req, res) => {
    const pathname = decodeURIComponent(
      new URL(req.url, "http://127.0.0.1").pathname,
    );
    const file = join(
      dir,
      pathname.endsWith("/") ? `${pathname}index.html` : pathname,
    );
    if (!file.startsWith(dir + sep)) {
      res.writeHead(403).end();
      return;
    }
    try {
      const body = await readFile(file);
      res.writeHead(200, {
        "content-type": TYPES[extname(file)] ?? "application/octet-stream",
      });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function matchesFilter(id, opts) {
  if (opts.smoke) {
    return SMOKE_IDS.has(id) || id.startsWith("templates-");
  }
  if (opts.filter === "all") return true;
  const prefixes = opts.filter
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  return prefixes.some((prefix) => id.startsWith(prefix));
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.build) {
    const r = spawnSync("bun", ["run", "build-storybook"], {
      cwd: ROOT,
      stdio: "inherit",
    });
    if (r.error || r.status !== 0) {
      console.error(
        `build-storybook failed (status ${r.status ?? r.error?.message})`,
      );
      process.exitCode = 1;
      return;
    }
  }

  if (!existsSync(join(STATIC_DIR, "index.json"))) {
    console.error(
      `no static Storybook at ${STATIC_DIR}; run without --no-build`,
    );
    process.exitCode = 1;
    return;
  }

  const index = JSON.parse(
    await readFile(join(STATIC_DIR, "index.json"), "utf8"),
  );
  const stories = Object.values(index.entries ?? index.stories ?? {}).filter(
    (e) => e.type === "story" && matchesFilter(e.id, opts),
  );
  if (stories.length === 0) {
    console.error(`no stories match ${opts.smoke ? "smoke" : opts.filter}`);
    process.exitCode = 1;
    return;
  }

  const server = await serveStatic(STATIC_DIR);
  const { port } = server.address();
  let browser;
  const failures = [];
  try {
    try {
      // biome-ignore lint/suspicious/noUndeclaredEnvVars: optional local Chromium override, not a build input
      const executablePath = process.env.CHROMIUM_PATH || undefined;
      browser = await chromium.launch({ executablePath });
    } catch {
      console.error(
        "Chromium launch failed: set CHROMIUM_PATH to a chromium binary or run `bunx playwright-core install chromium`",
      );
      process.exitCode = 1;
      return;
    }

    await mkdir(OUT_DIR, { recursive: true });
    let count = 0;
    for (const story of stories) {
      for (const dir of opts.directions) {
        for (const vp of VIEWPORTS) {
          const page = await browser.newPage({ viewport: vp });
          const pageErrors = [];
          page.on("pageerror", (err) => pageErrors.push(err.message));
          try {
            const url = `http://127.0.0.1:${port}/iframe.html?id=${story.id}&viewMode=story&globals=direction:${dir}`;
            await page.goto(url, { waitUntil: "load" });
            await page.waitForFunction(
              () =>
                (document.querySelector("#storybook-root")?.childElementCount ??
                  0) > 0,
              undefined,
              { timeout: 30_000 },
            );
            await page.waitForLoadState("networkidle").catch(() => {});
            await page.waitForTimeout(400);

            if (opts.check) {
              const overflow = await page.evaluate(() => {
                const doc = document.documentElement;
                return doc.scrollWidth - window.innerWidth;
              });
              if (overflow > 1) {
                failures.push(
                  `${story.id} (${dir} ${vp.width}px): horizontal overflow ${overflow}px`,
                );
              }
              if (pageErrors.length > 0) {
                failures.push(
                  `${story.id} (${dir} ${vp.width}px): ${pageErrors.join("; ")}`,
                );
              }
            }

            const suffix =
              opts.directions.length > 1
                ? `--${dir}--${vp.width}`
                : `--${vp.width}`;
            const file = join(OUT_DIR, `${story.id}${suffix}.png`);
            await page.screenshot({ path: file, fullPage: true });
            const { size } = await stat(file);
            console.log(`${file} ${size} bytes`);
            count++;
          } finally {
            await page.close();
          }
        }
      }
    }
    console.log(
      `${count} screenshot(s) written to ${OUT_DIR} (${stories.length} stor${stories.length === 1 ? "y" : "ies"})`,
    );
    if (failures.length > 0) {
      for (const f of failures) console.error(`storybook-shots: ${f}`);
      process.exitCode = 1;
    }
  } finally {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
