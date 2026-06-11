"use client";

import { Button, ScrollArea } from "@manovaspace/ui";
import { useMemo, useState } from "react";

import { useDevtools } from "../../context.js";
import { downloadJson } from "../../save/adapters.js";
import { buildTokenOverrideThemePayload } from "../../save/build-override-payload.js";
import {
  copyDesignSystemJson,
  saveDesignSystem,
} from "../../save/save-design-system.js";
import { DevToolbar } from "./dev-toolbar.js";
import { TokenSearch } from "./fields/token-search.js";
import { PaletteBar } from "./palette-bar.js";
import { AdvancedSection } from "./sections/advanced-section.js";
import { TypographySection } from "./sections/typography-section.js";

export function DesignSystemEditor() {
  const {
    draftTokens,
    baseTokens,
    setDraftTokens,
    resetDraftTokens,
    commitDraftTokens,
    config,
    hasUnsavedChanges,
  } = useDevtools();

  const [filter, setFilter] = useState("");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const savePayload = useMemo(
    () =>
      buildTokenOverrideThemePayload(draftTokens, baseTokens, config.appName),
    [draftTokens, baseTokens, config.appName],
  );

  const handleSave = async () => {
    if (!savePayload) return;

    setSaveMessage(null);
    const results = await saveDesignSystem(savePayload.tokens, {
      ...config.save,
      appName: config.appName,
    });

    const failed = results.find((result) => !result.ok);
    if (failed) {
      setSaveMessage(failed.message);
      return;
    }

    commitDraftTokens();
    await config.onTokensReload?.();
    setSaveMessage(
      results[0]?.message ?? "Saved — reload the page if colors look stale.",
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="orbit-dev-panel-toolbar orbit-dev-panel-toolbar--sticky">
        <PaletteBar tokens={draftTokens} onChange={setDraftTokens} />
        <DevToolbar />
        <TokenSearch value={filter} onChange={setFilter} />
      </div>

      <ScrollArea
        className="min-h-0 flex-1"
        viewportClassName="orbit-dev-panel-scroll scroll-fade-y scroll-fade-4"
      >
        <div className="orbit-dev-panel-sections">
          <TypographySection
            tokens={draftTokens}
            filter={filter}
            onChange={setDraftTokens}
          />
          <AdvancedSection
            tokens={draftTokens}
            filter={filter}
            onChange={setDraftTokens}
          />
        </div>
      </ScrollArea>

      <footer className="orbit-dev-panel-footer">
        {saveMessage ? (
          <p
            className={`orbit-dev-caption leading-relaxed ${saveMessage.toLowerCase().includes("failed") ? "text-destructive" : "text-muted-foreground"}`}
          >
            {saveMessage}
          </p>
        ) : null}
        <div className="orbit-dev-panel-footer-actions flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
          <Button
            size="sm"
            className="max-md:w-full disabled:cursor-not-allowed md:order-last md:ms-auto"
            disabled={!hasUnsavedChanges}
            onClick={() => void handleSave()}
          >
            Save
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="ghost" onClick={resetDraftTokens}>
              Reset
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                void copyDesignSystemJson(
                  savePayload?.tokens ?? {},
                  config.appName,
                )
              }
            >
              Copy JSON
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                if (savePayload) downloadJson(savePayload);
              }}
              disabled={!savePayload}
            >
              Download
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
