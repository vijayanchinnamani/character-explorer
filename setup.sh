#!/bin/bash
# First-time setup: makes sure a compatible Node.js exists, installs the project's
# dependencies, then starts the app and opens it in Chrome.
# Safe to run again at any time.
set -euo pipefail

# shellcheck source=scripts/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/scripts/lib.sh"

ensure_environment
start_server
