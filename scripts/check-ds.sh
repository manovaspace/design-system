#!/usr/bin/env bash
# ponytail: grep-based DS guardrails for @manovaspace/ui + @manovaspace/devtools.
# App import bans live in orbit-frontend/scripts/check-ds.sh.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

failures=0

report() {
  echo "check-ds: $1" >&2
  failures=$((failures + 1))
}

scan_tsx() {
  local label="$1"
  local pattern="$2"
  local pathspec="$3"
  local allowlist="${4:-}"

  while IFS= read -r match; do
    [[ -z "$match" ]] && continue
    if [[ -n "$allowlist" ]] && echo "$match" | grep -qE "$allowlist"; then
      continue
    fi
    report "$label: $match"
  done < <(rg -n "$pattern" $pathspec --glob '*.tsx' 2>/dev/null || true)
}

# No hardcoded hex in UI/devtools TSX (token tests and allowlisted fallbacks excluded).
scan_tsx \
  "hardcoded hex in TSX" \
  '#[0-9a-fA-F]{3,8}' \
  "packages/ui/src packages/devtools/src" \
  'packages/tokens/|\.test\.ts:|brand-color-family-row\.tsx:|color-field\.tsx:'

# No default Tailwind palette classes in UI surfaces.
scan_tsx \
  "default Tailwind palette" \
  '\b(bg|text|border|ring|from|to|via)-(red|blue|gray|slate|zinc|neutral|stone|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}\b' \
  "packages/ui/src packages/devtools/src"

if [[ "$failures" -gt 0 ]]; then
  echo "check-ds: $failures violation(s)" >&2
  exit 1
fi

echo "check-ds: ok"
