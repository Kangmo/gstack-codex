#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION_VALUE="$(
  git -C "$ROOT" rev-parse HEAD 2>/dev/null ||
  cat "$ROOT/VERSION" 2>/dev/null ||
  echo unknown
)"

for target in "$@"; do
  mkdir -p "$(dirname "$target")"
  printf '%s\n' "$VERSION_VALUE" > "$target"
done
