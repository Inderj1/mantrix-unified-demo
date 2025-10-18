import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Grid,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  Analytics as AnalyticsIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

const suggestionCategories = [
  {
    title: 'Inventory Analysis',
    icon: <InventoryIcon />,
    color: 'primary',
    queries: [
      'Show current inventory levels by product category',
      'Which products are below reorder point?',
      'What is the total inventory value?',
      'Show inventory turnover by SKU',
    ],
  },
  {
    title: 'Sales Trends',
    icon: <TrendingUpIcon />,
    color: 'success',
    queries: [
      'What are the top selling products this month?',
      'Show sales trend for the last 6 months',
      'Compare sales between online and retail channels',
      'Which products have declining sales?',
    ],
  },
  {
    title: 'Supply Chain',
    icon: <AnalyticsIcon />,
    color: 'info',
    queries: [
      'Which suppliers have the best on-time delivery?',
      'Show lead times by supplier',
      'What products are at risk of stockout?',
      'Calculate optimal reorder quantities',
    ],
  },
  {
    title: 'Alerts & Issues',
    icon: <WarningIcon />,
    color: 'warning',
    queries: [
      'Show products with zero inventory',
      'Which items have been out of stock longest?',
      'Find products with excess inventory',
      'Show items with negative inventory',
    ],
  },
];

function QuerySuggestions({ onSelectQuery }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Query Suggestions
        </Typography>
        <Grid container spacing={2}>
          {suggestionCategories.map((category, index) => (
            <Grid item xs={12} md={6} lg={3} key={index}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ color: `${category.color}.main`, mr: 1 }}>
                    {category.icon}
                  </Box>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {category.title}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {category.queries.map((query, qIndex) => (
                    <Chip
                      key={qIndex}
                      label={query}
                      variant="outlined"
                      size="small"
                      onClick={() => onSelectQuery(query)}
                      sx={{
                        justifyContent: 'flex-start',
                        height: 'auto',
                        py: 0.5,
                        '& .MuiChip-label': {
                          whiteSpace: 'normal',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                        },
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

export default QuerySuggestions;