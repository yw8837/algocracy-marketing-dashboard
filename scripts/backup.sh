#!/usr/bin/env sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
OUT=${1:-"$ROOT/backups/algocracy-marketing-$STAMP.tar.gz"}
mkdir -p "$(dirname "$OUT")"

tar -czf "$OUT" -C "$ROOT" \
  data \
  client/public/data \
  client/public/brand \
  docs \
  README.md \
  ENVIRONMENT.example

printf 'Backup created: %s\n' "$OUT"
