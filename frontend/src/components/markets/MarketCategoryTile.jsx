import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  alpha,
  Zoom,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { getSeverityLevel } from './CategoryIcons';

// Dark mode color helper
const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#00357a',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

/**
 * MarketCategoryTile - Individual tile for each market signal category
 * Styled to match STOX.AI and MARGEN.AI tile appearance
 *
 * Props:
 * - category: Category object from MARKET_CATEGORIES
 * - signalCount: Number of active signals
 * - enabled: Whether category is enabled for monitoring
 * - highestSeverity: Highest severity score among signals
 * - onClick: Handler when tile is clicked
 * - onConfigClick: Handler for config icon click
 * - index: Index for staggered animation
 * - darkMode: Whether dark mode is enabled
 */
const MarketCategoryTile = ({
  category,
  signalCount = 0,
  enabled = true,
  highestSeverity = 0,
  trend = null, // 'up', 'down', or null
  onClick,
  onConfigClick,
  index = 0,
  darkMode = false,
}) => {
  const colors = getColors(darkMode);
  const IconComponent = category.icon;
  const severityLevel = getSeverityLevel(highestSeverity);

  return (
    <Zoom in timeout={200 + index * 50}>
      <Card
        sx={{
          height: 200,
          cursor: enabled ? 'pointer' : 'default',
          opacity: enabled ? 1 : 0.6,
          transition: 'all 0.3s ease',
          border: `1px solid ${colors.border}`,
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          bgcolor: colors.cardBg,
          boxShadow: darkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': enabled ? {
            transform: 'translateY(-6px)',
            boxShadow: darkMode
              ? `0 20px 40px ${alpha(category.color, 0.2)}`
              : `0 20px 40px ${alpha(category.color, 0.12)}, 0 8px 16px rgba(0,0,0,0.06)`,
            '& .module-icon': {
              transform: 'scale(1.1)',
              bgcolor: category.color,
              color: 'white',
            },
            '& .module-arrow': {
              opacity: 1,
              transform: 'translateX(4px)',
            },
          } : {},
        }}
        onClick={enabled ? onClick : undefined}
      >
        <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Icon and Status */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Avatar
              className="module-icon"
              sx={{
                width: 40,
                height: 40,
                bgcolor: alpha(category.color, 0.1),
                color: category.color,
                transition: 'all 0.3s ease',
              }}
            >
              <IconComponent sx={{ fontSize: 22 }} />
            </Avatar>
            {!enabled && (
              <Chip label="Disabled" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha('#64748b', 0.1), color: '#64748b', fontWeight: 600 }} />
            )}
            {enabled && signalCount > 0 && highestSeverity >= 60 && (
              <Chip
                label={severityLevel.label}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  bgcolor: alpha(severityLevel.color, 0.1),
                  color: severityLevel.color,
                  fontWeight: 600
                }}
              />
            )}
          </Box>

          {/* Title */}
          <Typography variant="body1" sx={{ fontWeight: 700, color: category.color, mb: 0.5, fontSize: '0.9rem', lineHeight: 1.3 }}>
            {category.name}
          </Typography>

          {/* Description */}
          <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 'auto', lineHeight: 1.4, fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {category.description}
          </Typography>

          {/* Footer */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px solid', borderColor: alpha(category.color, 0.1) }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={signalCount === 0 ? 'No Alerts' : `${signalCount} Alert${signalCount > 1 ? 's' : ''}`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.65rem',
                  bgcolor: alpha(category.color, 0.08),
                  color: category.color,
                  fontWeight: 600
                }}
              />
              {/* Trend Indicator */}
              {trend && enabled && signalCount > 0 && (
                trend === 'up' ? (
                  <TrendingUpIcon sx={{ fontSize: 16, color: '#f44336' }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                )
              )}
            </Box>
            {enabled && (
              <ArrowForwardIcon className="module-arrow" sx={{ color: category.color, fontSize: 18, opacity: 0.5, transition: 'all 0.3s ease' }} />
            )}
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  );
};

export default MarketCategoryTile;
