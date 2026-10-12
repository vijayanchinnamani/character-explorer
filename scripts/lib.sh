#!/bin/bash
# shellcheck shell=bash
#
# Shared helpers for setup.sh / start.sh / stop.sh / status.sh.
#
# Rules this file follows (so it works on a brand-new Mac):
#   * bash 3.2 compatible (that is what /bin/bash is on macOS): no associative arrays,
#     no ${var,,}, no mapfile, no &>>.
#   * only uses tools that ship with macOS: curl, tar, shasum, lsof, ps, pgrep, open, sysctl.
#     No python3 (it is a shim that pops up an Xcode installer), no git, no Homebrew.
#   * every path is quoted: the project folder may contain spaces ("character-explorer 2").

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
TOOLS_DIR="$PROJECT_DIR/.tools"
NODE_HOME="$TOOLS_DIR/node"
RUN_DIR="$PROJECT_DIR/.run"
PID_FILE="$RUN_DIR/dev-server.pid"
PORT_FILE="$RUN_DIR/dev-server.port"
LOG_FILE="$RUN_DIR/dev-server.log"
NG_BIN="$PROJECT_DIR/node_modules/@angular/cli/bin/ng.js"
DEPS_STAMP="$PROJECT_DIR/node_modules/.install-stamp"

DEFAULT_PORT=4200
PORT_SEARCH_LIMIT=50
READY_TIMEOUT_SECONDS=180

# Portable Node.js that setup downloads when the Mac has no compatible Node.
# Pinned version + SHA-256 (from https://nodejs.org/dist/v22.23.3/SHASUMS256.txt).
NODE_VERSION="22.23.3"
NODE_SHA256_ARM64="23b25245dcfb9af7262f8ff142e9e2e0af025368117329e7a7458a51e5922f53"
NODE_SHA256_X64="8a677b0219178efd6eb0e475457c4afb452b521a92f6e67845a73bd85727f2a8"

export NG_CLI_ANALYTICS=false
export NO_UPDATE_NOTIFIER=1
export npm_config_update_notifier=false

# ---------------------------------------------------------------- output helpers
if [ -t 1 ]; then
  BOLD=$'\033[1m'; RED=$'\033[31m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; RESET=$'\033[0m'
else
  BOLD=''; RED=''; GREEN=''; YELLOW=''; RESET=''
fi

info() { printf '%s\n' "${BOLD}==>${RESET} $*"; }
ok()   { printf '%s\n' "${GREEN}✔${RESET} $*"; }
warn() { printf '%s\n' "${YELLOW}!${RESET} $*" >&2; }
die()  { printf '%s\n' "${RED}✘ $*${RESET}" >&2; exit 1; }

# ---------------------------------------------------------------- platform
ensure_macos() {
  [ "$(uname -s)" = "Darwin" ] || die "These scripts are for macOS only."

  local major
  major="$(sw_vers -productVersion 2>/dev/null | cut -d. -f1)"
  case "$major" in
    ''|*[!0-9]*) return 0 ;;
  esac
  if [ "$major" -lt 11 ]; then
    die "macOS 11 (Big Sur) or newer is required (this Mac has $(sw_vers -productVersion))."
  fi
}

detect_arch() {
  # hw.optional.arm64 is 1 on Apple Silicon (even when this shell runs under Rosetta).
  if [ "$(sysctl -n hw.optional.arm64 2>/dev/null || echo 0)" = "1" ]; then
    echo arm64
  else
    echo x64
  fi
}

# ---------------------------------------------------------------- Node.js
# Same range Angular CLI 20 declares in its package.json "engines".
node_is_compatible() { # $1 = path to a node binary
  [ -x "$1" ] || return 1
  "$1" -e '
    const [major, minor] = process.versions.node.split(".").map(Number);
    const ok = (major === 20 && minor >= 19) || (major === 22 && minor >= 12) || major >= 24;
    process.exit(ok ? 0 : 1);
  ' >/dev/null 2>&1
}

NODE_BIN=""

# Picks the project's portable Node first, then a compatible Node already on this Mac.
# On success sets NODE_BIN and puts its folder first on PATH (so npm/ng children use it too).
resolve_node() {
  local system_node
  NODE_BIN=""

  if node_is_compatible "$NODE_HOME/bin/node"; then
    NODE_BIN="$NODE_HOME/bin/node"
  else
    system_node="$(command -v node 2>/dev/null || true)"
    if [ -n "$system_node" ] && node_is_compatible "$system_node" \
      && [ -x "$(dirname "$system_node")/npm" ]; then
      NODE_BIN="$system_node"
    fi
  fi

  [ -n "$NODE_BIN" ] || return 1
  PATH="$(dirname "$NODE_BIN"):$PATH"
  export PATH
}

install_portable_node() {
  local arch expected file url tmp actual
  arch="$(detect_arch)"
  case "$arch" in
    arm64) expected="$NODE_SHA256_ARM64" ;;
    *)     expected="$NODE_SHA256_X64" ;;
  esac
  file="node-v${NODE_VERSION}-darwin-${arch}.tar.gz"
  url="https://nodejs.org/dist/v${NODE_VERSION}/${file}"

  mkdir -p "$TOOLS_DIR"
  rm -rf "$TOOLS_DIR"/download.* 2>/dev/null || true # leftovers from an interrupted run
  tmp="$(mktemp -d "$TOOLS_DIR/download.XXXXXX")"

  info "Downloading Node.js ${NODE_VERSION} for ${arch} (about 45 MB)..."
  if ! curl -fL --retry 3 --retry-delay 2 --progress-bar -o "$tmp/$file" "$url"; then
    rm -rf "$tmp"
    die "Could not download Node.js from nodejs.org. Please check your internet connection and run this script again."
  fi

  actual="$(shasum -a 256 "$tmp/$file" | awk '{print $1}')"
  if [ "$actual" != "$expected" ]; then
    rm -rf "$tmp"
    die "The downloaded Node.js file failed its checksum test, so it was discarded. Please run this script again."
  fi

  info "Unpacking Node.js..."
  tar -xzf "$tmp/$file" -C "$tmp"

  # Move into place only when complete, so an interrupted run never leaves a half-installed Node.
  rm -rf "$NODE_HOME"
  mv "$tmp/node-v${NODE_VERSION}-darwin-${arch}" "$NODE_HOME"
  rm -rf "$tmp"
}

# ---------------------------------------------------------------- dependencies
lock_hash() {
  shasum -a 256 "$PROJECT_DIR/package-lock.json" | awk '{print $1}'
}

deps_up_to_date() {
  [ -f "$NG_BIN" ] && [ -f "$DEPS_STAMP" ] && [ "$(cat "$DEPS_STAMP")" = "$(lock_hash)" ]
}

install_deps() {
  info "Installing project dependencies (first time takes a few minutes)..."
  if ! (cd "$PROJECT_DIR" && npm ci --no-audit --no-fund --loglevel=error); then
    die "Installing dependencies failed. Please check your internet connection and run this script again."
  fi
  lock_hash >"$DEPS_STAMP"
}

# Node + dependencies, installing whatever is missing.
ensure_environment() {
  ensure_macos

  if ! resolve_node; then
    info "No compatible Node.js found. Installing a private copy inside this project folder"
    info "(nothing is installed system-wide, deleting the folder removes everything)."
    install_portable_node
    resolve_node || die "Node.js could not be set up."
  fi
  ok "Node.js $("$NODE_BIN" -v) ($NODE_BIN)"

  if ! deps_up_to_date; then
    install_deps
  fi
  ok "Dependencies are installed"
}

# ---------------------------------------------------------------- processes / ports
pid_alive() { kill -0 "$1" 2>/dev/null; }

# True only for a node/ng process whose working directory is THIS project folder, so we never
# touch an unrelated program that happens to use the same port or a recycled PID.
# (The command line is no use here: Angular CLI renames its process title to "ng serve ...".)
is_ours() {
  local cwd command
  cwd="$(lsof -a -p "$1" -d cwd -Fn 2>/dev/null | awk '/^n/ { sub(/^n/, ""); print; exit }' || true)"
  [ "$cwd" = "$PROJECT_DIR" ] || return 1

  command="$(ps -ww -o command= -p "$1" 2>/dev/null || true)"
  case "$command" in
    *"ng serve"*|*node*) return 0 ;;
  esac
  return 1
}

port_in_use() {
  lsof -nP -iTCP:"$1" -sTCP:LISTEN -t >/dev/null 2>&1
}

find_free_port() {
  local port="$1" limit=$(($1 + PORT_SEARCH_LIMIT))
  while [ "$port" -le "$limit" ]; do
    if ! port_in_use "$port"; then
      echo "$port"
      return 0
    fi
    port=$((port + 1))
  done
  return 1
}

descendants() {
  local child
  for child in $(pgrep -P "$1" 2>/dev/null || true); do
    echo "$child"
    descendants "$child"
  done
}

kill_tree() { # $1 = pid, $2 = signal name (TERM / KILL)
  local pid
  for pid in $1 $(descendants "$1"); do
    kill "-$2" "$pid" 2>/dev/null || true
  done
}

# Prints the PID of this project's running dev server, or nothing.
running_pid() {
  local pid
  [ -f "$PID_FILE" ] || return 0
  pid="$(cat "$PID_FILE" 2>/dev/null || true)"
  case "$pid" in
    ''|*[!0-9]*) return 0 ;;
  esac
  if pid_alive "$pid" && is_ours "$pid"; then
    echo "$pid"
  fi
  return 0
}

recorded_port() {
  local port
  port="$(cat "$PORT_FILE" 2>/dev/null || true)"
  case "$port" in
    ''|*[!0-9]*) echo "$DEFAULT_PORT" ;;
    *) echo "$port" ;;
  esac
}

# ---------------------------------------------------------------- browser
open_browser() { # $1 = url
  if [ -n "${NO_BROWSER:-}" ]; then
    info "NO_BROWSER is set: not opening a browser. Open $1 yourself."
    return 0
  fi
  if open -Ra "Google Chrome" >/dev/null 2>&1; then
    open -a "Google Chrome" "$1"
  else
    warn "Google Chrome was not found, opening your default browser instead."
    open "$1"
  fi
}

wait_ready() { # $1 = url, $2 = pid
  local elapsed=0
  while [ "$elapsed" -lt "$READY_TIMEOUT_SECONDS" ]; do
    if ! pid_alive "$2"; then
      return 1
    fi
    if curl -sf -o /dev/null "$1"; then
      [ -t 1 ] && printf '\n'
      return 0
    fi
    [ -t 1 ] && printf '.'
    sleep 1
    elapsed=$((elapsed + 1))
  done
  [ -t 1 ] && printf '\n'
  return 1
}

# ---------------------------------------------------------------- dev server
start_server() {
  local pid port url free
  pid="$(running_pid)"
  if [ -n "$pid" ]; then
    url="http://localhost:$(recorded_port)"
    ok "The app is already running at $url"
    open_browser "$url"
    return 0
  fi

  rm -f "$PID_FILE" "$PORT_FILE"
  port="$DEFAULT_PORT"
  if port_in_use "$port"; then
    free="$(find_free_port "$port")" || die "No free port found between $port and $((port + PORT_SEARCH_LIMIT))."
    warn "Port $port is used by another program, using port $free instead."
    port="$free"
  fi
  url="http://localhost:$port"

  mkdir -p "$RUN_DIR"
  : >"$LOG_FILE"

  info "Starting the app on $url (the first build takes up to a minute)..."
  cd "$PROJECT_DIR"
  # Run node directly (not via npm/npx) so the recorded PID is the real server. A tiny Node
  # launcher spawns it "detached" (its own session, stdin closed, output to the log file), so
  # closing the Terminal window or pressing Ctrl+C in it cannot stop the server.
  # (nohup is not enough: Node resets the "ignore SIGHUP" setting that nohup relies on.)
  pid="$("$NODE_BIN" -e '
    const { spawn } = require("node:child_process");
    const { openSync } = require("node:fs");
    const [logFile, ...ngArgs] = process.argv.slice(1);
    const log = openSync(logFile, "a");
    const server = spawn(process.execPath, ngArgs, {
      cwd: process.cwd(),
      detached: true,
      stdio: ["ignore", log, log],
    });
    console.log(server.pid);
    server.unref();
  ' "$LOG_FILE" "$NG_BIN" serve --host localhost --port "$port")"
  case "$pid" in
    ''|*[!0-9]*) die "Could not launch the server process." ;;
  esac
  echo "$pid" >"$PID_FILE"
  echo "$port" >"$PORT_FILE"

  if ! wait_ready "$url" "$pid"; then
    warn "The app did not start. Last lines of $LOG_FILE:"
    tail -n 25 "$LOG_FILE" >&2 || true
    kill_tree "$pid" TERM
    rm -f "$PID_FILE" "$PORT_FILE"
    die "Start failed."
  fi

  ok "The app is running at $url"
  info "Stop it any time with: bash stop.sh   (or double-click Stop.command)"
  open_browser "$url"
}

stop_server() {
  local pid waited=0 found=""

  pid="$(running_pid)"
  if [ -n "$pid" ]; then
    info "Stopping the app (process $pid)..."
    kill_tree "$pid" TERM
    while pid_alive "$pid" && [ "$waited" -lt 10 ]; do
      sleep 1
      waited=$((waited + 1))
    done
    if pid_alive "$pid"; then
      warn "Still running after 10 seconds, forcing it to stop."
      kill_tree "$pid" KILL
    fi
    found="yes"
  fi

  # Safety net: a server of this project whose PID file was lost (e.g. the folder was copied).
  for pid in $(lsof -nP -iTCP:"$DEFAULT_PORT-$((DEFAULT_PORT + PORT_SEARCH_LIMIT))" -sTCP:LISTEN -t 2>/dev/null | sort -u || true); do
    if is_ours "$pid"; then
      info "Stopping a leftover server of this project (process $pid)..."
      kill_tree "$pid" TERM
      found="yes"
    fi
  done

  rm -f "$PID_FILE" "$PORT_FILE"
  if [ -n "$found" ]; then
    ok "Stopped."
  else
    ok "The app is not running."
  fi
}
