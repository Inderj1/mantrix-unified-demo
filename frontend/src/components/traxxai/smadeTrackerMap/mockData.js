// SMADE Tracker Map Mock Data
// Real-time IoT tracking for NexxtSpine loaner and consignment kits
// Based on SMADE.IO tracker data schema

import {
  facilities,
  distributors,
  kitConfigurations,
  regions,
  surgeons,
} from '../../../data/nexxtspineData';

// Tracker types
const TRACKER_TYPES = ['HOT', 'COT', 'BLE', 'GPS'];

// Trajectory statuses
const TRAJECTORY_STATUSES = ['in_transit', 'in_hospital', 'at_dc', 'processing', 'in_surgery'];

// Generate comprehensive SMADE tracker data
const generateTrackers = () => {
  const trackers = [];

  kitConfigurations.forEach((kitConfig, idx) => {
    const kitCount = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < kitCount; i++) {
      const facility = facilities[Math.floor(Math.random() * facilities.length)];
      const distributor = distributors[Math.floor(Math.random() * distributors.length)];
      const trackerType = TRACKER_TYPES[Math.floor(Math.random() * TRACKER_TYPES.length)];
      const trajectoryStatus = TRAJECTORY_STATUSES[Math.floor(Math.random() * TRAJECTORY_STATUSES.length)];
      const isLoaner = Math.random() > 0.4;
      const region = regions.find(r => r.name === facility.region) || regions[0];
      const baseCoords = getRegionCoordinates(region.name);

      const autoclaveCycles = Math.floor(50 + Math.random() * 120);
      const washingCycles = Math.floor(autoclaveCycles * 1.3);
      const usageCount = Math.floor(autoclaveCycles * 0.95);
      const dropCount = Math.floor(Math.random() * 5);
      const batteryLevel = Math.floor(60 + Math.random() * 40);
      const daysAtLocation = Math.floor(Math.random() * 14);
      const isOverdue = Math.random() > 0.9;

      // Generate previous facility
      const prevFacility = facilities[Math.floor(Math.random() * facilities.length)];

      trackers.push({
        // Tracker Info
        tracker: {
          tracker_id: `SMADE-${trackerType}-${String(10000 + idx * 10 + i).padStart(5, '0')}`,
          tracker_type: trackerType,
          serial_number: `${trackerType.charAt(0)}T-2024-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`,
          firmware_version: `${2 + Math.floor(Math.random() * 2)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
          battery_level: batteryLevel,
          battery_status: batteryLevel > 50 ? 'good' : batteryLevel > 20 ? 'low' : 'critical',
          estimated_battery_life_days: Math.floor(batteryLevel * 15),
          connectivity: {
            type: trackerType === 'BLE' ? 'Bluetooth' : trackerType === 'GPS' ? 'Cellular' : 'LPWAN',
            signal_strength: -50 - Math.floor(Math.random() * 50),
            last_transmission: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000).toISOString(),
            transmission_method: trackerType === 'HOT' ? ['cellular', 'wifi'] : trackerType === 'GPS' ? ['cellular'] : ['wifi', 'bluetooth']
          }
        },

        // Asset Info
        asset: {
          asset_id: `TRAY-${kitConfig.system.toUpperCase().replace(/\s+/g, '-')}-${String(100 + idx).padStart(3, '0')}`,
          asset_name: kitConfig.name,
          asset_type: 'surgical_tray',
          manufacturer: 'NexxtSpine',
          system: kitConfig.system,
          pairing_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
          logistics_status: isLoaner ? 'loaner' : 'consignment',
          value_usd: kitConfig.value,
          item_count: kitConfig.items
        },

        // Location Info
        location: {
          current_location: {
            type: trajectoryStatus === 'in_transit' ? 'in_transit' : 'facility',
            facility_id: facility.id,
            facility_name: facility.name,
            department: ['Central Sterile Processing', 'Operating Room', 'Storage', 'Receiving'][Math.floor(Math.random() * 4)],
            address: {
              street: `${Math.floor(100 + Math.random() * 9000)} Medical Drive`,
              city: facility.state === 'TX' ? 'Dallas' : facility.state === 'CA' ? 'Los Angeles' : 'Boston',
              state: facility.state,
              zip: String(10000 + Math.floor(Math.random() * 89999)),
              country: 'USA'
            },
            coordinates: {
              latitude: baseCoords.lat + (Math.random() - 0.5) * 4,
              longitude: baseCoords.lng + (Math.random() - 0.5) * 6,
              accuracy_meters: Math.floor(5 + Math.random() * 20)
            },
            location_method: ['wifi', 'gps', 'cellular', 'bluetooth'][Math.floor(Math.random() * 4)],
            timestamp: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000).toISOString()
          },
          previous_location: {
            facility_id: prevFacility.id,
            facility_name: prevFacility.name,
            departure_timestamp: new Date(Date.now() - (daysAtLocation + Math.random() * 3) * 24 * 60 * 60 * 1000).toISOString()
          }
        },

        // Lifecycle Events
        lifecycle_events: {
          total_autoclave_cycles: autoclaveCycles,
          total_washing_cycles: washingCycles,
          total_usage_count: usageCount,
          total_drop_count: dropCount,
          last_autoclave: {
            timestamp: new Date(Date.now() - Math.random() * 72 * 60 * 60 * 1000).toISOString(),
            duration_minutes: Math.floor(25 + Math.random() * 10),
            max_temperature_celsius: Math.floor(130 + Math.random() * 8),
            max_pressure_bar: 2.5 + Math.random() * 0.5,
            cycle_complete: Math.random() > 0.05
          },
          last_washing: {
            timestamp: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000).toISOString(),
            duration_minutes: Math.floor(40 + Math.random() * 15),
            max_temperature_celsius: Math.floor(88 + Math.random() * 10),
            cycle_complete: true
          },
          recent_drops: dropCount > 0 ? Array.from({ length: Math.min(dropCount, 3) }, (_, di) => ({
            timestamp: new Date(Date.now() - (di + 1) * 7 * 24 * 60 * 60 * 1000 - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
            impact_force_g: 8 + Math.random() * 15,
            location: facility.id
          })) : []
        },

        // Trajectory
        trajectory: {
          status: trajectoryStatus,
          days_at_current_location: daysAtLocation,
          days_since_last_movement: Math.floor(daysAtLocation * 0.8),
          current_phase: trajectoryStatus === 'in_surgery' ? 'surgery' : trajectoryStatus === 'processing' ? 'processing' : trajectoryStatus === 'in_transit' ? 'transit' : 'idle',
          predicted_next_location: Math.random() > 0.7 ? facilities[Math.floor(Math.random() * facilities.length)].name : null,
          is_overdue: isOverdue,
          expected_return_date: new Date(Date.now() + (3 + Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          surgeon: trajectoryStatus === 'in_surgery' ? surgeons[Math.floor(Math.random() * 10)].name : null,
          surgery_date: trajectoryStatus === 'in_surgery' ? new Date().toISOString().split('T')[0] : null
        },

        // Alerts
        alerts: generateTrackerAlerts(autoclaveCycles, batteryLevel, isOverdue, facility, dropCount),

        // History Summary
        history_summary: {
          total_facilities_visited: Math.floor(5 + Math.random() * 15),
          total_distance_traveled_km: Math.floor(1000 + Math.random() * 5000),
          average_days_per_location: 8 + Math.random() * 8,
          utilization_rate_percent: 60 + Math.random() * 35,
          on_time_return_rate_percent: 85 + Math.random() * 15
        },

        // Data Quality
        data_quality: {
          same_day_transmission_rate_percent: 90 + Math.random() * 10,
          data_completeness_percent: 95 + Math.random() * 5,
          connectivity_score: batteryLevel > 50 ? 'excellent' : batteryLevel > 20 ? 'good' : 'poor',
          last_maintenance_check: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },

        // Distributor info
        distributor: {
          id: distributor.id,
          name: distributor.name
        },

        // Region info
        region: facility.region,
        state: facility.state,

        // Legacy fields for backward compatibility
        id: `SMADE-${trackerType}-${String(10000 + idx * 10 + i).padStart(5, '0')}`,
        kit_type: kitConfig.name,
        system: kitConfig.system,
        value: kitConfig.value,
        item_count: kitConfig.items,
        status: trajectoryStatus === 'in_transit' ? 'in-transit' :
                trajectoryStatus === 'in_surgery' ? 'in-surgery' :
                trajectoryStatus === 'at_dc' ? 'at-dc' :
                isOverdue ? 'awaiting-return' : 'at-facility',
        process_type: isLoaner ? 'loaner' : 'consignment',
        facility_id: facility.id,
        facility_name: facility.name,
        distributor_id: distributor.id,
        distributor_name: distributor.name,
        latitude: baseCoords.lat + (Math.random() - 0.5) * 4,
        longitude: baseCoords.lng + (Math.random() - 0.5) * 6,
        last_scan_time: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        battery_level: batteryLevel,
        temperature: 68 + Math.floor(Math.random() * 10),
        humidity: 40 + Math.floor(Math.random() * 20),
        shock_detected: dropCount > 0 && Math.random() > 0.7,
        iot_device_id: `SMADE-${trackerType}-${String(10000 + idx * 10 + i).padStart(5, '0')}`,
        surgeon: trajectoryStatus === 'in_surgery' ? surgeons[Math.floor(Math.random() * 10)].name : null,
        surgery_date: trajectoryStatus === 'in_surgery' ? new Date().toISOString().split('T')[0] : null,
        expected_return: isOverdue ? new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] :
                        new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
  });

  return trackers;
};

// Generate alerts for a specific tracker
const generateTrackerAlerts = (autoclaveCycles, batteryLevel, isOverdue, facility, dropCount) => {
  const alerts = [];

  // High cycle count alert
  if (autoclaveCycles > 130) {
    alerts.push({
      alert_id: `ALT-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      alert_type: 'high_cycle_count',
      severity: autoclaveCycles > 145 ? 'critical' : 'warning',
      message: 'Asset approaching recommended autoclave cycle limit',
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      acknowledged: Math.random() > 0.7,
      threshold_value: 150,
      current_value: autoclaveCycles
    });
  }

  // Low battery alert
  if (batteryLevel < 30) {
    alerts.push({
      alert_id: `ALT-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      alert_type: 'low_battery',
      severity: batteryLevel < 15 ? 'critical' : 'warning',
      message: `Tracker battery at ${batteryLevel}% - requires attention`,
      timestamp: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000).toISOString(),
      acknowledged: false,
      threshold_value: 30,
      current_value: batteryLevel
    });
  }

  // Overdue return alert
  if (isOverdue) {
    alerts.push({
      alert_id: `ALT-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      alert_type: 'overdue_return',
      severity: 'critical',
      message: `Asset overdue for return from ${facility.name}`,
      timestamp: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000).toISOString(),
      acknowledged: false
    });
  }

  // Drop/shock alert
  if (dropCount > 2) {
    alerts.push({
      alert_id: `ALT-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      alert_type: 'multiple_drops',
      severity: 'warning',
      message: `Asset has ${dropCount} recorded drop events - inspection recommended`,
      timestamp: new Date(Date.now() - Math.random() * 72 * 60 * 60 * 1000).toISOString(),
      acknowledged: false,
      threshold_value: 3,
      current_value: dropCount
    });
  }

  return alerts;
};

// Generate facility data with NexxtSpine facilities
const generateFacilities = () => {
  return facilities.slice(0, 25).map(facility => {
    const region = regions.find(r => r.name === facility.region) || regions[0];
    const baseCoords = getRegionCoordinates(region.name);

    return {
      id: facility.id,
      name: facility.name,
      type: facility.type,
      region: facility.region,
      state: facility.state,
      latitude: baseCoords.lat + (Math.random() - 0.5) * 3,
      longitude: baseCoords.lng + (Math.random() - 0.5) * 5,
      revenue: facility.revenue,
      cases: facility.cases,
      kits_on_site: Math.floor(2 + Math.random() * 5),
      pending_surgeries: Math.floor(Math.random() * 4),
      last_activity: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000).toISOString(),
      status: Math.random() > 0.1 ? 'active' : 'needs-attention',
    };
  });
};

// Generate aggregated alerts from all trackers
const generateAlerts = (trackers) => {
  const alerts = [];

  trackers.forEach(tracker => {
    tracker.alerts.forEach(alert => {
      alerts.push({
        id: alert.alert_id,
        type: alert.alert_type,
        severity: alert.severity,
        message: alert.message,
        kit_id: tracker.id,
        facility_name: tracker.facility_name,
        region: tracker.region,
        latitude: tracker.latitude,
        longitude: tracker.longitude,
        created_at: alert.timestamp,
        status: alert.acknowledged ? 'acknowledged' : 'active',
        assigned_to: alert.acknowledged ? distributors[Math.floor(Math.random() * 10)].name : null,
        threshold_value: alert.threshold_value,
        current_value: alert.current_value
      });
    });
  });

  // Add some additional random alerts
  const alertTypes = [
    { type: 'kit-delay', severity: 'warning', message: 'Kit shipment delayed' },
    { type: 'temperature-alert', severity: 'critical', message: 'Temperature out of range for biologics' },
    { type: 'missing-scan', severity: 'warning', message: 'Kit not scanned in 24hrs' },
  ];

  for (let i = 0; i < 5; i++) {
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const facility = facilities[Math.floor(Math.random() * facilities.length)];
    const region = regions.find(r => r.name === facility.region) || regions[0];
    const baseCoords = getRegionCoordinates(region.name);

    alerts.push({
      id: `ALERT-${String(5000 + i).padStart(4, '0')}`,
      type: alertType.type,
      severity: alertType.severity,
      message: alertType.message,
      kit_id: trackers[Math.floor(Math.random() * trackers.length)]?.id || 'KIT-UNKNOWN',
      facility_name: facility.name,
      region: facility.region,
      latitude: baseCoords.lat + (Math.random() - 0.5) * 3,
      longitude: baseCoords.lng + (Math.random() - 0.5) * 5,
      created_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      assigned_to: null,
    });
  }

  return alerts;
};

// Get approximate coordinates for regions
function getRegionCoordinates(regionName) {
  const coords = {
    'Central': { lat: 32.0, lng: -97.0 },
    'Mountain': { lat: 39.5, lng: -106.0 },
    'Western': { lat: 36.0, lng: -119.0 },
    'Southern': { lat: 34.0, lng: -84.0 },
    'Midwest': { lat: 41.0, lng: -83.0 },
    'Eastern': { lat: 40.0, lng: -74.0 },
  };
  return coords[regionName] || { lat: 39.0, lng: -98.0 };
}

// Main function to generate all mock data
export const generateMockData = () => {
  const trackers = generateTrackers();
  const facilitiesData = generateFacilities();
  const alerts = generateAlerts(trackers);

  return {
    kits: trackers,  // Use trackers as kits for backward compatibility
    trackers: trackers,
    facilities: facilitiesData,
    alerts: alerts,
  };
};

// Export for use in ChatPanel context building
export const getTrackerById = (trackers, trackerId) => {
  return trackers.find(t => t.id === trackerId || t.tracker?.tracker_id === trackerId);
};

export const getTrackersByStatus = (trackers, status) => {
  return trackers.filter(t => t.trajectory?.status === status || t.status === status);
};

export const getTrackersWithAlerts = (trackers, severity = null) => {
  return trackers.filter(t => {
    if (!t.alerts || t.alerts.length === 0) return false;
    if (severity) {
      return t.alerts.some(a => a.severity === severity);
    }
    return true;
  });
};

export const getTrackersNeedingMaintenance = (trackers) => {
  return trackers.filter(t =>
    t.lifecycle_events?.total_autoclave_cycles > 130 ||
    t.tracker?.battery_level < 30 ||
    t.lifecycle_events?.total_drop_count > 2
  );
};

export const getOverdueTrackers = (trackers) => {
  return trackers.filter(t => t.trajectory?.is_overdue);
};

export const getUtilizationStats = (trackers) => {
  const total = trackers.length;
  const avgUtilization = trackers.reduce((sum, t) => sum + (t.history_summary?.utilization_rate_percent || 0), 0) / total;
  const avgOnTimeReturn = trackers.reduce((sum, t) => sum + (t.history_summary?.on_time_return_rate_percent || 0), 0) / total;

  return {
    total_trackers: total,
    average_utilization: avgUtilization.toFixed(1),
    average_on_time_return: avgOnTimeReturn.toFixed(1),
    total_facilities_served: new Set(trackers.map(t => t.facility_id)).size,
    total_distance_km: trackers.reduce((sum, t) => sum + (t.history_summary?.total_distance_traveled_km || 0), 0)
  };
};

export default {
  generateMockData,
  getTrackerById,
  getTrackersByStatus,
  getTrackersWithAlerts,
  getTrackersNeedingMaintenance,
  getOverdueTrackers,
  getUtilizationStats
};
