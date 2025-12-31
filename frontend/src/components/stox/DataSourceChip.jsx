/**
 * DataSourceChip Component
 * Displays a chip indicating the data source type (Real, Demo, or Mixed)
 */
import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import ScienceIcon from '@mui/icons-material/Science';
import SyncIcon from '@mui/icons-material/Sync';
import { getDataSourceDisplay } from './stoxDataConfig';

const ICONS = {
  CloudDone: CloudDoneIcon,
  Science: ScienceIcon,
  Sync: SyncIcon,
};

/**
 * DataSourceChip - Shows data source indicator
 * @param {Object} props
 * @param {string} props.dataType - 'real', 'demo', or 'mixed'
 * @param {string} props.size - Chip size ('small' or 'medium')
 * @param {Object} props.sx - Additional MUI sx styles
 */
function DataSourceChip({ dataType = 'demo', size = 'small', sx = {} }) {
  const config = getDataSourceDisplay(dataType);
  const IconComponent = ICONS[config.icon] || ScienceIcon;

  return (
    <Tooltip title={config.description} arrow placement="top">
      <Chip
        label={config.label}
        size={size}
        icon={<IconComponent sx={{ fontSize: size === 'small' ? 14 : 18 }} />}
        sx={{
          bgcolor: config.bgColor,
          color: config.color,
          fontWeight: 500,
          fontSize: size === 'small' ? '0.7rem' : '0.75rem',
          height: size === 'small' ? 22 : 28,
          '& .MuiChip-icon': {
            color: config.color,
          },
          ...sx,
        }}
      />
    </Tooltip>
  );
}

export default DataSourceChip;
