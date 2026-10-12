#!/bin/bash
# Double-click launcher for status.sh (a double-clicked file starts in the home folder,
# so jump to this folder first).
DIR="$(cd "$(dirname "$0")" && pwd)"
bash "$DIR/status.sh"
status=$?
echo
if [ -t 0 ]; then
  read -r -p "Press Enter to close this window..." _
fi
exit $status
