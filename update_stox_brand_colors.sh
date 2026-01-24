#!/bin/bash

# MANTRIX - Update STOX Components to Use Centralized Brand Colors
# This script updates all stox component files to use colors from ../../config/brandColors

set -e

STOX_DIR="frontend/src/components/stox"

echo "======================================"
echo "Updating STOX Components Brand Colors"
echo "======================================"
echo ""

cd "$(dirname "$0")"

# Check if we're in the right directory
if [ ! -d "$STOX_DIR" ]; then
  echo "Error: $STOX_DIR directory not found"
  exit 1
fi

# List of .jsx files to update
JSX_FILES=(
  "ForecastingEngine.jsx"
  "InventoryDashboard.jsx"
  "DemandIntelligence.jsx"
  "RecommendationsHub.jsx"
  "WhatIfSimulator.jsx"
  "WorkingCapitalBaseline.jsx"
  "PerformanceMonitor.jsx"
  "StoreForecast.jsx"
  "DCOptimization.jsx"
  "MRPParameterTuner.jsx"
  "Tile0ForecastSimulation.jsx"
  "StoreHealthMonitor.jsx"
  "InventoryHealthCheck.jsx"
  "FioriTileDetail.jsx"
  "ModuleTilesView.jsx"
)

# Function to add import if not exists
add_brand_colors_import() {
  local file=$1

  # Check if import already exists
  if grep -q "import.*brandColors" "$file"; then
    echo "  ✓ Import already exists"
    return
  fi

  # Find the line number of the last import before any empty line or code
  local import_line=$(grep -n "^import " "$file" | tail -1 | cut -d: -f1)

  if [ -z "$import_line" ]; then
    echo "  ✗ Could not find import section"
    return 1
  fi

  # Add the import after the last import
  sed -i.bak "${import_line}a\\
import { BRAND, MODULE_COLOR, getColors, BRAND_ALPHA } from '../../config/brandColors';
" "$file"

  echo "  ✓ Added brand colors import"
}

# Function to replace color codes
replace_color_codes() {
  local file=$1

  # Create backup
  cp "$file" "$file.colorbackup"

  # Replace #0078d4 with BRAND.navy.main (in string contexts)
  perl -i -pe 's/(?<=["'\''`])#0078d4(?=["'\''`])/BRAND.navy.main/g' "$file"
  perl -i -pe 's/color:\s*["\x27]#0078d4["\x27]/color: BRAND.navy.main/g' "$file"
  perl -i -pe 's/borderColor:\s*["\x27]#0078d4["\x27]/borderColor: BRAND.navy.main/g' "$file"
  perl -i -pe 's/bgcolor:\s*["\x27]#0078d4["\x27]/bgcolor: BRAND.navy.main/g' "$file"

  # Replace #005a9e with BRAND.navy.dark
  perl -i -pe 's/(?<=["'\''`])#005a9e(?=["'\''`])/BRAND.navy.dark/g' "$file"
  perl -i -pe 's/color:\s*["\x27]#005a9e["\x27]/color: BRAND.navy.dark/g' "$file"

  # Replace common alpha patterns
  perl -i -pe 's/alpha\(["\x27]#0078d4["\x27],\s*0\.12\)/BRAND_ALPHA.navy[12]/g' "$file"
  perl -i -pe 's/alpha\(["\x27]#0078d4["\x27],\s*0\.1\)/BRAND_ALPHA.navy[10]/g' "$file"
  perl -i -pe 's/alpha\(["\x27]#0078d4["\x27],\s*0\.08\)/BRAND_ALPHA.navy[8]/g' "$file"
  perl -i -pe 's/alpha\(["\x27]#0078d4["\x27],\s*0\.05\)/BRAND_ALPHA.navy[5]/g' "$file"
  perl -i -pe 's/alpha\(["\x27]#0078d4["\x27],\s*0\.15\)/BRAND_ALPHA.navy[15]/g' "$file"
  perl -i -pe 's/alpha\(["\x27]#0078d4["\x27],\s*0\.2\)/BRAND_ALPHA.navy[20]/g' "$file"

  # Replace rgba patterns
  perl -i -pe 's/rgba\(0,\s*120,\s*212,\s*0\.12\)/BRAND_ALPHA.navy[12]/g' "$file"
  perl -i -pe 's/rgba\(0,\s*120,\s*212,\s*0\.1\)/BRAND_ALPHA.navy[10]/g' "$file"
  perl -i -pe 's/rgba\(0,\s*120,\s*212,\s*0\.08\)/BRAND_ALPHA.navy[8]/g' "$file"

  echo "  ✓ Replaced color codes"
}

# Process each JSX file
echo "Processing JSX files..."
echo ""

for file in "${JSX_FILES[@]}"; do
  filepath="$STOX_DIR/$file"

  if [ ! -f "$filepath" ]; then
    echo "⊘ Skipping $file (not found)"
    continue
  fi

  echo "→ Processing $file"

  # Add import
  add_brand_colors_import "$filepath"

  # Replace colors
  replace_color_codes "$filepath"

  # Remove backup created by sed -i
  rm -f "$filepath.bak"

  echo ""
done

echo "======================================"
echo "✓ All files processed"
echo "======================================"
echo ""
echo "Backups created with .colorbackup extension"
echo "Review the changes and remove backups when satisfied"
echo ""
echo "To test: npm run dev"
echo "To remove backups: find $STOX_DIR -name '*.colorbackup' -delete"
