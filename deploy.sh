#!/bin/bash

# Mantrix Unified DI - EC2/GCP Instance Setup Script
# For t3.medium / e2-medium (2 vCPU, 4GB RAM) - ~$30/month
# Run once on fresh Ubuntu 22.04 instance
#
# Usage:
#   sudo ./deploy.sh                   # Setup for sandbox (default)
#   sudo ./deploy.sh --target sandbox  # Setup for sandbox
#   sudo ./deploy.sh --target drinkaz  # Setup for drinkaz

set -e

# Default target
TARGET="sandbox"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --target)
            TARGET="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: sudo $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --target ENV  Target environment: sandbox (default), drinkaz"
            echo "  -h, --help    Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Environment configuration
case "$TARGET" in
    sandbox)
        DOMAIN="sandbox.cloudmantra.ai"
        APP_DIR="/opt"
        BACKEND_DIR="/opt/backend"
        FRONTEND_DIR="/var/www/html"
        ;;
    drinkaz)
        DOMAIN="drinkaz-mantrix.cloudmantra.ai"
        APP_DIR="/opt/mantrix"
        BACKEND_DIR="/opt/mantrix/backend"
        FRONTEND_DIR="/opt/mantrix/frontend/dist"
        ;;
    *)
        echo "Unknown target: ${TARGET}. Use 'sandbox' or 'drinkaz'."
        exit 1
        ;;
esac

echo ""
echo "============================================================="
echo "  Mantrix Instance Setup - ${TARGET}"
echo "  Domain: ${DOMAIN}"
echo "============================================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run with sudo: sudo ./deploy.sh --target ${TARGET}"
    exit 1
fi

echo ""
echo "Step 1/6: Installing system dependencies..."
apt-get update
apt-get install -y \
    docker.io \
    docker-compose \
    nginx \
    git \
    curl \
    htop \
    ufw \
    certbot \
    python3-certbot-nginx

echo ""
echo "Step 2/6: Configuring firewall..."
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable

echo ""
echo "Step 3/6: Setting up Docker..."
systemctl start docker
systemctl enable docker
usermod -aG docker ubuntu || true
usermod -aG docker inder || true

echo ""
echo "Step 4/6: Setting up application directories..."
mkdir -p "${BACKEND_DIR}"
mkdir -p "${FRONTEND_DIR}"

if [ "$TARGET" = "sandbox" ]; then
    mkdir -p /opt/logs
fi

echo ""
echo "Step 5/6: Creating environment configuration..."
if [ ! -f "${BACKEND_DIR}/.env" ]; then
    cat > "${BACKEND_DIR}/.env" <<EOF
# Database Configuration
POSTGRES_USER=mantrix_user
POSTGRES_PASSWORD=$(openssl rand -base64 32)
POSTGRES_DB=mantrix_db

# Redis Configuration
REDIS_PASSWORD=$(openssl rand -base64 32)

# Application
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 64)

# Domain
DOMAIN=${DOMAIN}
EOF
    chmod 600 "${BACKEND_DIR}/.env"
    echo "Created .env with secure passwords"
else
    echo ".env already exists"
fi

echo ""
echo "Step 6/6: Configuring Nginx..."

cat > /etc/nginx/sites-available/mantrix <<NGINX_CONFIG
server {
    root ${FRONTEND_DIR};
    index index.html;

    server_name ${DOMAIN} _;

    client_max_body_size 100M;

    # Frontend
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
NGINX_CONFIG

ln -sf /etc/nginx/sites-available/mantrix /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl restart nginx
systemctl enable nginx

echo ""
echo "============================================================="
echo "  SETUP COMPLETE - ${TARGET}"
echo "============================================================="
echo ""
echo "  Access: http://$(curl -s ifconfig.me)"
echo ""
echo "  Next steps:"
echo "    1. Deploy code:  ./start_prod.sh --target ${TARGET}"
echo "    2. Setup SSL:    sudo certbot --nginx -d ${DOMAIN}"
echo ""
echo "  Useful commands:"
echo "    ./start_prod.sh --target ${TARGET}          # Deploy"
echo "    ./stop_prod.sh --target ${TARGET}           # Stop"
echo "    tail -f /tmp/uvicorn.log                    # Backend logs"
echo "============================================================="
echo ""
