import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
} from '@mui/material';
import {
  Map as MapIcon,
  LocationOn as LocationIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShowChart as ShowChartIcon,
  FilterList as FilterIcon,
  Layers as LayersIcon,
  MyLocation as MyLocationIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Place as PlaceIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

// Sample geographic data for Arizona Beverages
const sampleGeographicData = {
  salesRegions: [
    {
      id: 'southwest',
      name: 'Southwest Region',
      center: { lat: 33.4484, lng: -112.0740 }, // Phoenix
      revenue: 15200000,
      growth: 8.5,
      customers: 2430,
      distributors: 12,
      marketShare: 34.2,
      topProduct: '24pk 23oz CAN NP',
      color: '#1976d2',
      radius: 200000, // meters
    },
    {
      id: 'california',
      name: 'California Region',
      center: { lat: 34.0522, lng: -118.2437 }, // Los Angeles
      revenue: 28400000,
      growth: 12.3,
      customers: 4150,
      distributors: 18,
      marketShare: 28.7,
      topProduct: '12pk 20oz PET',
      color: '#388e3c',
      radius: 250000,
    },
    {
      id: 'texas',
      name: 'Texas Region',
      center: { lat: 29.7604, lng: -95.3698 }, // Houston
      revenue: 22100000,
      growth: -2.1,
      customers: 3200,
      distributors: 15,
      marketShare: 19.8,
      topProduct: '20oz PET Bottle',
      color: '#f57c00',
      radius: 300000,
    },
    {
      id: 'florida',
      name: 'Florida Region',
      center: { lat: 25.7617, lng: -80.1918 }, // Miami
      revenue: 18600000,
      growth: 15.7,
      customers: 2890,
      distributors: 14,
      marketShare: 22.4,
      topProduct: '24pk 23oz CAN NP',
      color: '#7b1fa2',
      radius: 180000,
    },
  ],
  distributionCenters: [
    { id: 'dc1', name: 'Phoenix DC', position: { lat: 33.4484, lng: -112.0740 }, capacity: 85, utilization: 78 },
    { id: 'dc2', name: 'Los Angeles DC', position: { lat: 34.0522, lng: -118.2437 }, capacity: 120, utilization: 92 },
    { id: 'dc3', name: 'Dallas DC', position: { lat: 32.7767, lng: -96.7970 }, capacity: 95, utilization: 67 },
    { id: 'dc4', name: 'Atlanta DC', position: { lat: 33.7490, lng: -84.3880 }, capacity: 110, utilization: 88 },
  ],
  supplyChainRisks: [
    { 
      id: 'hurricane', 
      type: 'Weather', 
      position: { lat: 25.7617, lng: -80.1918 }, 
      severity: 'HIGH', 
      impact: '$3.2M',
      description: 'Hurricane season affecting Florida operations',
      affectedFacilities: 8
    },
    { 
      id: 'drought', 
      type: 'Weather', 
      position: { lat: 36.7783, lng: -119.4179 }, 
      severity: 'MEDIUM', 
      impact: '$1.1M',
      description: 'Water shortage affecting production',
      affectedFacilities: 3
    },
    { 
      id: 'port-congestion', 
      type: 'Logistics', 
      position: { lat: 33.7430, lng: -118.2647 }, 
      severity: 'HIGH', 
      impact: '$2.5M',
      description: 'Port delays affecting ingredient imports',
      affectedFacilities: 5
    },
  ],
};

const MapComponent = ({ data, viewMode, showHeatmap, selectedRegion, onRegionSelect, signalData, showSignalOverlay, highlightedSignal }) => {
  const ref = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [heatmap, setHeatmap] = useState(null);
  const [signalMarkers, setSignalMarkers] = useState([]);

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

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    const newMarkers = [];

    if (viewMode === 'sales') {
      // Add sales region markers
      data.salesRegions.forEach(region => {
        const marker = new window.google.maps.Marker({
          position: region.center,
          map,
          title: region.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: Math.sqrt(region.revenue / 1000000) * 3,
            fillColor: region.color,
            fillOpacity: 0.7,
            strokeColor: region.color,
            strokeWeight: 2,
          },
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; min-width: 200px;">
              <h3 style="margin: 0 0 10px 0; color: ${region.color}">${region.name}</h3>
              <p><strong>Revenue:</strong> $${(region.revenue / 1000000).toFixed(1)}M</p>
              <p><strong>Growth:</strong> ${region.growth > 0 ? '+' : ''}${region.growth}%</p>
              <p><strong>Market Share:</strong> ${region.marketShare}%</p>
              <p><strong>Customers:</strong> ${region.customers.toLocaleString()}</p>
              <p><strong>Top Product:</strong> ${region.topProduct}</p>
            </div>
          `,
        });

        marker.addListener('click', (e) => {
          e.stop();
          infoWindow.open(map, marker);
          onRegionSelect(region);
        });

        // Add circle overlay for region coverage
        const circle = new window.google.maps.Circle({
          strokeColor: region.color,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: region.color,
          fillOpacity: 0.15,
          map,
          center: region.center,
          radius: region.radius,
        });

        newMarkers.push(marker);
      });
    }

    if (viewMode === 'distribution') {
      // Add distribution center markers
      data.distributionCenters.forEach(dc => {
        const utilizationColor = dc.utilization > 90 ? '#f44336' : dc.utilization > 75 ? '#ff9800' : '#4caf50';
        
        const marker = new window.google.maps.Marker({
          position: dc.position,
          map,
          title: dc.name,
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 8,
            fillColor: utilizationColor,
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px;">
              <h3 style="margin: 0 0 10px 0;">${dc.name}</h3>
              <p><strong>Capacity:</strong> ${dc.capacity}K units</p>
              <p><strong>Utilization:</strong> ${dc.utilization}%</p>
              <div style="background: ${utilizationColor}; color: white; padding: 4px 8px; border-radius: 4px; margin-top: 8px;">
                ${dc.utilization > 90 ? 'Over Capacity' : dc.utilization > 75 ? 'High Utilization' : 'Normal'}
              </div>
            </div>
          `,
        });

        marker.addListener('click', (e) => {
          e.stop();
          infoWindow.open(map, marker);
        });

        newMarkers.push(marker);
      });
    }

    if (viewMode === 'risks') {
      // Add supply chain risk markers
      data.supplyChainRisks.forEach(risk => {
        const severityColor = risk.severity === 'HIGH' ? '#f44336' : risk.severity === 'MEDIUM' ? '#ff9800' : '#4caf50';
        
        const marker = new window.google.maps.Marker({
          position: risk.position,
          map,
          title: risk.description,
          icon: {
            path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 10,
            fillColor: severityColor,
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px;">
              <h3 style="margin: 0 0 10px 0; color: ${severityColor}">${risk.type} Risk</h3>
              <p><strong>Description:</strong> ${risk.description}</p>
              <p><strong>Severity:</strong> ${risk.severity}</p>
              <p><strong>Impact:</strong> ${risk.impact}</p>
              <p><strong>Affected Facilities:</strong> ${risk.affectedFacilities}</p>
            </div>
          `,
        });

        marker.addListener('click', (e) => {
          e.stop();
          infoWindow.open(map, marker);
        });

        newMarkers.push(marker);
      });
    }

    setMarkers(newMarkers);
  }, [map, data, viewMode, onRegionSelect]);

  // Add signal overlay markers
  useEffect(() => {
    if (!map || !signalData || !showSignalOverlay) return;

    // Clear existing signal markers
    signalMarkers.forEach(marker => marker.setMap(null));
    const newSignalMarkers = [];

    // Map signals to geographic locations
    const signalLocations = {
      Weather: [
        { lat: 25.7617, lng: -80.1918, name: 'Hurricane Risk - Florida', severity: 85 },
        { lat: 36.7783, lng: -119.4179, name: 'Drought - California', severity: 72 },
      ],
      Supply: [
        { lat: 33.7430, lng: -118.2647, name: 'Port Congestion - LA', severity: 92 },
        { lat: 29.7604, lng: -95.3698, name: 'Supply Chain Delays - Houston', severity: 75 },
      ],
      Competitor: [
        { lat: 33.4484, lng: -112.0740, name: 'Competitor Launch - Phoenix', severity: 45 },
      ],
      Social: [
        { lat: 34.0522, lng: -118.2437, name: 'Viral Trend - Los Angeles', severity: 72 },
        { lat: 25.7617, lng: -80.1918, name: 'Social Media Buzz - Miami', severity: 68 },
      ],
      Economic: [
        { lat: 40.7128, lng: -74.0060, name: 'Interest Rate Impact - NYC', severity: 38 },
      ],
    };

    signalData.forEach(signal => {
      const locations = signalLocations[signal.signal] || [];
      const isHighlighted = highlightedSignal === signal.signal;
      
      locations.forEach(location => {
        // Create pulsing circle marker for signals
        const signalIcon = {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: isHighlighted ? Math.sqrt(location.severity) * 3 : Math.sqrt(location.severity) * 2,
          fillColor: location.severity >= 80 ? '#f44336' : location.severity >= 60 ? '#ff9800' : '#ffeb3b',
          fillOpacity: isHighlighted ? 0.7 : 0.4,
          strokeColor: location.severity >= 80 ? '#f44336' : location.severity >= 60 ? '#ff9800' : '#ffeb3b',
          strokeOpacity: isHighlighted ? 1 : 0.8,
          strokeWeight: isHighlighted ? 4 : 2,
        };

        const marker = new window.google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map,
          title: location.name,
          icon: signalIcon,
          animation: isHighlighted || location.severity >= 80 ? window.google.maps.Animation.BOUNCE : null,
        });

        // Add pulsing effect for high severity signals
        if (location.severity >= 60) {
          const circle = new window.google.maps.Circle({
            strokeColor: signalIcon.fillColor,
            strokeOpacity: 0,
            strokeWeight: 0,
            fillColor: signalIcon.fillColor,
            fillOpacity: 0.2,
            map,
            center: { lat: location.lat, lng: location.lng },
            radius: 50000 * (location.severity / 100),
          });

          // Animate the circle
          let opacity = 0.2;
          let expanding = true;
          setInterval(() => {
            if (expanding) {
              opacity += 0.01;
              if (opacity >= 0.4) expanding = false;
            } else {
              opacity -= 0.01;
              if (opacity <= 0.1) expanding = true;
            }
            circle.setOptions({ fillOpacity: opacity });
          }, 50);
        }

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; min-width: 200px;">
              <h3 style="margin: 0 0 10px 0; color: ${signalIcon.fillColor}">${signal.signal} Signal</h3>
              <p><strong>Location:</strong> ${location.name}</p>
              <p><strong>Severity:</strong> ${location.severity}%</p>
              <p><strong>Trend:</strong> ${signal.trend}</p>
              <p style="margin-top: 10px;">${signal.details}</p>
            </div>
          `,
        });

        marker.addListener('click', (e) => {
          e.stop();
          infoWindow.open(map, marker);
          if (onRegionSelect) {
            onRegionSelect({ signal: signal.signal, location });
          }
        });

        newSignalMarkers.push(marker);
      });
    });

    setSignalMarkers(newSignalMarkers);
    
    // Auto-focus on highlighted signal
    if (highlightedSignal && signalData) {
      const signal = signalData.find(s => s.signal === highlightedSignal);
      if (signal) {
        const locations = signalLocations[signal.signal];
        if (locations && locations.length > 0) {
          map.panTo({ lat: locations[0].lat, lng: locations[0].lng });
          map.setZoom(6);
        }
      }
    }
  }, [map, signalData, showSignalOverlay, onRegionSelect, highlightedSignal]);

  // Handle heatmap
  useEffect(() => {
    if (!map || !window.google.maps.visualization) return;

    if (heatmap) {
      heatmap.setMap(null);
    }

    if (showHeatmap) {
      let heatmapData = [];
      
      if (viewMode === 'sales') {
        // Revenue-based heatmap
        heatmapData = data.salesRegions.map(region => ({
          location: new window.google.maps.LatLng(region.center.lat, region.center.lng),
          weight: region.revenue / 1000000, // Weight by revenue
        }));
      } else if (viewMode === 'signals' && signalData) {
        // Signal intensity heatmap
        const signalLocations = {
          Weather: [
            { lat: 25.7617, lng: -80.1918, severity: 85 },
            { lat: 36.7783, lng: -119.4179, severity: 72 },
          ],
          Supply: [
            { lat: 33.7430, lng: -118.2647, severity: 92 },
            { lat: 29.7604, lng: -95.3698, severity: 75 },
          ],
          Competitor: [
            { lat: 33.4484, lng: -112.0740, severity: 45 },
          ],
          Social: [
            { lat: 34.0522, lng: -118.2437, severity: 72 },
            { lat: 25.7617, lng: -80.1918, severity: 68 },
          ],
          Economic: [
            { lat: 40.7128, lng: -74.0060, severity: 38 },
          ],
        };
        
        signalData.forEach(signal => {
          const locations = signalLocations[signal.signal] || [];
          locations.forEach(location => {
            heatmapData.push({
              location: new window.google.maps.LatLng(location.lat, location.lng),
              weight: location.severity / 10, // Normalize severity for heatmap
            });
          });
        });
      }

      if (heatmapData.length > 0) {
        const gradient = viewMode === 'signals' ? [
          'rgba(0, 255, 255, 0)',
          'rgba(0, 255, 255, 1)',
          'rgba(0, 191, 255, 1)',
          'rgba(0, 127, 255, 1)',
          'rgba(0, 63, 255, 1)',
          'rgba(0, 0, 255, 1)',
          'rgba(0, 0, 223, 1)',
          'rgba(0, 0, 191, 1)',
          'rgba(0, 0, 159, 1)',
          'rgba(0, 0, 127, 1)',
          'rgba(63, 0, 91, 1)',
          'rgba(127, 0, 63, 1)',
          'rgba(191, 0, 31, 1)',
          'rgba(255, 0, 0, 1)'
        ] : null;

        const newHeatmap = new window.google.maps.visualization.HeatmapLayer({
          data: heatmapData,
          map,
          radius: viewMode === 'signals' ? 80 : 50,
          opacity: 0.6,
          gradient: gradient,
        });

        setHeatmap(newHeatmap);
      }
    }
  }, [map, showHeatmap, viewMode, data, signalData]);

  return (
    <div 
      ref={ref} 
      style={{ 
        width: '100%', 
        height: '500px',
        position: 'relative',
        zIndex: 1
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onTouchStart={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    />
  );
};

const GeographicAnalysis = ({ signalData, onSignalLocationClick, highlightedSignal }) => {
  const [viewMode, setViewMode] = useState('sales');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [showSignalOverlay, setShowSignalOverlay] = useState(true);

  const handleRegionSelect = useCallback((region) => {
    setSelectedRegion(region);
    if (onSignalLocationClick) {
      onSignalLocationClick(region);
    }
  }, [onSignalLocationClick]);

  const renderStatus = (status) => {
    return status === Status.LOADING ? (
      <Box display="flex" justifyContent="center" alignItems="center" height={500}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Google Maps...</Typography>
      </Box>
    ) : null;
  };

  const getRegionStats = () => {
    const totalRevenue = sampleGeographicData.salesRegions.reduce((sum, region) => sum + region.revenue, 0);
    const avgGrowth = sampleGeographicData.salesRegions.reduce((sum, region) => sum + region.growth, 0) / sampleGeographicData.salesRegions.length;
    const totalCustomers = sampleGeographicData.salesRegions.reduce((sum, region) => sum + region.customers, 0);

    return { totalRevenue, avgGrowth, totalCustomers };
  };

  const stats = getRegionStats();

  return (
    <Box>
      {/* Header Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MapIcon color="primary" />
              Geographic Analysis
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
              fullWidth
            >
              <ToggleButton value="sales">
                <TrendingUpIcon sx={{ mr: 1 }} />
                Sales Regions
              </ToggleButton>
              <ToggleButton value="distribution">
                <LocationIcon sx={{ mr: 1 }} />
                Distribution
              </ToggleButton>
              <ToggleButton value="risks">
                <WarningIcon sx={{ mr: 1 }} />
                Risk Factors
              </ToggleButton>
              {signalData && (
                <ToggleButton value="signals">
                  <AnalyticsIcon sx={{ mr: 1 }} />
                  Market Signals
                </ToggleButton>
              )}
            </ToggleButtonGroup>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={2} alignItems="center">
              {(viewMode === 'sales' || viewMode === 'signals') && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={showHeatmap}
                      onChange={(e) => setShowHeatmap(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Heat Map"
                />
              )}
              {signalData && viewMode !== 'signals' && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={showSignalOverlay}
                      onChange={(e) => setShowSignalOverlay(e.target.checked)}
                      size="small"
                      color="secondary"
                    />
                  }
                  label="Signal Overlay"
                />
              )}
              <Tooltip title="Refresh Data">
                <IconButton size="small" onClick={() => setLoading(true)}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4" color="primary">
                ${(stats.totalRevenue / 1000000).toFixed(1)}M
              </Typography>
              <Typography variant="body2" color={stats.avgGrowth > 0 ? 'success.main' : 'error.main'}>
                {stats.avgGrowth > 0 ? '+' : ''}{stats.avgGrowth.toFixed(1)}% avg growth
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Regions
              </Typography>
              <Typography variant="h4" color="secondary">
                {sampleGeographicData.salesRegions.length}
              </Typography>
              <Typography variant="body2">
                {sampleGeographicData.distributionCenters.length} distribution centers
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Customers
              </Typography>
              <Typography variant="h4" color="info.main">
                {stats.totalCustomers.toLocaleString()}
              </Typography>
              <Typography variant="body2">
                Across all regions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Risk Level
              </Typography>
              <Typography variant="h4" color="warning.main">
                MEDIUM
              </Typography>
              <Typography variant="body2">
                {sampleGeographicData.supplyChainRisks.length} active risks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Map and Details */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Interactive Map - {viewMode === 'sales' ? 'Sales Regions' : viewMode === 'distribution' ? 'Distribution Centers' : viewMode === 'risks' ? 'Risk Factors' : 'Market Signals'}
            </Typography>
            <Box 
              sx={{ 
                position: 'relative',
                pointerEvents: 'auto',
                '& *': {
                  pointerEvents: 'auto'
                }
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <Wrapper
                apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                render={renderStatus}
                libraries={['visualization']}
              >
                <MapComponent
                  data={sampleGeographicData}
                  viewMode={viewMode}
                  showHeatmap={showHeatmap}
                  selectedRegion={selectedRegion}
                  onRegionSelect={handleRegionSelect}
                  signalData={signalData}
                  showSignalOverlay={showSignalOverlay}
                  highlightedSignal={highlightedSignal}
                />
              </Wrapper>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom>
              {viewMode === 'sales' ? 'Region Details' : 
               viewMode === 'distribution' ? 'Distribution Status' : 
               viewMode === 'risks' ? 'Risk Assessment' :
               'Signal Overview'}
            </Typography>
            
            {viewMode === 'sales' && (
              <List dense>
                {sampleGeographicData.salesRegions.map((region) => (
                  <ListItem 
                    key={region.id}
                    sx={{ 
                      border: selectedRegion?.id === region.id ? `2px solid ${region.color}` : '1px solid #e0e0e0',
                      borderRadius: 1,
                      mb: 1,
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedRegion(region)}
                  >
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: region.color, width: 32, height: 32 }}>
                        <LocationIcon fontSize="small" />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={region.name}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            Revenue: ${(region.revenue / 1000000).toFixed(1)}M
                          </Typography>
                          <Chip
                            size="small"
                            label={`${region.growth > 0 ? '+' : ''}${region.growth}%`}
                            color={region.growth > 0 ? 'success' : 'error'}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}

            {viewMode === 'distribution' && (
              <List dense>
                {sampleGeographicData.distributionCenters.map((dc) => (
                  <ListItem key={dc.id} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 1 }}>
                    <ListItemIcon>
                      <Avatar sx={{ 
                        bgcolor: dc.utilization > 90 ? 'error.main' : dc.utilization > 75 ? 'warning.main' : 'success.main',
                        width: 32, 
                        height: 32 
                      }}>
                        <LocationIcon fontSize="small" />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={dc.name}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            Utilization: {dc.utilization}%
                          </Typography>
                          <Typography variant="body2">
                            Capacity: {dc.capacity}K units
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}

            {viewMode === 'risks' && (
              <List dense>
                {sampleGeographicData.supplyChainRisks.map((risk) => (
                  <ListItem key={risk.id} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 1 }}>
                    <ListItemIcon>
                      <Avatar sx={{ 
                        bgcolor: risk.severity === 'HIGH' ? 'error.main' : risk.severity === 'MEDIUM' ? 'warning.main' : 'success.main',
                        width: 32, 
                        height: 32 
                      }}>
                        <WarningIcon fontSize="small" />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={risk.type}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {risk.description}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Impact: {risk.impact}
                          </Typography>
                          <Chip
                            size="small"
                            label={risk.severity}
                            color={risk.severity === 'HIGH' ? 'error' : 'warning'}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}

            {viewMode === 'signals' && signalData && (
              <List dense>
                {signalData.map((signal) => {
                  const getSignalColor = (value) => {
                    if (value >= 80) return '#f44336';
                    if (value >= 60) return '#ff9800';
                    return '#ffeb3b';
                  };
                  
                  return (
                    <ListItem 
                      key={signal.signal}
                      sx={{ 
                        border: `2px solid ${getSignalColor(signal.value)}`,
                        borderRadius: 1,
                        mb: 1,
                        cursor: 'pointer',
                        bgcolor: highlightedSignal === signal.signal ? `${getSignalColor(signal.value)}10` : 'transparent'
                      }}
                      onClick={() => onSignalLocationClick && onSignalLocationClick({ signal: signal.signal })}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ 
                          bgcolor: getSignalColor(signal.value),
                          width: 32, 
                          height: 32 
                        }}>
                          <AnalyticsIcon fontSize="small" />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" fontWeight="500">
                              {signal.signal}
                            </Typography>
                            <Chip 
                              label={`${signal.value}%`} 
                              size="small" 
                              sx={{ 
                                bgcolor: getSignalColor(signal.value),
                                color: 'white'
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              {signal.details}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Trend: {signal.trend}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GeographicAnalysis;