import React, { useState } from 'react';
import { Box, Typography, Stack, Chip, Button, IconButton, LinearProgress, Tabs, Tab } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

export default function FacilityDetailsPanel({ store, alerts = [], trucks = [], onClose }) {
  const [activeTab, setActiveTab] = useState(0);

  // Find alerts related to this facility
  const facilityAlerts = alerts.filter(alert =>
    Math.abs(alert.latitude - store.latitude) < 0.5 &&
    Math.abs(alert.longitude - store.longitude) < 0.5
  );

  // Find trucks nearby or heading to this facility
  const nearbyTrucks = trucks.filter(truck =>
    truck.destination_name === store.name ||
    (Math.abs(truck.latitude - store.latitude) < 1 &&
     Math.abs(truck.longitude - store.longitude) < 1)
  );

  const stockPercentage = store.stock_level;
  const capacityUsed = Math.round((store.current_stock / store.capacity) * 100);
  const daysToStockout = Math.floor(store.current_stock / store.demand_rate);

  // Sample SKU data
  const sampleSKUs = store.sku_details || [
    { sku_id: 'AZ-GT-23OZ', product_name: 'Green Tea 23oz', current_qty: 8000, stock_status: 'in-stock', trend: 'stable' },
    { sku_id: 'AZ-AP-20OZ', product_name: 'Arnold Palmer 20oz', current_qty: 3500, stock_status: 'low-stock', trend: 'increasing' },
    { sku_id: 'AZ-RX-16OZ', product_name: 'RX Energy 16oz', current_qty: 500, stock_status: 'critical', trend: 'decreasing' },
  ];

  const getTrendIcon = (trend) => {
    if (trend === 'increasing') return <TrendingUpIcon sx={{ fontSize: 14, color: '#10b981' }} />;
    if (trend === 'decreasing') return <TrendingDownIcon sx={{ fontSize: 14, color: '#ef4444' }} />;
    return <TrendingFlatIcon sx={{ fontSize: 14, color: '#64748b' }} />;
  };

  const getStockStatusColor = (status) => {
    if (status === 'in-stock') return { bg: '#dcfce7', text: '#15803d' };
    if (status === 'low-stock') return { bg: '#fef3c7', text: '#d97706' };
    return { bg: '#fee2e2', text: '#dc2626' };
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 64,
        left: 296,
        width: 420,
        bgcolor: 'white',
        border: '1px solid',
        borderColor: alpha('#64748b', 0.2),
        borderRadius: 2,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        zIndex: 1600,
        maxHeight: 'calc(100vh - 100px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: alpha('#64748b', 0.15), bgcolor: '#f8fafc' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
              {store.name}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>ID: {store.store_id}</Typography>
              {store.facility_type && (
                <Chip
                  label={store.facility_type.replace('-', ' ').toUpperCase()}
                  size="small"
                  sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: alpha('#0284c7', 0.12), color: '#0284c7' }}
                />
              )}
            </Stack>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: '#64748b' }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: '1px solid', borderColor: alpha('#64748b', 0.15), bgcolor: '#f8fafc' }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          sx={{
            minHeight: 36,
            '& .MuiTab-root': { minHeight: 36, fontSize: '0.75rem', fontWeight: 600, textTransform: 'none', py: 0.5 },
            '& .Mui-selected': { color: '#0284c7' },
            '& .MuiTabs-indicator': { bgcolor: '#0284c7' },
          }}
        >
          <Tab label="Overview" />
          <Tab label={`SKUs (${sampleSKUs.length})`} />
          <Tab label="Forecast" />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{
        p: 2,
        overflow: 'auto',
        flex: 1,
        '&::-webkit-scrollbar': { width: 6 },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: 'transparent', borderRadius: 3 },
        '&:hover::-webkit-scrollbar-thumb': { background: 'rgba(100, 116, 139, 0.3)' },
        scrollbarWidth: 'thin',
        scrollbarColor: 'transparent transparent',
        '&:hover': { scrollbarColor: 'rgba(100, 116, 139, 0.3) transparent' },
      }}>
        {/* Overview Tab */}
        {activeTab === 0 && (
          <Stack spacing={2}>
            {/* Stock Overview */}
            <Box sx={{ bgcolor: '#f8fafc', borderRadius: 1.5, p: 2 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', mb: 1.5 }}>
                Inventory Status
              </Typography>
              <Stack spacing={1.5}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>Stock Level</Typography>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b' }}>{stockPercentage}%</Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={stockPercentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha('#64748b', 0.15),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: stockPercentage < 30 ? '#ef4444' : stockPercentage < 50 ? '#f97316' : '#0284c7',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>Capacity Used</Typography>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b' }}>{capacityUsed}%</Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={capacityUsed}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha('#64748b', 0.15),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: capacityUsed > 90 ? '#ef4444' : capacityUsed > 70 ? '#f59e0b' : '#10b981',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 1, pt: 1.5, borderTop: '1px solid', borderColor: alpha('#64748b', 0.15) }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase' }}>Current Stock</Typography>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{store.current_stock?.toLocaleString()}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase' }}>Capacity</Typography>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{store.capacity?.toLocaleString()}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase' }}>Demand Rate</Typography>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#0284c7' }}>{store.demand_rate}/day</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase' }}>Days to Stockout</Typography>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: daysToStockout < 7 ? '#ef4444' : '#f97316' }}>{daysToStockout}</Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>

            {/* Active Alerts */}
            {facilityAlerts.length > 0 && (
              <Box sx={{ bgcolor: '#f8fafc', borderRadius: 1.5, p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1.5 }}>
                  <WarningAmberIcon sx={{ fontSize: 16, color: '#f97316' }} />
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>
                    Active Alerts ({facilityAlerts.length})
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  {facilityAlerts.map((alert, idx) => (
                    <Box
                      key={alert.id || idx}
                      sx={{ bgcolor: 'white', borderRadius: 1, p: 1.5, borderLeft: '3px solid #f97316' }}
                    >
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b', mb: 0.5 }}>{alert.title}</Typography>
                      <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>{alert.message}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Nearby Trucks */}
            {nearbyTrucks.length > 0 && (
              <Box sx={{ bgcolor: '#f8fafc', borderRadius: 1.5, p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1.5 }}>
                  <LocalShippingIcon sx={{ fontSize: 16, color: '#0284c7' }} />
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>
                    Inbound Trucks ({nearbyTrucks.length})
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  {nearbyTrucks.map((truck) => (
                    <Box
                      key={truck.truck_id}
                      sx={{ bgcolor: 'white', borderRadius: 1, p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <Box>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b' }}>{truck.truck_id}</Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>
                          Cargo: {truck.cargo_loaded}/{truck.cargo_capacity}
                        </Typography>
                      </Box>
                      <Chip
                        label={truck.status.toUpperCase()}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          bgcolor: truck.status === 'in-transit' ? alpha('#0284c7', 0.12) :
                                   truck.status === 'delayed' ? alpha('#f97316', 0.12) :
                                   truck.status === 'delivered' ? alpha('#10b981', 0.12) : alpha('#64748b', 0.12),
                          color: truck.status === 'in-transit' ? '#0284c7' :
                                 truck.status === 'delayed' ? '#f97316' :
                                 truck.status === 'delivered' ? '#10b981' : '#64748b',
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {/* AI Recommendations */}
            <Box sx={{ bgcolor: alpha('#0284c7', 0.08), border: '1px solid', borderColor: alpha('#0284c7', 0.2), borderRadius: 1.5, p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1.5 }}>
                <SmartToyIcon sx={{ fontSize: 16, color: '#0284c7' }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7' }}>AI Recommendations</Typography>
              </Stack>
              <Stack spacing={1}>
                {stockPercentage < 30 && (
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#ef4444', mt: 0.75 }} />
                    <Typography sx={{ fontSize: '0.7rem', color: '#0078d4' }}>
                      Critical stock level - Schedule emergency replenishment from nearest DC
                    </Typography>
                  </Stack>
                )}
                {capacityUsed > 90 && (
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#f59e0b', mt: 0.75 }} />
                    <Typography sx={{ fontSize: '0.7rem', color: '#0078d4' }}>
                      Capacity near limit - Consider redistributing inventory
                    </Typography>
                  </Stack>
                )}
                {nearbyTrucks.length === 0 && stockPercentage < 50 && (
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#f97316', mt: 0.75 }} />
                    <Typography sx={{ fontSize: '0.7rem', color: '#0078d4' }}>
                      No inbound shipments - Allocate truck from central hub
                    </Typography>
                  </Stack>
                )}
                {stockPercentage >= 50 && nearbyTrucks.length > 0 && (
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#10b981', mt: 0.75 }} />
                    <Typography sx={{ fontSize: '0.7rem', color: '#0078d4' }}>
                      Inventory levels healthy - Continue monitoring demand patterns
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Box>
          </Stack>
        )}

        {/* SKU Details Tab */}
        {activeTab === 1 && (
          <Stack spacing={1.5}>
            {sampleSKUs.map((sku) => {
              const statusColors = getStockStatusColor(sku.stock_status);
              return (
                <Box key={sku.sku_id} sx={{ bgcolor: '#f8fafc', borderRadius: 1.5, p: 2, border: '1px solid', borderColor: alpha('#64748b', 0.15) }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>{sku.product_name}</Typography>
                      <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>{sku.sku_id}</Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Chip
                        label={sku.stock_status.replace('-', ' ').toUpperCase()}
                        size="small"
                        sx={{ height: 18, fontSize: '0.55rem', fontWeight: 700, bgcolor: statusColors.bg, color: statusColors.text }}
                      />
                      {getTrendIcon(sku.trend)}
                    </Stack>
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <Box sx={{ bgcolor: 'white', borderRadius: 1, p: 1, flex: 1, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '0.55rem', color: '#64748b', textTransform: 'uppercase' }}>Current Qty</Typography>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{sku.current_qty.toLocaleString()}</Typography>
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}

        {/* Forecast Tab */}
        {activeTab === 2 && (
          <Stack spacing={2}>
            <Box sx={{ bgcolor: '#f8fafc', borderRadius: 1.5, p: 2 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', mb: 2 }}>
                Demand Forecast Summary
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
                <Box sx={{ bgcolor: 'white', borderRadius: 1, p: 1.5, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.55rem', color: '#64748b', textTransform: 'uppercase', mb: 0.5 }}>7-Day</Typography>
                  <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#0891b2' }}>+12%</Typography>
                </Box>
                <Box sx={{ bgcolor: 'white', borderRadius: 1, p: 1.5, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.55rem', color: '#64748b', textTransform: 'uppercase', mb: 0.5 }}>14-Day</Typography>
                  <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#0284c7' }}>+18%</Typography>
                </Box>
                <Box sx={{ bgcolor: 'white', borderRadius: 1, p: 1.5, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.55rem', color: '#64748b', textTransform: 'uppercase', mb: 0.5 }}>30-Day</Typography>
                  <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#005a9e' }}>+25%</Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ bgcolor: alpha('#0284c7', 0.08), border: '1px solid', borderColor: alpha('#0284c7', 0.2), borderRadius: 1.5, p: 2 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0284c7', mb: 1 }}>AI Forecast Insights</Typography>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#0284c7', mt: 0.75 }} />
                  <Typography sx={{ fontSize: '0.7rem', color: '#0078d4' }}>
                    Seasonal demand increase expected due to summer heat wave
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#10b981', mt: 0.75 }} />
                  <Typography sx={{ fontSize: '0.7rem', color: '#0078d4' }}>
                    Recommend increasing safety stock by 15% for next 2 weeks
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
