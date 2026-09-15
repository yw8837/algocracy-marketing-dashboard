#!/usr/bin/env sh
set -eu

if [ "$#" -ne 1 ]; then
  echo "Usage: scripts/restore.sh /path/to/backup.tar.gz" >&2
  exit 1
fi

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
ARCHIVE=$1
[ -f "$ARCHIVE" ] || { echo "Backup not found: $ARCHIVE" >&2; exit 1; }

tar -tzf "$ARCHIVE" | grep -Eq '^(data|client/public/data|client/public/brand|docs)/|^(README\.md|ENVIRONMENT\.example)$' || {
  echo "Backup does not contain expected project paths." >&2
  exit 1
}

tar -xzf "$ARCHIVE" -C "$ROOT"
printf 'Backup restored into: %s\n' "$ROOT"
