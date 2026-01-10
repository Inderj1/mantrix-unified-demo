#!/bin/bash
#
# Mantrix Production Start Script (Run on Remote Server)
# =======================================================
# Starts backend and frontend services on the production server
#
# Usage:
#   ./remote_start.sh              # Start all services
#   ./remote_start.sh --backend    # Start backend only
#   ./remote_start.sh --frontend   # Start frontend only
#

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Application directories
APP_DIR="/opt/mantrix"
BACKEND_DIR="${APP_DIR}/backend"
FRONTEND_DIR="${APP_DIR}/frontend"
LOG_DIR="${APP_DIR}/logs"

# Create log directory
mkdir -p "${LOG_DIR}"

# Default options
START_BACKEND=true
START_FRONTEND=true

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --backend)
            START_FRONTEND=false
            shift
            ;;
        --frontend)
            START_BACKEND=false
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --backend     Start backend only"
            echo "  --frontend    Start frontend only"
            echo "  -h, --help    Show this help message"
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
echo "         MANTRIX PRODUCTION - STARTING SERVICES              "
echo "============================================================="
echo -e "${NC}"

# Get external IP
EXTERNAL_IP=$(curl -s ifconfig.me 2>/dev/null || echo "unknown")

# ============================================================
# Start Backend
# ============================================================
if [ "$START_BACKEND" = true ]; then
    echo -e "\n${BLUE}[1/2] Starting Backend (FastAPI)...${NC}"

    # Kill any existing uvicorn processes
    pkill -f 'uvicorn src.main' 2>/dev/null || true
    sleep 2

    # Check if virtual environment exists
    if [ ! -d "${BACKEND_DIR}/venv" ]; then
        echo -e "${RED}  Error: Virtual environment not found at ${BACKEND_DIR}/venv${NC}"
        echo -e "${YELLOW}  Run: cd ${BACKEND_DIR} && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt${NC}"
        exit 1
    fi

    # Start uvicorn
    cd "${BACKEND_DIR}"
    source venv/bin/activate
    nohup python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 > "${LOG_DIR}/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > "${APP_DIR}/.backend.pid"

    echo -e "  Backend PID: ${BACKEND_PID}"
    echo -e "  Log file: ${LOG_DIR}/backend.log"

    # Wait for backend to start
    echo -n "  Waiting for backend..."
    for i in {1..30}; do
        if curl -s http://localhost:8000/api/v1/health >/dev/null 2>&1; then
            echo -e " ${GREEN}ready${NC}"
            break
        fi
        sleep 1
        echo -n "."
    done

    # Check health
    HEALTH=$(curl -s http://localhost:8000/api/v1/health 2>/dev/null)
    if [[ "$HEALTH" == *"healthy"* ]]; then
        echo -e "  ${GREEN}Backend is healthy${NC}"
        # Show BigQuery status
        if [[ "$HEALTH" == *"bigquery"* ]]; then
            BQ_STATUS=$(echo "$HEALTH" | grep -o '"bigquery":"[^"]*"' | cut -d'"' -f4)
            echo -e "  BigQuery: ${GREEN}${BQ_STATUS}${NC}"
        fi
    else
        echo -e "  ${YELLOW}Backend started but health check failed${NC}"
        echo -e "  Check logs: tail -f ${LOG_DIR}/backend.log"
    fi
else
    echo -e "\n${YELLOW}[1/2] Skipping Backend${NC}"
fi

# ============================================================
# Start Frontend (Nginx)
# ============================================================
if [ "$START_FRONTEND" = true ]; then
    echo -e "\n${BLUE}[2/2] Starting Frontend (Nginx)...${NC}"

    # Start nginx
    if command -v systemctl &> /dev/null; then
        sudo systemctl start nginx 2>/dev/null || sudo service nginx start 2>/dev/null
    else
        sudo service nginx start 2>/dev/null || sudo nginx 2>/dev/null
    fi

    # Check if nginx is running
    if pgrep -x nginx >/dev/null; then
        echo -e "  ${GREEN}Nginx is running${NC}"
    else
        echo -e "  ${YELLOW}Nginx may not be running. Check: sudo systemctl status nginx${NC}"
    fi
else
    echo -e "\n${YELLOW}[2/2] Skipping Frontend${NC}"
fi

# ============================================================
# Summary
# ============================================================
echo -e "\n${GREEN}"
echo "============================================================="
echo "              PRODUCTION SERVICES STARTED                    "
echo "============================================================="
echo "  Server IP: ${EXTERNAL_IP}"
echo "-------------------------------------------------------------"
if [ "$START_BACKEND" = true ]; then
echo "  Backend API: http://${EXTERNAL_IP}:8000"
echo "  API Health:  http://${EXTERNAL_IP}:8000/api/v1/health"
echo "  API Docs:    http://${EXTERNAL_IP}:8000/docs"
fi
if [ "$START_FRONTEND" = true ]; then
echo "  Frontend:    http://${EXTERNAL_IP}"
fi
echo "-------------------------------------------------------------"
echo "  View backend logs:  tail -f ${LOG_DIR}/backend.log"
echo "  Stop services:      ./remote_stop.sh"
echo "============================================================="
echo -e "${NC}"
