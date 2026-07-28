#!/usr/bin/env bash
# Restore into a SEPARATE database only. Refuses obvious production hostnames.
# Usage: DATABASE_URL=postgresql://.../hfd_growth_os_restore bash scripts/db-restore.sh backup.sql
set -euo pipefail
FILE="${1:-}"
if [[ -z "$FILE" || ! -f "$FILE" ]]; then
  echo "Usage: DATABASE_URL=... bash scripts/db-restore.sh backup.sql" >&2
  exit 1
fi
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi
# Refuse suspected production targets unless explicitly overridden.
# Operator precedence: (hfdds OR prod) AND not ALLOW_PROD_RESTORE.
if { [[ "$DATABASE_URL" == *"hfdds"* ]] || [[ "$DATABASE_URL" == *"prod"* ]]; } && [[ "${ALLOW_PROD_RESTORE:-}" != "true" ]]; then
  echo "Refusing restore to suspected production URL without ALLOW_PROD_RESTORE=true" >&2
  exit 1
fi
URL="${DATABASE_URL%%\?*}"
psql "$URL" -v ON_ERROR_STOP=1 -f "$FILE"
echo "Restore complete into target DATABASE_URL (credentials not printed)."
