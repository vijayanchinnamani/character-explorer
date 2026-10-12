#!/bin/bash
# Starts the app in the background and opens it in Chrome.
# If setup has not been done yet (or package-lock.json changed), it runs the missing steps first.
set -euo pipefail

# shellcheck source=scripts/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/scripts/lib.sh"

ensure_environment
start_server
