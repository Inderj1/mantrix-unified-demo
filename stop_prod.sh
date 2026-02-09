#!/bin/bash
#
# Mantrix Production Stop Script
# ===============================
# Stops services on a GCP production instance
#
# Usage:
#   ./stop_prod.sh                        # Stop sandbox (default)
#   ./stop_prod.sh --target sandbox       # Stop sandbox
#   ./stop_prod.sh --target drinkaz       # Stop drinkaz
#   ./stop_prod.sh --backend              # Stop backend only
#   ./stop_prod.sh --frontend             # Stop frontend only
#

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default target
TARGET="sandbox"

# Default options
STOP_BACKEND=true
STOP_FRONTEND=true

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --target)
            TARGET="$2"
            shift 2
            ;;
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
            echo "  --target ENV  Target environment: sandbox (default), drinkaz"
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

# ============================================================
# Target Environment Configuration
# ============================================================
GCP_ZONE="us-central1-a"
GCP_USER="inder"

case "$TARGET" in
    sandbox)
        GCP_INSTANCE="mantrix-sandbox-vm"
        DOMAIN="sandbox.cloudmantra.ai"
        ;;
    drinkaz)
        GCP_INSTANCE="mantrix-drinkaz-new-vm"
        DOMAIN="drinkaz-mantrix.cloudmantra.ai"
        ;;
    *)
        echo -e "${RED}Unknown target: ${TARGET}. Use 'sandbox' or 'drinkaz'.${NC}"
        exit 1
        ;;
esac

echo -e "${CYAN}"
echo "============================================================="
echo "         STOPPING MANTRIX PRODUCTION SERVICES                "
echo "============================================================="
echo "  Target:   ${TARGET} (${DOMAIN})"
echo "  Instance: ${GCP_INSTANCE}"
echo "  Zone:     ${GCP_ZONE}"
echo "============================================================="
echo -e "${NC}"

# Function to run SSH command with retry
ssh_cmd() {
    local max_attempts=3
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if gcloud compute ssh ${GCP_USER}@${GCP_INSTANCE} --zone=${GCP_ZONE} --ssh-flag="-o ConnectTimeout=30" --command="$1" 2>/dev/null; then
            return 0
        fi
        echo -e "${YELLOW}  SSH attempt $attempt failed, retrying...${NC}"
        sleep 2
        attempt=$((attempt + 1))
    done

    echo -e "${RED}  SSH command failed after $max_attempts attempts${NC}"
    return 1
}

# ============================================================
# Check GCP Instance Status
# ============================================================
echo -e "\n${BLUE}[1/2] Checking GCP Instance...${NC}"
INSTANCE_STATUS=$(gcloud compute instances describe ${GCP_INSTANCE} --zone=${GCP_ZONE} --format="value(status)" 2>/dev/null)

if [ "$INSTANCE_STATUS" != "RUNNING" ]; then
    echo -e "${YELLOW}  Instance is ${INSTANCE_STATUS}. Nothing to stop.${NC}"
    exit 0
fi
echo -e "  ${GREEN}Instance is running${NC}"

# Get external IP
EXTERNAL_IP=$(gcloud compute instances describe ${GCP_INSTANCE} --zone=${GCP_ZONE} --format="value(networkInterfaces[0].accessConfigs[0].natIP)")
echo -e "  External IP: ${EXTERNAL_IP}"

# ============================================================
# Stop Services
# ============================================================
echo -e "\n${BLUE}[2/2] Stopping Services...${NC}"

if [ "$STOP_BACKEND" = true ]; then
    echo -e "  Stopping backend (uvicorn)..."
    ssh_cmd "sudo pkill -f 'uvicorn src.main' 2>/dev/null || true"

    # Verify stopped
    sleep 2
    if ssh_cmd "pgrep -f 'uvicorn src.main' >/dev/null 2>&1"; then
        echo -e "  ${YELLOW}Backend still running, force killing...${NC}"
        ssh_cmd "sudo pkill -9 -f 'uvicorn src.main' 2>/dev/null || true"
    fi
    echo -e "  ${GREEN}Backend stopped${NC}"
fi

if [ "$STOP_FRONTEND" = true ]; then
    echo -e "  Stopping frontend (nginx)..."
    ssh_cmd "sudo systemctl stop nginx 2>/dev/null || sudo service nginx stop 2>/dev/null || true"
    echo -e "  ${GREEN}Nginx stopped${NC}"
fi

# ============================================================
# Summary
# ============================================================
echo -e "\n${GREEN}"
echo "============================================================="
echo "           PRODUCTION SERVICES STOPPED                       "
echo "============================================================="
echo "  Target:    ${TARGET} (${DOMAIN})"
if [ "$STOP_BACKEND" = true ]; then
echo "  Backend:   stopped"
fi
if [ "$STOP_FRONTEND" = true ]; then
echo "  Frontend:  stopped"
fi
echo "-------------------------------------------------------------"
echo "  To restart: ./start_prod.sh --target ${TARGET}"
echo "============================================================="
echo -e "${NC}"
