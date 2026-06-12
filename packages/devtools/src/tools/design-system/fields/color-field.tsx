import { normalizeSemanticColor, type OrbitTokensRaw } from "@manovaspace/tokens";
import { Badge, ColorSwatch, Input, Label } from "@manovaspace/ui";

import {
  isColorLiteral,
  isHexColor,
  isHslColor,
  isTokenReference,
  resolveTokenValue,
} from "../token-mutations.js";

type ColorFieldProps = {
  label: string;
  value: string;
  tokens: OrbitTokensRaw;
  onChange: (value: string) => void;
};

export function ColorField({
  label,
  value,
  tokens,
  onChange,
}: ColorFieldProps) {
  const resolved = resolveTokenValue(value, tokens);
  const pickerValue = isHexColor(resolved) ? resolved : "#000000";
  const showPicker = isColorLiteral(value) || isColorLiteral(resolved);

  return (
    <div className="orbit-token-field">
      <div className="orbit-token-field__control-group">
        <div className="flex items-center justify-between gap-2">
          <Label className="orbit-token-field__label">{label}</Label>
          {isTokenReference(value) ? (
            <Badge variant="outline" className="text-xs">
              linked
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-2.5">
          <ColorSwatch value={resolved} size="md" title={resolved} />
          {showPicker ? (
            <input
              type="color"
              value={pickerValue}
              onChange={(e) => onChange(normalizeSemanticColor(e.target.value))}
              className="size-8 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0"
              aria-label={`${label} color picker`}
            />
          ) : null}
          <Input
            value={value}
            onChange={(e) => {
              const next = e.target.value;
              onChange(
                isHexColor(next) || isHslColor(next)
                  ? normalizeSemanticColor(next)
                  : next,
              );
            }}
            className="orbit-token-field__input flex-1 font-mono"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
