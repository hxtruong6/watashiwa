#!/bin/bash

# Load environment variables from .env file
# This script loads .env and starts Inngest with the keys

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load .env file if it exists
if [ -f "$PROJECT_ROOT/.env" ]; then
  set -a
  source "$PROJECT_ROOT/.env"
  set +a
fi

# Check if required keys are set
if [ -z "$INNGEST_EVENT_KEY" ] || [ -z "$INNGEST_SIGNING_KEY" ]; then
  echo "Error: INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY must be set in .env file"
  exit 1
fi

# Change to project root
cd "$PROJECT_ROOT" || exit 1

# Determine the Inngest serve URL (default to production port)
# This should point to your Next.js app's Inngest API endpoint | Production Port is 3051 which is setup in ecosystem.config.cjs
INNGEST_SERVE_URL="${INNGEST_SERVE_URL:-http://localhost:3051/api/inngest}"

# Determine which inngest CLI command to use
# For self-hosting, we need @inngest/cli (not just inngest SDK)
INNGEST_CMD=""

# Check for pnpm first (preferred for pnpm projects)
if command -v pnpm >/dev/null 2>&1; then
  # Use @inngest/cli package
  INNGEST_CMD="pnpm exec @inngest/cli"
  echo "Using pnpm exec @inngest/cli"
# Check for npx (works with npm/pnpm/yarn)
elif command -v npx >/dev/null 2>&1; then
  INNGEST_CMD="npx @inngest/cli"
  echo "Using npx @inngest/cli"
# Check for direct binary in node_modules (fallback)
elif [ -f "$PROJECT_ROOT/node_modules/.bin/inngest" ]; then
  INNGEST_CMD="$PROJECT_ROOT/node_modules/.bin/inngest"
  echo "Using local inngest binary"
else
  echo "Error: @inngest/cli not found. Please install it: pnpm add -D @inngest/cli"
  exit 1
fi

# Start Inngest Dev Server (self-hosted mode)
# The serve URL points to your Next.js app's Inngest endpoint
# For self-hosting, use 'dev' command with --serve flag
exec $INNGEST_CMD dev \
  --event-key "$INNGEST_EVENT_KEY" \
  --signing-key "$INNGEST_SIGNING_KEY" \
  --serve "$INNGEST_SERVE_URL"

