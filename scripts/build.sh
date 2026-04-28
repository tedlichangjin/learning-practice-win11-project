#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

echo "Building the Next.js project..."
pnpm build:app

echo "Bundling server with tsup..."
pnpm build:server

echo "Build completed successfully!"
