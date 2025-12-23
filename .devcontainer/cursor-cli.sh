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

if [ -z "${VSCODE_IPC_HOOK_CLI:-}" ] && [ -z "${VSCODE_CLIENT_COMMAND:-}" ]; then
  term_pid="$(ps -eo pid,command | awk '/shellIntegration-/{print $1; exit}')"
  if [ -n "${term_pid}" ] && [ -r "/proc/${term_pid}/environ" ]; then
    ipc_path="$(tr '\0' '\n' < "/proc/${term_pid}/environ" | sed -n 's/^VSCODE_IPC_HOOK_CLI=//p' | head -n 1)"
    if [ -n "${ipc_path}" ]; then
      export VSCODE_IPC_HOOK_CLI="${ipc_path}"
    fi
  fi
fi

exec "${cursor_bin}" "$@"
