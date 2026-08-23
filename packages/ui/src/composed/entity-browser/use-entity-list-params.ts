"use client";

import { useCallback, useMemo } from "react";

export interface EntityListParamsState {
  q?: string;
  status?: string;
  page?: number;
  [key: string]: string | number | undefined;
}

export function parseEntityListParams(searchParams: URLSearchParams): EntityListParamsState {
  const result: EntityListParamsState = {};
  for (const [key, value] of searchParams.entries()) {
    if (!value) continue;
    if (key === "page") {
      const p = Number.parseInt(value, 10);
      if (Number.isFinite(p) && p > 0) {
        result.page = p;
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function serializeEntityListParams(params: EntityListParamsState): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "" || (key === "page" && value === 1)) {
      continue;
    }
    sp.set(key, String(value));
  }
  return sp.toString();
}
