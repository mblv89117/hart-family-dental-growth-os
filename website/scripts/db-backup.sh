#!/usr/bin/env bash
# Staging/local backup helper — does not touch Production Vercel.
# Usage: DATABASE_URL=... bash scripts/db-backup.sh [outfile]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-$ROOT/../data/backups/hfd_growth_os_$(date -u +%Y%m%dT%H%M%SZ).sql}"
mkdir -p "$(dirname "$OUT")"
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi
# Strip query string for pg_dump
URL="${DATABASE_URL%%\?*}"
pg_dump --no-owner --no-acl "$URL" > "$OUT"
echo "Backup written: $OUT"
