#!/usr/bin/env bash
set -euo pipefail

cursor_bin=""
for candidate in /home/vscode/.cursor-server/bin/*/bin/remote-cli/cursor; do
  if [ -x "${candidate}" ]; then
    cursor_bin="${candidate}"
    break
  fi
done

if [ -z "${cursor_bin}" ]; then
  echo "cursor CLI not found. Start Cursor IDE to install the server." >&2
  exit 1
fi

exec "${cursor_bin}" "$@"
