#!/usr/bin/env bash
# Runs the Playwright suite against a throwaway Docker Compose stack.
#
# Contract (see AGENTS.md):
#   - project name is e2e-${E2E_RUN_ID}; a random id is generated when unset,
#     so several runs can work side by side,
#   - no host ports are published, tests run inside the Compose network,
#   - the stack is always torn down, also on failure and on interrupt,
#   - secrets are loaded from ${SH_SECRETS_DIR:-$HOME/.sh-secrets}/kulki.env if present.
#
# Extra arguments go to `playwright test`, e.g.:
#   scripts/test-e2e.sh --project chromium start-screen
#
# The `postdeploy` project checks the `web` service (mock mode) unless
# POSTDEPLOY_URL points it at the published game:
#   POSTDEPLOY_URL=https://cieyhomelab.github.io/kulki/ scripts/test-e2e.sh --project postdeploy
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

REPO_NAME="kulki"
SECRETS_FILE="${SH_SECRETS_DIR:-$HOME/.sh-secrets}/${REPO_NAME}.env"
if [ -f "$SECRETS_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$SECRETS_FILE"
  set +a
fi

RUN_ID="${E2E_RUN_ID:-$(date +%s)-${RANDOM}${RANDOM}}"
# Compose project names allow only lowercase letters, digits, dashes and underscores.
RUN_ID="$(printf '%s' "$RUN_ID" | tr '[:upper:]' '[:lower:]' | tr -c 'a-z0-9_-' '-')"
PROJECT="e2e-${RUN_ID}"

PLAYWRIGHT_VERSION="$(sed -n 's/.*"@playwright\/test": *"\([0-9][0-9.]*\)".*/\1/p' package.json)"
if [ -z "$PLAYWRIGHT_VERSION" ]; then
  echo "Cannot read an exact @playwright/test version from package.json" >&2
  exit 1
fi
export PLAYWRIGHT_VERSION

compose() {
  docker compose -p "$PROJECT" -f compose.e2e.yml "$@"
}

cleanup() {
  status=$?
  trap - EXIT INT TERM
  if [ "$status" -ne 0 ]; then
    # Keep traces and screenshots of the failed run; best effort.
    mkdir -p test-results
    docker cp "${PROJECT}-runner:/work/test-results" "test-results/${PROJECT}" >/dev/null 2>&1 &&
      echo "Playwright artifacts: test-results/${PROJECT}" >&2 || true
  fi
  compose down -v --remove-orphans --rmi local >/dev/null 2>&1 || true
  exit "$status"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

echo "E2E stack: ${PROJECT} (Playwright ${PLAYWRIGHT_VERSION})"
compose build --quiet
compose run --name "${PROJECT}-runner" e2e "$@"
