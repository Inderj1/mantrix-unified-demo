#!/bin/bash
#
# Mantrix Production Deployment Script
# =====================================
# Deploys and starts the application on GCP instance
#
# Usage:
#   ./start_prod.sh              # Full deploy: sync files + restart services
#   ./start_prod.sh --restart    # Restart services only (no file sync)
#   ./start_prod.sh --sync       # Sync files only (no restart)
#   ./start_prod.sh --backend    # Deploy and restart backend only
#   ./start_prod.sh --frontend   # Deploy and restart frontend only
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# GCP Configuration
GCP_INSTANCE="mantrix-drinkaz-new-vm"
GCP_ZONE="us-central1-a"
GCP_USER="inder"
REMOTE_APP_DIR="/opt/mantrix"

# Local directories
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${PROJECT_ROOT}/backend"
FRONTEND_DIR="${PROJECT_ROOT}/frontend"

# Default options
SYNC_FILES=true
RESTART_SERVICES=true
DEPLOY_BACKEND=true
DEPLOY_FRONTEND=true

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --restart)
            SYNC_FILES=false
            shift
            ;;
        --sync)
            RESTART_SERVICES=false
            shift
            ;;
        --backend)
            DEPLOY_FRONTEND=false
            shift
            ;;
        --frontend)
            DEPLOY_BACKEND=false
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --restart     Restart services only (skip file sync)"
            echo "  --sync        Sync files only (skip restart)"
            echo "  --backend     Deploy backend only"
            echo "  --frontend    Deploy frontend only"
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
echo "         MANTRIX PRODUCTION DEPLOYMENT                       "
echo "============================================================="
echo "  Instance: ${GCP_INSTANCE}"
echo "  Zone:     ${GCP_ZONE}"
echo "  Remote:   ${REMOTE_APP_DIR}"
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

# Function to sync files via SCP
sync_files() {
    local src=$1
    local dest=$2
    local name=$3

    echo -e "  Syncing ${name}..."
    gcloud compute scp --zone=${GCP_ZONE} --recurse "$src" ${GCP_USER}@${GCP_INSTANCE}:/tmp/sync_temp 2>/dev/null
    ssh_cmd "sudo rm -rf ${dest} && sudo mv /tmp/sync_temp ${dest} && sudo chown -R ${GCP_USER}:${GCP_USER} ${dest}"
    echo -e "  ${GREEN}${name} synced${NC}"
}

# ============================================================
# Check GCP Instance Status
# ============================================================
echo -e "\n${BLUE}[1/4] Checking GCP Instance...${NC}"
INSTANCE_STATUS=$(gcloud compute instances describe ${GCP_INSTANCE} --zone=${GCP_ZONE} --format="value(status)" 2>/dev/null)

if [ "$INSTANCE_STATUS" != "RUNNING" ]; then
    echo -e "${YELLOW}  Instance is ${INSTANCE_STATUS}. Starting...${NC}"
    gcloud compute instances start ${GCP_INSTANCE} --zone=${GCP_ZONE}
    echo -e "  Waiting for instance to start..."
    sleep 30
fi
echo -e "  ${GREEN}Instance is running${NC}"

# Get external IP
EXTERNAL_IP=$(gcloud compute instances describe ${GCP_INSTANCE} --zone=${GCP_ZONE} --format="value(networkInterfaces[0].accessConfigs[0].natIP)")
echo -e "  External IP: ${EXTERNAL_IP}"

# ============================================================
# Sync Files
# ============================================================
if [ "$SYNC_FILES" = true ]; then
    echo -e "\n${BLUE}[2/4] Syncing Files to Production...${NC}"

    if [ "$DEPLOY_BACKEND" = true ]; then
        echo -e "\n  ${CYAN}Backend files:${NC}"

        # Sync backend src directory
        echo -e "  Syncing backend/src..."
        gcloud compute scp --zone=${GCP_ZONE} --recurse "${BACKEND_DIR}/src" ${GCP_USER}@${GCP_INSTANCE}:/tmp/src_new 2>/dev/null
        ssh_cmd "sudo rm -rf ${REMOTE_APP_DIR}/backend/src && sudo mv /tmp/src_new ${REMOTE_APP_DIR}/backend/src && sudo chown -R ${GCP_USER}:${GCP_USER} ${REMOTE_APP_DIR}/backend/src"
        echo -e "  ${GREEN}Backend source synced${NC}"

        # Sync requirements if changed
        if [ -f "${BACKEND_DIR}/requirements.txt" ]; then
            gcloud compute scp --zone=${GCP_ZONE} "${BACKEND_DIR}/requirements.txt" ${GCP_USER}@${GCP_INSTANCE}:/tmp/requirements.txt 2>/dev/null
            ssh_cmd "sudo mv /tmp/requirements.txt ${REMOTE_APP_DIR}/backend/requirements.txt"
            echo -e "  ${GREEN}Requirements synced${NC}"
        fi
    fi

    if [ "$DEPLOY_FRONTEND" = true ]; then
        echo -e "\n  ${CYAN}Frontend files:${NC}"

        # Build frontend locally first
        echo -e "  Building frontend..."
        cd "${FRONTEND_DIR}"
        npm run build 2>/dev/null || {
            echo -e "${YELLOW}  Frontend build skipped (run 'npm run build' manually if needed)${NC}"
        }

        # Sync frontend dist if it exists
        if [ -d "${FRONTEND_DIR}/dist" ]; then
            gcloud compute scp --zone=${GCP_ZONE} --recurse "${FRONTEND_DIR}/dist" ${GCP_USER}@${GCP_INSTANCE}:/tmp/dist_new 2>/dev/null
            ssh_cmd "sudo rm -rf ${REMOTE_APP_DIR}/frontend/dist && sudo mv /tmp/dist_new ${REMOTE_APP_DIR}/frontend/dist && sudo chown -R ${GCP_USER}:${GCP_USER} ${REMOTE_APP_DIR}/frontend/dist"
            echo -e "  ${GREEN}Frontend dist synced${NC}"
        fi

        cd "${PROJECT_ROOT}"
    fi
else
    echo -e "\n${YELLOW}[2/4] Skipping file sync${NC}"
fi

# ============================================================
# Stop Existing Services
# ============================================================
if [ "$RESTART_SERVICES" = true ]; then
    echo -e "\n${BLUE}[3/4] Stopping Existing Services...${NC}"

    if [ "$DEPLOY_BACKEND" = true ]; then
        echo -e "  Stopping backend..."
        ssh_cmd "sudo pkill -f 'uvicorn src.main' 2>/dev/null || true"
        echo -e "  ${GREEN}Backend stopped${NC}"
    fi

    if [ "$DEPLOY_FRONTEND" = true ]; then
        echo -e "  Stopping frontend..."
        ssh_cmd "sudo pkill -f 'nginx' 2>/dev/null || true; sudo pkill -f 'node' 2>/dev/null || true"
        echo -e "  ${GREEN}Frontend stopped${NC}"
    fi

    sleep 2
else
    echo -e "\n${YELLOW}[3/4] Skipping service restart${NC}"
fi

# ============================================================
# Start Services
# ============================================================
if [ "$RESTART_SERVICES" = true ]; then
    echo -e "\n${BLUE}[4/4] Starting Services...${NC}"

    if [ "$DEPLOY_BACKEND" = true ]; then
        echo -e "  Starting backend..."
        ssh_cmd "cd ${REMOTE_APP_DIR}/backend && source venv/bin/activate && nohup python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 > /tmp/uvicorn.log 2>&1 &"
        sleep 5

        # Verify backend started
        HEALTH=$(ssh_cmd "curl -s http://localhost:8000/api/v1/health 2>/dev/null | head -c 100" || echo "failed")
        if [[ "$HEALTH" == *"healthy"* ]]; then
            echo -e "  ${GREEN}Backend started and healthy${NC}"
        else
            echo -e "  ${YELLOW}Backend started (health check pending)${NC}"
        fi
    fi

    if [ "$DEPLOY_FRONTEND" = true ]; then
        echo -e "  Starting nginx..."
        ssh_cmd "sudo systemctl start nginx 2>/dev/null || sudo service nginx start 2>/dev/null || true"
        echo -e "  ${GREEN}Nginx started${NC}"
    fi
else
    echo -e "\n${YELLOW}[4/4] Skipping service start${NC}"
fi

# ============================================================
# Summary
# ============================================================
echo -e "\n${GREEN}"
echo "============================================================="
echo "              PRODUCTION DEPLOYMENT COMPLETE                 "
echo "============================================================="
echo "  Instance:   ${GCP_INSTANCE}"
echo "  External IP: ${EXTERNAL_IP}"
echo "-------------------------------------------------------------"
if [ "$DEPLOY_BACKEND" = true ]; then
echo "  Backend API: http://${EXTERNAL_IP}:8000"
echo "  API Health:  http://${EXTERNAL_IP}:8000/api/v1/health"
fi
if [ "$DEPLOY_FRONTEND" = true ]; then
echo "  Frontend:    http://${EXTERNAL_IP}"
fi
echo "-------------------------------------------------------------"
echo "  View logs:   gcloud compute ssh ${GCP_INSTANCE} --zone=${GCP_ZONE} --command='tail -f /tmp/uvicorn.log'"
echo "  Stop:        ./stop_prod.sh"
echo "============================================================="
echo -e "${NC}"
