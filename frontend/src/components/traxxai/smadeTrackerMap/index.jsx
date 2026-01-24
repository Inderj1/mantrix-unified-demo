import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography, IconButton, Stack, Chip, Button, ToggleButton, ToggleButtonGroup, Tooltip, CircularProgress } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SensorsIcon from '@mui/icons-material/Sensors';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

import MapView from './MapView';
import ChatPanel from './ChatPanel';
import KitDetailsPanel from './KitDetailsPanel';
import FacilityDetailsPanel from './FacilityDetailsPanel';
import AlertDetailsPanel from './AlertDetailsPanel';
import { generateMockData } from './mockData';

export default function SmadeTrackerMap({ onBack, kitData }) {
  const [kits, setKits] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mapStyle, setMapStyle] = useState('cartodb-light');
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [selectedKit, setSelectedKit] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filters, setFilters] = useState({
    kits: true,
    facilities: true,
    routes: true,
    alerts: true,
  });
  const [highlightedItems, setHighlightedItems] = useState({ type: null, ids: [] });

  const mapRef = useRef(null);

  // Transform kit data from KitControlTower format to map format
  const transformKitDataToMapFormat = useCallback((data) => {
    if (!data || data.length === 0) return { kits: [], facilities: [], alerts: [] };

    // Map List View statuses to MapView expected statuses
    const statusMapping = {
      'at hospital': 'at-facility',
      'in transit': 'in-transit',
      'idle': 'at-dc',
      'qc': 'at-dc',
      'quarantine': 'awaiting-return',
    };

    // Transform kits
    const transformedKits = data.map((kit) => ({
      id: kit.id,
      kit_id: kit.id,
      kit_type: kit.kitCategory,
      kit_serial: kit.kitSerial,
      process_type: kit.kitType.toLowerCase(),
      status: statusMapping[kit.currentStatus.toLowerCase()] || 'at-dc',
      latitude: kit.gpsLat,
      longitude: kit.gpsLong,
      facility_name: kit.hospitalName,
      distributor: kit.distributorName,
      tracker_id: kit.trackerId,
      battery_level: 85, // Default battery level
      last_heartbeat: kit.lastHeartbeat,
      days_at_location: kit.daysInStatus,
      priority: kit.priority,
      next_action: kit.nextExpectedAction,
      temp_alerts: kit.tempAlerts,
      tamper_alerts: kit.tamperAlerts,
      revenue: kit.revenueThisUsage,
      cogs: kit.cogsThisUsage,
      commission: kit.commissionThisUsage,
      shipping_cost: kit.shippingCostThisUsage,
      contract_tier: kit.contractTier,
      waybill: kit.lastShipmentWaybill,
      shipping_provider: kit.lastShipmentProvider,
      value: kit.revenueThisUsage || 0, // Add value for MapView popup
    }));

    // Extract unique facilities from kit data
    const facilityMap = new Map();
    data.forEach((kit) => {
      if (kit.hospitalName && kit.hospitalName !== 'Unassigned') {
        const key = kit.hospitalName;
        if (!facilityMap.has(key)) {
          facilityMap.set(key, {
            id: `facility-${facilityMap.size + 1}`,
            name: kit.hospitalName,
            type: 'hospital',
            latitude: kit.gpsLat + (Math.random() - 0.5) * 0.01, // Slight offset for visibility
            longitude: kit.gpsLong + (Math.random() - 0.5) * 0.01,
            kits_on_site: 1, // MapView expects kits_on_site, not kit_count
            pending_surgeries: 0, // Default value
            status: 'active', // Default status
            distributor: kit.distributorName,
          });
        } else {
          facilityMap.get(key).kits_on_site++;
        }
      }
    });
    const transformedFacilities = Array.from(facilityMap.values());

    // Generate alerts from kit data
    const transformedAlerts = data
      .filter((kit) => kit.priority === 'red' || kit.priority === 'yellow' || kit.tempAlerts > 0 || kit.tamperAlerts > 0)
      .map((kit, idx) => ({
        id: `alert-${idx + 1}`,
        kit_id: kit.id,
        type: kit.tempAlerts > 0 ? 'temperature' : kit.tamperAlerts > 0 ? 'tamper' : kit.priority === 'red' ? 'critical' : 'warning',
        severity: kit.priority === 'red' ? 'critical' : 'warning',
        message: kit.tempAlerts > 0
          ? `Temperature alert on ${kit.id}`
          : kit.tamperAlerts > 0
          ? `Tamper alert on ${kit.id}`
          : `${kit.nextExpectedAction} - ${kit.id}`,
        latitude: kit.gpsLat,
        longitude: kit.gpsLong,
        facility_name: kit.hospitalName,
        created_at: kit.lastHeartbeat,
      }));

    return {
      kits: transformedKits,
      facilities: transformedFacilities,
      alerts: transformedAlerts,
    };
  }, []);

  // Initialize data
  const initializeData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));

      // Use kitData if provided, otherwise use mock data
      if (kitData && kitData.length > 0) {
        const transformed = transformKitDataToMapFormat(kitData);
        setKits(transformed.kits);
        setFacilities(transformed.facilities);
        setAlerts(transformed.alerts);
      } else {
        // Fallback to mock data
        const mockData = generateMockData();
        setKits(mockData.kits);
        setFacilities(mockData.facilities);
        setAlerts(mockData.alerts);
      }
    } catch (error) {
      console.error('Failed to initialize data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [kitData, transformKitDataToMapFormat]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [isFullScreen]);

  // Map handlers
  const handleMapReady = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const handleZoomIn = useCallback(() => {
    if (mapRef.current) mapRef.current.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) mapRef.current.zoomOut();
  }, []);

  const handleResetView = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.setView([39.0, -98.0], 4, { animate: true });
    }
  }, []);

  const handleFacilityClick = useCallback((facility) => {
    setSelectedKit(null);
    setSelectedAlert(null);
    setSelectedFacility(facility);
    if (facility && mapRef.current) {
      mapRef.current.setView([facility.latitude, facility.longitude], 10, { animate: true });
    }
  }, []);

  const handleKitClick = useCallback((kit) => {
    setSelectedFacility(null);
    setSelectedAlert(null);
    setSelectedKit(kit);
    if (kit && mapRef.current) {
      mapRef.current.setView([kit.latitude, kit.longitude], 12, { animate: true });
    }
  }, []);

  const handleAlertClick = useCallback((alert) => {
    setSelectedFacility(null);
    setSelectedKit(null);
    setSelectedAlert(alert);
    if (alert && mapRef.current) {
      mapRef.current.setView([alert.latitude, alert.longitude], 10, { animate: true });
    }
  }, []);

  const handleCloseDetailsPanel = useCallback(() => {
    setSelectedFacility(null);
    setSelectedKit(null);
    setSelectedAlert(null);
  }, []);

  const handleFilterChange = (filter) => {
    setFilters((prev) => ({ ...prev, [filter]: !prev[filter] }));
  };

  const handleHighlightItems = useCallback((type, ids) => {
    setHighlightedItems({ type, ids });
    // Clear highlight after 5 seconds
    setTimeout(() => setHighlightedItems({ type: null, ids: [] }), 5000);
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={40} sx={{ color: '#00357a' }} />
          <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>Loading TRACK AI...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', bgcolor: '#f8fafc' }}>
      {/* Top Header Bar */}
      {!isFullScreen && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 48,
            bgcolor: 'white',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderBottom: '1px solid',
            borderColor: alpha('#64748b', 0.15),
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            px: 2,
          }}
        >
          <IconButton onClick={onBack} size="small" sx={{ mr: 1 }}>
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              p: 0.75,
              borderRadius: 1,
              background: 'linear-gradient(135deg, #00357a 0%, #002352 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(10, 110, 209, 0.3)',
            }}>
              <SensorsIcon sx={{ fontSize: 18, color: 'white' }} />
            </Box>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>TRACK AI</Typography>
            <Chip label="TRAXX.AI" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha('#00357a', 0.15), color: '#002352' }} />
            <Chip label="IoT" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha('#10b981', 0.15), color: '#059669' }} />
          </Stack>

          {/* Filter Toggles */}
          <Stack direction="row" spacing={1} sx={{ ml: 'auto', mr: 2 }}>
            <FilterToggle icon={<MedicalServicesIcon sx={{ fontSize: 14 }} />} label="Kits" active={filters.kits} onClick={() => handleFilterChange('kits')} />
            <FilterToggle icon={<LocalHospitalIcon sx={{ fontSize: 14 }} />} label="Facilities" active={filters.facilities} onClick={() => handleFilterChange('facilities')} />
            <FilterToggle icon={<WarningAmberIcon sx={{ fontSize: 14 }} />} label="Alerts" active={filters.alerts} onClick={() => handleFilterChange('alerts')} />
          </Stack>

          {/* Map Style Selector */}
          <ToggleButtonGroup
            value={mapStyle}
            exclusive
            onChange={(e, value) => value && setMapStyle(value)}
            size="small"
            sx={{
              mr: 1,
              bgcolor: alpha('#64748b', 0.08),
              borderRadius: 1.5,
              p: 0.5,
              '& .MuiToggleButtonGroup-grouped': {
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '8px !important',
                mx: 0.5,
              },
            }}
          >
            <ToggleButton
              value="cartodb-light"
              sx={{
                py: 0.75,
                px: 2.5,
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#64748b',
                textTransform: 'none',
                minWidth: 70,
                '&.Mui-selected': {
                  bgcolor: 'white',
                  color: '#1e293b',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  '&:hover': { bgcolor: 'white' },
                },
                '&:hover': { bgcolor: alpha('#64748b', 0.1) },
              }}
            >
              Light
            </ToggleButton>
            <ToggleButton
              value="cartodb-dark"
              sx={{
                py: 0.75,
                px: 2.5,
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#64748b',
                textTransform: 'none',
                minWidth: 70,
                '&.Mui-selected': {
                  bgcolor: 'white',
                  color: '#1e293b',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  '&:hover': { bgcolor: 'white' },
                },
                '&:hover': { bgcolor: alpha('#64748b', 0.1) },
              }}
            >
              Dark
            </ToggleButton>
            <ToggleButton
              value="esri-light"
              sx={{
                py: 0.75,
                px: 2.5,
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#64748b',
                textTransform: 'none',
                minWidth: 70,
                '&.Mui-selected': {
                  bgcolor: 'white',
                  color: '#1e293b',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  '&:hover': { bgcolor: 'white' },
                },
                '&:hover': { bgcolor: alpha('#64748b', 0.1) },
              }}
            >
              ESRI
            </ToggleButton>
          </ToggleButtonGroup>

          <Tooltip title="Refresh Data">
            <IconButton onClick={initializeData} size="small">
              <RefreshIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Map Container */}
      <Box
        sx={{
          position: 'absolute',
          top: isFullScreen ? 0 : 48,
          left: 0,
          right: isFullScreen ? 0 : 320,
          bottom: 0,
          zIndex: 500,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
          <MapView
            key={`map-${isFullScreen}`}
            kits={kits}
            facilities={facilities}
            alerts={alerts}
            showKits={filters.kits}
            showFacilities={filters.facilities}
            showRoutes={filters.routes}
            showAlerts={filters.alerts}
            onMapReady={handleMapReady}
            mapStyle={mapStyle}
            onFacilityClick={handleFacilityClick}
            onKitClick={handleKitClick}
            onAlertClick={handleAlertClick}
            isFullScreen={isFullScreen}
          />
        </Box>

        {/* Map Controls */}
        <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 1000 }}>
          <Stack spacing={0.5}>
            <Tooltip title="Zoom In" placement="right">
              <IconButton size="small" onClick={handleZoomIn} sx={{ bgcolor: 'white', boxShadow: 1, '&:hover': { bgcolor: '#f1f5f9' } }}>
                <ZoomInIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom Out" placement="right">
              <IconButton size="small" onClick={handleZoomOut} sx={{ bgcolor: 'white', boxShadow: 1, '&:hover': { bgcolor: '#f1f5f9' } }}>
                <ZoomOutIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reset View" placement="right">
              <IconButton size="small" onClick={handleResetView} sx={{ bgcolor: 'white', boxShadow: 1, '&:hover': { bgcolor: '#f1f5f9' } }}>
                <CenterFocusStrongIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'} placement="right">
              <IconButton size="small" onClick={() => setIsFullScreen(!isFullScreen)} sx={{ bgcolor: 'white', boxShadow: 1, '&:hover': { bgcolor: '#f1f5f9' } }}>
                {isFullScreen ? <FullscreenExitIcon sx={{ fontSize: 20 }} /> : <FullscreenIcon sx={{ fontSize: 20 }} />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Box>

      {/* Chat Panel - 70% height within map view */}
      {!isFullScreen && (
        <Box sx={{ position: 'absolute', top: 48, right: 0, height: 'calc(70% - 48px)', width: 320, zIndex: 600 }}>
          <ChatPanel
            kits={kits}
            facilities={facilities}
            alerts={alerts}
            onKitClick={handleKitClick}
            onFacilityClick={handleFacilityClick}
            onAlertClick={handleAlertClick}
            onHighlightItems={handleHighlightItems}
          />
        </Box>
      )}

      {/* Detail Panels */}
      {selectedFacility && (
        <FacilityDetailsPanel
          facility={selectedFacility}
          alerts={alerts}
          kits={kits}
          onClose={handleCloseDetailsPanel}
        />
      )}

      {selectedKit && (
        <KitDetailsPanel
          kit={selectedKit}
          alerts={alerts}
          onClose={handleCloseDetailsPanel}
        />
      )}

      {selectedAlert && (
        <AlertDetailsPanel
          alert={selectedAlert}
          onClose={handleCloseDetailsPanel}
        />
      )}
    </Box>
  );
}

// Filter Toggle Button Component
function FilterToggle({ icon, label, active, onClick }) {
  return (
    <Chip
      icon={icon}
      label={label}
      size="small"
      onClick={onClick}
      sx={{
        height: 32,
        fontSize: '0.75rem',
        fontWeight: 600,
        bgcolor: active ? alpha('#00357a', 0.15) : alpha('#64748b', 0.08),
        color: active ? '#002352' : '#64748b',
        border: '1px solid',
        borderColor: active ? alpha('#00357a', 0.3) : 'transparent',
        borderRadius: 2,
        cursor: 'pointer',
        '&:hover': { bgcolor: active ? alpha('#00357a', 0.2) : alpha('#64748b', 0.12) },
        '& .MuiChip-icon': { color: 'inherit', ml: 1 },
        '& .MuiChip-label': { px: 1.5 },
      }}
    />
  );
}
