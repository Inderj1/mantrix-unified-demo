#!/bin/bash

# Mantrix Unified DI - GCP VM Startup Script
# Runs on first boot to set up the environment

set -e

exec > >(tee -a /var/log/mantrix-startup.log)
exec 2>&1

echo "=================================="
echo "Mantrix Startup Script - $(date)"
echo "=================================="

# Wait for network
sleep 10

# Update system
echo "Updating system packages..."
apt-get update
export DEBIAN_FRONTEND=noninteractive
apt-get upgrade -y

# Install dependencies
echo "Installing dependencies..."
apt-get install -y \
    docker.io \
    docker-compose \
    nginx \
    git \
    curl \
    wget \
    htop \
    ufw \
    ca-certificates \
    gnupg \
    lsb-release

# Configure firewall
echo "Configuring firewall..."
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Start and enable Docker
echo "Setting up Docker..."
systemctl start docker
systemctl enable docker

# Add ubuntu user to docker group
usermod -aG docker ubuntu || true

# Create application directory
APP_DIR="/opt/mantrix"
echo "Creating application directory: $APP_DIR"
mkdir -p $APP_DIR
chown ubuntu:ubuntu $APP_DIR

# Clone repository (or wait for manual upload)
cd $APP_DIR

# Create environment file with secure defaults
echo "Creating environment configuration..."
cat > .env <<EOF
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
DOMAIN=mantrix.cloudmantra.ai
EOF

chmod 600 .env
chown ubuntu:ubuntu .env

# Configure Nginx
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/mantrix <<'NGINX_CONFIG'
server {
    listen 80 default_server;
    server_name mantrix.cloudmantra.ai;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
NGINX_CONFIG

ln -sf /etc/nginx/sites-available/mantrix /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx

echo "======================================="
echo "Mantrix VM Setup Complete!"
echo "======================================="
echo "Next steps:"
echo "1. Upload application files to $APP_DIR"
echo "2. Run: cd $APP_DIR && docker-compose up -d --build"
echo "3. Configure SSL: certbot --nginx -d mantrix.cloudmantra.ai"
echo ""
echo "Environment file created at: $APP_DIR/.env"
echo "View this log: tail -f /var/log/mantrix-startup.log"
echo "======================================="
