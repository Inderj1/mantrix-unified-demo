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
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StoreIcon from '@mui/icons-material/Store';
import RouteIcon from '@mui/icons-material/Route';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MapIcon from '@mui/icons-material/Map';

import MapView from './MapView';
import LeftSidebar from './LeftSidebar';
import RightPanel from './RightPanel';
import BottomPanel from './BottomPanel';
import FacilityDetailsPanel from './FacilityDetailsPanel';
import TruckDetailsPanel from './TruckDetailsPanel';
import AlertDetailsPanel from './AlertDetailsPanel';
import {
  trucksApi,
  storesApi,
  alertsApi,
  agentsApi,
  seedDatabase,
  generateAIActions,
  calculateAutopilotStatus,
  separateActions,
  USE_MOCK,
} from './api';

export default function SupplyChainMap({ onBack }) {
  const [trucks, setTrucks] = useState([]);
  const [stores, setStores] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mapStyle, setMapStyle] = useState('cartodb-light');
  const [aiActions, setAiActions] = useState([]);
  const [autopilotStatus, setAutopilotStatus] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filters, setFilters] = useState({
    trucks: true,
    stores: true,
    routes: true,
    alerts: true,
  });

  const mapRef = useRef(null);

  // Initialize data
  const initializeData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Try to seed database (for live mode)
      if (!USE_MOCK) {
        try {
          await seedDatabase();
        } catch (error) {
          console.log('Database already seeded or seed failed');
        }
      }

      // Fetch all data in parallel
      const [trucksRes, storesRes, alertsRes, agentsRes] = await Promise.all([
        trucksApi.getAll(),
        storesApi.getAll(),
        alertsApi.getAll('active'),
        agentsApi.getAll(),
      ]);

      if (trucksRes.data) setTrucks(trucksRes.data);
      if (storesRes.data) setStores(storesRes.data);
      if (alertsRes.data) setAlerts(alertsRes.data);
      if (agentsRes.data?.agents) setAgents(agentsRes.data.agents);
    } catch (error) {
      console.error('Failed to initialize data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Generate AI actions based on current state
  useEffect(() => {
    if (trucks.length > 0 && stores.length > 0) {
      const actions = generateAIActions(trucks, stores, alerts);
      setAiActions(actions);
      const status = calculateAutopilotStatus(actions);
      setAutopilotStatus(status);
    }
  }, [trucks, stores, alerts]);

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

  const handleStoreClick = useCallback((store) => {
    // Close other panels when opening this one
    setSelectedTruck(null);
    setSelectedAlert(null);
    setSelectedStore(store);
    if (store && mapRef.current) {
      mapRef.current.setView([store.latitude, store.longitude], 10, { animate: true });
    }
  }, []);

  const handleTruckClick = useCallback((truck) => {
    // Close other panels when opening this one
    setSelectedStore(null);
    setSelectedAlert(null);
    setSelectedTruck(truck);
    if (truck && mapRef.current) {
      mapRef.current.setView([truck.latitude, truck.longitude], 12, { animate: true });
    }
  }, []);

  const handleAlertClick = useCallback((alert) => {
    // Close other panels when opening this one
    setSelectedStore(null);
    setSelectedTruck(null);
    setSelectedAlert(alert);
    if (alert && mapRef.current) {
      mapRef.current.setView([alert.latitude, alert.longitude], 10, { animate: true });
    }
  }, []);

  const handleCloseDetailsPanel = useCallback(() => {
    setSelectedStore(null);
    setSelectedTruck(null);
    setSelectedAlert(null);
  }, []);

  const handleFilterChange = (filter) => {
    setFilters((prev) => ({ ...prev, [filter]: !prev[filter] }));
  };

  const handleApproveAction = useCallback((action) => {
    setAiActions((prev) =>
      prev.map((a) =>
        a.id === action.id ? { ...a, status: 'completed', actual_impact: a.predicted_impact } : a
      )
    );
  }, []);

  const handleRejectAction = useCallback((action) => {
    setAiActions((prev) => prev.filter((a) => a.id !== action.id));
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={40} sx={{ color: '#3b82f6' }} />
          <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>Loading Supply Chain Map...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden', bgcolor: '#f8fafc' }}>
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
              background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(14, 165, 233, 0.3)',
            }}>
              <MapIcon sx={{ fontSize: 18, color: 'white' }} />
            </Box>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>Supply Chain Map</Typography>
            {USE_MOCK && (
              <Chip label="DEMO" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha('#f59e0b', 0.15), color: '#d97706' }} />
            )}
          </Stack>

          {/* Filter Toggles */}
          <Stack direction="row" spacing={1} sx={{ ml: 'auto', mr: 2 }}>
            <FilterToggle icon={<LocalShippingIcon sx={{ fontSize: 14 }} />} label="Trucks" active={filters.trucks} onClick={() => handleFilterChange('trucks')} />
            <FilterToggle icon={<StoreIcon sx={{ fontSize: 14 }} />} label="Stores" active={filters.stores} onClick={() => handleFilterChange('stores')} />
            <FilterToggle icon={<RouteIcon sx={{ fontSize: 14 }} />} label="Routes" active={filters.routes} onClick={() => handleFilterChange('routes')} />
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
                border: 'none',
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
          left: isFullScreen ? 0 : 280,
          right: isFullScreen ? 0 : 280,
          bottom: isFullScreen ? 0 : 200,
          zIndex: 500,
          overflow: 'hidden',
        }}
      >
        <MapView
          trucks={trucks}
          stores={stores}
          alerts={alerts}
          showTrucks={filters.trucks}
          showStores={filters.stores}
          showRoutes={filters.routes}
          showAlerts={filters.alerts}
          onMapReady={handleMapReady}
          mapStyle={mapStyle}
          onStoreClick={handleStoreClick}
          onTruckClick={handleTruckClick}
          onAlertClick={handleAlertClick}
          isFullScreen={isFullScreen}
        />

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

      {/* Left Sidebar */}
      {!isFullScreen && (
        <Box sx={{ position: 'absolute', top: 48, left: 0, bottom: 200, width: 280, zIndex: 600 }}>
          <LeftSidebar
            trucks={trucks}
            stores={stores}
            alerts={alerts}
            aiActions={aiActions}
            onAlertClick={handleAlertClick}
            onActionClick={(action) => console.log('Action clicked:', action)}
          />
        </Box>
      )}

      {/* Right Panel */}
      {!isFullScreen && (
        <Box sx={{ position: 'absolute', top: 48, right: 0, bottom: 200, width: 280, zIndex: 600 }}>
          <RightPanel
            agents={agents}
            actionsToday={autopilotStatus?.actions_today || 0}
            costSavedWeek={autopilotStatus?.cost_saved_week || 0}
            issuesPrevented={autopilotStatus?.issues_prevented || 0}
          />
        </Box>
      )}

      {/* Bottom Panel */}
      {!isFullScreen && (
        <BottomPanel
          pendingDecisions={separateActions(aiActions).pending}
          completedActions={separateActions(aiActions).completed}
          onApprove={handleApproveAction}
          onReject={handleRejectAction}
        />
      )}

      {/* Detail Panels */}
      {selectedStore && (
        <FacilityDetailsPanel
          store={selectedStore}
          alerts={alerts}
          trucks={trucks}
          onClose={handleCloseDetailsPanel}
        />
      )}

      {selectedTruck && (
        <TruckDetailsPanel
          truck={selectedTruck}
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
        bgcolor: active ? alpha('#3b82f6', 0.15) : alpha('#64748b', 0.08),
        color: active ? '#2563eb' : '#64748b',
        border: '1px solid',
        borderColor: active ? alpha('#3b82f6', 0.3) : 'transparent',
        borderRadius: 2,
        cursor: 'pointer',
        '&:hover': { bgcolor: active ? alpha('#3b82f6', 0.2) : alpha('#64748b', 0.12) },
        '& .MuiChip-icon': { color: 'inherit', ml: 1 },
        '& .MuiChip-label': { px: 1.5 },
      }}
    />
  );
}
