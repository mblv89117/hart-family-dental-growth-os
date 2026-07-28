#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  docker compose -f compose.yaml down
  echo "PostgreSQL stopped via Docker Compose."
  exit 0
fi

echo "db:down: Docker Compose not active. Local PostgreSQL left running."
exit 0
