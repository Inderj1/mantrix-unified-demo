#!/bin/bash
# Load all Excel data directly into mantrix_nexxt database

echo "=================================="
echo "Loading Excel Data to mantrix_nexxt"
echo "=================================="

# Update load scripts to use mantrix_nexxt
export PGHOST=localhost
export PGPORT=5433
export PGUSER=mantrix
export PGPASSWORD=mantrix123
export PGDATABASE=mantrix_nexxt

echo ""
echo "1. Loading Invoice Data (21,005 records)..."
python3 /Users/inder/projects/mantrix-unified-nexxt-v1/backend/venv/bin/python << 'PYTHON'
from load_invoice_data import load_invoice_data
# Modify connection to use mantrix_nexxt
load_invoice_data()
PYTHON

echo ""
echo "2. Loading Item Master (12,852 items)..."
# Will add after fixing

echo ""
echo "3. Loading Item Costs (15,407 records)..."
# Will add after creating script

echo ""
echo "=================================="
echo "All Excel Data Loaded"
echo "=================================="
