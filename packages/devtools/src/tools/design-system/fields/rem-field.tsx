import { Input, Label, Slider } from "@manovaspace/ui";

import { formatRem, parseRem } from "../token-mutations.js";

type RemFieldProps = {
  label: string;
  value: string;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: string) => void;
};

export function RemField({
  label,
  value,
  min = 0,
  max = 4,
  step = 0.0625,
  onChange,
}: RemFieldProps) {
  const rem = parseRem(value) ?? min;
  const pxHint = `${Math.round(rem * 16)}px`;

  return (
    <div className="orbit-token-field">
      <div className="orbit-token-field__control-group">
        <div className="flex items-center justify-between gap-2">
          <Label className="orbit-token-field__label">{label}</Label>
          <span className="text-xs tabular-nums text-muted-foreground/80">
            {pxHint}
          </span>
        </div>
        <Slider
          min={min}
          max={max}
          step={step}
          value={[rem]}
          onValueChange={(vals) => {
            const n = Array.isArray(vals) ? vals[0] : vals;
            if (n !== undefined) onChange(formatRem(n));
          }}
          aria-label={`${label} slider`}
        />
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="orbit-token-field__input font-mono"
        spellCheck={false}
      />
    </div>
  );
}
