import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mockRoutes } from './mockData';

// Custom cluster icon
const createClusterIcon = (cluster, type) => {
  const count = cluster.getChildCount();
  const colors = {
    trucks: { bg: '#3b82f6', border: '#2563eb' },
    stores: { bg: '#8b5cf6', border: '#7c3aed' },
    alerts: { bg: '#f97316', border: '#ea580c' },
  };
  const { bg, border } = colors[type] || colors.trucks;

  return L.divIcon({
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background: ${bg};
        border: 3px solid ${border};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      ">
        ${count}
      </div>
    `,
    className: 'custom-cluster-icon',
    iconSize: L.point(40, 40, true),
  });
};

// Map style options
const MAP_STYLES = {
  'cartodb-light': 'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  'cartodb-dark': 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  'esri-light': 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  'esri-dark': 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  'stadia-light': 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
  'stadia-dark': 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
};

// Custom marker icons
const createTruckIcon = (status) => {
  const colors = {
    'in-transit': '#3b82f6',
    'delayed': '#f97316',
    'idle': '#ef4444',
    'maintenance': '#ef4444',
    'delivered': '#10b981',
  };
  const color = colors[status] || '#3b82f6';
  const shouldPulse = status === 'delayed' || status === 'idle' || status === 'maintenance';

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="position: relative; width: 28px; height: 28px; background: ${color};
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35);
                    ${shouldPulse ? 'animation: pulse 2s infinite;' : ''}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M18,18.5a1.5,1.5 0 0,1 -1.5,-1.5a1.5,1.5 0 0,1 1.5,-1.5a1.5,1.5 0 0,1 1.5,1.5a1.5,1.5 0 0,1 -1.5,1.5m1.5,-9l1.96,2.5H17V9.5M6,18.5a1.5,1.5 0 0,1 -1.5,-1.5a1.5,1.5 0 0,1 1.5,-1.5a1.5,1.5 0 0,1 1.5,1.5a1.5,1.5 0 0,1 -1.5,1.5M20,8h-3V4H3a1,1 0 0,0 -1,1v11h2a3,3 0 0,0 3,3a3,3 0 0,0 3,-3h6a3,3 0 0,0 3,3a3,3 0 0,0 3,-3h2v-5z"/>
          </svg>
          ${shouldPulse ? `<div style="position: absolute; inset: -3px; border-radius: 50%; border: 1.5px solid ${color}; animation: ping 2s infinite;"></div>` : ''}
        </div>
        <div style="width: 0; height: 0; border-left: 3px solid transparent; border-right: 3px solid transparent;
                    border-top: 4px solid white; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25));"></div>
      </div>
      <style>
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes ping { 0% { transform: scale(1); opacity: 1; } 75%, 100% { transform: scale(1.5); opacity: 0; } }
      </style>
    `,
    className: 'custom-marker',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
  });
};

const createStoreIcon = (stockLevel, facilityType) => {
  const color = stockLevel < 30 ? '#ef4444' : stockLevel < 50 ? '#f97316' : '#3b82f6';
  const shouldPulse = stockLevel < 50;
  const warningColor = stockLevel < 30 ? '#dc2626' : '#fbbf24';
  const hasWarning = stockLevel < 50;
  const isDC = facilityType === 'distribution-center';

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="position: relative; width: 26px; height: 26px; background: ${color};
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35);
                    ${shouldPulse ? 'animation: pulse 2s infinite;' : ''}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
            ${isDC
              ? '<path d="M18,15H16V17H18M18,11H16V13H18M20,19H12V17H14V15H12V13H14V11H12V9H20M10,7H8V5H10M10,11H8V9H10M10,15H8V13H10M10,19H8V17H10M6,7H4V5H6M6,11H4V9H6M6,15H4V13H6M6,19H4V17H6M12,7V3H2V21H22V7H12Z"/>'
              : '<path d="M12,2L2,7V10C2,16.5 6.5,22.5 12,24C17.5,22.5 22,16.5 22,10V7L12,2M12,4.18L20,8.09V10C20,15.5 16.5,20.38 12,21.93C7.5,20.38 4,15.5 4,10V8.09L12,4.18Z"/>'
            }
          </svg>
          ${hasWarning ? `
            <div style="position: absolute; top: -5px; right: -5px; width: 12px; height: 12px;
                        background: ${warningColor}; border-radius: 50%; border: 1.5px solid white;
                        display: flex; align-items: center; justify-content: center;
                        font-size: 8px; font-weight: bold; color: white;
                        box-shadow: 0 1px 4px rgba(0,0,0,0.3);">!</div>
          ` : ''}
        </div>
        <div style="margin-top: 2px; background: ${color}; padding: 1px 5px; border-radius: 3px;
                    font-size: 8px; font-weight: bold; color: white; white-space: nowrap;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.3);">
          ${stockLevel}%
        </div>
        <div style="width: 0; height: 0; border-left: 3px solid transparent; border-right: 3px solid transparent;
                    border-top: 4px solid white; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25)); margin-top: -1px;"></div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [26, 50],
    iconAnchor: [13, 50],
  });
};

const createAlertIcon = (severity) => {
  const colors = { critical: '#ef4444', high: '#f97316', medium: '#f97316', low: '#eab308' };
  const color = colors[severity] || '#f97316';

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="position: relative; width: 30px; height: 30px; background: ${color};
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35);
                    animation: pulse 2s infinite;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/>
          </svg>
          <div style="position: absolute; inset: -4px; border-radius: 50%; border: 1.5px solid ${color}; animation: ping 2s infinite;"></div>
        </div>
        <div style="width: 0; height: 0; border-left: 3px solid transparent; border-right: 3px solid transparent;
                    border-top: 4px solid white; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25));"></div>
      </div>
      <style>
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
        @keyframes ping { 0% { transform: scale(1); opacity: 1; } 75%, 100% { transform: scale(1.6); opacity: 0; } }
      </style>
    `,
    className: 'custom-marker',
    iconSize: [30, 38],
    iconAnchor: [15, 38],
  });
};

// Component to pass map instance to parent and handle resize
function MapEventHandler({ onMapReady, isFullScreen }) {
  const map = useMap();

  useEffect(() => {
    if (onMapReady) onMapReady(map);

    // Invalidate size on mount and after a short delay to ensure proper rendering
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    // Additional delay for initial load
    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 500);

    // Handle window resize
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResize);
    };
  }, [map, onMapReady]);

  // Re-invalidate when fullscreen state changes
  useEffect(() => {
    // Wait for DOM to update after fullscreen toggle
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 50);

    // Additional invalidation to ensure tiles load properly
    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [map, isFullScreen]);

  return null;
}

// Get truck route from mock data
const getTruckRoute = (truckId) => mockRoutes[truckId] || [];

// Offset overlapping markers slightly so they're visible
// Different marker types get different offsets
const getOffsetPosition = (lat, lng, type, index = 0) => {
  const offset = 0.008; // Small offset in degrees (~0.5 miles)
  const offsets = {
    truck: [offset, 0],           // Trucks offset to the east
    store: [-offset, 0],          // Stores offset to the west
    alert: [0, offset],           // Alerts offset to the north
  };
  const [latOffset, lngOffset] = offsets[type] || [0, 0];
  return [lat + latOffset, lng + lngOffset];
};

export default function MapView({
  trucks = [],
  stores = [],
  alerts = [],
  showTrucks = true,
  showStores = true,
  showRoutes = true,
  showAlerts = true,
  onMapReady,
  mapStyle = 'cartodb-light',
  onStoreClick,
  onTruckClick,
  onAlertClick,
  isFullScreen = false,
}) {
  const [isMounted, setIsMounted] = useState(false);
  const tileUrl = MAP_STYLES[mapStyle] || MAP_STYLES['cartodb-light'];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div style={{ width: '100%', height: '100%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#64748b', fontSize: '1rem' }}>Loading map...</div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .leaflet-container {
          width: 100% !important;
          height: 100% !important;
          background: #f8fafc;
        }
        .leaflet-tile-pane {
          will-change: transform;
        }
        .leaflet-zoom-animated {
          will-change: transform;
        }
        /* Hide scrollbars by default, show on hover */
        .scrollbar-hidden {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .scrollbar-hidden::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
        .scrollbar-hover::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .scrollbar-hover::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-hover::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.3);
          border-radius: 3px;
        }
        .scrollbar-hover::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.5);
        }
        .scrollbar-hover {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
        }
        .scrollbar-hover:hover {
          scrollbar-color: rgba(100, 116, 139, 0.3) transparent;
        }
        .scrollbar-hover:hover::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.3);
        }
      `}</style>
      <MapContainer
        center={[39.0, -98.0]}
        zoom={4}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
        attributionControl={false}
        preferCanvas={true}
      >
      <MapEventHandler onMapReady={onMapReady} isFullScreen={isFullScreen} />
      <TileLayer url={tileUrl} maxZoom={20} minZoom={2} />

      {/* Store markers with clustering */}
      {showStores && (
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={(cluster) => createClusterIcon(cluster, 'stores')}
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
        >
          {stores.map((store) => (
            <Marker
              key={store.store_id}
              position={getOffsetPosition(store.latitude, store.longitude, 'store')}
              icon={createStoreIcon(store.stock_level, store.facility_type)}
            >
              <Popup minWidth={220} maxWidth={220}>
                <div style={{ padding: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>{store.name}</h3>
                    <div style={{ width: '24px', height: '24px', background: '#8b5cf6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                        {store.facility_type === 'distribution-center'
                          ? <path d="M18,15H16V17H18M18,11H16V13H18M20,19H12V17H14V15H12V13H14V11H12V9H20M10,7H8V5H10M10,11H8V9H10M10,15H8V13H10M10,19H8V17H10M6,7H4V5H6M6,11H4V9H6M6,15H4V13H6M6,19H4V17H6M12,7V3H2V21H22V7H12Z"/>
                          : <path d="M18.36 9L18.96 12H5.04L5.64 9H18.36M20 4H4V6H20V4M20 7H4L3 12V14H4V20H14V14H18V20H20V14H21V12L20 7M6 18V14H12V18H6Z"/>
                        }
                      </svg>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#64748b' }}>Stock:</span>
                      <span style={{ fontWeight: 700, color: store.stock_level < 50 ? '#ea580c' : '#0891b2' }}>{store.stock_level}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#64748b' }}>Available:</span>
                      <span style={{ color: '#334155' }}>{(store.available_stock || store.current_stock).toLocaleString()} units</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Demand:</span>
                      <span style={{ color: '#334155' }}>{store.demand_rate}/day</span>
                    </div>
                  </div>
                  {store.stock_level < 30 && (
                    <div style={{ marginBottom: '8px', padding: '4px 8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', fontSize: '0.625rem', color: '#b91c1c' }}>
                      Critical Stock
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); onStoreClick?.(store); }}
                    style={{ width: '100%', padding: '6px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      )}

      {/* Route polylines - render separately so they can be toggled independently */}
      {showRoutes && trucks.map((truck) => {
        const route = getTruckRoute(truck.truck_id);
        if (route.length === 0) return null;

        const routeColor = truck.status === 'delayed' ? '#f97316' :
                          truck.status === 'in-transit' ? '#3b82f6' : '#64748b';

        return (
          <Polyline
            key={`route-${truck.truck_id}`}
            positions={route}
            pathOptions={{
              color: routeColor,
              weight: 4,
              opacity: 0.8,
            }}
          />
        );
      })}

      {/* Truck markers with clustering */}
      {showTrucks && (
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={(cluster) => createClusterIcon(cluster, 'trucks')}
          maxClusterRadius={40}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
        >
          {trucks.map((truck) => (
            <Marker key={truck.truck_id} position={getOffsetPosition(truck.latitude, truck.longitude, 'truck')} icon={createTruckIcon(truck.status)}>
              <Popup minWidth={200} maxWidth={200}>
                <div style={{ padding: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>{truck.truck_id}</h3>
                    <div style={{ width: '24px', height: '24px', background: truck.status === 'delayed' ? '#f97316' : '#3b82f6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                        <path d="M18,18.5a1.5,1.5 0 0,1 -1.5,-1.5a1.5,1.5 0 0,1 1.5,-1.5a1.5,1.5 0 0,1 1.5,1.5a1.5,1.5 0 0,1 -1.5,1.5m1.5,-9l1.96,2.5H17V9.5M6,18.5a1.5,1.5 0 0,1 -1.5,-1.5a1.5,1.5 0 0,1 1.5,-1.5a1.5,1.5 0 0,1 1.5,1.5a1.5,1.5 0 0,1 -1.5,1.5M20,8h-3V4H3a1,1 0 0,0 -1,1v11h2a3,3 0 0,0 3,3a3,3 0 0,0 3,-3h6a3,3 0 0,0 3,3a3,3 0 0,0 3,-3h2v-5z"/>
                      </svg>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ color: '#64748b' }}>Status:</span>
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 700,
                        background: truck.status === 'delayed' ? '#ffedd5' : truck.status === 'in-transit' ? '#dbeafe' : truck.status === 'delivered' ? '#dcfce7' : '#f1f5f9',
                        color: truck.status === 'delayed' ? '#c2410c' : truck.status === 'in-transit' ? '#1d4ed8' : truck.status === 'delivered' ? '#15803d' : '#475569',
                      }}>
                        {truck.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#64748b' }}>Cargo:</span>
                      <span style={{ color: '#334155' }}>{Math.round((truck.cargo_loaded / truck.cargo_capacity) * 100)}%</span>
                    </div>
                    {truck.destination_name && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>To:</span>
                        <span style={{ color: '#334155', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginLeft: '8px' }}>{truck.destination_name}</span>
                      </div>
                    )}
                  </div>
                  {truck.status === 'delayed' && (
                    <div style={{ marginBottom: '8px', padding: '4px 8px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '4px', fontSize: '0.625rem', color: '#c2410c' }}>
                      Delayed
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); onTruckClick?.(truck); }}
                    style={{ width: '100%', padding: '6px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      )}

      {/* Alert markers with clustering */}
      {showAlerts && (
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={(cluster) => createClusterIcon(cluster, 'alerts')}
          maxClusterRadius={60}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
        >
          {alerts.map((alert) => {
            const severity = alert.severity || (alert.priority >= 9 ? 'critical' : alert.priority >= 6 ? 'high' : alert.priority >= 3 ? 'medium' : 'low');

            return (
              <Marker key={alert.id} position={getOffsetPosition(alert.latitude, alert.longitude, 'alert')} icon={createAlertIcon(severity)}>
                <Popup minWidth={240} maxWidth={240}>
                  <div style={{ padding: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '24px', height: '24px', background: severity === 'critical' ? '#ef4444' : severity === 'high' ? '#f97316' : '#eab308', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                          <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/>
                        </svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: '0 0 4px 0', color: '#1e293b' }}>{alert.title}</h3>
                        <span style={{
                          padding: '2px 8px', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
                          background: severity === 'critical' ? '#fef2f2' : severity === 'high' ? '#fff7ed' : severity === 'medium' ? '#fefce8' : '#eff6ff',
                          color: severity === 'critical' ? '#b91c1c' : severity === 'high' ? '#c2410c' : severity === 'medium' ? '#a16207' : '#1d4ed8',
                        }}>
                          {severity}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#475569', margin: '0 0 12px 0', lineHeight: 1.4 }}>{alert.message}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); onAlertClick?.(alert); }}
                      style={{ width: '100%', padding: '6px', background: '#ea580c', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      View Analysis
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      )}

      {/* Alert alternate routes (rendered outside cluster) */}
      {showAlerts && alerts.map((alert) => (
        alert.alternate_route && alert.alternate_route.length > 0 && (
          <Polyline key={`alt-route-${alert.id}`} positions={alert.alternate_route} pathOptions={{ color: '#ef4444', weight: 4, opacity: 0.7, dashArray: '10, 10' }} />
        )
      ))}
      </MapContainer>
    </>
  );
}
