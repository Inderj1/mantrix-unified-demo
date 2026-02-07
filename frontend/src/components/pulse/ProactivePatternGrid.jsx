import React, { useState } from 'react';
import {
  Box,
  Typography,
  Collapse,
  IconButton,
  Chip,
  alpha,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccountBalance as AccountBalanceIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { getColors } from '../../config/brandColors';
import ProactivePatternCard from './ProactivePatternCard';
import {
  getCOPAPatterns,
  getSTOXPatterns,
  getTotalDetections,
  getPendingExecutions,
  PATTERN_ICONS,
} from './proactivePatternData';

const ProactivePatternGrid = ({ darkMode = false, onRunPattern }) => {
  const colors = getColors(darkMode);
  const [expanded, setExpanded] = useState(true);

  const copaPatterns = getCOPAPatterns();
  const stoxPatterns = getSTOXPatterns();
  const totalDetections = getTotalDetections();
  const pendingExec = getPendingExecutions();

  return (
    <Box sx={{ mb: 3, px: 2 }}>
      {/* Section header with collapse toggle */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: expanded ? 2 : 0 }}
      >
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: colors.text }}>
          PROACTIVE PATTERNS
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          {!expanded && (
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
              12 patterns, {totalDetections} detections, {pendingExec} pending execution
            </Typography>
          )}
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ color: colors.textSecondary }}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        {/* COPA Section */}
        <Box sx={{ mb: 2.5 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1.5}>
            <AccountBalanceIcon sx={{ fontSize: 18, color: colors.primary }} />
            <Typography variant="caption" fontWeight={700} sx={{ color: colors.primary, letterSpacing: 0.5 }}>
              COPA PROFITABILITY PATTERNS
            </Typography>
            <Chip
              label={`${copaPatterns.reduce((s, p) => s + p.detectionCount, 0)} detections`}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.6rem',
                bgcolor: alpha(colors.primary, 0.1),
                color: colors.primary,
              }}
            />
          </Box>
          <Box
            display="flex"
            gap={1.5}
            sx={{
              overflowX: 'auto',
              pb: 1,
              '&::-webkit-scrollbar': { height: 4 },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: alpha(colors.textSecondary, 0.3),
                borderRadius: 2,
              },
            }}
          >
            {copaPatterns.map((pattern) => (
              <ProactivePatternCard
                key={pattern.id}
                pattern={pattern}
                iconName={PATTERN_ICONS[pattern.id]}
                darkMode={darkMode}
                onRun={onRunPattern}
              />
            ))}
          </Box>
        </Box>

        {/* STOX Section */}
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={1.5}>
            <InventoryIcon sx={{ fontSize: 18, color: colors.accent }} />
            <Typography variant="caption" fontWeight={700} sx={{ color: colors.accent, letterSpacing: 0.5 }}>
              STOX SUPPLY CHAIN PATTERNS
            </Typography>
            <Chip
              label={`${stoxPatterns.reduce((s, p) => s + p.detectionCount, 0)} detections`}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.6rem',
                bgcolor: alpha(colors.accent, 0.1),
                color: colors.accent,
              }}
            />
          </Box>
          <Box
            display="flex"
            gap={1.5}
            sx={{
              overflowX: 'auto',
              pb: 1,
              '&::-webkit-scrollbar': { height: 4 },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: alpha(colors.textSecondary, 0.3),
                borderRadius: 2,
              },
            }}
          >
            {stoxPatterns.map((pattern) => (
              <ProactivePatternCard
                key={pattern.id}
                pattern={pattern}
                iconName={PATTERN_ICONS[pattern.id]}
                darkMode={darkMode}
                onRun={onRunPattern}
              />
            ))}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

export default ProactivePatternGrid;
