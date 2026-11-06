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

  local runner
  if command -v rg >/dev/null 2>&1; then
    runner() { rg -n "$1" $2 --glob '*.tsx' 2>/dev/null || true; }
  else
    runner() { grep -rnE --include='*.tsx' -e "$1" $2 2>/dev/null || true; }
  fi

  while IFS= read -r match; do
    [[ -z "$match" ]] && continue
    if [[ "$match" == *"check-ds:allow"* ]]; then
      continue
    fi
    if [[ -n "$allowlist" ]] && echo "$match" | grep -qE "$allowlist"; then
      continue
    fi
    report "$label: $match"
  done < <(runner "$pattern" "$pathspec")
}

# No hardcoded hex in UI/devtools TSX (token tests and allowlisted fallbacks excluded).
scan_tsx \
  "hardcoded hex in TSX" \
  '#[0-9a-fA-F]{3,8}' \
  "packages/ui/src packages/devtools/src" \
  'packages/tokens/|\.test\.(ts|tsx):|\.stories\.(ts|tsx):|brand-color-family-row\.tsx:|color-field\.tsx:'

# No default Tailwind palette classes in UI surfaces.
scan_tsx \
  "default Tailwind palette" \
  '\b(bg|text|border|ring|fill|stroke|outline|from|to|via|shadow|divide|decoration|accent|caret)-(red|blue|gray|slate|zinc|neutral|stone|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}\b' \
  "packages/ui/src packages/devtools/src"

# No non-token arbitrary bracket values in UI/devtools TSX (tokens, tests, icons, z-index, and allowlisted legacy usages excluded).
scan_tsx \
  "non-token arbitrary bracket value" \
  '-\[[^]]+\]' \
  "packages/ui/src packages/devtools/src" \
  'var\(--|color-mix|env\(|--spacing|z-\[|\.test\.|\.stories\.|\.spec\.|icon|icons|packages/ui/src/primitives/|packages/ui/src/motion/|packages/ui/src/composed/|packages/devtools/|color-swatch\.tsx:|mobile-bottom-tab-bar\.tsx:|whats-new\.tsx:|dialog\.tsx:|alert-dialog\.tsx:'

if [[ "$failures" -gt 0 ]]; then
  echo "check-ds: $failures violation(s)" >&2
  exit 1
fi

echo "check-ds: ok"
