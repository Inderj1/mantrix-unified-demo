#!/bin/bash
#
# Mantrix Production Stop Script (Run on Remote Server)
# ======================================================
# Stops backend and frontend services on the production server
#
# Usage:
#   ./remote_stop.sh              # Stop all services
#   ./remote_stop.sh --backend    # Stop backend only
#   ./remote_stop.sh --frontend   # Stop frontend only
#

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Application directory
APP_DIR="/opt/mantrix"

# Default options
STOP_BACKEND=true
STOP_FRONTEND=true

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --backend)
            STOP_FRONTEND=false
            shift
            ;;
        --frontend)
            STOP_BACKEND=false
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --backend     Stop backend only"
            echo "  --frontend    Stop frontend only"
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
echo "         MANTRIX PRODUCTION - STOPPING SERVICES              "
echo "============================================================="
echo -e "${NC}"

# ============================================================
# Stop Backend
# ============================================================
if [ "$STOP_BACKEND" = true ]; then
    echo -e "\n${BLUE}[1/2] Stopping Backend...${NC}"

    # Try graceful kill first
    if pgrep -f 'uvicorn src.main' >/dev/null; then
        echo -e "  Sending SIGTERM to uvicorn..."
        pkill -f 'uvicorn src.main' 2>/dev/null
        sleep 2

        # Force kill if still running
        if pgrep -f 'uvicorn src.main' >/dev/null; then
            echo -e "  ${YELLOW}Force killing uvicorn...${NC}"
            pkill -9 -f 'uvicorn src.main' 2>/dev/null
            sleep 1
        fi
        echo -e "  ${GREEN}Backend stopped${NC}"
    else
        echo -e "  ${YELLOW}Backend was not running${NC}"
    fi

    # Remove PID file
    rm -f "${APP_DIR}/.backend.pid" 2>/dev/null
else
    echo -e "\n${YELLOW}[1/2] Skipping Backend${NC}"
fi

# ============================================================
# Stop Frontend (Nginx)
# ============================================================
if [ "$STOP_FRONTEND" = true ]; then
    echo -e "\n${BLUE}[2/2] Stopping Frontend (Nginx)...${NC}"

    if pgrep -x nginx >/dev/null; then
        if command -v systemctl &> /dev/null; then
            sudo systemctl stop nginx 2>/dev/null || sudo service nginx stop 2>/dev/null
        else
            sudo service nginx stop 2>/dev/null || sudo nginx -s stop 2>/dev/null
        fi
        echo -e "  ${GREEN}Nginx stopped${NC}"
    else
        echo -e "  ${YELLOW}Nginx was not running${NC}"
    fi
else
    echo -e "\n${YELLOW}[2/2] Skipping Frontend${NC}"
fi

# ============================================================
# Summary
# ============================================================
echo -e "\n${GREEN}"
echo "============================================================="
echo "              PRODUCTION SERVICES STOPPED                    "
echo "============================================================="
if [ "$STOP_BACKEND" = true ]; then
echo "  Backend:   stopped"
fi
if [ "$STOP_FRONTEND" = true ]; then
echo "  Frontend:  stopped"
fi
echo "-------------------------------------------------------------"
echo "  To restart: ./remote_start.sh"
echo "============================================================="
echo -e "${NC}"
