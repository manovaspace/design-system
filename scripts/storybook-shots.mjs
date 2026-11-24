#!/usr/bin/env node
// Screenshot every Storybook story matching --filter at phone/tablet/desktop widths.
// Usage: bun run storybook:shots [--no-build] [--filter <id-prefix>]
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
  const opts = { build: true, filter: "templates-" };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--no-build") opts.build = false;
    else if (argv[i] === "--filter" && argv[i + 1]) opts.filter = argv[++i];
    else throw new Error(`unknown argument: ${argv[i]}`);
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
    (e) => e.type === "story" && e.id.startsWith(opts.filter),
  );
  if (stories.length === 0) {
    console.error(`no stories match ${opts.filter}`);
    process.exitCode = 1;
    return;
  }

  const server = await serveStatic(STATIC_DIR);
  const { port } = server.address();
  let browser;
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
      for (const vp of VIEWPORTS) {
        const page = await browser.newPage({ viewport: vp });
        try {
          const url = `http://127.0.0.1:${port}/iframe.html?id=${story.id}&viewMode=story&globals=direction:rtl`;
          await page.goto(url, { waitUntil: "load" });
          await page.waitForFunction(
            () =>
              (document.querySelector("#storybook-root")?.childElementCount ??
                0) > 0,
            undefined,
            { timeout: 30_000 },
          );
          await page.waitForLoadState("networkidle").catch(() => {});
          await page.waitForTimeout(500);
          const file = join(OUT_DIR, `${story.id}--${vp.width}.png`);
          await page.screenshot({ path: file, fullPage: true });
          const { size } = await stat(file);
          console.log(`${file} ${size} bytes`);
          count++;
        } finally {
          await page.close();
        }
      }
    }
    console.log(
      `${count} screenshot(s) written to ${OUT_DIR} (${stories.length} stor${stories.length === 1 ? "y" : "ies"})`,
    );
  } finally {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
