import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Card,
  CardContent,
  IconButton,
  Button,
  Tooltip,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  alpha,
  Grid,
} from '@mui/material';
import {
  Map as MapIcon,
  LocationOn as LocationIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Layers as LayersIcon,
  Timeline as TimelineIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

// Sample data for distribution centers with inventory
const distributionCenters = [
  {
    id: 'dc-phoenix',
    name: 'Phoenix Distribution Center',
    location: { lat: 33.4484, lng: -112.0740 },
    totalInventory: 45800,
    mlPredictedDemand: 52000,
    criticalItems: 3,
    lowItems: 8,
    optimalItems: 42,
    topProducts: [
      { name: 'Siena Brown', stock: 2450, status: 'optimal' },
      { name: 'Palermo Black', stock: 5200, status: 'excess' },
      { name: 'Root Touch-Up Brown', stock: 3800, status: 'optimal' },
    ],
    capacity: 85,
    mlOptimizationScore: 92,
  },
  {
    id: 'dc-la',
    name: 'Los Angeles Distribution Center',
    location: { lat: 34.0522, lng: -118.2437 },
    totalInventory: 38500,
    mlPredictedDemand: 45000,
    criticalItems: 5,
    lowItems: 12,
    optimalItems: 35,
    topProducts: [
      { name: 'Ravenna Red', stock: 890, status: 'low' },
      { name: 'Valencia Blonde', stock: 1200, status: 'optimal' },
      { name: 'Siena Brown', stock: 3200, status: 'optimal' },
    ],
    capacity: 92,
    mlOptimizationScore: 78,
  },
  {
    id: 'dc-dallas',
    name: 'Dallas Distribution Center',
    location: { lat: 32.7767, lng: -96.7970 },
    totalInventory: 52000,
    mlPredictedDemand: 48000,
    criticalItems: 1,
    lowItems: 4,
    optimalItems: 48,
    topProducts: [
      { name: 'Palermo Black', stock: 8500, status: 'excess' },
      { name: 'Siena Brown', stock: 4200, status: 'optimal' },
      { name: 'Root Touch-Up Blonde', stock: 2100, status: 'optimal' },
    ],
    capacity: 67,
    mlOptimizationScore: 88,
  },
  {
    id: 'dc-miami',
    name: 'Miami Distribution Center',
    location: { lat: 25.7617, lng: -80.1918 },
    totalInventory: 28900,
    mlPredictedDemand: 35000,
    criticalItems: 8,
    lowItems: 15,
    optimalItems: 25,
    topProducts: [
      { name: 'Valencia Blonde', stock: 450, status: 'critical' },
      { name: 'Ravenna Red', stock: 680, status: 'low' },
      { name: 'Tropical Copper', stock: 1800, status: 'optimal' },
    ],
    capacity: 88,
    mlOptimizationScore: 65,
  },
];

const MapComponent = ({ centers, showMLPredictions, selectedMetric }) => {
  const ref = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [infoWindows, setInfoWindows] = useState([]);

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center: { lat: 39.8283, lng: -98.5795 }, // Center of US
        zoom: 4,
        mapTypeId: 'roadmap',
        styles: [
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#e9e9e9' }, { lightness: 17 }],
          },
          {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }, { lightness: 20 }],
          },
        ],
      });
      setMap(newMap);
    }
  }, [ref, map]);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers and info windows
    markers.forEach(marker => marker.setMap(null));
    infoWindows.forEach(infoWindow => infoWindow.close());

    const newMarkers = [];
    const newInfoWindows = [];

    centers.forEach(center => {
      // Determine marker color based on ML optimization score
      let markerColor = '#4caf50'; // green
      if (center.mlOptimizationScore < 70) markerColor = '#f44336'; // red
      else if (center.mlOptimizationScore < 85) markerColor = '#ff9800'; // orange

      // Create custom marker
      const marker = new window.google.maps.Marker({
        position: center.location,
        map,
        title: center.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: Math.sqrt(center.totalInventory / 1000) + 10,
          fillColor: markerColor,
          fillOpacity: 0.7,
          strokeColor: markerColor,
          strokeWeight: 2,
        },
      });

      // Create info window content
      const infoContent = `
        <div style="padding: 12px; min-width: 280px;">
          <h3 style="margin: 0 0 12px 0; color: #1976d2;">${center.name}</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <p style="margin: 4px 0; font-size: 14px;">
                <strong>Total Inventory:</strong> ${center.totalInventory.toLocaleString()} units
              </p>
              <p style="margin: 4px 0; font-size: 14px;">
                <strong>ML Predicted Demand:</strong> ${center.mlPredictedDemand.toLocaleString()} units
              </p>
              <p style="margin: 4px 0; font-size: 14px;">
                <strong>Capacity:</strong> ${center.capacity}%
              </p>
            </div>
            <div>
              <p style="margin: 4px 0; font-size: 14px;">
                <strong>ML Optimization:</strong> 
                <span style="color: ${markerColor}; font-weight: bold;">
                  ${center.mlOptimizationScore}%
                </span>
              </p>
              <p style="margin: 4px 0; font-size: 14px;">
                <strong>Critical Items:</strong> <span style="color: #f44336;">${center.criticalItems}</span>
              </p>
              <p style="margin: 4px 0; font-size: 14px;">
                <strong>Low Stock Items:</strong> <span style="color: #ff9800;">${center.lowItems}</span>
              </p>
            </div>
          </div>
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e0e0e0;">
            <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px;">Top Products:</p>
            ${center.topProducts.map(product => `
              <div style="display: flex; justify-content: space-between; align-items: center; margin: 4px 0;">
                <span style="font-size: 13px;">${product.name}</span>
                <span style="
                  background: ${product.status === 'critical' ? '#ffebee' : product.status === 'low' ? '#fff3e0' : product.status === 'excess' ? '#e3f2fd' : '#e8f5e9'};
                  color: ${product.status === 'critical' ? '#c62828' : product.status === 'low' ? '#ef6c00' : product.status === 'excess' ? '#1565c0' : '#2e7d32'};
                  padding: 2px 8px;
                  border-radius: 12px;
                  font-size: 12px;
                  font-weight: 500;
                ">${product.stock.toLocaleString()} units</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      const infoWindow = new window.google.maps.InfoWindow({
        content: infoContent,
      });

      marker.addListener('click', () => {
        // Close all other info windows
        newInfoWindows.forEach(iw => iw.close());
        infoWindow.open(map, marker);
      });

      newMarkers.push(marker);
      newInfoWindows.push(infoWindow);

      // Add ML prediction overlay if enabled
      if (showMLPredictions) {
        const predictionCircle = new window.google.maps.Circle({
          strokeColor: '#2196f3',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#2196f3',
          fillOpacity: 0.1,
          map,
          center: center.location,
          radius: (center.mlPredictedDemand / center.totalInventory) * 50000,
        });
      }
    });

    setMarkers(newMarkers);
    setInfoWindows(newInfoWindows);
  }, [map, centers, showMLPredictions]);

  return <div ref={ref} style={{ width: '100%', height: '600px' }} />;
};

const InventoryMap = () => {
  const [showMLPredictions, setShowMLPredictions] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('optimization');
  const [selectedCenter, setSelectedCenter] = useState(null);

  const renderMapWrapper = (status) => {
    if (status === Status.LOADING) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height={600}>
          <Typography>Loading map...</Typography>
        </Box>
      );
    }
    return null;
  };

  const getTotalStats = () => {
    const total = distributionCenters.reduce((acc, center) => ({
      inventory: acc.inventory + center.totalInventory,
      critical: acc.critical + center.criticalItems,
      low: acc.low + center.lowItems,
      optimal: acc.optimal + center.optimalItems,
    }), { inventory: 0, critical: 0, low: 0, optimal: 0 });

    return total;
  };

  const stats = getTotalStats();

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Inventory Distribution Map
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time inventory levels across distribution centers
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={showMLPredictions}
                  onChange={(e) => setShowMLPredictions(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <ScienceIcon fontSize="small" />
                  <Typography variant="body2">ML Predictions</Typography>
                </Stack>
              }
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>View Metric</InputLabel>
              <Select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                label="View Metric"
              >
                <MenuItem value="optimization">ML Optimization</MenuItem>
                <MenuItem value="inventory">Total Inventory</MenuItem>
                <MenuItem value="demand">Predicted Demand</MenuItem>
                <MenuItem value="capacity">Capacity Usage</MenuItem>
              </Select>
            </FormControl>
            <IconButton size="small">
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Inventory
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {(stats.inventory / 1000).toFixed(1)}K
                  </Typography>
                  <Typography variant="caption" color="primary">
                    Units across all DCs
                  </Typography>
                </Box>
                <InventoryIcon sx={{ fontSize: 40, color: 'primary.light' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Critical Items
                  </Typography>
                  <Typography variant="h5" fontWeight={600} color="error.main">
                    {stats.critical}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Immediate action needed
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 40, color: 'error.light' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Low Stock Items
                  </Typography>
                  <Typography variant="h5" fontWeight={600} color="warning.main">
                    {stats.low}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Monitor closely
                  </Typography>
                </Box>
                <InfoIcon sx={{ fontSize: 40, color: 'warning.light' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Optimal Items
                  </Typography>
                  <Typography variant="h5" fontWeight={600} color="success.main">
                    {stats.optimal}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Well stocked
                  </Typography>
                </Box>
                <CheckIcon sx={{ fontSize: 40, color: 'success.light' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Map */}
      <Paper sx={{ overflow: 'hidden' }}>
        <Wrapper
          apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          render={renderMapWrapper}
          libraries={['visualization']}
        >
          <MapComponent
            centers={distributionCenters}
            showMLPredictions={showMLPredictions}
            selectedMetric={selectedMetric}
          />
        </Wrapper>
        
        {/* Map Legend */}
        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Map Legend
          </Typography>
          <Stack direction="row" spacing={3} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 16, height: 16, bgcolor: '#4caf50', borderRadius: '50%' }} />
              <Typography variant="caption">High ML Optimization (85%+)</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 16, height: 16, bgcolor: '#ff9800', borderRadius: '50%' }} />
              <Typography variant="caption">Medium ML Optimization (70-85%)</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 16, height: 16, bgcolor: '#f44336', borderRadius: '50%' }} />
              <Typography variant="caption">Low ML Optimization (&lt;70%)</Typography>
            </Stack>
            {showMLPredictions && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 16, height: 16, bgcolor: alpha('#2196f3', 0.3), border: '2px solid #2196f3', borderRadius: '50%' }} />
                <Typography variant="caption">ML Demand Prediction Zone</Typography>
              </Stack>
            )}
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default InventoryMap;