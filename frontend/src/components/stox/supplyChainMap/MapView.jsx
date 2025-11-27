import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mockRoutes } from './mockData';

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
        <div style="position: relative; width: 40px; height: 40px; background: ${color};
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                    ${shouldPulse ? 'animation: pulse 2s infinite;' : ''}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M18,18.5a1.5,1.5 0 0,1 -1.5,-1.5a1.5,1.5 0 0,1 1.5,-1.5a1.5,1.5 0 0,1 1.5,1.5a1.5,1.5 0 0,1 -1.5,1.5m1.5,-9l1.96,2.5H17V9.5M6,18.5a1.5,1.5 0 0,1 -1.5,-1.5a1.5,1.5 0 0,1 1.5,-1.5a1.5,1.5 0 0,1 1.5,1.5a1.5,1.5 0 0,1 -1.5,1.5M20,8h-3V4H3a1,1 0 0,0 -1,1v11h2a3,3 0 0,0 3,3a3,3 0 0,0 3,-3h6a3,3 0 0,0 3,3a3,3 0 0,0 3,-3h2v-5z"/>
          </svg>
          ${shouldPulse ? `<div style="position: absolute; inset: -4px; border-radius: 50%; border: 2px solid ${color}; animation: ping 2s infinite;"></div>` : ''}
        </div>
        <div style="width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent;
                    border-top: 6px solid white; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));"></div>
      </div>
      <style>
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes ping { 0% { transform: scale(1); opacity: 1; } 75%, 100% { transform: scale(1.5); opacity: 0; } }
      </style>
    `,
    className: 'custom-marker',
    iconSize: [40, 52],
    iconAnchor: [20, 52],
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
        <div style="position: relative; width: 36px; height: 36px; background: ${color};
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                    ${shouldPulse ? 'animation: pulse 2s infinite;' : ''}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            ${isDC
              ? '<path d="M18,15H16V17H18M18,11H16V13H18M20,19H12V17H14V15H12V13H14V11H12V9H20M10,7H8V5H10M10,11H8V9H10M10,15H8V13H10M10,19H8V17H10M6,7H4V5H6M6,11H4V9H6M6,15H4V13H6M6,19H4V17H6M12,7V3H2V21H22V7H12Z"/>'
              : '<path d="M12,2L2,7V10C2,16.5 6.5,22.5 12,24C17.5,22.5 22,16.5 22,10V7L12,2M12,4.18L20,8.09V10C20,15.5 16.5,20.38 12,21.93C7.5,20.38 4,15.5 4,10V8.09L12,4.18Z"/>'
            }
          </svg>
          ${hasWarning ? `
            <div style="position: absolute; top: -8px; right: -8px; width: 18px; height: 18px;
                        background: ${warningColor}; border-radius: 50%; border: 2px solid white;
                        display: flex; align-items: center; justify-content: center;
                        font-size: 12px; font-weight: bold; color: white;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.4);">!</div>
          ` : ''}
        </div>
        <div style="margin-top: 4px; background: ${color}; padding: 2px 8px; border-radius: 4px;
                    font-size: 10px; font-weight: bold; color: white; white-space: nowrap;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.3);">
          ${stockLevel}%
        </div>
        <div style="width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent;
                    border-top: 6px solid white; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); margin-top: -1px;"></div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [36, 70],
    iconAnchor: [18, 70],
  });
};

const createAlertIcon = (severity) => {
  const colors = { critical: '#ef4444', high: '#f97316', medium: '#f97316', low: '#eab308' };
  const color = colors[severity] || '#f97316';

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="position: relative; width: 44px; height: 44px; background: ${color};
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                    animation: pulse 2s infinite;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/>
          </svg>
          <div style="position: absolute; inset: -6px; border-radius: 50%; border: 2px solid ${color}; animation: ping 2s infinite;"></div>
        </div>
        <div style="width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent;
                    border-top: 6px solid white; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));"></div>
      </div>
      <style>
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
        @keyframes ping { 0% { transform: scale(1); opacity: 1; } 75%, 100% { transform: scale(1.8); opacity: 0; } }
      </style>
    `,
    className: 'custom-marker',
    iconSize: [44, 56],
    iconAnchor: [22, 56],
  });
};

// Component to pass map instance to parent
function MapEventHandler({ onMapReady }) {
  const map = useMap();
  useEffect(() => {
    if (onMapReady) onMapReady(map);
  }, [map, onMapReady]);
  return null;
}

// Get truck route
const getTruckRoute = (truckId) => mockRoutes[truckId] || [];

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
    <MapContainer
      center={[39.0, -82.0]}
      zoom={6}
      style={{ width: '100%', height: '100%' }}
      zoomControl={true}
      attributionControl={false}
      preferCanvas={true}
    >
      <MapEventHandler onMapReady={onMapReady} />
      <TileLayer url={tileUrl} maxZoom={20} minZoom={2} />

      {/* Store markers */}
      {showStores && stores.map((store) => (
        <Marker
          key={store.store_id}
          position={[store.latitude, store.longitude]}
          icon={createStoreIcon(store.stock_level, store.facility_type)}
        >
          <Popup minWidth={220} maxWidth={220}>
            <div style={{ padding: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>{store.name}</h3>
                <span style={{ fontSize: '1.25rem' }}>{store.facility_type === 'distribution-center' ? '🏭' : '🏪'}</span>
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
                  🚨 Critical Stock
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

      {/* Truck markers and routes */}
      {showTrucks && trucks.map((truck) => {
        const route = getTruckRoute(truck.truck_id);
        const routeColor = truck.status === 'delayed' ? '#f97316' : '#94a3b8';

        return (
          <React.Fragment key={truck.truck_id}>
            {showRoutes && route.length > 0 && (
              <Polyline positions={route} pathOptions={{ color: routeColor, weight: 3, opacity: 0.6, dashArray: '10, 10' }} />
            )}
            <Marker position={[truck.latitude, truck.longitude]} icon={createTruckIcon(truck.status)}>
              <Popup minWidth={200} maxWidth={200}>
                <div style={{ padding: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>{truck.truck_id}</h3>
                    <span style={{ fontSize: '1.25rem' }}>🚚</span>
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
                      ⚠️ Delayed
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
          </React.Fragment>
        );
      })}

      {/* Alert markers */}
      {showAlerts && alerts.map((alert) => {
        const severity = alert.severity || (alert.priority >= 9 ? 'critical' : alert.priority >= 6 ? 'high' : alert.priority >= 3 ? 'medium' : 'low');

        return (
          <React.Fragment key={alert.id}>
            <Marker position={[alert.latitude, alert.longitude]} icon={createAlertIcon(severity)}>
              <Popup minWidth={240} maxWidth={240}>
                <div style={{ padding: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.25rem', marginTop: '2px' }}>⚠️</span>
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
            {alert.alternate_route && alert.alternate_route.length > 0 && (
              <Polyline positions={alert.alternate_route} pathOptions={{ color: '#ef4444', weight: 4, opacity: 0.7, dashArray: '10, 10' }} />
            )}
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
}
