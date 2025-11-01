import { useQuery } from 'react-query';

/**
 * Generic hook factory for RouteAI data with automatic persistence
 */
export const useRouteData = (queryKey, fetchFn, options = {}) => {
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery(
    queryKey,
    async () => {
      // Simulate async data fetching with delay
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(fetchFn());
        }, 500);
      });
    },
    {
      ...options,
      cacheTime: options.cacheTime || 1000 * 60 * 60 * 24, // 24 hours
      staleTime: options.staleTime || 1000 * 60 * 5, // 5 minutes
    }
  );

  return {
    data: data?.data || [],
    loading: isLoading || isFetching,
    error,
    refetch,
  };
};

/**
 * Hook for Fleet Management data
 */
export const useFleetManagement = () => {
  return useRouteData('fleet-management', () => {
    const data = [];
    const vehicles = ['TRK-001', 'TRK-002', 'TRK-003', 'TRK-004', 'TRK-005', 'VAN-001', 'VAN-002', 'VAN-003'];
    const drivers = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Wilson', 'David Brown', 'Lisa Martinez', 'James Lee', 'Maria Garcia'];
    const routes = ['Route A', 'Route B', 'Route C', 'Route D', 'Route E', 'Route F', 'Route G', 'Route H'];
    const statuses = ['Active', 'In Transit', 'Completed', 'Idle', 'Maintenance'];

    for (let i = 0; i < 45; i++) {
      const efficiency = 75 + Math.random() * 25;
      const distance = 150 + Math.random() * 200;
      const deliveries = Math.floor(10 + Math.random() * 15);
      const fuelLevel = Math.random() * 100;
      const speed = Math.random() * 65;

      data.push({
        id: `VEH${String(i + 1).padStart(4, '0')}`,
        vehicle: vehicles[i % vehicles.length] + (i > 7 ? `-${Math.floor(i / 8)}` : ''),
        driver: drivers[i % drivers.length],
        route: routes[i % routes.length],
        status: statuses[i % statuses.length],
        efficiency: parseFloat(efficiency.toFixed(1)),
        distance: Math.round(distance),
        deliveries: deliveries,
        fuel_level: parseFloat(fuelLevel.toFixed(1)),
        current_speed: Math.round(speed),
        last_updated: `${Math.floor(Math.random() * 60)} min ago`,
      });
    }

    return { data };
  });
};

/**
 * Hook for Route Optimization data
 */
export const useRouteOptimization = () => {
  return useRouteData('route-optimization', () => {
    const data = [];
    const routes = ['Route A', 'Route B', 'Route C', 'Route D', 'Route E', 'Route F', 'Route G', 'Route H'];
    const zones = ['North', 'South', 'East', 'West', 'Central'];
    const statuses = ['Applied', 'Pending', 'In Review', 'Scheduled'];

    for (let i = 0; i < 50; i++) {
      const originalDistance = 200 + Math.random() * 150;
      const savingsPercent = 5 + Math.random() * 15;
      const optimizedDistance = originalDistance * (1 - savingsPercent / 100);
      const timeSaved = Math.floor(savingsPercent * 2 + Math.random() * 10);

      data.push({
        id: `OPT${String(i + 1).padStart(4, '0')}`,
        route: routes[i % routes.length] + (i > 7 ? ` ${Math.floor(i / 8) + 1}` : ''),
        zone: zones[i % zones.length],
        original_distance: Math.round(originalDistance),
        optimized_distance: Math.round(optimizedDistance),
        savings_km: Math.round(originalDistance - optimizedDistance),
        savings_percent: parseFloat(savingsPercent.toFixed(1)),
        time_saved_min: timeSaved,
        fuel_saved_liters: parseFloat((savingsPercent * 0.8).toFixed(1)),
        status: statuses[i % statuses.length],
        stops: Math.floor(10 + Math.random() * 15),
      });
    }

    return { data };
  });
};

/**
 * Hook for Delivery Tracking data
 */
export const useDeliveryTracking = () => {
  return useRouteData('delivery-tracking', () => {
    const data = [];
    const customers = ['ABC Corp', 'XYZ Ltd', 'Acme Inc', 'GlobalTech', 'MegaMart', 'QuickStop', 'SuperStore', 'FastShip'];
    const statuses = ['Delivered', 'In Transit', 'Out for Delivery', 'Pending Pickup', 'Delayed'];
    const priorities = ['High', 'Medium', 'Low'];

    for (let i = 0; i < 128; i++) {
      const scheduledTime = new Date(Date.now() + (Math.random() - 0.5) * 24 * 60 * 60 * 1000);
      const eta = new Date(scheduledTime.getTime() + Math.random() * 60 * 60 * 1000);

      data.push({
        id: `DEL${String(i + 1).padStart(5, '0')}`,
        tracking_number: `TRK${String(1000 + i).padStart(6, '0')}`,
        customer: customers[i % customers.length],
        address: `${100 + i} Main Street, City ${i % 10}`,
        status: statuses[i % statuses.length],
        priority: priorities[i % priorities.length],
        scheduled_time: scheduledTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        eta: eta.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        driver: `Driver ${(i % 8) + 1}`,
        vehicle: `VEH-${String((i % 45) + 1).padStart(3, '0')}`,
        items: Math.floor(1 + Math.random() * 10),
        signature_required: Math.random() > 0.5,
      });
    }

    return { data };
  });
};

/**
 * Hook for Performance Analytics data
 */
export const usePerformanceAnalytics = () => {
  return useRouteData('performance-analytics', () => {
    const data = [];
    const drivers = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Wilson', 'David Brown', 'Lisa Martinez', 'James Lee', 'Maria Garcia'];
    const metrics = ['On-Time Delivery', 'Fuel Efficiency', 'Safety Score', 'Customer Rating', 'Route Adherence'];

    for (let i = 0; i < 40; i++) {
      const onTimeRate = 85 + Math.random() * 15;
      const fuelEfficiency = 8 + Math.random() * 4;
      const safetyScore = 80 + Math.random() * 20;
      const rating = 4 + Math.random();

      data.push({
        id: `PERF${String(i + 1).padStart(4, '0')}`,
        driver: drivers[i % drivers.length],
        metric: metrics[i % metrics.length],
        total_deliveries: Math.floor(150 + Math.random() * 100),
        on_time_rate: parseFloat(onTimeRate.toFixed(1)),
        fuel_efficiency_kmpl: parseFloat(fuelEfficiency.toFixed(2)),
        safety_score: parseFloat(safetyScore.toFixed(1)),
        customer_rating: parseFloat(rating.toFixed(2)),
        total_distance_km: Math.floor(3000 + Math.random() * 2000),
        avg_delivery_time_min: Math.floor(15 + Math.random() * 20),
        incidents: Math.floor(Math.random() * 3),
      });
    }

    return { data };
  });
};

/**
 * Hook for Fuel Management data
 */
export const useFuelManagement = () => {
  return useRouteData('fuel-management', () => {
    const data = [];
    const vehicles = ['TRK-001', 'TRK-002', 'TRK-003', 'TRK-004', 'TRK-005', 'VAN-001', 'VAN-002', 'VAN-003'];
    const fuelTypes = ['Diesel', 'Gasoline', 'Electric'];

    for (let i = 0; i < 60; i++) {
      const consumption = 15 + Math.random() * 10;
      const cost = consumption * (1.5 + Math.random() * 0.5);
      const efficiency = 8 + Math.random() * 4;
      const distanceCovered = 200 + Math.random() * 150;

      data.push({
        id: `FUEL${String(i + 1).padStart(4, '0')}`,
        vehicle: vehicles[i % vehicles.length] + (i > 7 ? `-${Math.floor(i / 8)}` : ''),
        fuel_type: fuelTypes[i % fuelTypes.length],
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        consumption_liters: parseFloat(consumption.toFixed(2)),
        cost_usd: parseFloat(cost.toFixed(2)),
        efficiency_kmpl: parseFloat(efficiency.toFixed(2)),
        distance_km: Math.round(distanceCovered),
        fuel_station: `Station ${(i % 5) + 1}`,
        driver: `Driver ${(i % 8) + 1}`,
        vs_target: parseFloat((-5 + Math.random() * 15).toFixed(1)),
      });
    }

    return { data };
  });
};

/**
 * Hook for Maintenance Scheduler data
 */
export const useMaintenanceScheduler = () => {
  return useRouteData('maintenance-scheduler', () => {
    const data = [];
    const vehicles = ['TRK-001', 'TRK-002', 'TRK-003', 'TRK-004', 'TRK-005', 'VAN-001', 'VAN-002', 'VAN-003'];
    const serviceTypes = ['Oil Change', 'Tire Rotation', 'Brake Service', 'Engine Check', 'Transmission Service', 'Battery Replacement'];
    const statuses = ['Scheduled', 'Completed', 'Overdue', 'In Progress'];
    const priorities = ['High', 'Medium', 'Low'];

    for (let i = 0; i < 35; i++) {
      const mileage = 50000 + Math.random() * 100000;
      const nextService = 5000 + Math.random() * 10000;
      const cost = 150 + Math.random() * 500;

      data.push({
        id: `MAINT${String(i + 1).padStart(4, '0')}`,
        vehicle: vehicles[i % vehicles.length] + (i > 7 ? `-${Math.floor(i / 8)}` : ''),
        service_type: serviceTypes[i % serviceTypes.length],
        status: statuses[i % statuses.length],
        priority: priorities[i % priorities.length],
        scheduled_date: new Date(Date.now() + (Math.random() - 0.3) * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        last_service_date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        current_mileage_km: Math.round(mileage),
        next_service_km: Math.round(mileage + nextService),
        estimated_cost_usd: parseFloat(cost.toFixed(2)),
        service_provider: `Workshop ${(i % 3) + 1}`,
        downtime_hours: Math.floor(2 + Math.random() * 6),
      });
    }

    return { data };
  });
};
