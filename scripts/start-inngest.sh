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

# Determine which inngest command to use
# Prefer local installation (from node_modules/.bin), fallback to global
INNGEST_CMD=""

# Check for local installation first
if [ -f "$PROJECT_ROOT/node_modules/.bin/inngest" ]; then
  INNGEST_CMD="$PROJECT_ROOT/node_modules/.bin/inngest"
  echo "Using local inngest installation"
elif command -v inngest >/dev/null 2>&1; then
  INNGEST_CMD="inngest"
  echo "Using global inngest installation"
else
  echo "Error: inngest not found. Please install it locally (pnpm install) or globally."
  exit 1
fi

# Start Inngest with the keys
exec "$INNGEST_CMD" start --event-key "$INNGEST_EVENT_KEY" --signing-key "$INNGEST_SIGNING_KEY"

