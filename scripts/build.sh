#!/usr/bin/env bash
# Builds the product: a single self-contained dist/index.html.
set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/_deps.sh"

npm run --silent build
test -s dist/index.html

if [ -n "${GITHUB_OUTPUT:-}" ]; then
  echo "sha256=$(sha256sum dist/index.html | cut -d' ' -f1)" >>"$GITHUB_OUTPUT"
fi
