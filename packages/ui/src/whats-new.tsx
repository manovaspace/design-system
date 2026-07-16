"use client";

import { useEffect, useState } from "react";

import { Button } from "./button.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog.js";

export interface WhatsNewItem {
  title: string;
  body: string;
  docUrl?: string;
  audience?: "user" | "developer";
}

export interface WhatsNewManifest {
  version: string;
  publishedAt: string;
  items: WhatsNewItem[];
}

export interface WhatsNewProps {
  /** URL to fetch releases.json (e.g. "/releases.json"). */
  manifestUrl: string;
  /** localStorage key prefix; full key is `${storageKeyPrefix}-${version}`. */
  storageKeyPrefix?: string;
  title?: string;
  dismissLabel?: string;
}

function storageKey(prefix: string, version: string): string {
  return `${prefix}-${version}`;
}

export function WhatsNew({
  manifestUrl,
  storageKeyPrefix = "whats-new-seen",
  title = "What's new",
  dismissLabel = "Got it",
}: WhatsNewProps) {
  const [manifest, setManifest] = useState<WhatsNewManifest | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(manifestUrl);
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as WhatsNewManifest;
        if (cancelled || !data.version || !Array.isArray(data.items)) {
          return;
        }
        if (data.items.length === 0) {
          return;
        }
        const seen = localStorage.getItem(
          storageKey(storageKeyPrefix, data.version),
        );
        if (seen) {
          return;
        }
        setManifest(data);
        setOpen(true);
      } catch {
        // ponytail: silent fail — optional UX; missing manifest must not break the app
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [manifestUrl, storageKeyPrefix]);

  function dismiss() {
    if (manifest) {
      localStorage.setItem(
        storageKey(storageKeyPrefix, manifest.version),
        "1",
      );
    }
    setOpen(false);
  }

  if (!manifest) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          dismiss();
        } else {
          setOpen(true);
        }
      }}
    >
      <DialogContent aria-describedby="whats-new-description">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription id="whats-new-description">
            {manifest.publishedAt
              ? `Updated ${manifest.publishedAt}`
              : undefined}
          </DialogDescription>
        </DialogHeader>
        <ul className="max-h-[min(50vh,20rem)] space-y-4 overflow-y-auto px-4 pb-2">
          {manifest.items.map((item) => (
            <li key={item.title} className="space-y-1 text-sm">
              <p className="font-medium text-[var(--foreground)]">
                {item.docUrl ? (
                  <a
                    href={item.docUrl}
                    className="underline-offset-4 hover:underline"
                  >
                    {item.title}
                  </a>
                ) : (
                  item.title
                )}
              </p>
              <p className="text-[var(--muted-foreground)]">{item.body}</p>
            </li>
          ))}
        </ul>
        <DialogFooter>
          <Button type="button" onClick={dismiss}>
            {dismissLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
