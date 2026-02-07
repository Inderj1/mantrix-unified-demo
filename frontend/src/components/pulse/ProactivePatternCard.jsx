import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
} from '@mui/material';
import {
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  MoneyOff as MoneyOffIcon,
  BarChart as BarChartIcon,
  LocalShipping as LocalShippingIcon,
  Description as DescriptionIcon,
  Map as MapIcon,
  WarningAmber as WarningAmberIcon,
  Inventory2 as Inventory2Icon,
  ShowChart as ShowChartIcon,
  Schedule as ScheduleIcon,
  Tune as TuneIcon,
  PlayArrow as PlayArrowIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { getColors } from '../../config/brandColors';
import {
  AUTOMATION_LEVELS,
  AUTOMATION_LEVEL_BUTTONS,
} from './proactivePatternData';

const ICON_MAP = {
  TrendingDown: TrendingDownIcon,
  People: PeopleIcon,
  MoneyOff: MoneyOffIcon,
  BarChart: BarChartIcon,
  LocalShipping: LocalShippingIcon,
  Description: DescriptionIcon,
  Map: MapIcon,
  WarningAmber: WarningAmberIcon,
  Inventory2: Inventory2Icon,
  ShowChart: ShowChartIcon,
  Schedule: ScheduleIcon,
  Tune: TuneIcon,
};

const ProactivePatternCard = ({ pattern, iconName, darkMode = false, onRun }) => {
  const colors = getColors(darkMode);
  const [level, setLevel] = useState(pattern.defaultLevel);
  const [executeConfirm, setExecuteConfirm] = useState(false);

  const IconComponent = ICON_MAP[iconName] || BarChartIcon;

  const isDetected = pattern.detectionCount > 0;
  const isClear = pattern.status === 'clear';
  const isError = pattern.status === 'error';

  const handleLevelChange = (_, newLevel) => {
    if (newLevel !== null) setLevel(newLevel);
  };

  const handleRun = () => {
    if (level === AUTOMATION_LEVELS.EXECUTE) {
      setExecuteConfirm(true);
    } else {
      onRun?.(pattern.id, level);
    }
  };

  const handleConfirmExecute = () => {
    setExecuteConfirm(false);
    onRun?.(pattern.id, AUTOMATION_LEVELS.EXECUTE);
  };

  const sourceColor = pattern.source === 'copa' ? colors.primary : colors.accent;

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          width: 210,
          minHeight: 190,
          bgcolor: colors.cardBg,
          borderColor: isDetected
            ? alpha(colors.error, 0.3)
            : colors.border,
          borderWidth: isDetected ? 1.5 : 1,
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: sourceColor,
            boxShadow: `0 2px 8px ${alpha(sourceColor, 0.15)}`,
          },
        }}
      >
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          {/* Row 1: Icon + Title + Source badge */}
          <Box display="flex" alignItems="flex-start" gap={1} mb={1}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                bgcolor: alpha(sourceColor, darkMode ? 0.2 : 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconComponent sx={{ fontSize: 18, color: sourceColor }} />
            </Box>
            <Box flex={1} minWidth={0}>
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{
                  color: colors.text,
                  lineHeight: 1.2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  fontSize: '0.72rem',
                }}
              >
                {pattern.name}
              </Typography>
            </Box>
            <Chip
              label={pattern.source.toUpperCase()}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.6rem',
                fontWeight: 700,
                bgcolor: alpha(sourceColor, 0.12),
                color: sourceColor,
                flexShrink: 0,
              }}
            />
          </Box>

          {/* Row 2: Detection status + last check */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Chip
              label={
                isError
                  ? 'Error'
                  : isDetected
                  ? `${pattern.detectionCount} Detected`
                  : '0 Clear'
              }
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 600,
                bgcolor: isError
                  ? alpha(colors.warning, 0.15)
                  : isDetected
                  ? alpha(colors.error, 0.12)
                  : alpha(colors.success, 0.12),
                color: isError
                  ? colors.warning
                  : isDetected
                  ? colors.error
                  : colors.success,
              }}
            />
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.6rem' }}>
              {pattern.lastChecked}
            </Typography>
          </Box>

          {/* Row 3: Automation level toggle */}
          <ToggleButtonGroup
            value={level}
            exclusive
            onChange={handleLevelChange}
            size="small"
            fullWidth
            sx={{
              mb: 1,
              '& .MuiToggleButton-root': {
                py: 0.3,
                fontSize: '0.6rem',
                fontWeight: 600,
                textTransform: 'none',
                color: colors.textSecondary,
                borderColor: colors.border,
                '&.Mui-selected': {
                  bgcolor: alpha(colors.primary, 0.12),
                  color: colors.primary,
                  borderColor: alpha(colors.primary, 0.3),
                },
              },
            }}
          >
            <ToggleButton value="recommend">Rec</ToggleButton>
            <ToggleButton value="simulate">Sim</ToggleButton>
            <ToggleButton value="execute">Exec</ToggleButton>
          </ToggleButtonGroup>

          {/* Row 4: Run button */}
          <Tooltip title={pattern.actions[level]} placement="bottom">
            <Button
              fullWidth
              variant="contained"
              size="small"
              startIcon={level === 'execute' ? <WarningIcon sx={{ fontSize: 14 }} /> : <PlayArrowIcon sx={{ fontSize: 14 }} />}
              onClick={handleRun}
              sx={{
                py: 0.5,
                fontSize: '0.68rem',
                fontWeight: 600,
                textTransform: 'none',
                bgcolor: level === 'execute' ? colors.error : colors.accent,
                color: '#fff',
                '&:hover': {
                  bgcolor: level === 'execute'
                    ? alpha(colors.error, 0.85)
                    : alpha(colors.accent, 0.85),
                },
              }}
            >
              {AUTOMATION_LEVEL_BUTTONS[level]}
            </Button>
          </Tooltip>
        </CardContent>
      </Card>

      {/* Execute Confirmation Dialog */}
      <Dialog
        open={executeConfirm}
        onClose={() => setExecuteConfirm(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: colors.cardBg,
            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle sx={{ color: colors.text, display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon sx={{ color: colors.error }} />
          Confirm Execution
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
            You are about to execute an ERP action for:
          </Typography>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: colors.text, mb: 1 }}>
            {pattern.name}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
            {pattern.actions.execute}
          </Typography>
          <Chip
            label={`ERP Action: ${pattern.erpAction}`}
            color="error"
            variant="outlined"
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExecuteConfirm(false)} sx={{ color: colors.textSecondary }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmExecute}
            startIcon={<WarningIcon />}
          >
            Confirm & Execute
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProactivePatternCard;
