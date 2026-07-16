import { cn, Input, Label, Slider, Textarea } from "@manovaspace/ui";

import { parseUnitless } from "../token-mutations.js";

type UnitlessFieldProps = {
  label: string;
  value: string;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: string) => void;
};

export function UnitlessField({
  label,
  value,
  min = 1,
  max = 2.5,
  step = 0.05,
  onChange,
}: UnitlessFieldProps) {
  const n = parseUnitless(value) ?? min;

  return (
    <div className="orbit-token-field">
      <div className="orbit-token-field__control-group">
        <Label className="orbit-token-field__label">{label}</Label>
        <Slider
          min={min}
          max={max}
          step={step}
          value={[n]}
          onValueChange={(vals) => {
            const v = Array.isArray(vals) ? vals[0] : vals;
            if (v !== undefined) onChange(String(v));
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

type TextFieldProps = {
  label: string;
  value: string;
  mono?: boolean;
  multiline?: boolean;
  onChange: (value: string) => void;
};

export function TextField({
  label,
  value,
  mono = false,
  multiline = false,
  onChange,
}: TextFieldProps) {
  return (
    <div className="orbit-token-field">
      <Label className="orbit-token-field__label">{label}</Label>
      {multiline ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className={cn("orbit-token-field__textarea", mono && "font-mono")}
          spellCheck={false}
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn("orbit-token-field__input", mono && "font-mono")}
          spellCheck={false}
        />
      )}
    </div>
  );
}
