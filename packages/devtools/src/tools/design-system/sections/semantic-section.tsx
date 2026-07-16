import { type OrbitTokensRaw, resolveTokens } from "@manovaspace/tokens";
import {
  Badge,
  ColorSwatch,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@manovaspace/ui";

import { ColorField } from "../fields/color-field.js";
import { TextField } from "../fields/text-field.js";
import { matchesFilter } from "../fields/token-search.js";
import { TokenSection } from "../fields/token-section.js";
import {
  isColorLiteral,
  isTokenReference,
  setTokenPath,
} from "../token-mutations.js";

type SemanticSectionProps = {
  tokens: OrbitTokensRaw;
  filter: string;
  onChange: (tokens: OrbitTokensRaw) => void;
};

const PREVIEW_KEYS = [
  "background",
  "foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "muted",
  "border",
  "ring",
] as const;

export function SemanticSection({
  tokens,
  filter,
  onChange,
}: SemanticSectionProps) {
  if (!matchesFilter("semantic theme", filter) && filter.trim()) {
    return null;
  }

  const resolved = resolveTokens(tokens);
  const lightLiterals = Object.entries(tokens.semantic.light).filter(
    ([key, value]) => matchesFilter(key, filter) && !isTokenReference(value),
  );

  return (
    <TokenSection
      title="Semantic"
      description="Light theme tokens. Dark mode is derived via HSL L inversion."
    >
      <Tabs defaultValue="light" className="flex flex-col gap-4">
        <TabsList className="h-9 w-full">
          <TabsTrigger value="light" className="flex-1 text-xs">
            Light (edit)
          </TabsTrigger>
          <TabsTrigger value="dark" className="flex-1 text-xs">
            Dark (preview)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="light" className="flex flex-col gap-4">
          <div className="orbit-semantic-preview">
            <Label className="mb-3 block text-xs font-medium text-foreground/90">
              Resolved preview
            </Label>
            <div className="grid grid-cols-2 gap-2.5">
              {PREVIEW_KEYS.map((key) => (
                <div key={key} className="flex items-center gap-1.5">
                  <ColorSwatch
                    value={resolved.semantic.light[key]}
                    size="sm"
                    title={resolved.semantic.light[key]}
                  />
                  <span className="truncate text-xs text-muted-foreground">
                    {key}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {lightLiterals.map(([key, value]) =>
            isColorLiteral(value) ? (
              <ColorField
                key={`light.${key}`}
                label={key}
                value={value}
                tokens={tokens}
                onChange={(next) =>
                  onChange(setTokenPath(tokens, `semantic.light.${key}`, next))
                }
              />
            ) : (
              <TextField
                key={`light.${key}`}
                label={key}
                value={value}
                mono
                onChange={(next) =>
                  onChange(setTokenPath(tokens, `semantic.light.${key}`, next))
                }
              />
            ),
          )}
          <div className="orbit-semantic-linked-badges">
            {Object.entries(tokens.semantic.light)
              .filter(([, v]) => isTokenReference(v))
              .slice(0, 6)
              .map(([key]) => (
                <Badge key={key} variant="secondary" className="text-xs">
                  {key} linked
                </Badge>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="dark" className="flex flex-col gap-4">
          <p className="text-xs text-muted-foreground">
            Derived from light via L → 100 − L (brand tokens excluded).
          </p>
          <div className="orbit-semantic-preview">
            <Label className="mb-3 block text-xs font-medium text-foreground/90">
              Resolved preview
            </Label>
            <div className="grid grid-cols-2 gap-2.5">
              {PREVIEW_KEYS.map((key) => (
                <div key={key} className="flex items-center gap-1.5">
                  <ColorSwatch
                    value={resolved.semantic.dark[key]}
                    size="sm"
                    title={resolved.semantic.dark[key]}
                  />
                  <span className="truncate text-xs text-muted-foreground">
                    {key}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {Object.entries(resolved.semantic.dark)
              .filter(([key]) => matchesFilter(key, filter))
              .map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
                >
                  <span className="text-xs text-muted-foreground">{key}</span>
                  <code className="truncate text-xs">{value}</code>
                </div>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </TokenSection>
  );
}
