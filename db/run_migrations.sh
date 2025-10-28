#!/bin/bash

# ========================================
# STOX.AI Database Migration Runner
# ========================================
# This script executes all SQL migration files in order
# Usage: ./run_migrations.sh
# ========================================

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Database configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-stoxai_db}"
DB_USER="${DB_USER:-postgres}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}STOX.AI Database Migration${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Database: ${YELLOW}$DB_NAME${NC}"
echo -e "Host: ${YELLOW}$DB_HOST:$DB_PORT${NC}"
echo -e "User: ${YELLOW}$DB_USER${NC}"
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > /dev/null 2>&1; then
    echo -e "${RED}Error: PostgreSQL is not running or not accessible${NC}"
    echo "Please start PostgreSQL and try again"
    exit 1
fi

echo -e "${GREEN}✓ PostgreSQL is running${NC}"
echo ""

# Check if database exists
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${YELLOW}Warning: Database '$DB_NAME' already exists${NC}"
    read -p "Do you want to continue and run migrations? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Migration cancelled${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}Creating database '$DB_NAME'...${NC}"
    createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
    echo -e "${GREEN}✓ Database created${NC}"
fi

echo ""
echo -e "${GREEN}Running migration scripts...${NC}"
echo ""

# Change to migrations directory
cd "$(dirname "$0")/migrations"

# Array of migration files in order
MIGRATIONS=(
    "001_create_master_tables.sql"
    "002_create_demand_flow_tables.sql"
    "003_create_demand_forecasting_tables.sql"
    "004_create_replenishment_tables.sql"
    "005_create_remaining_modules.sql"
)

# Run each migration
for i in "${!MIGRATIONS[@]}"; do
    migration="${MIGRATIONS[$i]}"
    number=$((i + 1))

    if [ -f "$migration" ]; then
        echo -e "${YELLOW}[$number/${#MIGRATIONS[@]}] Running $migration...${NC}"

        if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$migration" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ $migration completed${NC}"
        else
            echo -e "${RED}✗ Error running $migration${NC}"
            echo "Check the error messages above for details"
            exit 1
        fi
    else
        echo -e "${RED}✗ Migration file not found: $migration${NC}"
        exit 1
    fi
    echo ""
done

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Migration Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Get table count
TABLE_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo -e "Total tables created: ${GREEN}$TABLE_COUNT${NC}"

# Show created tables
echo ""
echo -e "${YELLOW}Created tables:${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" -t | sed 's/^/ - /'

echo ""
echo -e "${GREEN}Next steps:${NC}"
echo " 1. Load master data (SKUs, locations, suppliers)"
echo " 2. Generate sample transactional data"
echo " 3. Build backend API"
echo " 4. Update frontend to use database instead of mock data"
echo ""
echo -e "${GREEN}Connection string:${NC}"
echo -e " ${YELLOW}postgresql://$DB_USER@$DB_HOST:$DB_PORT/$DB_NAME${NC}"
echo ""
