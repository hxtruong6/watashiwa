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

# Health check function
# This checks if Inngest is already running and healthy before starting a new instance.
# If the service is healthy, we exit with code 0, which tells PM2 the script completed successfully.
# Note: PM2 with autorestart=true will restart processes that exit, but since we're checking
# before starting, this prevents duplicate instances when the script is run manually or during
# PM2's initial startup. PM2's process management will handle the actual process lifecycle.
check_inngest_health() {
    local port=$1
    local health_endpoint="${INNGEST_HEALTH_ENDPOINT:-/api/v1/status}"
    local health_url="http://localhost:${port}${health_endpoint}"
    local check_timeout="${INNGEST_HEALTH_TIMEOUT:-3}"
    
    # First, check if port is listening
    local port_in_use=false
    if command -v lsof &> /dev/null; then
        if lsof -i ":${port}" &> /dev/null; then
            port_in_use=true
        fi
    elif command -v ss &> /dev/null; then
        if ss -lnt 2>/dev/null | grep -q ":${port} "; then
            port_in_use=true
        fi
    elif command -v netstat &> /dev/null; then
        if netstat -lnt 2>/dev/null | grep -q ":${port} "; then
            port_in_use=true
        fi
    else
        # If we can't check port, assume it's not running
        log_warn "Cannot check port status (lsof/ss/netstat not available), proceeding to start"
        return 1
    fi
    
    if [ "$port_in_use" = false ]; then
        log_info "Port ${port} is not in use"
        return 1
    fi
    
    log_info "Port ${port} is in use, checking health endpoint..."
    
    # Try to check health endpoint (with timeout)
    # Try multiple common endpoints if the configured one fails
    local health_endpoints=("${health_url}")
    
    # Add fallback endpoints if the primary one is not the default
    if [ "$health_endpoint" != "/api/v1/status" ]; then
        health_endpoints+=("http://localhost:${port}/api/v1/status")
    fi
    health_endpoints+=("http://localhost:${port}/health")
    health_endpoints+=("http://localhost:${port}/api/health")
    
    local health_check_passed=false
    if command -v curl &> /dev/null; then
        for endpoint in "${health_endpoints[@]}"; do
            if curl -sf --max-time "${check_timeout}" "${endpoint}" &> /dev/null; then
                log_info "Inngest health check passed at ${endpoint} - service is healthy"
                health_check_passed=true
                break
            fi
        done
    elif command -v wget &> /dev/null; then
        for endpoint in "${health_endpoints[@]}"; do
            if wget -q --spider --timeout="${check_timeout}" "${endpoint}" &> /dev/null; then
                log_info "Inngest health check passed at ${endpoint} - service is healthy"
                health_check_passed=true
                break
            fi
        done
    else
        # If curl/wget not available, just check if port is listening
        log_info "Health check tools not available, but port is listening - assuming healthy"
        health_check_passed=true
    fi
    
    if [ "$health_check_passed" = true ]; then
        return 0
    fi
    
    log_warn "Port ${port} is in use but health check failed - will restart"
    return 1
}

# Check if Inngest is already running and healthy
# Flow:
# 1. If healthy: Enter monitoring loop (never reaches exec in this run)
# 2. If unhealthy: Skip this block, proceed to exec command below
# 3. If monitoring detects failure: Exit with error → PM2 restarts → health check fails → exec runs
if check_inngest_health "$INNGEST_PORT"; then
    log_info "Inngest is already running and healthy on port ${INNGEST_PORT}"
    log_info "Keeping process alive for PM2 - no restart needed"
    # Keep the process alive so PM2 doesn't restart it
    # This is a lightweight way to satisfy PM2's process management
    # Memory footprint: ~2-8 MB (bash process + sleep + occasional health check commands)
    # Health check commands (lsof/ss/curl) run briefly and exit, so no memory accumulation
    # If health fails during monitoring, we exit to allow PM2 to restart the script,
    # which will then execute the exec command below (since health check will fail)
    while true; do
        sleep 60
        # Re-check health every minute
        # Note: To monitor memory usage: pm2 monit or ps aux | grep start-inngest.sh
        if ! check_inngest_health "$INNGEST_PORT" &> /dev/null; then
            log_warn "Inngest health check failed - exiting to allow PM2 to restart"
            log_warn "On restart, health check will fail and exec command will run to start Inngest"
            exit 1
        fi
    done
    # Note: The above while loop runs indefinitely, so code below never executes
    # If health fails, we exit 1 above, causing PM2 to restart the script
fi

# This code executes when:
# 1. Initial startup: Service is not running/healthy → Start it
# 2. After monitoring failure: PM2 restarted script → Health check failed → Start it
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

