import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Badge,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { getSeverityLevel } from './CategoryIcons';

/**
 * MarketCategoryTile - Individual tile for each market signal category
 *
 * Props:
 * - category: Category object from MARKET_CATEGORIES
 * - signalCount: Number of active signals
 * - enabled: Whether category is enabled for monitoring
 * - highestSeverity: Highest severity score among signals
 * - onClick: Handler when tile is clicked
 * - onConfigClick: Handler for config icon click
 */
const MarketCategoryTile = ({
  category,
  signalCount = 0,
  enabled = true,
  highestSeverity = 0,
  trend = null, // 'up', 'down', or null
  onClick,
  onConfigClick,
}) => {
  const IconComponent = category.icon;
  const severityLevel = getSeverityLevel(highestSeverity);

  // Determine tile border color based on severity - light theme
  const getBorderColor = () => {
    if (!enabled) return '#e0e0e0';
    if (signalCount === 0) return '#e0e0e0';
    if (highestSeverity >= 80) return '#ffcdd2'; // light red
    if (highestSeverity >= 60) return '#ffe0b2'; // light orange
    return '#e3f2fd'; // light blue
  };

  // Determine badge color
  const getBadgeColor = () => {
    if (highestSeverity >= 80) return 'error';
    if (highestSeverity >= 60) return 'warning';
    if (highestSeverity >= 40) return 'info';
    return 'success';
  };

  return (
    <Card
      sx={{
        height: '100%',
        cursor: enabled ? 'pointer' : 'not-allowed',
        opacity: enabled ? 1 : 0.6,
        border: '2px solid',
        borderColor: getBorderColor(),
        transition: 'all 0.3s ease',
        position: 'relative',
        '&:hover': enabled ? {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          borderColor: '#bdbdbd',
        } : {},
      }}
      onClick={enabled ? onClick : undefined}
    >
      <CardContent sx={{ pb: 1.5, p: 1.5 }}>
        {/* Config Icon */}
        <Box sx={{ position: 'absolute', top: 6, right: 6 }}>
          <Tooltip title="Configure category">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onConfigClick?.();
              }}
              sx={{
                opacity: 0.6,
                '&:hover': { opacity: 1 }
              }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Category Icon */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: '#f5f5f5',
            mb: 1.5,
          }}
        >
          <IconComponent sx={{ fontSize: 28, color: '#666666' }} />
        </Box>

        {/* Category Name */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: '0.95rem',
            mb: 0.25,
            color: enabled ? 'text.primary' : 'text.disabled',
          }}
        >
          {category.name}
        </Typography>

        {/* Description */}
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            mb: 1.5,
            minHeight: 32,
            fontSize: '0.7rem',
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {category.description}
        </Typography>

        {/* Metrics Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
          {/* Alert Count Badge */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Badge
              badgeContent={signalCount}
              color={getBadgeColor()}
              max={99}
              sx={{
                '& .MuiBadge-badge': {
                  fontWeight: 600,
                  fontSize: '0.65rem',
                }
              }}
            >
              <Chip
                label={signalCount === 0 ? 'No Alerts' : `${signalCount} Alert${signalCount > 1 ? 's' : ''}`}
                size="small"
                sx={{
                  bgcolor: '#f5f5f5',
                  color: 'text.secondary',
                  fontWeight: 500,
                  height: 20,
                  fontSize: '0.7rem',
                }}
              />
            </Badge>
          </Box>

          {/* Trend Indicator */}
          {trend && enabled && signalCount > 0 && (
            <Tooltip title={trend === 'up' ? 'Severity increasing' : 'Severity decreasing'}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {trend === 'up' ? (
                  <TrendingUpIcon sx={{ fontSize: 20, color: '#f44336' }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 20, color: '#4caf50' }} />
                )}
              </Box>
            </Tooltip>
          )}
        </Box>

        {/* Severity Level Indicator */}
        {enabled && signalCount > 0 && (
          <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                Highest:
              </Typography>
              <Chip
                label={severityLevel.label}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  bgcolor: severityLevel.bgColor,
                  color: severityLevel.color,
                  border: `1px solid ${severityLevel.color}`,
                }}
              />
            </Box>
          </Box>
        )}

        {/* Disabled State */}
        {!enabled && (
          <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #e0e0e0' }}>
            <Chip
              label="Disabled"
              size="small"
              sx={{
                height: 18,
                fontSize: '0.6rem',
                bgcolor: '#f5f5f5',
                color: 'text.disabled',
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketCategoryTile;
