#!/usr/bin/env bash
set -euo pipefail

WORKSPACE_ROOT="$(pwd)"
RUNTIME_DIR="${SILEX_RUNTIME_DIR:-.silex-runtime}"
PNPM="npx --yes pnpm@10"

# Keep Silex project files inside this GitHub Codespace workspace.
FS_STORAGE_ROOT="${SILEX_FS_ROOT:-$WORKSPACE_ROOT/silex-workspaces/storage}"
FS_HOSTING_ROOT="${SILEX_FS_HOSTING_ROOT:-$WORKSPACE_ROOT/silex-workspaces/hosting}"
CLIENT_CONFIG="$WORKSPACE_ROOT/silex-client-config.js"
mkdir -p "$FS_STORAGE_ROOT" "$FS_HOSTING_ROOT"

if [ ! -d "$RUNTIME_DIR/.git" ]; then
  echo "[JINHUAN] Downloading the current Silex V3 source..."
  git clone --recurse-submodules --depth 1 https://github.com/silexlabs/Silex.git "$RUNTIME_DIR"
else
  echo "[JINHUAN] Silex runtime already exists. Reusing it."
  git -C "$RUNTIME_DIR" submodule update --init --recursive
fi

cd "$RUNTIME_DIR"

# Silex's default SaaS config reads these values from process.env and .env.
# Write both so Codespaces cannot fall back to the FTP defaults.
cat > .env <<EOF
STORAGE_CONNECTORS=fs
HOSTING_CONNECTORS=fs,download
SILEX_FS_ROOT=$FS_STORAGE_ROOT
SILEX_FS_HOSTING_ROOT=$FS_HOSTING_ROOT
SILEX_CLIENT_CONFIG=$CLIENT_CONFIG
EOF

export STORAGE_CONNECTORS="fs"
export HOSTING_CONNECTORS="fs,download"
export SILEX_FS_ROOT="$FS_STORAGE_ROOT"
export SILEX_FS_HOSTING_ROOT="$FS_HOSTING_ROOT"
export SILEX_CLIENT_CONFIG="$CLIENT_CONFIG"

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

echo "[JINHUAN] STORAGE_CONNECTORS=$STORAGE_CONNECTORS"
echo "[JINHUAN] HOSTING_CONNECTORS=$HOSTING_CONNECTORS"
echo "[JINHUAN] Storage root: $SILEX_FS_ROOT"
echo "[JINHUAN] Client config: $SILEX_CLIENT_CONFIG"
echo "[JINHUAN] Starting Silex on port 6805..."
exec env \
  STORAGE_CONNECTORS="$STORAGE_CONNECTORS" \
  HOSTING_CONNECTORS="$HOSTING_CONNECTORS" \
  SILEX_FS_ROOT="$SILEX_FS_ROOT" \
  SILEX_FS_HOSTING_ROOT="$SILEX_FS_HOSTING_ROOT" \
  SILEX_CLIENT_CONFIG="$SILEX_CLIENT_CONFIG" \
  $PNPM start
