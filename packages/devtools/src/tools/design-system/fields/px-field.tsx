import { Input, Label, Slider } from "@manovaspace/ui";

import { formatPx, parsePx } from "../token-mutations.js";

type PxFieldProps = {
  label: string;
  value: string;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: string) => void;
};

export function PxField({
  label,
  value,
  min = 320,
  max = 1920,
  step = 1,
  onChange,
}: PxFieldProps) {
  const px = parsePx(value) ?? min;

  return (
    <div className="orbit-token-field">
      <div className="orbit-token-field__control-group">
        <Label className="orbit-token-field__label">{label}</Label>
        <Slider
          min={min}
          max={max}
          step={step}
          value={[px]}
          onValueChange={(vals) => {
            const n = Array.isArray(vals) ? vals[0] : vals;
            if (n !== undefined) onChange(formatPx(n));
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
