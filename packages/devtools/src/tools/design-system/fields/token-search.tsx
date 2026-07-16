import { Input } from "@manovaspace/ui";

type TokenSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function TokenSearch({
  value,
  onChange,
  placeholder = "Filter tokens…",
}: TokenSearchProps) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="orbit-token-field__input h-9 px-3 text-xs md:text-xs"
      aria-label="Filter tokens"
    />
  );
}

export function matchesFilter(label: string, query: string): boolean {
  if (!query.trim()) return true;
  return label.toLowerCase().includes(query.trim().toLowerCase());
}
