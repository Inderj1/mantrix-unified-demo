import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Stack, Avatar, IconButton, TextField, InputAdornment, Chip, CircularProgress } from '@mui/material';
import { alpha } from '@mui/material/styles';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import MicIcon from '@mui/icons-material/Mic';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

// Sample suggested prompts - aligned with database capabilities
const suggestedPrompts = [
  { label: 'Critical Alerts', icon: <WarningAmberIcon sx={{ fontSize: 12 }} />, query: 'Show me critical severity alerts with revenue at risk' },
  { label: 'Low Battery', icon: <BatteryAlertIcon sx={{ fontSize: 12 }} />, query: 'Which trackers have low battery levels?' },
  { label: 'In Transit', icon: <LocalShippingIcon sx={{ fontSize: 12 }} />, query: 'Show me all kits currently in transit' },
  { label: 'Revenue Risk', icon: <WarningAmberIcon sx={{ fontSize: 12 }} />, query: 'What is the total revenue at risk from all alerts?' },
];

export default function ChatPanel({
  kits = [],
  facilities = [],
  alerts = [],
  onKitClick,
  onFacilityClick,
  onAlertClick,
  onFilterKits,
  onHighlightItems
}) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Hello! I\'m your TRACK AI assistant powered by advanced language models. I can help you:\n\n• Analyze kit locations and statuses\n• Identify critical alerts and issues\n• Track IoT sensor data anomalies\n• Provide recommendations for logistics optimization\n\nWhat would you like to explore?',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    // Use block: 'nearest' to only scroll within the chat container, not the whole page
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Build comprehensive context string from SMADE tracker data
  const buildDataContext = () => {
    // Tracker/Kit Summary
    const trackersSummary = {
      total: kits.length,
      byTrajectoryStatus: kits.reduce((acc, k) => {
        const status = k.trajectory?.status || k.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
      byTrackerType: kits.reduce((acc, k) => {
        const type = k.tracker?.tracker_type || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}),
      byLogisticsStatus: kits.reduce((acc, k) => {
        const status = k.asset?.logistics_status || k.process_type;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
      lowBattery: kits.filter(k => (k.tracker?.battery_level || k.battery_level) < 30).length,
      criticalBattery: kits.filter(k => (k.tracker?.battery_level || k.battery_level) < 15).length,
      overdueReturns: kits.filter(k => k.trajectory?.is_overdue).length,
      highCycleCounts: kits.filter(k => (k.lifecycle_events?.total_autoclave_cycles || 0) > 130).length,
      withDropEvents: kits.filter(k => (k.lifecycle_events?.total_drop_count || 0) > 0).length,
      multipleDrops: kits.filter(k => (k.lifecycle_events?.total_drop_count || 0) > 2).length,
    };

    // Calculate fleet utilization
    const avgUtilization = kits.reduce((sum, k) => sum + (k.history_summary?.utilization_rate_percent || 0), 0) / kits.length;
    const avgOnTimeReturn = kits.reduce((sum, k) => sum + (k.history_summary?.on_time_return_rate_percent || 0), 0) / kits.length;
    const totalDistanceKm = kits.reduce((sum, k) => sum + (k.history_summary?.total_distance_traveled_km || 0), 0);
    const totalAutoclaveCycles = kits.reduce((sum, k) => sum + (k.lifecycle_events?.total_autoclave_cycles || 0), 0);

    // Connectivity summary
    const connectivitySummary = kits.reduce((acc, k) => {
      const score = k.data_quality?.connectivity_score || 'unknown';
      acc[score] = (acc[score] || 0) + 1;
      return acc;
    }, {});

    // Alerts Summary
    const alertsSummary = {
      total: alerts.length,
      bySeverity: alerts.reduce((acc, a) => {
        acc[a.severity] = (acc[a.severity] || 0) + 1;
        return acc;
      }, {}),
      byType: alerts.reduce((acc, a) => {
        acc[a.type] = (acc[a.type] || 0) + 1;
        return acc;
      }, {}),
      unacknowledged: alerts.filter(a => a.status === 'active').length,
    };

    // Facilities Summary
    const facilitiesSummary = {
      total: facilities.length,
      needsAttention: facilities.filter(f => f.status !== 'active').length,
      totalKitsOnSite: facilities.reduce((sum, f) => sum + (f.kits_on_site || 0), 0),
      pendingSurgeries: facilities.reduce((sum, f) => sum + (f.pending_surgeries || 0), 0),
    };

    return `
TRACK AI IoT System - Real-Time Data Context

═══════════════════════════════════════════════════════
FLEET OVERVIEW
═══════════════════════════════════════════════════════
• Total Trackers: ${trackersSummary.total}
• Tracker Types: ${Object.entries(trackersSummary.byTrackerType).map(([t, c]) => `${t}: ${c}`).join(', ')}
• Logistics Status: ${Object.entries(trackersSummary.byLogisticsStatus).map(([s, c]) => `${s}: ${c}`).join(', ')}

TRAJECTORY STATUS:
${Object.entries(trackersSummary.byTrajectoryStatus).map(([s, c]) => `• ${s.replace('_', ' ')}: ${c} assets`).join('\n')}

═══════════════════════════════════════════════════════
BATTERY & CONNECTIVITY
═══════════════════════════════════════════════════════
• Low Battery (<30%): ${trackersSummary.lowBattery} trackers
• Critical Battery (<15%): ${trackersSummary.criticalBattery} trackers
• Connectivity: ${Object.entries(connectivitySummary).map(([s, c]) => `${s}: ${c}`).join(', ')}

═══════════════════════════════════════════════════════
LIFECYCLE & MAINTENANCE
═══════════════════════════════════════════════════════
• Total Autoclave Cycles (fleet): ${totalAutoclaveCycles.toLocaleString()}
• High Cycle Count Assets (>130): ${trackersSummary.highCycleCounts}
• Assets with Drop Events: ${trackersSummary.withDropEvents}
• Multiple Drops (>2, needs inspection): ${trackersSummary.multipleDrops}

═══════════════════════════════════════════════════════
RETURNS & LOGISTICS
═══════════════════════════════════════════════════════
• Overdue Returns: ${trackersSummary.overdueReturns}
• Average On-Time Return Rate: ${avgOnTimeReturn.toFixed(1)}%
• Average Utilization Rate: ${avgUtilization.toFixed(1)}%
• Total Distance Traveled: ${totalDistanceKm.toLocaleString()} km

═══════════════════════════════════════════════════════
ALERTS (${alertsSummary.total} active)
═══════════════════════════════════════════════════════
• By Severity: ${Object.entries(alertsSummary.bySeverity).map(([s, c]) => `${s}: ${c}`).join(', ') || 'none'}
• By Type: ${Object.entries(alertsSummary.byType).map(([t, c]) => `${t.replace('_', ' ')}: ${c}`).join(', ') || 'none'}
• Unacknowledged: ${alertsSummary.unacknowledged}

═══════════════════════════════════════════════════════
FACILITIES (${facilitiesSummary.total})
═══════════════════════════════════════════════════════
• Assets On-Site: ${facilitiesSummary.totalKitsOnSite}
• Pending Surgeries: ${facilitiesSummary.pendingSurgeries}
• Needing Attention: ${facilitiesSummary.needsAttention}

═══════════════════════════════════════════════════════
DETAILED TRACKER DATA (Sample of 5)
═══════════════════════════════════════════════════════
${kits.slice(0, 5).map(k => `
TRACKER: ${k.tracker?.tracker_id || k.id}
• Asset: ${k.asset?.asset_name || k.kit_type}
• Type: ${k.tracker?.tracker_type || 'N/A'} | Status: ${k.trajectory?.status || k.status}
• Location: ${k.location?.current_location?.facility_name || k.facility_name} (${k.location?.current_location?.department || 'N/A'})
• Battery: ${k.tracker?.battery_level || k.battery_level}% (${k.tracker?.battery_status || 'N/A'})
• Days at Location: ${k.trajectory?.days_at_current_location || 'N/A'}
• Autoclave Cycles: ${k.lifecycle_events?.total_autoclave_cycles || 'N/A'}/150
• Drop Events: ${k.lifecycle_events?.total_drop_count || 0}
• Utilization: ${k.history_summary?.utilization_rate_percent?.toFixed(1) || 'N/A'}%
• Value: $${(k.asset?.value_usd || k.value)?.toLocaleString() || 'N/A'}
`).join('\n')}

═══════════════════════════════════════════════════════
RECENT ALERTS
═══════════════════════════════════════════════════════
${alerts.slice(0, 5).map(a => `• [${a.severity.toUpperCase()}] ${a.message} at ${a.facility_name} (${a.type})`).join('\n')}
`;
  };

  // Extract actionable items from LLM response
  const extractActionableItems = (response, query) => {
    const items = [];
    const lowerQuery = query.toLowerCase();
    const lowerResponse = response.toLowerCase();

    // Check for critical alerts mention
    if (lowerQuery.includes('critical') || lowerQuery.includes('alert') || lowerResponse.includes('critical')) {
      const criticalAlerts = alerts.filter(a => a.severity === 'critical');
      criticalAlerts.slice(0, 3).forEach(a => {
        items.push({
          type: 'alert',
          id: a.id,
          title: a.message,
          subtitle: a.facility_name,
          severity: a.severity,
          data: a
        });
      });
      if (criticalAlerts.length > 0) {
        onHighlightItems?.('alerts', criticalAlerts.map(a => a.id));
      }
    }

    // Check for battery issues
    if (lowerQuery.includes('battery') || lowerResponse.includes('battery') || lowerResponse.includes('low power')) {
      const lowBatteryKits = kits.filter(k => k.battery_level < 30);
      lowBatteryKits.slice(0, 3).forEach(k => {
        items.push({
          type: 'kit',
          id: k.id,
          title: k.kit_type,
          subtitle: `Battery: ${k.battery_level}%`,
          status: 'warning',
          data: k
        });
      });
      if (lowBatteryKits.length > 0) {
        onHighlightItems?.('kits', lowBatteryKits.map(k => k.id));
      }
    }

    // Check for transit/shipping
    if (lowerQuery.includes('transit') || lowerQuery.includes('shipping') || lowerResponse.includes('in transit')) {
      const transitKits = kits.filter(k => k.status === 'in-transit');
      transitKits.slice(0, 3).forEach(k => {
        items.push({
          type: 'kit',
          id: k.id,
          title: k.kit_type,
          subtitle: `To: ${k.facility_name}`,
          status: 'in-transit',
          data: k
        });
      });
      if (transitKits.length > 0) {
        onHighlightItems?.('kits', transitKits.map(k => k.id));
      }
    }

    // Check for temperature issues
    if (lowerQuery.includes('temperature') || lowerQuery.includes('temp') || lowerResponse.includes('temperature')) {
      const tempAlerts = alerts.filter(a => a.type === 'temperature-alert');
      tempAlerts.slice(0, 2).forEach(a => {
        items.push({
          type: 'alert',
          id: a.id,
          title: a.message,
          subtitle: a.facility_name,
          severity: a.severity,
          data: a
        });
      });
    }

    // Check for shock events
    if (lowerQuery.includes('shock') || lowerQuery.includes('damage') || lowerResponse.includes('shock')) {
      const shockKits = kits.filter(k => k.shock_detected);
      shockKits.slice(0, 3).forEach(k => {
        items.push({
          type: 'kit',
          id: k.id,
          title: k.kit_type,
          subtitle: `Shock detected - ${k.facility_name}`,
          status: 'critical',
          data: k
        });
      });
      if (shockKits.length > 0) {
        onHighlightItems?.('kits', shockKits.map(k => k.id));
      }
    }

    return items;
  };

  // Call LLM API - uses the natural language query endpoint
  const callLLMAPI = async (query) => {
    try {
      // First, fetch real-time data from TRAXX API for context
      let realTimeContext = '';
      try {
        const [kitsRes, alertsRes, statsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/traxx/kits`),
          fetch(`${API_BASE_URL}/api/v1/traxx/alerts`),
          fetch(`${API_BASE_URL}/api/v1/traxx/stats`)
        ]);

        const kitsData = kitsRes.ok ? await kitsRes.json() : { kits: [] };
        const alertsData = alertsRes.ok ? await alertsRes.json() : { alerts: [] };
        const statsData = statsRes.ok ? await statsRes.json() : {};

        realTimeContext = `
REAL-TIME KIT CONTROL TOWER DATA:
- Total Kits: ${kitsData.total || 0}
- Active Alerts: ${alertsData.total || 0}
- Critical Alerts: ${alertsData.alerts?.filter(a => a.severity === 'critical').length || 0}
- High Priority Alerts: ${alertsData.alerts?.filter(a => a.severity === 'high').length || 0}

Recent Alerts:
${alertsData.alerts?.slice(0, 5).map(a => `- [${a.severity.toUpperCase()}] ${a.kitName}: ${a.message}`).join('\n') || 'None'}

Kit Status Summary:
${kitsData.kits?.slice(0, 5).map(k => `- ${k.name}: ${k.status} at ${k.location}`).join('\n') || 'None'}
`;
      } catch (contextErr) {
        console.log('Could not fetch real-time context, continuing with query');
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: query,
          conversationId: conversationId
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();

      // Update conversation ID for context continuity
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      // Format the response based on what we got back
      let content = '';

      // Check if we have query results
      const results = data.execution?.data || data.results || [];

      if (results.length > 0) {
        // Format the SQL results nicely
        content = `Based on your query, here's what I found:\n\n`;

        // Create a summary of results
        if (results.length === 1) {
          // Single result - show all fields
          const row = results[0];
          content += Object.entries(row).map(([key, value]) => `**${key.replace(/_/g, ' ')}**: ${value}`).join('\n');
        } else {
          // Multiple results - show as list
          content += `Found **${results.length} records**:\n\n`;
          results.slice(0, 8).forEach((row, idx) => {
            const summary = Object.values(row).slice(0, 4).join(' | ');
            content += `${idx + 1}. ${summary}\n`;
          });
          if (results.length > 8) {
            content += `\n... and ${results.length - 8} more records.`;
          }
        }

        // Add explanation if available
        if (data.explanation) {
          content += `\n\n${data.explanation}`;
        }
      } else if (data.explanation) {
        content = data.explanation;
      } else if (data.answer || data.response || data.message) {
        content = data.answer || data.response || data.message;
      } else {
        content = 'Query executed but no results were returned. Try rephrasing your question.';
      }

      return {
        content: content,
        sql: data.sql,
        data: results
      };
    } catch (error) {
      console.error('LLM API error:', error);
      // Fallback to local processing if API fails
      return fallbackLocalProcessing(query);
    }
  };

  // Fallback local processing when API is unavailable
  const fallbackLocalProcessing = (query) => {
    const lowerQuery = query.toLowerCase();

    // Critical alerts
    if (lowerQuery.includes('critical') || (lowerQuery.includes('alert') && lowerQuery.includes('urgent'))) {
      const criticalAlerts = alerts.filter(a => a.severity === 'critical');
      return {
        content: criticalAlerts.length > 0
          ? `I found **${criticalAlerts.length} critical alert${criticalAlerts.length > 1 ? 's' : ''}** requiring immediate attention:\n\n${criticalAlerts.slice(0, 4).map(a => `• **${a.message}**\n  Location: ${a.facility_name}\n  Type: ${a.type?.replace('_', ' ')}`).join('\n\n')}\n\n**Recommended Actions:**\n• Address overdue returns immediately to avoid compliance issues\n• Schedule maintenance for high-cycle assets\n• Replace low battery trackers`
          : 'Great news! There are no critical alerts at the moment. All systems are operating normally.'
      };
    }

    // Battery queries
    if (lowerQuery.includes('battery') || lowerQuery.includes('power') || lowerQuery.includes('charge')) {
      const lowBatteryKits = kits.filter(k => (k.tracker?.battery_level || k.battery_level) < 30);
      const criticalBatteryKits = kits.filter(k => (k.tracker?.battery_level || k.battery_level) < 15);
      return {
        content: lowBatteryKits.length > 0
          ? `**Battery Status Report:**\n\n• **${criticalBatteryKits.length}** trackers with critical battery (<15%)\n• **${lowBatteryKits.length}** trackers with low battery (<30%)\n\n**Trackers Needing Attention:**\n${lowBatteryKits.slice(0, 4).map(k => `• **${k.tracker?.tracker_id || k.id}** (${k.tracker?.tracker_type || 'N/A'})\n  Asset: ${k.asset?.asset_name || k.kit_type}\n  Battery: ${k.tracker?.battery_level || k.battery_level}%\n  Est. Life: ${k.tracker?.estimated_battery_life_days || 'N/A'} days\n  Location: ${k.facility_name}`).join('\n\n')}\n\n**Recommendation:** Schedule IoT device replacement for critical battery units within 48 hours.`
          : 'All tracker batteries are healthy (above 30%). No immediate action required.'
      };
    }

    // Transit/shipping queries
    if (lowerQuery.includes('transit') || lowerQuery.includes('shipping') || lowerQuery.includes('movement')) {
      const transitKits = kits.filter(k => k.trajectory?.status === 'in_transit' || k.status === 'in-transit');
      return {
        content: transitKits.length > 0
          ? `**Assets In Transit: ${transitKits.length}**\n\n${transitKits.slice(0, 4).map(k => `• **${k.asset?.asset_name || k.kit_type}**\n  Tracker: ${k.tracker?.tracker_id || k.id}\n  Destination: ${k.facility_name}\n  Previous: ${k.location?.previous_location?.facility_name || 'N/A'}\n  Connectivity: ${k.tracker?.connectivity?.type || 'N/A'} (Signal: ${k.tracker?.connectivity?.signal_strength || 'N/A'} dBm)`).join('\n\n')}\n\nAll shipments are being monitored via IoT sensors for location, temperature, and shock events.`
          : 'No assets are currently in transit. All inventory is stationed at facilities or distribution centers.'
      };
    }

    // Autoclave/sterilization queries
    if (lowerQuery.includes('autoclave') || lowerQuery.includes('steriliz') || lowerQuery.includes('cycle')) {
      const highCycleKits = kits.filter(k => (k.lifecycle_events?.total_autoclave_cycles || 0) > 130);
      const totalCycles = kits.reduce((sum, k) => sum + (k.lifecycle_events?.total_autoclave_cycles || 0), 0);
      return {
        content: `**Autoclave Cycle Analysis:**\n\n• **Total Fleet Cycles:** ${totalCycles.toLocaleString()}\n• **Assets Near Limit (>130/150):** ${highCycleKits.length}\n\n${highCycleKits.length > 0 ? `**Assets Requiring Attention:**\n${highCycleKits.slice(0, 4).map(k => `• **${k.asset?.asset_name || k.kit_type}**\n  Cycles: ${k.lifecycle_events?.total_autoclave_cycles}/150\n  Last Autoclave: ${k.lifecycle_events?.last_autoclave?.timestamp ? new Date(k.lifecycle_events.last_autoclave.timestamp).toLocaleDateString() : 'N/A'}\n  Max Temp: ${k.lifecycle_events?.last_autoclave?.max_temperature_celsius || 'N/A'}°C`).join('\n\n')}\n\n**Recommendation:** Schedule replacement or refurbishment for assets exceeding 140 cycles.` : 'All assets are within acceptable autoclave cycle limits.'}`
      };
    }

    // Drop/shock events
    if (lowerQuery.includes('drop') || lowerQuery.includes('shock') || lowerQuery.includes('impact') || lowerQuery.includes('damage')) {
      const droppedKits = kits.filter(k => (k.lifecycle_events?.total_drop_count || 0) > 0);
      const multiDropKits = kits.filter(k => (k.lifecycle_events?.total_drop_count || 0) > 2);
      return {
        content: `**Drop/Shock Event Analysis:**\n\n• **Assets with Drop Events:** ${droppedKits.length}\n• **Multiple Drops (>2, needs inspection):** ${multiDropKits.length}\n\n${multiDropKits.length > 0 ? `**Assets Requiring Inspection:**\n${multiDropKits.slice(0, 4).map(k => `• **${k.asset?.asset_name || k.kit_type}**\n  Drop Count: ${k.lifecycle_events?.total_drop_count}\n  Recent Drops:\n${(k.lifecycle_events?.recent_drops || []).slice(0, 2).map(d => `    - ${new Date(d.timestamp).toLocaleDateString()}: ${d.impact_force_g?.toFixed(1)}g force`).join('\n')}\n  Location: ${k.facility_name}`).join('\n\n')}\n\n**Recommendation:** Conduct physical inspection to verify instrument integrity.` : 'No significant drop events recorded.'}`
      };
    }

    // Overdue returns
    if (lowerQuery.includes('overdue') || lowerQuery.includes('return') || lowerQuery.includes('late')) {
      const overdueKits = kits.filter(k => k.trajectory?.is_overdue);
      return {
        content: overdueKits.length > 0
          ? `**Overdue Returns: ${overdueKits.length}**\n\n${overdueKits.slice(0, 4).map(k => `• **${k.asset?.asset_name || k.kit_type}**\n  Tracker: ${k.tracker?.tracker_id || k.id}\n  Location: ${k.facility_name}\n  Days at Location: ${k.trajectory?.days_at_current_location || 'N/A'}\n  Expected Return: ${k.trajectory?.expected_return_date || 'N/A'}\n  Value: $${(k.asset?.value_usd || k.value)?.toLocaleString()}`).join('\n\n')}\n\n**Recommendation:** Contact facilities immediately to schedule pickup and prevent revenue loss.`
          : 'No overdue returns at this time. All assets are within expected return windows.'
      };
    }

    // Utilization queries
    if (lowerQuery.includes('utilization') || lowerQuery.includes('usage') || lowerQuery.includes('performance')) {
      const avgUtilization = kits.reduce((sum, k) => sum + (k.history_summary?.utilization_rate_percent || 0), 0) / kits.length;
      const avgOnTimeReturn = kits.reduce((sum, k) => sum + (k.history_summary?.on_time_return_rate_percent || 0), 0) / kits.length;
      const totalDistance = kits.reduce((sum, k) => sum + (k.history_summary?.total_distance_traveled_km || 0), 0);
      const lowUtilKits = kits.filter(k => (k.history_summary?.utilization_rate_percent || 0) < 50);
      return {
        content: `**Fleet Utilization Analysis:**\n\n• **Average Utilization Rate:** ${avgUtilization.toFixed(1)}%\n• **Average On-Time Return:** ${avgOnTimeReturn.toFixed(1)}%\n• **Total Distance Traveled:** ${totalDistance.toLocaleString()} km\n• **Underutilized Assets (<50%):** ${lowUtilKits.length}\n\n${lowUtilKits.length > 0 ? `**Consider Repositioning:**\n${lowUtilKits.slice(0, 3).map(k => `• **${k.asset?.asset_name || k.kit_type}** - ${k.history_summary?.utilization_rate_percent?.toFixed(1)}% utilization at ${k.facility_name}`).join('\n')}` : 'All assets are performing well.'}`
      };
    }

    // Connectivity queries
    if (lowerQuery.includes('connectivity') || lowerQuery.includes('signal') || lowerQuery.includes('transmission')) {
      const connectivityStats = kits.reduce((acc, k) => {
        const score = k.data_quality?.connectivity_score || 'unknown';
        acc[score] = (acc[score] || 0) + 1;
        return acc;
      }, {});
      const poorConnectivity = kits.filter(k => k.data_quality?.connectivity_score === 'poor');
      return {
        content: `**Connectivity Status:**\n\n${Object.entries(connectivityStats).map(([score, count]) => `• **${score}:** ${count} trackers`).join('\n')}\n\n${poorConnectivity.length > 0 ? `**Poor Connectivity Trackers:**\n${poorConnectivity.slice(0, 3).map(k => `• **${k.tracker?.tracker_id || k.id}** at ${k.facility_name}\n  Signal: ${k.tracker?.connectivity?.signal_strength || 'N/A'} dBm\n  Last Transmission: ${k.tracker?.connectivity?.last_transmission ? new Date(k.tracker.connectivity.last_transmission).toLocaleString() : 'N/A'}`).join('\n\n')}\n\n**Recommendation:** Investigate connectivity issues in these facilities.` : 'All trackers have good connectivity.'}`
      };
    }

    // General/summary query
    const trajectoryCounts = kits.reduce((acc, k) => {
      const status = k.trajectory?.status || k.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    const avgUtilization = kits.reduce((sum, k) => sum + (k.history_summary?.utilization_rate_percent || 0), 0) / kits.length;

    return {
      content: `**TRACK AI Fleet Summary:**\n\n**${kits.length} Tracked Assets**\n\n**Trajectory Status:**\n${Object.entries(trajectoryCounts).map(([status, count]) => `• ${status.replace('_', ' ')}: ${count}`).join('\n')}\n\n**Key Metrics:**\n• Average Utilization: ${avgUtilization.toFixed(1)}%\n• Active Alerts: ${alerts.length} (${alerts.filter(a => a.severity === 'critical').length} critical)\n• Facilities Monitored: ${facilities.length}\n• Low Battery Trackers: ${kits.filter(k => (k.tracker?.battery_level || k.battery_level) < 30).length}\n• Overdue Returns: ${kits.filter(k => k.trajectory?.is_overdue).length}\n\n**What would you like to explore?**\n• Battery status and connectivity\n• Autoclave cycles and maintenance\n• Drop events and inspections\n• Utilization and performance\n• Transit and logistics`
    };
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const query = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // Call LLM API
      const response = await callLLMAPI(query);

      // Extract actionable items based on query and response
      const items = extractActionableItems(response.content, query);

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response.content,
        items: items.length > 0 ? items : undefined,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing query:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedPrompt = (prompt) => {
    setInputValue(prompt.query);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const handleItemClick = (item) => {
    if (item.type === 'kit') {
      onKitClick?.(item.data);
    } else if (item.type === 'facility') {
      onFacilityClick?.(item.data);
    } else if (item.type === 'alert') {
      onAlertClick?.(item.data);
    }
  };

  const getItemIcon = (type) => {
    switch (type) {
      case 'kit': return <MedicalServicesIcon sx={{ fontSize: 14 }} />;
      case 'facility': return <LocalHospitalIcon sx={{ fontSize: 14 }} />;
      case 'alert': return <WarningAmberIcon sx={{ fontSize: 14 }} />;
      default: return <MedicalServicesIcon sx={{ fontSize: 14 }} />;
    }
  };

  const getItemColor = (item) => {
    if (item.severity === 'critical' || item.status === 'critical') return '#ef4444';
    if (item.severity === 'warning' || item.status === 'warning') return '#f97316';
    if (item.status === 'in-transit') return '#3b82f6';
    return '#0a6ed1';
  };

  // Simple markdown-like rendering
  const renderContent = (content) => {
    // Split by newlines and process each line
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Bold text
      let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Bullet points
      if (processedLine.startsWith('• ') || processedLine.startsWith('- ')) {
        processedLine = processedLine;
      }
      return (
        <Typography
          key={idx}
          component="span"
          sx={{
            display: 'block',
            fontSize: '0.75rem',
            color: '#1e293b',
            lineHeight: 1.6,
            mb: line.trim() === '' ? 0.5 : 0,
            '& strong': { fontWeight: 600, color: '#0a6ed1' }
          }}
          dangerouslySetInnerHTML={{ __html: processedLine }}
        />
      );
    });
  };

  return (
    <Box
      sx={{
        height: '100%',
        bgcolor: 'white',
        borderLeft: '1px solid',
        borderColor: alpha('#64748b', 0.15),
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: alpha('#64748b', 0.1), background: 'linear-gradient(135deg, #0a6ed1 0%, #0854a0 100%)' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar sx={{ width: 28, height: 28, bgcolor: alpha('#fff', 0.2) }}>
            <AutoAwesomeIcon sx={{ fontSize: 16, color: 'white' }} />
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>TRACK AI</Typography>
            <Typography sx={{ fontSize: '0.6rem', color: alpha('#fff', 0.8) }}>Powered by LLM</Typography>
          </Box>
          <Box sx={{ flex: 1 }} />
          <Chip
            label="Online"
            size="small"
            sx={{
              height: 18,
              fontSize: '0.55rem',
              fontWeight: 700,
              bgcolor: alpha('#10b981', 0.3),
              color: '#10b981',
            }}
          />
        </Stack>
      </Box>

      {/* Suggested Prompts */}
      <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: alpha('#64748b', 0.1), bgcolor: alpha('#f8fafc', 0.5) }}>
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          {suggestedPrompts.map((prompt, idx) => (
            <Chip
              key={idx}
              icon={prompt.icon}
              label={prompt.label}
              size="small"
              onClick={() => handleSuggestedPrompt(prompt)}
              sx={{
                height: 24,
                fontSize: '0.65rem',
                fontWeight: 600,
                bgcolor: alpha('#0a6ed1', 0.08),
                color: '#0a6ed1',
                cursor: 'pointer',
                '&:hover': { bgcolor: alpha('#0a6ed1', 0.15) },
                '& .MuiChip-icon': { color: '#0a6ed1', ml: 0.5 },
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* Messages */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
        <Stack spacing={1.5}>
          {messages.map((message) => (
            <Box key={message.id}>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
                }}
              >
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: message.type === 'user' ? alpha('#64748b', 0.15) : alpha('#0a6ed1', 0.15),
                  }}
                >
                  {message.type === 'user' ? (
                    <PersonIcon sx={{ fontSize: 16, color: '#64748b' }} />
                  ) : (
                    <AutoAwesomeIcon sx={{ fontSize: 16, color: '#0a6ed1' }} />
                  )}
                </Avatar>
                <Box
                  sx={{
                    maxWidth: '85%',
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: message.type === 'user' ? alpha('#0a6ed1', 0.1) : alpha('#64748b', 0.05),
                    borderTopRightRadius: message.type === 'user' ? 4 : 16,
                    borderTopLeftRadius: message.type === 'user' ? 16 : 4,
                  }}
                >
                  {message.type === 'user' ? (
                    <Typography sx={{ fontSize: '0.75rem', color: '#1e293b', lineHeight: 1.5 }}>
                      {message.content}
                    </Typography>
                  ) : (
                    renderContent(message.content)
                  )}

                  {/* Clickable Items */}
                  {message.items && message.items.length > 0 && (
                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                      {message.items.map((item) => (
                        <Box
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          sx={{
                            p: 0.75,
                            borderRadius: 1,
                            bgcolor: alpha(getItemColor(item), 0.08),
                            border: '1px solid',
                            borderColor: alpha(getItemColor(item), 0.2),
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: alpha(getItemColor(item), 0.15),
                              transform: 'translateX(2px)',
                            },
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={0.75}>
                            <Avatar sx={{ width: 20, height: 20, bgcolor: alpha(getItemColor(item), 0.15) }}>
                              {React.cloneElement(getItemIcon(item.type), { sx: { fontSize: 12, color: getItemColor(item) } })}
                            </Avatar>
                            <Box sx={{ flex: 1, overflow: 'hidden' }}>
                              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.title}
                              </Typography>
                              <Typography sx={{ fontSize: '0.6rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.subtitle}
                              </Typography>
                            </Box>
                            <Chip
                              label="View"
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.55rem',
                                fontWeight: 600,
                                bgcolor: alpha(getItemColor(item), 0.15),
                                color: getItemColor(item),
                              }}
                            />
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Stack>
              <Typography
                sx={{
                  fontSize: '0.55rem',
                  color: '#94a3b8',
                  mt: 0.5,
                  textAlign: message.type === 'user' ? 'right' : 'left',
                  ml: message.type === 'user' ? 0 : 4.5,
                  mr: message.type === 'user' ? 4.5 : 0,
                }}
              >
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <Stack direction="row" spacing={1} alignItems="flex-end">
              <Avatar sx={{ width: 28, height: 28, bgcolor: alpha('#0a6ed1', 0.15) }}>
                <AutoAwesomeIcon sx={{ fontSize: 16, color: '#0a6ed1' }} />
              </Avatar>
              <Box sx={{ p: 1.25, borderRadius: 2, borderTopLeftRadius: 4, bgcolor: alpha('#64748b', 0.05) }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <CircularProgress size={12} sx={{ color: '#0a6ed1' }} />
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', ml: 1 }}>
                    Analyzing data...
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          )}
          <div ref={messagesEndRef} />
        </Stack>
      </Box>

      {/* Input Area */}
      <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: alpha('#64748b', 0.1), bgcolor: alpha('#f8fafc', 0.5) }}>
        <TextField
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about kits, alerts, logistics..."
          fullWidth
          size="small"
          multiline
          maxRows={3}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: 'white',
              fontSize: '0.8rem',
              '& fieldset': { borderColor: alpha('#64748b', 0.2) },
              '&:hover fieldset': { borderColor: alpha('#0a6ed1', 0.3) },
              '&.Mui-focused fieldset': { borderColor: '#0a6ed1', borderWidth: 1 },
            },
            '& .MuiInputBase-input': {
              py: 1.25,
              '&::placeholder': { color: '#94a3b8', opacity: 1 },
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" sx={{ color: '#94a3b8' }}>
                    <MicIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isTyping}
                    sx={{
                      color: inputValue.trim() && !isTyping ? '#0a6ed1' : '#94a3b8',
                      bgcolor: inputValue.trim() && !isTyping ? alpha('#0a6ed1', 0.1) : 'transparent',
                      '&:hover': { bgcolor: alpha('#0a6ed1', 0.2) },
                    }}
                  >
                    <SendIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Stack>
              </InputAdornment>
            ),
          }}
        />
        <Typography sx={{ fontSize: '0.6rem', color: '#94a3b8', mt: 0.5, textAlign: 'center' }}>
          AI-powered insights from real-time IoT data
        </Typography>
      </Box>
    </Box>
  );
}
