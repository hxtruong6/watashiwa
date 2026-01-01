#!/bin/bash

# Inngest Start Script for PM2
# This script loads environment variables from .env and starts the Inngest server
# Used by PM2 ecosystem.config.cjs

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Colors for output (optional, helps with debugging)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the project root directory (parent of scripts/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Change to project root to ensure .env is found
cd "$PROJECT_ROOT"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >&2
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*" >&2
}

log_info() {
    echo -e "${GREEN}[INFO]${NC} $*" >&2
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $*" >&2
}

# Load environment variables from .env file if it exists
if [ -f "$PROJECT_ROOT/.env" ]; then
    log_info "Loading environment variables from .env"
    # Use a safe method to load .env (handles comments and empty lines)
    set -a
    source "$PROJECT_ROOT/.env"
    set +a
else
    log_warn ".env file not found at $PROJECT_ROOT/.env"
    log_warn "Continuing with system environment variables only"
fi

# Validate required environment variables
REQUIRED_VARS=("INNGEST_EVENT_KEY" "INNGEST_SIGNING_KEY")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var:-}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    log_error "Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        log_error "  - $var"
    done
    log_error ""
    log_error "Please set these in your .env file or environment:"
    log_error "  INNGEST_EVENT_KEY=<your-event-key>"
    log_error "  INNGEST_SIGNING_KEY=<your-signing-key>"
    exit 1
fi

# Validate key format (should be hex strings)
if ! [[ "$INNGEST_EVENT_KEY" =~ ^[0-9a-fA-F]{64}$ ]]; then
    log_error "INNGEST_EVENT_KEY must be a 64-character hexadecimal string"
    log_error "Generate one with: openssl rand -hex 32"
    exit 1
fi

if ! [[ "$INNGEST_SIGNING_KEY" =~ ^[0-9a-fA-F]{64}$ ]]; then
    log_error "INNGEST_SIGNING_KEY must be a 64-character hexadecimal string"
    log_error "Generate one with: openssl rand -hex 32"
    exit 1
fi

# Check if inngest-cli is available
if command -v inngest &> /dev/null; then
    INNGEST_CMD="inngest"
    log_info "Using global inngest-cli installation"
elif command -v npx &> /dev/null; then
    INNGEST_CMD="npx -y inngest-cli@latest"
    log_info "Using npx to run inngest-cli"
else
    log_error "Neither 'inngest' nor 'npx' found in PATH"
    log_error "Please install inngest-cli: npm install -g inngest-cli"
    exit 1
fi

# Set default port if not specified
INNGEST_PORT="${INNGEST_PORT:-8288}"

# Log startup information (without exposing keys)
log_info "Starting Inngest server..."
log_info "  Port: ${INNGEST_PORT}"
log_info "  App ID: ${INNGEST_APP_ID:-watashiwa-app}"
log_info "  Event Key: ${INNGEST_EVENT_KEY:0:8}...${INNGEST_EVENT_KEY: -8} (masked)"
log_info "  Signing Key: ${INNGEST_SIGNING_KEY:0:8}...${INNGEST_SIGNING_KEY: -8} (masked)"

# Start Inngest server
# PM2 will handle process management, so we exec to replace the shell process
exec $INNGEST_CMD start \
    --event-key "$INNGEST_EVENT_KEY" \
    --signing-key "$INNGEST_SIGNING_KEY" \
    ${INNGEST_PORT:+--port "$INNGEST_PORT"}

