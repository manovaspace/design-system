import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import type { OrbitTokenOverride } from "@manovaspace/tokens";

type ThemePayload = {
  version: number;
  tokens: OrbitTokenOverride;
  meta?: { savedAt?: string; app?: string };
};

function devOnly(): boolean {
  return process.env.NODE_ENV === "development";
}

function resolveOverridePath(): string {
  const cwd = process.cwd();
  return join(cwd, "public", "theme.override.json");
}

function readOverride(): ThemePayload | null {
  const path = resolveOverridePath();
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as ThemePayload;
  } catch {
    return null;
  }
}

export async function GET(): Promise<Response> {
  if (!devOnly()) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = readOverride();
  if (!data) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(data);
}

export async function POST(request: Request): Promise<Response> {
  if (!devOnly()) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as ThemePayload;

  const path = resolveOverridePath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(body, null, 2)}\n`, "utf8");

  return Response.json({ ok: true, path: "public/theme.override.json" });
}
