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
    trucks: { bg: '#2b88d8', border: '#0078d4' },
    stores: { bg: '#0078d4', border: '#005a9e' },
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

// Custom marker icons - supports ground, air, sea shipments
const createTruckIcon = (status, shipmentType = 'ground') => {
  const colors = {
    'in-transit': '#2b88d8',
    'delayed': '#f97316',
    'idle': '#94a3b8',
    'delivered': '#10b981',
  };
  const color = colors[status] || '#2b88d8';
  const shouldPulse = status === 'delayed';

  // Different icons for different shipment types
  const icons = {
    ground: '<path d="M18,18.5a1.5,1.5 0 0,1 -1.5,-1.5a1.5,1.5 0 0,1 1.5,-1.5a1.5,1.5 0 0,1 1.5,1.5a1.5,1.5 0 0,1 -1.5,1.5m1.5,-9l1.96,2.5H17V9.5M6,18.5a1.5,1.5 0 0,1 -1.5,-1.5a1.5,1.5 0 0,1 1.5,-1.5a1.5,1.5 0 0,1 1.5,1.5a1.5,1.5 0 0,1 -1.5,1.5M20,8h-3V4H3a1,1 0 0,0 -1,1v11h2a3,3 0 0,0 3,3a3,3 0 0,0 3,-3h6a3,3 0 0,0 3,3a3,3 0 0,0 3,-3h2v-5z"/>',
    air: '<path d="M21,16V14L13,9V3.5A1.5,1.5 0 0,0 11.5,2A1.5,1.5 0 0,0 10,3.5V9L2,14V16L10,13.5V19L8,20.5V22L11.5,21L15,22V20.5L13,19V13.5L21,16Z"/>',
    sea: '<path d="M20,21C18.61,21 17.22,20.53 16,19.67C13.56,21.38 10.44,21.38 8,19.67C6.78,20.53 5.39,21 4,21H2V23H4C5.37,23 6.74,22.65 8,22C10.5,23.3 13.5,23.3 16,22C17.26,22.65 18.62,23 20,23H22V21H20M20,17C18.61,17 17.22,16.53 16,15.67C13.56,17.38 10.44,17.38 8,15.67C6.78,16.53 5.39,17 4,17H2V19H4C5.37,19 6.74,18.65 8,18C10.5,19.3 13.5,19.3 16,18C17.26,18.65 18.62,19 20,19H22V17H20M22,13.5V12L12,7V1H10V7L0,12V13.5L10,10V14.6L8,15.6V17.5L11,16.5L14,17.5V15.6L12,14.6V10L22,13.5Z"/>',
  };
  const icon = icons[shipmentType] || icons.ground;

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="position: relative; width: 28px; height: 28px; background: ${color};
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35);
                    ${shouldPulse ? 'animation: pulse 2s infinite;' : ''}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            ${icon}
          </svg>
          ${shouldPulse ? `<div style="position: absolute; inset: -3px; border-radius: 50%; border: 1.5px solid ${color}; animation: ping 2s infinite;"></div>` : ''}
        </div>
      </div>
      <style>
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes ping { 0% { transform: scale(1); opacity: 1; } 75%, 100% { transform: scale(1.5); opacity: 0; } }
      </style>
    `,
    className: 'custom-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const createStoreIcon = (stockLevel, facilityType) => {
  const isPlant = facilityType === 'plant';
  const isVendor = facilityType === 'vendor';

  // Plants: blue when healthy, orange/red when low
  // Vendors: green (suppliers)
  let color;
  if (isVendor) {
    color = '#10b981'; // Green for vendors
  } else {
    color = stockLevel < 60 ? '#ef4444' : stockLevel < 75 ? '#f59e0b' : '#0078d4';
  }

  const shouldPulse = isPlant && stockLevel < 70;
  const hasWarning = isPlant && stockLevel < 70;

  // Different icons for plant vs vendor
  const plantIcon = '<path d="M18,15H16V17H18M18,11H16V13H18M20,19H12V17H14V15H12V13H14V11H12V9H20M10,7H8V5H10M10,11H8V9H10M10,15H8V13H10M10,19H8V17H10M6,7H4V5H6M6,11H4V9H6M6,15H4V13H6M6,19H4V17H6M12,7V3H2V21H22V7H12Z"/>';
  const vendorIcon = '<path d="M18.36 9L18.96 12H5.04L5.64 9H18.36M20 4H4V6H20V4M20 7H4L3 12V14H4V20H14V14H18V20H20V14H21V12L20 7M6 18V14H12V18H6Z"/>';

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="position: relative; width: ${isPlant ? 30 : 24}px; height: ${isPlant ? 30 : 24}px; background: ${color};
                    border-radius: ${isPlant ? '6px' : '50%'}; display: flex; align-items: center; justify-content: center;
                    border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35);
                    ${shouldPulse ? 'animation: pulse 2s infinite;' : ''}">
          <svg width="${isPlant ? 16 : 12}" height="${isPlant ? 16 : 12}" viewBox="0 0 24 24" fill="white">
            ${isPlant ? plantIcon : vendorIcon}
          </svg>
          ${hasWarning ? `
            <div style="position: absolute; top: -6px; right: -6px; width: 14px; height: 14px;
                        background: #ef4444; border-radius: 50%; border: 2px solid white;
                        display: flex; align-items: center; justify-content: center;
                        font-size: 9px; font-weight: bold; color: white;
                        box-shadow: 0 1px 4px rgba(0,0,0,0.3);">!</div>
          ` : ''}
        </div>
        ${isPlant ? `
          <div style="margin-top: 2px; background: ${color}; padding: 2px 6px; border-radius: 4px;
                      font-size: 9px; font-weight: bold; color: white; white-space: nowrap;
                      box-shadow: 0 1px 4px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.3);">
            ${stockLevel}%
          </div>
        ` : ''}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [isPlant ? 30 : 24, isPlant ? 52 : 30],
    iconAnchor: [isPlant ? 15 : 12, isPlant ? 52 : 30],
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

    // Invalidate size multiple times to handle race conditions
    const timers = [50, 100, 250, 500, 1000].map((delay) =>
      setTimeout(() => {
        map.invalidateSize();
      }, delay)
    );

    // Handle window resize
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    // Use ResizeObserver to detect container size changes
    const container = map.getContainer();
    let resizeObserver;
    if (container && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(container);
    }

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [map, onMapReady]);

  // Re-invalidate when fullscreen state changes
  useEffect(() => {
    // Wait for DOM to update after fullscreen toggle
    const timers = [50, 100, 200, 400].map((delay) =>
      setTimeout(() => {
        map.invalidateSize();
      }, delay)
    );

    return () => {
      timers.forEach(clearTimeout);
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
        worldCopyJump={true}
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
              <Popup minWidth={240} maxWidth={240}>
                <div style={{ padding: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>{store.name}</h3>
                      <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{store.country} • {store.region}</span>
                    </div>
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 700,
                      background: store.facility_type === 'plant' ? '#deecf9' : '#d1fae5',
                      color: store.facility_type === 'plant' ? '#0078d4' : '#059669',
                    }}>
                      {store.facility_type === 'plant' ? 'PLANT' : 'VENDOR'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', marginBottom: '8px' }}>
                    {store.facility_type === 'plant' ? (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: '#64748b' }}>Capacity:</span>
                          <span style={{ fontWeight: 700, color: store.stock_level < 70 ? '#ea580c' : '#0891b2' }}>{store.stock_level}%</span>
                        </div>
                        {store.inventory_value && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#64748b' }}>Inventory:</span>
                            <span style={{ color: '#0078d4', fontWeight: 600 }}>${(store.inventory_value / 1000000).toFixed(0)}M</span>
                          </div>
                        )}
                        {store.customers && (
                          <div style={{ marginTop: '6px', padding: '4px 8px', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.65rem', color: '#334155' }}>
                            <span style={{ color: '#64748b' }}>Customers: </span>{store.customers.join(', ')}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: '#64748b' }}>Category:</span>
                          <span style={{ color: '#334155', fontWeight: 500 }}>{store.category}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: '#64748b' }}>Lead Time:</span>
                          <span style={{ color: '#334155' }}>{store.lead_time} days</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748b' }}>Rating:</span>
                          <span style={{ color: '#f59e0b', fontWeight: 600 }}>★ {store.vendor_rating}</span>
                        </div>
                      </>
                    )}
                  </div>
                  {store.facility_type === 'plant' && store.stock_level < 70 && (
                    <div style={{ marginBottom: '8px', padding: '4px 8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', fontSize: '0.625rem', color: '#b91c1c' }}>
                      ⚠ Low Stock Alert
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); onStoreClick?.(store); }}
                    style={{ width: '100%', padding: '6px', background: store.facility_type === 'plant' ? '#0078d4' : '#10b981', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {store.facility_type === 'plant' ? 'View Plant Details' : 'View Vendor Profile'}
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      )}

      {/* Route polylines - clean curved arcs for global routes */}
      {showRoutes && trucks.map((truck) => {
        const route = getTruckRoute(truck.truck_id);
        if (route.length < 2) return null;

        const routeColor = truck.status === 'delayed' ? '#f97316' :
                          truck.status === 'in-transit' ? '#0078d4' :
                          truck.status === 'delivered' ? '#10b981' : '#94a3b8';

        // Generate curved arc points for smoother routes
        const generateArcPoints = (start, end, numPoints = 20) => {
          const points = [];
          for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const lat = start[0] + (end[0] - start[0]) * t;
            const lng = start[1] + (end[1] - start[1]) * t;
            // Add curvature for longer routes
            const distance = Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2));
            const curvature = Math.min(distance * 0.15, 8);
            const curve = Math.sin(t * Math.PI) * curvature;
            points.push([lat + curve * 0.3, lng]);
          }
          return points;
        };

        // Create smooth curved route through all waypoints
        const curvedRoute = [];
        for (let i = 0; i < route.length - 1; i++) {
          const arcPoints = generateArcPoints(route[i], route[i + 1], 15);
          curvedRoute.push(...(i === 0 ? arcPoints : arcPoints.slice(1)));
        }

        return (
          <React.Fragment key={`route-${truck.truck_id}`}>
            {/* Glow effect */}
            <Polyline
              positions={curvedRoute}
              pathOptions={{
                color: routeColor,
                weight: 8,
                opacity: 0.15,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Main route line */}
            <Polyline
              positions={curvedRoute}
              pathOptions={{
                color: routeColor,
                weight: 2.5,
                opacity: 0.85,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </React.Fragment>
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
            <Marker key={truck.truck_id} position={getOffsetPosition(truck.latitude, truck.longitude, 'truck')} icon={createTruckIcon(truck.status, truck.type)}>
              <Popup minWidth={220} maxWidth={220}>
                <div style={{ padding: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>{truck.truck_id}</h3>
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 700,
                      background: truck.status === 'delayed' ? '#ffedd5' : truck.status === 'in-transit' ? '#deecf9' : truck.status === 'delivered' ? '#dcfce7' : '#f1f5f9',
                      color: truck.status === 'delayed' ? '#c2410c' : truck.status === 'in-transit' ? '#106ebe' : truck.status === 'delivered' ? '#15803d' : '#64748b',
                    }}>
                      {(truck.type || 'ground').toUpperCase()} • {truck.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', marginBottom: '8px' }}>
                    {truck.cargo && (
                      <div style={{ marginBottom: '6px', padding: '4px 8px', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.7rem', color: '#334155' }}>
                        {truck.cargo}
                      </div>
                    )}
                    {truck.origin && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#64748b' }}>From:</span>
                        <span style={{ color: '#334155', fontWeight: 500 }}>{truck.origin}</span>
                      </div>
                    )}
                    {truck.destination_name && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#64748b' }}>To:</span>
                        <span style={{ color: '#334155', fontWeight: 500 }}>{truck.destination_name}</span>
                      </div>
                    )}
                    {truck.eta && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#64748b' }}>ETA:</span>
                        <span style={{ color: truck.status === 'delayed' ? '#c2410c' : '#334155', fontWeight: 600 }}>{truck.eta}</span>
                      </div>
                    )}
                    {truck.value && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Value:</span>
                        <span style={{ color: '#0078d4', fontWeight: 600 }}>${(truck.value / 1000000).toFixed(2)}M</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onTruckClick?.(truck); }}
                    style={{ width: '100%', padding: '6px', background: '#0078d4', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Track Shipment
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
                          color: severity === 'critical' ? '#b91c1c' : severity === 'high' ? '#c2410c' : severity === 'medium' ? '#a16207' : '#106ebe',
                        }}>
                          {severity}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#0078d4', margin: '0 0 12px 0', lineHeight: 1.4 }}>{alert.message}</p>
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
