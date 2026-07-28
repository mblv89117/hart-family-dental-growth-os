#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  docker compose -f compose.yaml up -d
  echo "PostgreSQL started via Docker Compose."
  exit 0
fi

# Fallback: local PostgreSQL cluster (cloud/dev environments without Docker daemon)
if command -v pg_isready >/dev/null 2>&1; then
  if ! pg_isready -h 127.0.0.1 -p 5432 >/dev/null 2>&1; then
    if command -v pg_ctlcluster >/dev/null 2>&1; then
      sudo pg_ctlcluster 16 main start || true
    fi
  fi
  pg_isready -h 127.0.0.1 -p 5432
  echo "Using local PostgreSQL on 127.0.0.1:5432"
  echo "Ensure databases hfd_growth_os and hfd_growth_os_test exist (see docs)."
  exit 0
fi

echo "Neither Docker nor local PostgreSQL is available." >&2
exit 1
