#!/bin/bash
#
# Mantrix Unified Development Environment Stopper
# ================================================
# Stops all development services: Docker (databases), Backend (FastAPI), Frontend (Vite)
#
# Usage:
#   ./stop_dev.sh              # Stop all services
#   ./stop_dev.sh --no-docker  # Keep Docker services running
#   ./stop_dev.sh --backend    # Stop backend only
#   ./stop_dev.sh --frontend   # Stop frontend only
#   ./stop_dev.sh --docker     # Stop Docker services only
#   ./stop_dev.sh --force      # Force kill all processes on ports 8000 and 5173
#

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# PID files for tracking processes
PID_DIR="${PROJECT_ROOT}/.dev_pids"
BACKEND_PID_FILE="${PID_DIR}/backend.pid"
FRONTEND_PID_FILE="${PID_DIR}/frontend.pid"

# Default options
STOP_DOCKER=true
STOP_BACKEND=true
STOP_FRONTEND=true
FORCE_KILL=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --no-docker)
            STOP_DOCKER=false
            shift
            ;;
        --backend)
            STOP_DOCKER=false
            STOP_FRONTEND=false
            shift
            ;;
        --frontend)
            STOP_DOCKER=false
            STOP_BACKEND=false
            shift
            ;;
        --docker)
            STOP_BACKEND=false
            STOP_FRONTEND=false
            shift
            ;;
        --force)
            FORCE_KILL=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --no-docker    Keep Docker services running"
            echo "  --backend      Stop backend only"
            echo "  --frontend     Stop frontend only"
            echo "  --docker       Stop Docker services only"
            echo "  --force        Force kill all processes on ports 8000 and 5173"
            echo "  -h, --help     Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${CYAN}"
echo "============================================================="
echo "      STOPPING MANTRIX DEVELOPMENT ENVIRONMENT               "
echo "============================================================="
echo -e "${NC}"

# Function to kill process by PID file
kill_by_pid_file() {
    local pid_file=$1
    local name=$2

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "  Stopping ${name} (PID: ${pid})..."
            kill "$pid" 2>/dev/null
            sleep 1
            # Force kill if still running
            if kill -0 "$pid" 2>/dev/null; then
                kill -9 "$pid" 2>/dev/null
            fi
            echo -e "  ${GREEN}${name} stopped${NC}"
        else
            echo -e "  ${YELLOW}${name} already stopped (stale PID file)${NC}"
        fi
        rm -f "$pid_file"
    else
        echo -e "  ${YELLOW}No PID file found for ${name}${NC}"
    fi
}

# Function to kill process by port
kill_by_port() {
    local port=$1
    local name=$2

    local pids=$(lsof -ti :${port} 2>/dev/null)
    if [ -n "$pids" ]; then
        echo -e "  Killing processes on port ${port} (${name})..."
        echo "$pids" | while read pid; do
            if [ -n "$pid" ]; then
                kill "$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null
                echo -e "    Killed PID: ${pid}"
            fi
        done
        echo -e "  ${GREEN}${name} stopped${NC}"
    else
        echo -e "  ${YELLOW}No process running on port ${port} (${name})${NC}"
    fi
}

# ============================================================
# Stop Backend
# ============================================================
if [ "$STOP_BACKEND" = true ]; then
    echo -e "\n${BLUE}[1/3] Stopping Backend...${NC}"

    if [ "$FORCE_KILL" = true ]; then
        kill_by_port 8000 "Backend API"
    else
        kill_by_pid_file "$BACKEND_PID_FILE" "Backend API"
        # Also try port-based kill as backup
        kill_by_port 8000 "Backend API"
    fi
else
    echo -e "\n${YELLOW}[1/3] Skipping Backend${NC}"
fi

# ============================================================
# Stop Frontend
# ============================================================
if [ "$STOP_FRONTEND" = true ]; then
    echo -e "\n${BLUE}[2/3] Stopping Frontend...${NC}"

    if [ "$FORCE_KILL" = true ]; then
        kill_by_port 5173 "Frontend Vite"
    else
        kill_by_pid_file "$FRONTEND_PID_FILE" "Frontend Vite"
        # Also try port-based kill as backup
        kill_by_port 5173 "Frontend Vite"
    fi

    # Also kill any stray node processes from Vite
    pkill -f "vite" 2>/dev/null && echo -e "  Killed stray Vite processes" || true
else
    echo -e "\n${YELLOW}[2/3] Skipping Frontend${NC}"
fi

# ============================================================
# Stop Docker Services
# ============================================================
if [ "$STOP_DOCKER" = true ]; then
    echo -e "\n${BLUE}[3/3] Stopping Docker Services...${NC}"

    # Check if Docker is running
    if docker info >/dev/null 2>&1; then
        cd "${PROJECT_ROOT}"

        # Stop docker-compose services
        echo -e "  Stopping containers..."
        docker-compose stop redis mongodb weaviate neo4j postgres fuseki 2>&1 | while read line; do
            echo "    $line"
        done

        echo -e "  ${GREEN}Docker services stopped${NC}"
        echo -e ""
        echo -e "  ${YELLOW}Note: Containers are stopped but not removed.${NC}"
        echo -e "  ${YELLOW}Data persists in Docker volumes.${NC}"
        echo -e "  ${YELLOW}To remove containers: docker-compose down${NC}"
        echo -e "  ${YELLOW}To remove all data: docker-compose down -v${NC}"
    else
        echo -e "  ${YELLOW}Docker is not running${NC}"
    fi
else
    echo -e "\n${YELLOW}[3/3] Keeping Docker Services running${NC}"
fi

# ============================================================
# Clean up PID directory
# ============================================================
if [ -d "$PID_DIR" ]; then
    rm -rf "$PID_DIR"
fi

# ============================================================
# Summary
# ============================================================
echo -e "\n${GREEN}"
echo "============================================================="
echo "           DEVELOPMENT ENVIRONMENT STOPPED                   "
echo "============================================================="
if [ "$STOP_BACKEND" = true ]; then
echo "  Backend API:  stopped                                      "
fi
if [ "$STOP_FRONTEND" = true ]; then
echo "  Frontend:     stopped                                      "
fi
if [ "$STOP_DOCKER" = true ]; then
echo "  Docker:       containers stopped (data preserved)          "
fi
echo "-------------------------------------------------------------"
echo "  To restart: ./start_dev.sh                                 "
echo "============================================================="
echo -e "${NC}"
