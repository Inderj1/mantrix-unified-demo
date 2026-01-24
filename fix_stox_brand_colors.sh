#!/bin/bash

# Fix the color replacements - convert quoted brand colors to unquoted expressions

set -e

STOX_DIR="frontend/src/components/stox"

echo "======================================"
echo "Fixing Brand Color References"
echo "======================================"
echo ""

cd "$(dirname "$0")"

# List of .jsx files to fix
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

for file in "${JSX_FILES[@]}"; do
  filepath="$STOX_DIR/$file"

  if [ ! -f "$filepath" ]; then
    echo "⊘ Skipping $file (not found)"
    continue
  fi

  echo "→ Fixing $file"

  # Fix quoted BRAND references (remove quotes around BRAND.navy.main/dark)
  perl -i -pe 's/["\x27](BRAND\.navy\.(?:main|dark|light))["\x27]/\1/g' "$filepath"

  # Fix alpha expressions with quoted BRAND
  perl -i -pe 's/alpha\(["\x27](BRAND\.navy\.main)["\x27],\s*([0-9.]+)\)/alpha(\1, \2)/g' "$filepath"
  perl -i -pe 's/alpha\(["\x27](BRAND\.navy\.dark)["\x27],\s*([0-9.]+)\)/alpha(\1, \2)/g' "$filepath"

  # Fix borderColor, color, bgcolor with quoted BRAND
  perl -i -pe 's/(borderColor|color|bgcolor):\s*["\x27](BRAND\.navy\.(?:main|dark|light))["\x27]/\1: \2/g' "$filepath"

  # Fix template literals with BRAND
  perl -i -pe 's/`([^`]*)["\x27](BRAND\.navy\.(?:main|dark|light))["\x27]([^`]*)`/`\1\${\2}\3`/g' "$filepath"

  echo "  ✓ Fixed color references"
done

echo ""
echo "======================================"
echo "✓ Fixes applied"
echo "======================================"
