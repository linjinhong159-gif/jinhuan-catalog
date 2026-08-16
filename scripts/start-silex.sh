#!/usr/bin/env bash
set -euo pipefail

RUNTIME_DIR="${SILEX_RUNTIME_DIR:-.silex-runtime}"

if [ ! -d "$RUNTIME_DIR/.git" ]; then
  echo "[JINHUAN] Downloading the current Silex V3 source..."
  git clone --recurse-submodules --depth 1 https://github.com/silexlabs/Silex.git "$RUNTIME_DIR"
else
  echo "[JINHUAN] Silex runtime already exists. Reusing it."
  git -C "$RUNTIME_DIR" submodule update --init --recursive
fi

cd "$RUNTIME_DIR"

if command -v corepack >/dev/null 2>&1; then
  corepack enable
fi

if ! command -v pnpm >/dev/null 2>&1; then
  npm install -g pnpm
fi

if [ ! -d node_modules ]; then
  echo "[JINHUAN] Installing Silex dependencies (first run can take a few minutes)..."
  pnpm install
fi

if [ ! -f .jinhuan-built ]; then
  echo "[JINHUAN] Building Silex V3 (first run only)..."
  pnpm build
  touch .jinhuan-built
fi

echo "[JINHUAN] Starting Silex on port 6805..."
exec pnpm start
