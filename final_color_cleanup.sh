#!/bin/bash

# Final cleanup of remaining old color codes

set -e

STOX_DIR="frontend/src/components/stox"

echo "======================================"
echo "Final Color Code Cleanup"
echo "======================================"
echo ""

cd "$(dirname "$0")"

# List of .jsx files
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
    continue
  fi

  # Check if file still has old color codes
  if ! grep -q "#0078d4\|#005a9e" "$filepath"; then
    continue
  fi

  echo "→ Cleaning remaining colors in $file"

  # Replace #0078d4 in template literals
  perl -i -pe 's/#0078d4/\${BRAND.navy.main}/g' "$filepath"

  # Replace #005a9e in template literals
  perl -i -pe 's/#005a9e/\${BRAND.navy.dark}/g' "$filepath"

  echo "  ✓ Cleaned remaining color codes"
done

echo ""
echo "======================================"
echo "✓ Final cleanup complete"
echo "======================================"
