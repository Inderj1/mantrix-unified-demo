# Mantrix Unified DI - EC2 Deployment Guide

## Target Configuration

- **Domain**: mantrix.cloudmantra.ai
- **Instance**: AWS EC2 t3.medium (2 vCPU, 4GB RAM)
- **OS**: Ubuntu 22.04 LTS
- **Cost**: ~$30-35/month

---

## Prerequisites

1. **AWS Account** with EC2 access
2. **Domain DNS** access to configure mantrix.cloudmantra.ai
3. **SSH Key Pair** for EC2 access

---

## Step 1: Launch EC2 Instance

### Via AWS Console

1. Go to EC2 → Launch Instance
2. Configure:
   - **Name**: mantrix-production
   - **AMI**: Ubuntu Server 22.04 LTS
   - **Instance Type**: t3.medium
   - **Key Pair**: Create or select existing
   - **Storage**: 30GB GP3 SSD

3. **Security Group** - Allow:
   - SSH (22) from your IP
   - HTTP (80) from anywhere (0.0.0.0/0)
   - HTTPS (443) from anywhere (0.0.0.0/0)

4. Launch Instance

### Note the Public IP
After launch, note the **Public IPv4 address** (e.g., 54.123.45.67)

---

## Step 2: Configure DNS

Point your domain to the EC2 instance:

1. Go to your DNS provider (Route53, Cloudflare, etc.)
2. Add an **A Record**:
   - **Name**: mantrix.cloudmantra.ai
   - **Type**: A
   - **Value**: [Your EC2 Public IP]
   - **TTL**: 300 (5 minutes)

3. Wait 5-10 minutes for DNS propagation

Verify: `nslookup mantrix.cloudmantra.ai`

---

## Step 3: Connect to EC2

```bash
# SSH into your instance
ssh -i your-key.pem ubuntu@mantrix.cloudmantra.ai
```

---

## Step 4: Upload Application Files

### Option A: From Local Machine

```bash
# From your local machine, copy files to EC2
scp -i your-key.pem -r /path/to/mantrix-unified-di ubuntu@mantrix.cloudmantra.ai:~/
```

### Option B: Clone from Git

```bash
# On EC2 instance
git clone https://github.com/yourusername/mantrix-unified-di.git
cd mantrix-unified-di
```

---

## Step 5: Run Deployment Script

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment (this installs Docker, Nginx, starts containers)
sudo ./deploy.sh
```

The script will:
- ✅ Install Docker, Docker Compose, Nginx
- ✅ Configure firewall (UFW)
- ✅ Generate secure passwords
- ✅ Setup Nginx reverse proxy
- ✅ Build and start all containers
- ✅ Takes ~5-10 minutes

---

## Step 6: Setup SSL Certificate (HTTPS)

After containers are running and DNS is configured:

```bash
# Install certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d mantrix.cloudmantra.ai --non-interactive --agree-tos -m your-email@example.com

# Auto-renewal is configured automatically
```

---

## Step 7: Verify Deployment

```bash
# Check all containers are running
docker-compose ps

# Should show:
# mantrix-frontend    Up (healthy)
# mantrix-backend     Up (healthy)
# mantrix-postgres    Up (healthy)
# mantrix-redis       Up (healthy)

# Check logs
docker-compose logs -f

# Test application
curl https://mantrix.cloudmantra.ai
```

---

## Access Your Application

🌐 **URL**: https://mantrix.cloudmantra.ai

---

## Useful Commands

### Check Status
```bash
cd /opt/mantrix
docker-compose ps
docker-compose logs -f [service-name]
```

### Restart Services
```bash
docker-compose restart
docker-compose restart backend  # Restart specific service
```

### Update/Redeploy
```bash
cd /opt/mantrix
git pull
docker-compose up -d --build
```

### Stop All
```bash
docker-compose down
```

### View Resource Usage
```bash
htop
docker stats
```

### Access Database
```bash
docker exec -it mantrix-postgres psql -U mantrix_user -d mantrix_db
```

### Backup Database
```bash
docker exec mantrix-postgres pg_dump -U mantrix_user mantrix_db > backup-$(date +%Y%m%d).sql
```

---

## Security Notes

- ✅ Firewall configured (only 22, 80, 443 open)
- ✅ Database passwords auto-generated
- ✅ SSL/TLS enabled
- ✅ Containers isolated in bridge network
- ⚠️  Change default passwords in `/opt/mantrix/.env`
- ⚠️  Restrict SSH to your IP only in Security Group

---

## Monitoring

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Check Resource Usage
```bash
docker stats
```

### Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Troubleshooting

### Containers not starting?
```bash
docker-compose logs
docker-compose ps
```

### Port already in use?
```bash
sudo lsof -i :3000
sudo lsof -i :80
```

### Clear everything and restart
```bash
docker-compose down -v
docker-compose up -d --build
```

### Check Nginx config
```bash
sudo nginx -t
sudo systemctl status nginx
```

---

## Cost Breakdown

| Resource          | Specification      | Monthly Cost |
|-------------------|--------------------|--------------|
| EC2 t3.medium     | 2 vCPU, 4GB RAM    | $30.37       |
| EBS Storage       | 30GB GP3           | $2.40        |
| Data Transfer     | 1TB (free tier)    | $0           |
| **Total**         |                    | **~$33/mo**  |

---

## Scaling Options

When you need more resources:

1. **Vertical Scaling** (Easier):
   - Stop instance
   - Change instance type to t3.large or t3.xlarge
   - Start instance
   - No code changes needed

2. **Add Monitoring**:
   - CloudWatch metrics
   - Uptime monitoring
   - Log aggregation

3. **Add Backups**:
   - Automated S3 backups
   - Database snapshots

---

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review this guide
- Check container health: `docker-compose ps`
