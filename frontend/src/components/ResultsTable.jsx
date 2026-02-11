import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Box, 
  Paper, 
  ToggleButton, 
  ToggleButtonGroup,
  Typography,
  Stack,
  Button,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import {
  TableChart as TableIcon,
  PivotTableChart as PivotIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';
import '../styles/pivottable-overrides.css';
import TableRenderers from 'react-pivottable/TableRenderers';
import CustomPlotlyRenderers from './CustomPlotlyRenderers';

function ResultsTable({ results }) {
  const [viewMode, setViewMode] = useState('table');
  const [pivotState, setPivotState] = useState({});
  const [presetsAnchor, setPresetsAnchor] = useState(null);
  
  // Detect numeric columns for default aggregation
  const detectNumericColumns = () => {
    if (!results || results.length === 0) return [];
    const firstRow = results[0];
    return Object.keys(firstRow).filter(key => {
      const value = firstRow[key];
      return typeof value === 'number' && !key.toLowerCase().includes('id');
    });
  };
  
  // Set intelligent defaults based on data structure
  React.useEffect(() => {
    if (results && results.length > 0 && Object.keys(pivotState).length === 0) {
      const numericCols = detectNumericColumns();
      if (numericCols.length > 0) {
        setPivotState({
          vals: [numericCols[0]],
          aggregatorName: 'Sum',
        });
      }
    }
  }, [results]);
  
  // Preset configurations
  const applyPreset = (preset) => {
    const numericCols = detectNumericColumns();
    const allCols = Object.keys(results[0] || {});
    const categoricalCols = allCols.filter(col => !numericCols.includes(col));
    
    switch (preset) {
      case 'summary':
        setPivotState({
          vals: numericCols.slice(0, 1),
          aggregatorName: 'Sum',
          rendererName: 'Table',
        });
        break;
      case 'timeSeries':
        const dateCol = allCols.find(col => 
          col.toLowerCase().includes('date') || 
          col.toLowerCase().includes('time') ||
          col.toLowerCase().includes('month') ||
          col.toLowerCase().includes('year')
        );
        if (dateCol) {
          setPivotState({
            rows: [dateCol],
            vals: numericCols.slice(0, 1),
            aggregatorName: 'Sum',
            rendererName: 'Line Chart',
          });
        }
        break;
      case 'topN':
        if (categoricalCols.length > 0 && numericCols.length > 0) {
          setPivotState({
            rows: [categoricalCols[0]],
            vals: [numericCols[0]],
            aggregatorName: 'Sum',
            rendererName: 'Bar Chart',
          });
        }
        break;
      case 'heatmap':
        if (categoricalCols.length >= 2 && numericCols.length > 0) {
          setPivotState({
            rows: [categoricalCols[0]],
            cols: [categoricalCols[1]],
            vals: [numericCols[0]],
            aggregatorName: 'Average',
            rendererName: 'Heatmap',
          });
        }
        break;
      default:
        break;
    }
    setPresetsAnchor(null);
  };

  if (!results || results.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
        No results to display
      </Box>
    );
  }

  // Column name patterns that should never get comma formatting (IDs, document numbers, codes)
  const ID_COLUMN_PATTERN = /(_id|_number|_code|_key|document|order|invoice|delivery|shipment|billing|ebeln|ebelp|vbeln|posnr|kunnr|lifnr|matnr|bukrs|belnr|gjahr|buzei|banfn|bnfpo|mblnr|kostl|prctr|sakto|saknr|hkont|laufd|laufi|augbl|augdt|aedat|erdat|cpudt|budat|bldat|xblnr|zuonr|sgtxt|awkey|racct|werks|ekorg|ekgrp|waers|zterm|mandt|spras|zeile|kdauf|vgbel|vgpos|bsart|lfart|abgru|statu|wbstk|gbstk|lfgsk|lsstk)$/i;

  // Generate columns from the first row
  const columns = Object.keys(results[0]).map((key) => ({
    field: key,
    headerName: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
    flex: 1,
    minWidth: 150,
    renderCell: (params) => {
      const value = params.value;
      if (value === null || value === undefined) return '-';
      if (typeof value === 'boolean') return value ? 'Yes' : 'No';
      if (typeof value === 'number') {
        if (Number.isInteger(value)) {
          if (value >= 1900 && value <= 2099) return String(value);
          // Don't add comma separators for ID/document/order number columns
          if (ID_COLUMN_PATTERN.test(key)) return String(value);
          return value.toLocaleString();
        }
        return value.toFixed(2);
      }
      return String(value);
    },
  }));

  // Add id field if not present
  const rows = results.map((row, index) => ({
    id: row.id || index,
    ...row,
  }));

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  return (
    <Box>
      {/* View Mode Toggle */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          View Mode:
        </Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
        >
          <ToggleButton value="table">
            <TableIcon sx={{ mr: 1 }} />
            Table
          </ToggleButton>
          <ToggleButton value="pivot">
            <PivotIcon sx={{ mr: 1 }} />
            Pivot Table
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Table View */}
      {viewMode === 'table' && (
        <Paper sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50, 100]}
            checkboxSelection
            disableSelectionOnClick
            density="compact"
            sx={{
              '& .MuiDataGrid-cell': {
                fontSize: '0.875rem',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'action.hover',
                fontSize: '0.875rem',
                fontWeight: 600,
              },
            }}
          />
        </Paper>
      )}

      {/* Pivot Table View */}
      {viewMode === 'pivot' && (
        <>
          {/* Presets Button */}
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              size="small"
              endIcon={<ArrowDropDownIcon />}
              onClick={(e) => setPresetsAnchor(e.currentTarget)}
            >
              Quick Analysis Presets
            </Button>
            <Menu
              anchorEl={presetsAnchor}
              open={Boolean(presetsAnchor)}
              onClose={() => setPresetsAnchor(null)}
            >
              <MenuItem onClick={() => applyPreset('summary')}>
                Summary Statistics
              </MenuItem>
              <MenuItem onClick={() => applyPreset('timeSeries')}>
                Time Series Analysis
              </MenuItem>
              <MenuItem onClick={() => applyPreset('topN')}>
                Top N Analysis
              </MenuItem>
              <MenuItem onClick={() => applyPreset('heatmap')}>
                Heatmap Analysis
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => setPivotState({})}>
                Reset Configuration
              </MenuItem>
            </Menu>
          </Box>
          
          <Paper sx={{ p: 2, width: '100%', overflow: 'auto' }}>
            <Box sx={{ minHeight: 400 }}>
              <PivotTableUI
                data={results}
                onChange={s => setPivotState(s)}
                renderers={Object.assign({}, TableRenderers, CustomPlotlyRenderers)}
                {...pivotState}
                unusedOrientationCutoff={100}
              />
            </Box>
          </Paper>
        </>
      )}

      {/* Pivot Table Instructions */}
      {viewMode === 'pivot' && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Drag and drop fields to create pivot tables. Select different renderers to visualize data as charts.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default ResultsTable;