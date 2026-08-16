#!/usr/bin/env bash
set -euo pipefail

WORKSPACE_ROOT="$(pwd)"
RUNTIME_DIR="${SILEX_RUNTIME_DIR:-.silex-runtime}"
PNPM="npx --yes pnpm@10"

# Codespaces should save Silex projects directly in this GitHub workspace.
# This avoids the default FTP login screen.
export STORAGE_CONNECTORS="fs"
export HOSTING_CONNECTORS="download"
export SILEX_FS_ROOT="${SILEX_FS_ROOT:-$WORKSPACE_ROOT/silex-workspaces/storage}"
export SILEX_FS_HOSTING_ROOT="${SILEX_FS_HOSTING_ROOT:-$WORKSPACE_ROOT/silex-workspaces/hosting}"
mkdir -p "$SILEX_FS_ROOT" "$SILEX_FS_HOSTING_ROOT"

if [ ! -d "$RUNTIME_DIR/.git" ]; then
  echo "[JINHUAN] Downloading the current Silex V3 source..."
  git clone --recurse-submodules --depth 1 https://github.com/silexlabs/Silex.git "$RUNTIME_DIR"
else
  echo "[JINHUAN] Silex runtime already exists. Reusing it."
  git -C "$RUNTIME_DIR" submodule update --init --recursive
fi

cd "$RUNTIME_DIR"

echo "[JINHUAN] Using pnpm without global installation..."
$PNPM --version

if [ ! -d node_modules ]; then
  echo "[JINHUAN] Installing Silex dependencies (first run can take a few minutes)..."
  $PNPM install
fi

if [ ! -f .jinhuan-built ]; then
  echo "[JINHUAN] Building Silex V3 (first run only)..."
  $PNPM build
  touch .jinhuan-built
fi

echo "[JINHUAN] Storage: filesystem -> $SILEX_FS_ROOT"
echo "[JINHUAN] Starting Silex on port 6805..."
exec $PNPM start
