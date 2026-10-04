#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/_deps.sh"

npm run --silent test:integration -- "$@"
