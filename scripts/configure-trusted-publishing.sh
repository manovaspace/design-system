#!/usr/bin/env bash
# Configure npm trusted publishing (OIDC) for @manovaspace design-system packages.
set -euo pipefail

REGISTRY="${NPM_REGISTRY:-https://registry.npmjs.org}"
REPO="${TRUST_REPO:-manovaspace/design-system}"
WORKFLOW="${TRUST_WORKFLOW:-publish.yml}"

PACKAGES=(
  @manovaspace/tokens
  @manovaspace/ui
  @manovaspace/devtools
)

has_trust() {
  npm trust list "$1" --registry="$REGISTRY" 2>/dev/null | grep -q "type: github"
}

on_npm() {
  npm view "$1" version --registry="$REGISTRY" >/dev/null 2>&1
}

trust_pkg() {
  local pkg="$1"

  if has_trust "$pkg"; then
    echo "==> $pkg: GitHub trusted publisher already configured — skip"
    return 0
  fi

  if ! on_npm "$pkg"; then
    echo "==> $pkg: not on npm yet — publish first (pnpm build && pnpm release), then re-run"
    return 0
  fi

  echo "==> npm trust github $pkg"
  if npm trust github "$pkg" \
    --file "$WORKFLOW" \
    --repo "$REPO" \
    --allow-publish \
    --registry="$REGISTRY" \
    -y; then
    return 0
  fi

  if has_trust "$pkg"; then
    echo "==> $pkg: trust already exists (409) — skip"
    return 0
  fi

  return 1
}

failed=0
for pkg in "${PACKAGES[@]}"; do
  trust_pkg "$pkg" || failed=1
done

echo ""
echo "Verify:"
for pkg in "${PACKAGES[@]}"; do
  if on_npm "$pkg"; then
    if has_trust "$pkg"; then
      echo "  OK  $pkg"
    else
      echo "  !!  $pkg (on npm, no trust)"
      failed=1
    fi
  else
    echo "  --  $pkg (not on npm)"
  fi
done

exit "$failed"
