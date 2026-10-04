#!/usr/bin/env bash
# Sourced by the other scripts: moves to the repository root and installs
# dependencies when they are missing or older than the lockfile.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

if [ ! -f node_modules/.package-lock.json ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
  npm ci --no-audit --no-fund
fi
