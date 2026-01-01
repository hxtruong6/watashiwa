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

# Start Inngest with the keys
exec inngest start --event-key "$INNGEST_EVENT_KEY" --signing-key "$INNGEST_SIGNING_KEY"

