import React from 'react';
import { Box, Tooltip, alpha } from '@mui/material';
import {
  Storage as StorageIcon,
  VerifiedUser as VerifiedUserIcon,
  Calculate as CalculateIcon,
  Science as ScienceIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';

// Data source types - matches backend
export const DATA_SOURCES = {
  SAP_SD: 'sap_sd',
  SAP_MASTER: 'sap_master',
  SAP_FI: 'sap_fi',
  ML_INSIGHTS: 'ml_insights',
  CALCULATED: 'calculated',
  MOCK: 'mock'
};

/**
 * SourceIndicator - Shows the data source for a value
 * Similar to ORDLY.AI pattern for transparency on data origin
 */
const SourceIndicator = ({ source, sapTable, size = 'small' }) => {
  const config = {
    [DATA_SOURCES.SAP_SD]: {
      icon: <StorageIcon sx={{ fontSize: size === 'small' ? 10 : 12 }} />,
      color: '#0854a0',
      label: `SAP SD${sapTable ? ` (${sapTable})` : ''}`
    },
    [DATA_SOURCES.SAP_MASTER]: {
      icon: <VerifiedUserIcon sx={{ fontSize: size === 'small' ? 10 : 12 }} />,
      color: '#059669',
      label: `SAP Master${sapTable ? ` (${sapTable})` : ''}`
    },
    [DATA_SOURCES.SAP_FI]: {
      icon: <StorageIcon sx={{ fontSize: size === 'small' ? 10 : 12 }} />,
      color: '#d97706',
      label: `SAP FI${sapTable ? ` (${sapTable})` : ''}`
    },
    [DATA_SOURCES.ML_INSIGHTS]: {
      icon: <PsychologyIcon sx={{ fontSize: size === 'small' ? 10 : 12 }} />,
      color: '#8b5cf6',
      label: 'ML Calculated'
    },
    [DATA_SOURCES.CALCULATED]: {
      icon: <CalculateIcon sx={{ fontSize: size === 'small' ? 10 : 12 }} />,
      color: '#6366f1',
      label: 'Derived Value'
    },
    [DATA_SOURCES.MOCK]: {
      icon: <ScienceIcon sx={{ fontSize: size === 'small' ? 10 : 12 }} />,
      color: '#f59e0b',
      label: 'Demo/Mock Data'
    }
  };

  const c = config[source] || config[DATA_SOURCES.MOCK];

  return (
    <Tooltip title={c.label} arrow placement="top">
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size === 'small' ? 14 : 18,
          height: size === 'small' ? 14 : 18,
          borderRadius: '50%',
          bgcolor: alpha(c.color, 0.15),
          color: c.color,
          ml: 0.5,
          flexShrink: 0,
        }}
      >
        {c.icon}
      </Box>
    </Tooltip>
  );
};

export default SourceIndicator;
