#!/bin/bash
# Shows whether the app is running and where.
set -euo pipefail

# shellcheck source=scripts/lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/scripts/lib.sh"

pid="$(running_pid)"
if [ -n "$pid" ]; then
  port="$(recorded_port)"
  ok "Running: http://localhost:$port (process $pid)"
  if curl -sf -o /dev/null "http://localhost:$port"; then
    ok "The page responds."
  else
    warn "The process is up but the page does not respond yet (still building?)."
  fi
else
  warn "Not running. Start it with: bash start.sh"
  if [ -s "$LOG_FILE" ]; then
    info "Last lines of the log ($LOG_FILE):"
    tail -n 15 "$LOG_FILE"
  fi
fi

if resolve_node; then
  info "Node.js: $("$NODE_BIN" -v) ($NODE_BIN)"
else
  info "Node.js: no compatible version yet (run: bash setup.sh)"
fi
if deps_up_to_date; then
  info "Dependencies: installed"
else
  info "Dependencies: not installed or outdated (run: bash setup.sh)"
fi
