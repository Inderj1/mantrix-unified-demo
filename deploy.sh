#!/bin/bash

# Mantrix Unified DI - EC2 Setup Script
# For t3.medium (2 vCPU, 4GB RAM) - ~$30/month
# Run once on fresh Ubuntu 22.04 EC2 instance

set -e

echo "🚀 Mantrix EC2 Setup - t3.medium"
echo "================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run with sudo: sudo ./deploy.sh"
    exit 1
fi

APP_DIR="/opt/mantrix"

echo ""
echo "📦 Step 1/6: Installing system dependencies..."
apt-get update
apt-get install -y \
    docker.io \
    docker-compose \
    nginx \
    git \
    curl \
    htop \
    ufw

echo ""
echo "🔥 Step 2/6: Configuring firewall..."
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable

echo ""
echo "🐳 Step 3/6: Setting up Docker..."
systemctl start docker
systemctl enable docker
usermod -aG docker ubuntu || true

echo ""
echo "📁 Step 4/6: Setting up application directory..."
mkdir -p $APP_DIR

# Copy application files
if [ -f "docker-compose.yml" ]; then
    echo "Copying application files..."
    cp -r . $APP_DIR/
    cd $APP_DIR
else
    echo "❌ Run this script from your application directory"
    exit 1
fi

echo ""
echo "🔧 Step 5/6: Creating environment configuration..."
if [ ! -f .env ]; then
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
    echo "✅ Created .env with secure passwords"
    echo "📝 Passwords saved to .env (keep this safe!)"
else
    echo "✅ .env already exists"
fi

echo ""
echo "🌐 Step 6/6: Configuring Nginx reverse proxy..."
cat > /etc/nginx/sites-available/mantrix <<'NGINX_CONFIG'
server {
    listen 80 default_server;
    server_name _;

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

nginx -t
systemctl restart nginx
systemctl enable nginx

echo ""
echo "🐳 Starting Docker containers..."
docker-compose up -d --build

echo ""
echo "⏳ Waiting for services to start..."
sleep 15

echo ""
echo "✅ SETUP COMPLETE!"
echo "=================="
echo ""
echo "🌐 Access your app: http://$(curl -s ifconfig.me)"
echo ""
echo "📊 Useful Commands:"
echo "   docker-compose ps              # Check status"
echo "   docker-compose logs -f         # View logs"
echo "   docker-compose restart         # Restart all"
echo "   docker-compose down            # Stop all"
echo ""
echo "🔄 To update/redeploy:"
echo "   cd $APP_DIR"
echo "   git pull"
echo "   docker-compose up -d --build"
echo ""
echo "💾 Data persists in Docker volumes even after restart"
echo ""
