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
}) => {
  const IconComponent = category.icon;
  const severityLevel = getSeverityLevel(highestSeverity);

  return (
    <Zoom in timeout={200 + index * 50}>
      <Card
        sx={{
          height: 200,
          cursor: enabled ? 'pointer' : 'default',
          opacity: enabled ? 1 : 0.6,
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid',
          borderColor: alpha(category.color, 0.15),
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: category.gradient || `linear-gradient(135deg, ${category.color} 0%, ${alpha(category.color, 0.7)} 100%)`,
            opacity: 0.8,
          },
          '&:hover': enabled ? {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 24px ${alpha(category.color, 0.15)}`,
            borderColor: category.color,
            '& .module-icon': {
              transform: 'scale(1.15)',
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
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 'auto', lineHeight: 1.4, fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
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
