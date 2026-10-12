#!/bin/bash
# Stops the app started by start.sh / setup.sh.
set -euo pipefail

# shellcheck source=scripts/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/scripts/lib.sh"

stop_server
