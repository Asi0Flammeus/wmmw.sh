#!/bin/bash
set -e

# ==============================================================================
# wmmw.sh Deployment Script (Docker Compose)
# Containerized: Astro node-standalone app via docker compose
#
# nginx vhost routes wmmw.sh -> localhost:4327 (TLS via certbot)
#
# Usage:
#   ./deploy.sh              # First deploy (creates .env.prod, builds, starts)
#   ./deploy.sh update       # Pull latest code, rebuild & restart
#   ./deploy.sh status       # Show service status
#   ./deploy.sh logs         # Tail container logs
#   ./deploy.sh rollback     # Restore previous image
#   ./deploy.sh down         # Stop all containers
# ==============================================================================

# Configuration
DOMAIN="wmmw.sh"
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT=4327            # host-published port (nginx vhost -> localhost:4327)
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env.prod"
SERVICE="wmmw"       # docker compose service name
# Prefer docker compose v2 plugin, fall back to docker-compose v1
if docker compose version &> /dev/null; then
    COMPOSE="docker compose -f $COMPOSE_FILE --env-file $ENV_FILE"
else
    COMPOSE="docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE"
fi

# --- TUI: Colors & Symbols --------------------------------------------------

if [[ -n "$NO_COLOR" || "$TERM" == "dumb" ]]; then
    ORANGE="" GREEN="" YELLOW="" RED="" CYAN="" DIM="" BOLD="" RESET=""
    SYM_OK="ok" SYM_FAIL="!!" SYM_WARN="--" SYM_DOT="*"
    SYM_SPIN=("-" "\\" "|" "/")
    BOX_TL="+" BOX_TR="+" BOX_BL="+" BOX_BR="+"
    BOX_H="-" BOX_V="|"
    TREE_MID="|--" TREE_END="\`--"
else
    ORANGE='\033[38;2;218;112;44m'
    GREEN='\033[38;2;135;154;57m'
    YELLOW='\033[38;2;208;162;21m'
    RED='\033[38;2;209;77;65m'
    CYAN='\033[38;2;58;169;159m'
    DIM='\033[2m'
    BOLD='\033[1m'
    RESET='\033[0m'
    SYM_OK="OK" SYM_FAIL="X" SYM_WARN="!" SYM_DOT="*"
    SYM_SPIN=("|" "/" "-" "\\")
    BOX_TL="+" BOX_TR="+" BOX_BL="+" BOX_BR="+"
    BOX_H="-" BOX_V="|"
    TREE_MID="|-" TREE_END="\`-"
fi

TOTAL_START=$SECONDS
STEP_NUM=0
STEP_START=0
SPINNER_PID=""

# --- TUI: Helper Functions --------------------------------------------------

header() {
    local text="* ${DOMAIN} $1"
    local width=42
    local pad=$(( (width - ${#text}) / 2 ))
    local lpad="" rpad=""
    for ((i=0; i<pad; i++)); do lpad+=" "; done
    for ((i=0; i<width - ${#text} - pad; i++)); do rpad+=" "; done

    local line=""
    for ((i=0; i<width; i++)); do line+="$BOX_H"; done

    echo ""
    echo -e "  ${DIM}${BOX_TL}${line}${BOX_TR}${RESET}"
    echo -e "  ${DIM}${BOX_V}${RESET}$(printf '%*s' $((width)) '')${DIM}${BOX_V}${RESET}"
    echo -e "  ${DIM}${BOX_V}${RESET}${lpad}${ORANGE}${BOLD}${text}${RESET}${rpad}${DIM}${BOX_V}${RESET}"
    echo -e "  ${DIM}${BOX_V}${RESET}$(printf '%*s' $((width)) '')${DIM}${BOX_V}${RESET}"
    echo -e "  ${DIM}${BOX_BL}${line}${BOX_BR}${RESET}"
    echo ""
}

spin_start() {
    if [[ -n "$NO_COLOR" || "$TERM" == "dumb" ]]; then return; fi
    spin_stop 2>/dev/null || true
    local _step="$STEP_NUM" _msg="$1"
    (
        local i=0
        while true; do
            printf "\r  \033[2m%2d\033[0m  \033[38;2;58;169;159m%s\033[0m  %-40s" "$_step" "${SYM_SPIN[$((i % 4))]}" "$_msg"
            i=$((i + 1))
            sleep 0.1
        done
    ) &
    SPINNER_PID=$!
    disown "$SPINNER_PID" 2>/dev/null
}

spin_stop() {
    if [[ -n "$SPINNER_PID" ]]; then
        kill "$SPINNER_PID" 2>/dev/null
        wait "$SPINNER_PID" 2>/dev/null || true
        SPINNER_PID=""
        printf "\r"
    fi
}

step_start() {
    STEP_NUM=$1
    STEP_START=$SECONDS
    shift
    local msg="$*"
    spin_start "$msg"
}

step_done() {
    spin_stop
    local elapsed=$(( SECONDS - STEP_START ))
    local msg="$1"
    local time_str=""
    if [[ $elapsed -gt 0 ]]; then
        time_str="${DIM}${elapsed}s${RESET}"
    fi
    echo -e "$(printf "  ${DIM}%2d${RESET}  ${GREEN}${SYM_DOT}${RESET}  %-40s" "$STEP_NUM" "$msg") ${time_str}"
}

step_ok() {
    spin_stop
    local msg="$1"
    echo -e "$(printf "  ${DIM}%2d${RESET}  ${GREEN}${SYM_DOT}${RESET}  %-40s" "$STEP_NUM" "$msg") ${GREEN}${SYM_OK}${RESET}"
}

step_fail() {
    spin_stop
    local msg="$1"
    echo -e "$(printf "  ${DIM}%2d${RESET}  ${RED}${SYM_DOT}${RESET}  %-40s" "$STEP_NUM" "$msg") ${RED}${SYM_FAIL}${RESET}"
    echo ""
    echo -e "  ${RED}${BOLD}Deploy failed:${RESET} $msg"
    echo ""
    exit 1
}

step_warn() {
    spin_stop
    local msg="$1"
    echo -e "$(printf "  ${DIM}%2d${RESET}  ${YELLOW}${SYM_DOT}${RESET}  %-40s" "$STEP_NUM" "$msg") ${YELLOW}${SYM_WARN}${RESET}"
}

substep() {
    local msg="$1"
    local is_last="${2:-}"
    local prefix="$TREE_MID"
    if [[ "$is_last" == "last" ]]; then
        prefix="$TREE_END"
    fi
    echo -e "         ${DIM}${prefix}${RESET} ${msg}"
}

footer_done() {
    local total=$(( SECONDS - TOTAL_START ))
    echo ""
    echo -e "  ${GREEN}${SYM_OK}${RESET}  ${BOLD}Deploy complete${RESET}  ${DIM}${total}s${RESET}"
}

footer_commands() {
    local line=""
    for ((i=0; i<42; i++)); do line+="$BOX_H"; done

    echo ""
    echo -e "  ${DIM}${BOX_TL}${line}${BOX_TR}${RESET}"
    echo -e "  ${DIM}${BOX_V}${RESET}  ${DIM}update${RESET}     ./deploy.sh update              ${DIM}${BOX_V}${RESET}"
    echo -e "  ${DIM}${BOX_V}${RESET}  ${DIM}status${RESET}     ./deploy.sh status              ${DIM}${BOX_V}${RESET}"
    echo -e "  ${DIM}${BOX_V}${RESET}  ${DIM}logs${RESET}       ./deploy.sh logs                ${DIM}${BOX_V}${RESET}"
    echo -e "  ${DIM}${BOX_V}${RESET}  ${DIM}rollback${RESET}   ./deploy.sh rollback            ${DIM}${BOX_V}${RESET}"
    echo -e "  ${DIM}${BOX_V}${RESET}  ${DIM}down${RESET}       ./deploy.sh down                ${DIM}${BOX_V}${RESET}"
    echo -e "  ${DIM}${BOX_BL}${line}${BOX_BR}${RESET}"
    echo ""
}

status_line() {
    local color="$1" label="$2" value="$3" detail="$4"
    echo -e "  ${color}${SYM_DOT}${RESET}  $(printf "%-10s" "$label") ${BOLD}${value}${RESET}  ${DIM}(${detail})${RESET}"
}

# --- Cleanup on exit --------------------------------------------------------

cleanup() {
    spin_stop
}
trap cleanup EXIT

# ==============================================================================
# Helpers
# ==============================================================================

check_docker() {
    if ! command -v docker &> /dev/null; then
        step_fail "Docker is not installed"
    fi
    if ! docker compose version &> /dev/null && ! docker-compose version &> /dev/null; then
        step_fail "Docker Compose is not available"
    fi
    step_ok "Docker $(docker --version | grep -oP '\d+\.\d+\.\d+')"
}

# ==============================================================================
# Environment File Setup (first deploy only)
# ==============================================================================

setup_env() {
    if [[ -f "$APP_DIR/$ENV_FILE" ]]; then
        step_ok "Environment file loaded"
        return
    fi

    # wmmw.sh v1 has no build-time or runtime secrets: content is in-repo and the
    # contact link is the GitHub profile. The env file just pins the node runtime.
    cat > "$APP_DIR/$ENV_FILE" <<ENVEOF
# ==============================================================================
# wmmw.sh -- Production Environment
# Generated by deploy.sh on $(date -Iseconds)
# DO NOT COMMIT THIS FILE
# ==============================================================================

# Astro node standalone runtime
NODE_ENV=production
HOST=0.0.0.0
# Container-internal port; docker-compose publishes it on host ${PORT}.
PORT=4321
ENVEOF

    chmod 600 "$APP_DIR/$ENV_FILE"
    step_done "$ENV_FILE created"
}

# Build with .env.prod values exported so Astro/Vite pick them up. Run in a
# subshell: .env.prod sets PORT=4321 (container-internal); sourcing it in the
# parent would clobber the script's PORT (4327, host-published) used by health
# checks. The subshell keeps that pollution local to the build.
build_image() {
    (
        set -a
        # shellcheck disable=SC1090
        source "$APP_DIR/$ENV_FILE"
        set +a
        $COMPOSE build --pull
    )
}

# ==============================================================================
# Subcommands
# ==============================================================================

cmd_status() {
    header "status"
    cd "$APP_DIR"

    local app_state
    app_state=$($COMPOSE ps --format '{{.State}}' "$SERVICE" 2>/dev/null || echo "stopped")

    if [[ "$app_state" == "running" ]]; then
        status_line "$GREEN" "App" "running" "$SERVICE"
    else
        status_line "$RED" "App" "$app_state" "$SERVICE"
    fi

    # Local health check
    local response
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${PORT}/" 2>/dev/null || echo "000")
    if [[ "$response" == "200" ]]; then
        status_line "$GREEN" "Local" "HTTP ${response}" "127.0.0.1:${PORT}"
    elif [[ "$response" == "000" ]]; then
        status_line "$RED" "Local" "down" "127.0.0.1:${PORT}"
    else
        status_line "$YELLOW" "Local" "HTTP ${response}" "127.0.0.1:${PORT}"
    fi

    # Public health check
    local public_response
    public_response=$(curl -s -o /dev/null -w "%{http_code}" "https://${DOMAIN}/" 2>/dev/null || echo "000")
    if [[ "$public_response" == "200" ]]; then
        status_line "$GREEN" "Public" "HTTP ${public_response}" "$DOMAIN"
    elif [[ "$public_response" == "000" ]]; then
        status_line "$RED" "Public" "unreachable" "$DOMAIN"
    else
        status_line "$YELLOW" "Public" "HTTP ${public_response}" "$DOMAIN"
    fi

    echo ""
}

cmd_logs() {
    cd "$APP_DIR"
    if [[ -n "${2:-}" ]]; then
        $COMPOSE logs -f "$2"
    else
        $COMPOSE logs -f
    fi
}

cmd_down() {
    header "down"
    cd "$APP_DIR"
    $COMPOSE down
    echo -e "  ${GREEN}${SYM_OK}${RESET}  ${BOLD}Containers stopped${RESET}"
    echo ""
}

cmd_update() {
    header "update"
    cd "$APP_DIR"

    # Step 1: Check env
    STEP_NUM=1
    if [[ ! -f "$APP_DIR/$ENV_FILE" ]]; then
        step_fail "No $ENV_FILE found -- run ./deploy.sh first"
    fi
    step_ok "Environment loaded"

    # Step 2: Pull latest code
    STEP_NUM=2
    step_start 2 "Pulling latest changes..."
    local before_hash after_hash
    before_hash=$(git -C "$APP_DIR" rev-parse HEAD 2>/dev/null || echo "unknown")
    if git -C "$APP_DIR" pull --ff-only 2>&1; then
        after_hash=$(git -C "$APP_DIR" rev-parse HEAD 2>/dev/null || echo "unknown")
        if [[ "$before_hash" == "$after_hash" ]]; then
            step_done "Already up to date"
        else
            local short_before short_after
            short_before=${before_hash:0:7}
            short_after=${after_hash:0:7}
            step_done "Updated ${short_before} to ${short_after}"
            local commits
            commits=$(git -C "$APP_DIR" log --oneline "${before_hash}..${after_hash}" 2>/dev/null | head -5)
            while IFS= read -r line; do
                [[ -n "$line" ]] && substep "$line"
            done <<< "$commits"
        fi
    else
        step_fail "Git pull failed -- resolve conflicts manually"
    fi

    # Step 3: Tag previous image for rollback
    STEP_NUM=3
    step_start 3 "Preserving previous image..."
    local prev_id
    prev_id=$($COMPOSE images "$SERVICE" -q 2>/dev/null || true)
    if [[ -n "$prev_id" ]]; then
        docker tag "$prev_id" "wmmw:prev" 2>/dev/null || true
        step_done "Previous image tagged"
    else
        step_ok "No previous image"
    fi

    # Step 4: Rebuild
    STEP_NUM=4
    step_start 4 "Building new image..."
    if ! build_image 2>&1; then
        step_fail "Docker build failed -- previous version still running"
    fi
    step_done "Image rebuilt"

    # Step 5: Restart with new image
    STEP_NUM=5
    step_start 5 "Restarting app..."
    $COMPOSE up -d --no-deps "$SERVICE" 2>&1
    step_done "App container restarted"

    # Step 6: Health check
    STEP_NUM=6
    step_start 6 "Waiting for app..."
    local retries=0
    while [[ $retries -lt 30 ]]; do
        local response
        response=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${PORT}/" 2>/dev/null || echo "000")
        if [[ "$response" != "000" ]]; then
            step_done "App responding on :${PORT} (HTTP ${response})"
            break
        fi
        retries=$((retries + 1))
        sleep 2
    done
    if [[ $retries -ge 30 ]]; then
        step_warn "App not responding -- run: ./deploy.sh rollback"
    fi

    # Step 7: Cleanup dangling images
    STEP_NUM=7
    local dangling
    dangling=$(docker images -f "dangling=true" -q 2>/dev/null | wc -l)
    if [[ $dangling -gt 0 ]]; then
        docker image prune -f > /dev/null 2>&1
        step_ok "Cleaned ${dangling} dangling image(s)"
    else
        step_ok "No cleanup needed"
    fi

    footer_done
    footer_commands
}

cmd_rollback() {
    header "rollback"
    cd "$APP_DIR"

    local prev_image
    prev_image=$(docker images --format '{{.Repository}}:{{.Tag}}' | grep "^wmmw:prev$" || true)

    if [[ -z "$prev_image" ]]; then
        step_fail "No previous image found. Nothing to roll back to."
    fi

    STEP_NUM=1
    step_start 1 "Tagging current image as rollback..."
    local current_image
    current_image=$($COMPOSE images "$SERVICE" -q 2>/dev/null || true)
    if [[ -n "$current_image" ]]; then
        docker tag "$current_image" "wmmw:rollback-$(date +%s)" 2>/dev/null || true
    fi
    step_done "Current image tagged"

    STEP_NUM=2
    step_start 2 "Restarting with previous build..."
    $COMPOSE up -d --no-build
    step_done "Rollback complete"

    footer_done
    echo ""
}

# ==============================================================================
# Main Deploy
# ==============================================================================

main() {
    header "deploy"
    cd "$APP_DIR"

    # Step 1: Check Docker
    STEP_NUM=1; check_docker

    # Step 2: Setup .env.prod
    STEP_NUM=2; setup_env

    # Step 3: Pull latest code
    STEP_NUM=3
    if [[ -d "$APP_DIR/.git" ]]; then
        step_start 3 "Pulling latest changes..."
        if git -C "$APP_DIR" pull --ff-only 2>&1; then
            step_done "Git pull complete"
        else
            step_warn "Git pull failed -- continuing with current code"
        fi
    else
        step_ok "Local source (no git)"
    fi

    # Step 4: Tag previous image for rollback
    STEP_NUM=4
    step_start 4 "Preserving previous image..."
    local prev_id
    prev_id=$($COMPOSE images "$SERVICE" -q 2>/dev/null || true)
    if [[ -n "$prev_id" ]]; then
        docker tag "$prev_id" "wmmw:prev" 2>/dev/null || true
        step_done "Previous image tagged"
    else
        step_ok "First deploy (no previous image)"
    fi

    # Step 5: Build
    STEP_NUM=5
    step_start 5 "Building Docker image..."
    if ! build_image 2>&1; then
        step_fail "Docker build failed"
    fi
    step_done "Docker image built"

    # Step 6: Start containers
    STEP_NUM=6
    step_start 6 "Starting containers..."
    $COMPOSE up -d
    step_done "Containers started"

    # Step 7: Wait for app to be healthy
    STEP_NUM=7
    step_start 7 "Waiting for app..."
    local retries=0
    while [[ $retries -lt 30 ]]; do
        local response
        response=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${PORT}/" 2>/dev/null || echo "000")
        if [[ "$response" != "000" ]]; then
            step_done "App responding on :${PORT} (HTTP ${response})"
            break
        fi
        retries=$((retries + 1))
        sleep 2
    done
    if [[ $retries -ge 30 ]]; then
        step_warn "App not yet responding -- check logs: ./deploy.sh logs"
    fi

    footer_done
    footer_commands
}

# Route subcommands
case "${1:-deploy}" in
    status)   cmd_status ;;
    logs)     cmd_logs "$@" ;;
    update)   cmd_update ;;
    rollback) cmd_rollback ;;
    down)     cmd_down ;;
    deploy|"") main ;;
    *)        echo "Usage: $0 {deploy|update|status|logs|rollback|down}"; exit 1 ;;
esac
