import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom cluster icon
const createClusterIcon = (cluster, type) => {
  const count = cluster.getChildCount();
  const colors = {
    kits: { bg: '#00357a', border: '#002352' },
    facilities: { bg: '#8b5cf6', border: '#7c3aed' },
    alerts: { bg: '#f97316', border: '#ea580c' },
  };
  const { bg, border } = colors[type] || colors.kits;

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
};

// Custom marker icons for kits
const createKitIcon = (status, processType) => {
  const colors = {
    'in-transit': '#3b82f6',
    'at-facility': '#10b981',
    'in-surgery': '#8b5cf6',
    'awaiting-return': '#f97316',
    'at-dc': '#64748b',
  };
  const color = colors[status] || '#00357a';
  const shouldPulse = status === 'in-surgery' || status === 'awaiting-return';
  const isLoaner = processType === 'loaner';

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="position: relative; width: 28px; height: 28px; background: ${color};
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35);
                    ${shouldPulse ? 'animation: pulse 2s infinite;' : ''}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            ${isLoaner
              ? '<path d="M20,6H12L10,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8A2,2 0 0,0 20,6M15,16H6V14H15V16M18,12H6V10H18V12Z"/>'
              : '<path d="M3,6H21V18H3V6M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M7,8A2,2 0 0,1 5,10V14A2,2 0 0,1 7,16H17A2,2 0 0,1 19,14V10A2,2 0 0,1 17,8H7Z"/>'
            }
          </svg>
          ${shouldPulse ? `<div style="position: absolute; inset: -3px; border-radius: 50%; border: 1.5px solid ${color}; animation: ping 2s infinite;"></div>` : ''}
        </div>
        <div style="margin-top: 2px; background: ${color}; padding: 1px 5px; border-radius: 3px;
                    font-size: 7px; font-weight: bold; color: white; white-space: nowrap;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.3); text-transform: uppercase;">
          ${status.replace('-', ' ')}
        </div>
      </div>
      <style>
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes ping { 0% { transform: scale(1); opacity: 1; } 75%, 100% { transform: scale(1.5); opacity: 0; } }
      </style>
    `,
    className: 'custom-marker',
    iconSize: [28, 46],
    iconAnchor: [14, 46],
  });
};

const createFacilityIcon = (kitsOnSite, status) => {
  const color = status === 'needs-attention' ? '#f97316' : kitsOnSite > 3 ? '#10b981' : '#00357a';
  const shouldPulse = status === 'needs-attention';

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="position: relative; width: 26px; height: 26px; background: ${color};
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35);
                    ${shouldPulse ? 'animation: pulse 2s infinite;' : ''}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
            <path d="M19,8H17V6H19M19,12H17V10H19M19,16H17V14H19M21,4H11V2H21V4M13,6V22H3V6H13M9,8H7V16H9V8Z"/>
          </svg>
          ${kitsOnSite > 0 ? `
            <div style="position: absolute; top: -5px; right: -5px; min-width: 14px; height: 14px;
                        background: #00357a; border-radius: 50%; border: 1.5px solid white;
                        display: flex; align-items: center; justify-content: center;
                        font-size: 8px; font-weight: bold; color: white;
                        box-shadow: 0 1px 4px rgba(0,0,0,0.3);">${kitsOnSite}</div>
          ` : ''}
        </div>
        <div style="width: 0; height: 0; border-left: 3px solid transparent; border-right: 3px solid transparent;
                    border-top: 4px solid white; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25)); margin-top: 1px;"></div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [26, 38],
    iconAnchor: [13, 38],
  });
};

const createAlertIcon = (severity) => {
  const colors = { critical: '#ef4444', warning: '#f97316', info: '#eab308' };
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

// Component to pass map instance to parent
function MapEventHandler({ onMapReady, isFullScreen }) {
  const map = useMap();

  useEffect(() => {
    if (onMapReady) onMapReady(map);

    const timers = [50, 100, 250, 500, 1000].map((delay) =>
      setTimeout(() => map.invalidateSize(), delay)
    );

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    const container = map.getContainer();
    let resizeObserver;
    if (container && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => map.invalidateSize());
      resizeObserver.observe(container);
    }

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [map, onMapReady]);

  useEffect(() => {
    const timers = [50, 100, 200, 400].map((delay) =>
      setTimeout(() => map.invalidateSize(), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [map, isFullScreen]);

  return null;
}

// Offset overlapping markers
const getOffsetPosition = (lat, lng, type) => {
  const offset = 0.008;
  const offsets = {
    kit: [offset, 0],
    facility: [-offset, 0],
    alert: [0, offset],
  };
  const [latOffset, lngOffset] = offsets[type] || [0, 0];
  return [lat + latOffset, lng + lngOffset];
};

export default function MapView({
  kits = [],
  facilities = [],
  alerts = [],
  showKits = true,
  showFacilities = true,
  showRoutes = true,
  showAlerts = true,
  onMapReady,
  mapStyle = 'cartodb-light',
  onFacilityClick,
  onKitClick,
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
        .leaflet-tile-pane { will-change: transform; }
        .leaflet-zoom-animated { will-change: transform; }
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

        {/* Facility markers with clustering */}
        {showFacilities && (
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={(cluster) => createClusterIcon(cluster, 'facilities')}
            maxClusterRadius={50}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
          >
            {facilities.map((facility) => (
              <Marker
                key={facility.id}
                position={getOffsetPosition(facility.latitude, facility.longitude, 'facility')}
                icon={createFacilityIcon(facility.kits_on_site, facility.status)}
              >
                <Popup minWidth={220} maxWidth={220}>
                  <div style={{ padding: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>{facility.name}</h3>
                    </div>
                    <div style={{ fontSize: '0.75rem', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#64748b' }}>Type:</span>
                        <span style={{ color: '#334155' }}>{facility.type}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#64748b' }}>Kits On-Site:</span>
                        <span style={{ fontWeight: 700, color: '#00357a' }}>{facility.kits_on_site}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Pending Cases:</span>
                        <span style={{ color: '#334155' }}>{facility.pending_surgeries}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onFacilityClick?.(facility); }}
                      style={{ width: '100%', padding: '6px', background: '#00357a', color: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        )}

        {/* Kit markers with clustering */}
        {showKits && (
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={(cluster) => createClusterIcon(cluster, 'kits')}
            maxClusterRadius={40}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
          >
            {kits.map((kit) => (
              <Marker key={kit.id} position={getOffsetPosition(kit.latitude, kit.longitude, 'kit')} icon={createKitIcon(kit.status, kit.process_type)}>
                <Popup minWidth={240} maxWidth={240}>
                  <div style={{ padding: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>{kit.kit_type}</h3>
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
                        background: kit.process_type === 'loaner' ? '#dbeafe' : '#f3e8ff',
                        color: kit.process_type === 'loaner' ? '#1d4ed8' : '#7c3aed',
                      }}>
                        {kit.process_type}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#64748b' }}>Status:</span>
                        <span style={{ fontWeight: 600, color: '#334155' }}>{kit.status.replace('-', ' ')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#64748b' }}>Facility:</span>
                        <span style={{ color: '#334155', fontSize: '0.7rem' }}>{kit.facility_name.slice(0, 25)}...</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#64748b' }}>Value:</span>
                        <span style={{ color: '#334155' }}>${kit.value.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>IoT Battery:</span>
                        <span style={{ color: kit.battery_level > 50 ? '#10b981' : '#f97316' }}>{kit.battery_level}%</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onKitClick?.(kit); }}
                      style={{ width: '100%', padding: '6px', background: '#00357a', color: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      View Kit Details
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
            {alerts.map((alert) => (
              <Marker key={alert.id} position={getOffsetPosition(alert.latitude, alert.longitude, 'alert')} icon={createAlertIcon(alert.severity)}>
                <Popup minWidth={240} maxWidth={240}>
                  <div style={{ padding: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '24px', height: '24px', background: alert.severity === 'critical' ? '#ef4444' : '#f97316', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                          <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/>
                        </svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: '0 0 4px 0', color: '#1e293b' }}>{alert.message}</h3>
                        <span style={{
                          padding: '2px 8px', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
                          background: alert.severity === 'critical' ? '#fef2f2' : '#fff7ed',
                          color: alert.severity === 'critical' ? '#b91c1c' : '#c2410c',
                        }}>
                          {alert.severity}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#475569', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                      Kit: {alert.kit_id} at {alert.facility_name}
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); onAlertClick?.(alert); }}
                      style={{ width: '100%', padding: '6px', background: '#ea580c', color: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      View Alert
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        )}
      </MapContainer>
    </>
  );
}
