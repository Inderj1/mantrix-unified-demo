#!/bin/bash

# Remove local getColors functions from stox components

set -e

STOX_DIR="frontend/src/components/stox"

echo "======================================"
echo "Removing Local getColors Functions"
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

  # Check if file has local getColors
  if ! grep -q "^const getColors = (darkMode) => ({" "$filepath"; then
    continue
  fi

  echo "→ Removing local getColors from $file"

  # Use perl to remove the multiline getColors function
  # This removes from "const getColors =" until the closing "});"
  perl -i -0pe 's/const getColors = \(darkMode\) => \({[^}]*border:.*;[^}]*\}\);/\/\/ Using centralized getColors from brandColors config/gs' "$filepath"

  echo "  ✓ Removed local getColors function"
done

echo ""
echo "======================================"
echo "✓ Local getColors functions removed"
echo "======================================"
