import React from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';

function TestDataExplorer() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Data Explorer Test
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Tables
              </Typography>
              <Typography variant="h4">
                42
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default TestDataExplorer;