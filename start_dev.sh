#!/bin/bash
#
# Mantrix Unified Development Environment Starter
# ================================================
# Starts all development services: Docker (databases), Backend (FastAPI), Frontend (Vite)
#
# Usage:
#   ./start_dev.sh              # Start all services
#   ./start_dev.sh --no-docker  # Skip Docker services (if already running)
#   ./start_dev.sh --backend    # Start backend only
#   ./start_dev.sh --frontend   # Start frontend only
#   ./start_dev.sh --docker     # Start Docker services only
#
# Services:
#   - Docker: Redis, MongoDB, Weaviate, Neo4j, PostgreSQL, Fuseki
#   - Backend: FastAPI (uvicorn) on port 8000
#   - Frontend: Vite dev server on port 5173
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${PROJECT_ROOT}/backend"
FRONTEND_DIR="${PROJECT_ROOT}/frontend"
LOG_DIR="${PROJECT_ROOT}/logs"

# PID files for tracking processes
PID_DIR="${PROJECT_ROOT}/.dev_pids"
BACKEND_PID_FILE="${PID_DIR}/backend.pid"
FRONTEND_PID_FILE="${PID_DIR}/frontend.pid"

# Log files
mkdir -p "${LOG_DIR}"
BACKEND_LOG="${LOG_DIR}/backend.log"
FRONTEND_LOG="${LOG_DIR}/frontend.log"

# Default options
START_DOCKER=true
START_BACKEND=true
START_FRONTEND=true

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --no-docker)
            START_DOCKER=false
            shift
            ;;
        --backend)
            START_DOCKER=false
            START_FRONTEND=false
            shift
            ;;
        --frontend)
            START_DOCKER=false
            START_BACKEND=false
            shift
            ;;
        --docker)
            START_BACKEND=false
            START_FRONTEND=false
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --no-docker    Skip Docker services (if already running)"
            echo "  --backend      Start backend only"
            echo "  --frontend     Start frontend only"
            echo "  --docker       Start Docker services only"
            echo "  -h, --help     Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Create PID directory
mkdir -p "${PID_DIR}"

echo -e "${CYAN}"
echo "============================================================="
echo "         MANTRIX UNIFIED DEVELOPMENT ENVIRONMENT             "
echo "============================================================="
echo "  Backend:  http://localhost:8000                            "
echo "  Frontend: http://localhost:5173                            "
echo "  API Docs: http://localhost:8000/docs                       "
echo "============================================================="
echo -e "${NC}"

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi ":${port}" -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to wait for a service to be ready
wait_for_service() {
    local name=$1
    local url=$2
    local max_attempts=${3:-30}
    local attempt=1

    echo -n "  Waiting for ${name}..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo -e " ${GREEN}ready${NC}"
            return 0
        fi
        sleep 1
        attempt=$((attempt + 1))
        echo -n "."
    done
    echo -e " ${RED}timeout${NC}"
    return 1
}

# ============================================================
# Start Docker Services
# ============================================================
if [ "$START_DOCKER" = true ]; then
    echo -e "\n${BLUE}[1/3] Starting Docker Services...${NC}"

    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        echo -e "${YELLOW}  Docker is not running. Starting Docker...${NC}"
        open -a Docker

        # Wait for Docker to start
        echo -n "  Waiting for Docker..."
        for i in {1..60}; do
            if docker info >/dev/null 2>&1; then
                echo -e " ${GREEN}ready${NC}"
                break
            fi
            sleep 2
            echo -n "."
        done

        if ! docker info >/dev/null 2>&1; then
            echo -e "\n${RED}  Docker failed to start. Please start Docker manually.${NC}"
            exit 1
        fi
    else
        echo -e "  Docker is already running ${GREEN}OK${NC}"
    fi

    # Start docker-compose services (excluding api and nginx)
    echo -e "  Starting database services..."
    cd "${PROJECT_ROOT}"

    # Start specific services needed for development
    docker-compose up -d redis mongodb weaviate neo4j postgres fuseki 2>&1 | while read line; do
        echo "    $line"
    done

    echo -e "  ${GREEN}Docker services started${NC}"

    # Wait for key services
    echo -e "\n  Checking service health..."
    wait_for_service "Redis" "http://localhost:6379" 10 2>/dev/null || true
    wait_for_service "MongoDB" "http://localhost:27017" 10 2>/dev/null || true
    wait_for_service "Weaviate" "http://localhost:8082/v1/.well-known/ready" 30 || true
else
    echo -e "\n${YELLOW}[1/3] Skipping Docker Services${NC}"
fi

# ============================================================
# Start Backend (FastAPI with Uvicorn)
# ============================================================
if [ "$START_BACKEND" = true ]; then
    echo -e "\n${BLUE}[2/3] Starting Backend (FastAPI)...${NC}"

    # Check if backend is already running
    if check_port 8000; then
        echo -e "  ${YELLOW}Backend already running on port 8000${NC}"
    else
        cd "${BACKEND_DIR}"

        # Check for virtual environment
        if [ ! -d "venv" ]; then
            echo -e "  ${YELLOW}Creating virtual environment...${NC}"
            python3 -m venv venv
        fi

        # Activate venv and start uvicorn
        echo -e "  Starting uvicorn server..."
        source venv/bin/activate

        # Start uvicorn in background
        nohup uvicorn src.main:app \
            --host 0.0.0.0 \
            --port 8000 \
            --reload \
            > "${BACKEND_LOG}" 2>&1 &

        BACKEND_PID=$!
        echo $BACKEND_PID > "${BACKEND_PID_FILE}"

        echo -e "  Backend PID: ${BACKEND_PID}"
        echo -e "  Log file: ${BACKEND_LOG}"

        # Wait for backend to be ready
        wait_for_service "Backend API" "http://localhost:8000/api/v1/health" 60 || true
    fi
else
    echo -e "\n${YELLOW}[2/3] Skipping Backend${NC}"
fi

# ============================================================
# Start Frontend (Vite)
# ============================================================
if [ "$START_FRONTEND" = true ]; then
    echo -e "\n${BLUE}[3/3] Starting Frontend (Vite)...${NC}"

    # Check if frontend is already running
    if check_port 5173; then
        echo -e "  ${YELLOW}Frontend already running on port 5173${NC}"
    else
        cd "${FRONTEND_DIR}"

        # Check for node_modules
        if [ ! -d "node_modules" ]; then
            echo -e "  ${YELLOW}Installing dependencies...${NC}"
            npm install
        fi

        # Start Vite dev server in background
        echo -e "  Starting Vite dev server..."
        nohup npm run start > "${FRONTEND_LOG}" 2>&1 &

        FRONTEND_PID=$!
        echo $FRONTEND_PID > "${FRONTEND_PID_FILE}"

        echo -e "  Frontend PID: ${FRONTEND_PID}"
        echo -e "  Log file: ${FRONTEND_LOG}"

        # Wait for frontend to be ready
        wait_for_service "Frontend" "http://localhost:5173" 30 || true
    fi
else
    echo -e "\n${YELLOW}[3/3] Skipping Frontend${NC}"
fi

# ============================================================
# Summary
# ============================================================
echo -e "\n${GREEN}"
echo "============================================================="
echo "              DEVELOPMENT ENVIRONMENT READY                  "
echo "============================================================="
if [ "$START_BACKEND" = true ]; then
    echo "  Backend API:  http://localhost:8000                        "
    echo "  API Docs:     http://localhost:8000/docs                   "
fi
if [ "$START_FRONTEND" = true ]; then
    echo "  Frontend:     http://localhost:5173                        "
fi
if [ "$START_DOCKER" = true ]; then
    echo "-------------------------------------------------------------"
    echo "  Redis:        localhost:6379                               "
    echo "  MongoDB:      localhost:27017                              "
    echo "  Weaviate:     localhost:8082                               "
    echo "  Neo4j:        localhost:7474 (HTTP) / 7687 (Bolt)          "
    echo "  PostgreSQL:   localhost:5433                               "
    echo "  Fuseki:       localhost:3030                               "
fi
echo "-------------------------------------------------------------"
echo "  To stop all services: ./stop_dev.sh                        "
echo "  View backend logs:  tail -f logs/backend.log               "
echo "  View frontend logs: tail -f logs/frontend.log              "
echo "============================================================="
echo -e "${NC}"

# Return to project root
cd "${PROJECT_ROOT}"
