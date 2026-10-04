#!/usr/bin/env bash
# Builds the product: a single self-contained dist/index.html.
set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/_deps.sh"

npm run --silent build
test -s dist/index.html
