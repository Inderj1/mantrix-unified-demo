# Mantrix - GCP Terraform Deployment

Deploy Mantrix Unified DI to Google Cloud Platform using Terraform.

## Architecture

- **Compute**: e2-medium (2 vCPU, 4GB RAM) ~$30/month
- **Storage**: 30GB Standard Persistent Disk
- **Network**: VPC with firewall rules
- **Domain**: mantrix.cloudmantra.ai
- **OS**: Ubuntu 22.04 LTS

---

## Prerequisites

### 1. Install Tools

```bash
# Install Terraform
brew install terraform  # macOS
# OR
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### 2. GCP Setup

```bash
# Login to GCP
gcloud auth login
gcloud auth application-default login

# Create or select project
gcloud projects create mantrix-prod-12345 --name="Mantrix Production"
gcloud config set project mantrix-prod-12345

# Enable required APIs
gcloud services enable compute.googleapis.com
gcloud services enable dns.googleapis.com

# Note your project ID
gcloud config get-value project
```

### 3. SSH Key Setup

```bash
# Generate SSH key if you don't have one
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Key will be at ~/.ssh/id_rsa.pub
```

---

## Quick Start

### 1. Configure Variables

```bash
cd terraform/gcp

# Copy example configuration
cp terraform.tfvars.example terraform.tfvars

# Edit with your values
nano terraform.tfvars
```

Update `terraform.tfvars`:
```hcl
project_id = "mantrix-prod-12345"  # Your GCP project ID
region     = "us-central1"
zone       = "us-central1-a"
machine_type = "e2-medium"
ssh_user   = "ubuntu"
ssh_public_key_path = "~/.ssh/id_rsa.pub"
```

### 2. Initialize Terraform

```bash
terraform init
```

### 3. Preview Changes

```bash
terraform plan
```

### 4. Deploy Infrastructure

```bash
terraform apply
```

Type `yes` when prompted.

**Deployment takes ~3-5 minutes**

### 5. Get VM Details

```bash
# Get outputs
terraform output

# Will show:
# instance_ip = "34.123.45.67"
# ssh_command = "ssh ubuntu@34.123.45.67"
# application_url = "http://34.123.45.67"
```

---

## Post-Deployment Steps

### 1. Configure DNS

Point your domain to the VM IP:

```bash
# Get the IP
INSTANCE_IP=$(terraform output -raw instance_ip)
echo "Configure DNS: mantrix.cloudmantra.ai -> $INSTANCE_IP"
```

**In your DNS provider**:
- Type: A Record
- Name: mantrix.cloudmantra.ai
- Value: [INSTANCE_IP from above]
- TTL: 300

### 2. Upload Application Files

```bash
# Get SSH command
terraform output -raw ssh_command

# Upload application from your local machine
cd /path/to/mantrix-unified-di
tar czf mantrix.tar.gz --exclude=node_modules --exclude=.git .
scp mantrix.tar.gz ubuntu@<INSTANCE_IP>:~/

# SSH to VM
ssh ubuntu@<INSTANCE_IP>

# Extract and deploy
cd /opt/mantrix
sudo tar xzf ~/mantrix.tar.gz
sudo chown -R ubuntu:ubuntu .
```

### 3. Setup PostgreSQL Database

```bash
# On the VM
# PostgreSQL is installed via startup script

# Set password for PostgreSQL user
sudo -u postgres psql -c "ALTER USER inder WITH PASSWORD 'mantrix2024';"

# Configure authentication for password-based access
sudo sed -i 's/^local\s\+all\s\+all\s\+peer$/local   all             all                                     md5/' /etc/postgresql/*/main/pg_hba.conf
sudo systemctl restart postgresql

# Create database (if not exists)
PGPASSWORD=mantrix2024 psql -U inder -d postgres -h localhost -c "CREATE DATABASE customer_analytics OWNER inder;"
```

### 4. Transfer Customer Analytics Data

**Required PostgreSQL Tables (26 tables):**

#### Customer Analytics Tables:
- `customer_master` - Customer master data with RFM segments
- `transaction_data` - Transaction/sales data (~150K rows)
- `segment_performance` - Customer segment performance metrics
- `time_series_performance` - Time series performance data
- `product_customer_matrix` - Product-customer relationships

#### Cohort Analysis Tables:
- `cohort_avg_revenue` - Average revenue by cohort
- `cohort_retention` - Customer retention by cohort
- `cohort_sizes` - Cohort size data

#### Regional Analytics Tables:
- `regional_product_clusters` - Product clusters by region
- `regional_product_matrix` - Regional product matrix
- `regional_top_performers` - Top performers by region

#### Stock/Inventory Tables (Stox):
- `stox_annual_cost` - Annual inventory costs
- `stox_enterprise_summary` - Enterprise inventory summary
- `stox_future_projection` - Future inventory projections
- `stox_lot_size` - Lot size data
- `stox_material_master` - Material master data
- `stox_performance_metrics` - Inventory performance metrics
- `stox_reorder_point` - Reorder point calculations
- `stox_safety_stock` - Safety stock levels
- `stox_working_capital` - Working capital metrics

#### Enterprise Pulse Monitoring Tables:
- `pulse_monitors` - Monitor configurations
- `pulse_alerts` - Alert history
- `pulse_monitor_templates` - Monitor templates
- `pulse_execution_log` - Execution logs
- `pulse_query_history` - Query history
- `pulse_query_versions` - Query version history

**Data Transfer from Local/Source PostgreSQL:**

```bash
# On your local machine (source database)
# Export schema
pg_dump -h localhost -U inder -d customer_analytics --schema-only --no-owner --no-acl -f /tmp/customer_analytics_schema.sql

# Export data (creates ~38MB file)
pg_dump -h localhost -U inder -d customer_analytics --data-only --no-owner --no-acl -f /tmp/customer_analytics_data.sql

# Alternatively, use custom format for specific tables
pg_dump -h localhost -U inder -d customer_analytics -Fc \
  -t transaction_data \
  -t customer_master \
  -t segment_performance \
  -t time_series_performance \
  -t product_customer_matrix \
  -t cohort_retention \
  -t cohort_sizes \
  -t cohort_avg_revenue \
  -t regional_product_clusters \
  -t regional_product_matrix \
  -t regional_top_performers \
  -t pulse_monitor_templates \
  -f /tmp/customer_analytics.dump

# Copy to GCP VM
INSTANCE_IP=$(terraform output -raw instance_ip)
scp /tmp/customer_analytics_schema.sql ubuntu@$INSTANCE_IP:~/
scp /tmp/customer_analytics.dump ubuntu@$INSTANCE_IP:~/

# On the VM - Import schema
PGPASSWORD=mantrix2024 psql -U inder -d customer_analytics -h localhost -f ~/customer_analytics_schema.sql

# Import data
PGPASSWORD=mantrix2024 pg_restore -h localhost -U inder -d customer_analytics --data-only --disable-triggers ~/customer_analytics.dump

# Verify data import
PGPASSWORD=mantrix2024 psql -U inder -d customer_analytics -h localhost -c "
SELECT
    'transaction_data' as table_name, COUNT(*) as row_count FROM transaction_data
UNION ALL
SELECT 'customer_master', COUNT(*) FROM customer_master
UNION ALL
SELECT 'pulse_monitor_templates', COUNT(*) FROM pulse_monitor_templates;
"
```

**Expected Row Counts:**
- `transaction_data`: ~150,000 rows
- `customer_master`: ~2,900 rows
- `segment_performance`: ~25 rows
- `time_series_performance`: ~576 rows
- `product_customer_matrix`: ~5,272 rows
- `pulse_monitor_templates`: ~11 templates

### 5. Start Application

```bash
# On the VM
cd /opt/mantrix

# Update backend .env with PostgreSQL credentials
cd backend
cat >> .env <<EOF
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=inder
POSTGRES_PASSWORD=mantrix2024
POSTGRES_DATABASE=customer_analytics
EOF

# Start Docker containers (MongoDB, Neo4j, Weaviate, Redis)
docker-compose up -d --build

# Start backend (with environment variables)
cd /opt/mantrix/backend
export $(grep -v '^#' .env | xargs)
nohup ./venv/bin/python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 > /opt/mantrix/logs/backend.log 2>&1 &

# Start frontend
cd /opt/mantrix/frontend
nohup npm run dev -- --host 0.0.0.0 > /opt/mantrix/logs/frontend.log 2>&1 &

# Check status
ps aux | grep -E '(uvicorn|vite)'
tail -f /opt/mantrix/logs/backend.log
tail -f /opt/mantrix/logs/frontend.log
```

### 6. Setup SSL

```bash
# Install certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d mantrix.cloudmantra.ai --non-interactive --agree-tos -m your-email@example.com

# Auto-renewal is configured automatically
```

---

## Access Application

🌐 **URL**: https://mantrix.cloudmantra.ai

---

## Useful Commands

### Terraform Management

```bash
# Show current state
terraform show

# List resources
terraform state list

# Get outputs
terraform output

# Update infrastructure
terraform apply

# Destroy everything
terraform destroy
```

### VM Management

```bash
# SSH to VM
terraform output -raw ssh_command | sh

# View startup logs
ssh ubuntu@<IP> "sudo tail -f /var/log/mantrix-startup.log"

# Restart VM
gcloud compute instances reset mantrix-production --zone=us-central1-a

# Stop VM (to save costs)
gcloud compute instances stop mantrix-production --zone=us-central1-a

# Start VM
gcloud compute instances start mantrix-production --zone=us-central1-a
```

### Application Management

```bash
# SSH to VM first
ssh ubuntu@<IP>

# Check backend/frontend processes
ps aux | grep -E '(uvicorn|vite)'

# View logs
tail -f /opt/mantrix/logs/backend.log
tail -f /opt/mantrix/logs/frontend.log

# Restart backend
pkill -f 'uvicorn src.main:app'
cd /opt/mantrix/backend
export $(grep -v '^#' .env | xargs)
nohup ./venv/bin/python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 > /opt/mantrix/logs/backend.log 2>&1 &

# Restart frontend
pkill -f 'vite'
cd /opt/mantrix/frontend
nohup npm run dev -- --host 0.0.0.0 > /opt/mantrix/logs/frontend.log 2>&1 &

# Check Docker containers
docker-compose ps

# Restart Docker services
docker-compose restart

# Update application
cd /opt/mantrix
git pull  # if using git
docker-compose up -d --build
```

### PostgreSQL Management

```bash
# SSH to VM first
ssh ubuntu@<IP>

# Connect to PostgreSQL
PGPASSWORD=mantrix2024 psql -U inder -d customer_analytics -h localhost

# Check table counts
PGPASSWORD=mantrix2024 psql -U inder -d customer_analytics -h localhost -c "
SELECT tablename, n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
"

# Check database size
PGPASSWORD=mantrix2024 psql -U inder -d customer_analytics -h localhost -c "
SELECT pg_size_pretty(pg_database_size('customer_analytics')) as size;
"

# Backup PostgreSQL database
PGPASSWORD=mantrix2024 pg_dump -h localhost -U inder -d customer_analytics -Fc -f ~/customer_analytics_backup_$(date +%Y%m%d).dump

# Restore from backup
PGPASSWORD=mantrix2024 pg_restore -h localhost -U inder -d customer_analytics -c ~/customer_analytics_backup_YYYYMMDD.dump

# Check PostgreSQL service
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

---

## Cost Breakdown

| Resource              | Specification    | Monthly Cost |
|-----------------------|------------------|--------------|
| e2-medium VM          | 2 vCPU, 4GB RAM  | $24.27       |
| Standard Disk (30GB)  | HDD              | $1.20        |
| Static IP             | Reserved         | $3.00        |
| Network Egress (1TB)  | Internet         | ~$12.00      |
| **Total**             |                  | **~$40/mo**  |

**Cost Optimization**:
- Use preemptible instances: Save 60-80% (~$10/mo for VM)
- Stop VM when not in use
- Use e2-small (2GB RAM) if sufficient (~$12/mo)

---

## Machine Type Options

| Type          | vCPU | RAM  | Monthly Cost | Use Case              |
|---------------|------|------|--------------|------------------------|
| e2-micro      | 2    | 1GB  | $6.11        | Testing only          |
| e2-small      | 2    | 2GB  | $12.23       | Minimal production    |
| **e2-medium** | **2**    | **4GB**  | **$24.27**       | **Recommended**       |
| e2-standard-2 | 2    | 8GB  | $48.54       | High traffic          |
| e2-standard-4 | 4    | 16GB | $97.09       | Heavy workloads       |

---

## Troubleshooting

### Terraform Errors

```bash
# Re-initialize
terraform init -upgrade

# Check state
terraform state list

# Import existing resource
terraform import google_compute_instance.mantrix_vm mantrix-production
```

### VM Not Accessible

```bash
# Check firewall rules
gcloud compute firewall-rules list

# Check VM status
gcloud compute instances describe mantrix-production --zone=us-central1-a

# View serial console output
gcloud compute instances get-serial-port-output mantrix-production --zone=us-central1-a
```

### Application Issues

```bash
# SSH to VM
ssh ubuntu@<IP>

# Check startup script logs
sudo tail -f /var/log/mantrix-startup.log

# Check backend/frontend logs
tail -100 /opt/mantrix/logs/backend.log
tail -100 /opt/mantrix/logs/frontend.log

# Check if services are running
ps aux | grep -E '(uvicorn|vite)'

# Check Docker
sudo systemctl status docker
docker ps

# Check Nginx
sudo systemctl status nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### PostgreSQL Issues

```bash
# SSH to VM
ssh ubuntu@<IP>

# Check PostgreSQL is running
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -100 /var/log/postgresql/postgresql-*-main.log

# Test connection
PGPASSWORD=mantrix2024 psql -U inder -d customer_analytics -h localhost -c "SELECT 1;"

# Common issue: "no password supplied"
# Fix: Update pg_hba.conf for password authentication
sudo sed -i 's/^local\s\+all\s\+all\s\+peer$/local   all             all                                     md5/' /etc/postgresql/*/main/pg_hba.conf
sudo systemctl restart postgresql

# Common issue: "relation does not exist"
# Fix: Verify tables exist
PGPASSWORD=mantrix2024 psql -U inder -d customer_analytics -h localhost -c "\dt"

# If tables missing, reimport data (see section 4)

# Check backend can connect to PostgreSQL
tail -50 /opt/mantrix/logs/backend.log | grep -i postgres
```

### Missing Data/Templates

```bash
# Check if templates are loaded
curl -s https://your-domain.com/api/v1/pulse/templates | python3 -m json.tool

# If templates missing, reimport from local
# On local machine:
pg_dump -h localhost -U inder -d customer_analytics -t pulse_monitor_templates --data-only --no-owner --no-acl | \
  ssh ubuntu@<IP> "PGPASSWORD=mantrix2024 psql -U inder -d customer_analytics -h localhost"

# Check transaction data exists
ssh ubuntu@<IP> "PGPASSWORD=mantrix2024 psql -U inder -d customer_analytics -h localhost -c 'SELECT COUNT(*) FROM transaction_data;'"
```

---

## Scaling

### Vertical Scaling (More Resources)

```bash
# Edit terraform.tfvars
machine_type = "e2-standard-2"  # 2 vCPU, 8GB RAM

# Apply changes
terraform apply
```

### Horizontal Scaling (Multiple VMs)

Use Google Cloud Load Balancer and Managed Instance Groups (requires additional Terraform configuration).

---

## Security

✅ Firewall configured (only 22, 80, 443)
✅ VPC network isolation
✅ Secure passwords auto-generated
✅ SSL/TLS via Let's Encrypt
⚠️ Consider:
- Limiting SSH to specific IPs
- Setting up Cloud Armor for DDoS protection
- Enabling Cloud Logging and Monitoring

---

## Backup & Disaster Recovery

### Manual Backup

```bash
# Create VM snapshot
gcloud compute disks snapshot mantrix-production \
  --zone=us-central1-a \
  --snapshot-names=mantrix-backup-$(date +%Y%m%d)

# List snapshots
gcloud compute snapshots list
```

### Automated Backups

Add to Terraform or use GCP Snapshot Schedule.

---

## Clean Up

### Destroy Everything

```bash
# Warning: This deletes all resources!
terraform destroy

# Type 'yes' to confirm
```

### Keep Data, Delete VM Only

```bash
# Remove VM from Terraform
terraform destroy -target=google_compute_instance.mantrix_vm
```

---

## Support

- **Logs**: `sudo tail -f /var/log/mantrix-startup.log`
- **Status**: `docker-compose ps`
- **Terraform Docs**: https://registry.terraform.io/providers/hashicorp/google/latest/docs
- **GCP Console**: https://console.cloud.google.com
