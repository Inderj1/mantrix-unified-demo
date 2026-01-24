import React from 'react';
import {
  Box,
  ButtonGroup,
  Button,
  Paper,
  Typography,
  alpha,
} from '@mui/material';
import {
  CalendarToday as DailyIcon,
  DateRange as WeeklyIcon,
  EventNote as MonthlyIcon,
} from '@mui/icons-material';

const TimeGranularitySelector = ({ value, onChange, sx }) => {
  const granularityOptions = [
    { value: 'daily', label: 'Daily', icon: <DailyIcon sx={{ fontSize: 16 }} /> },
    { value: 'weekly', label: 'Weekly', icon: <WeeklyIcon sx={{ fontSize: 16 }} /> },
    { value: 'monthly', label: 'Monthly', icon: <MonthlyIcon sx={{ fontSize: 16 }} /> },
  ];

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2, ...sx }}>
      <Typography variant="body2" color="text.secondary" fontWeight={600}>
        View By:
      </Typography>
      <ButtonGroup size="small" variant="outlined">
        {granularityOptions.map((option) => (
          <Button
            key={option.value}
            variant={value === option.value ? 'contained' : 'outlined'}
            onClick={() => onChange(option.value)}
            startIcon={option.icon}
            sx={{
              minWidth: 100,
              fontWeight: value === option.value ? 600 : 400,
              borderColor: value === option.value ? 'primary.main' : 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: value === option.value
                  ? 'primary.main'
                  : alpha('#00357a', 0.04),
              },
            }}
          >
            {option.label}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  );
};

export default TimeGranularitySelector;
