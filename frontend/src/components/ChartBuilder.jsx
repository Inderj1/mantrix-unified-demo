import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  Paper,
  IconButton,
  Tabs,
  Tab,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Switch,
  FormControlLabel,
  Autocomplete,
  Slider,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  BarChart as BarChartIcon,
  Timeline as LineChartIcon,
  PieChart as PieChartIcon,
  ScatterPlot as ScatterIcon,
  BubbleChart as BubbleIcon,
  DonutLarge as DonutIcon,
  ShowChart as AreaChartIcon,
  BarChart as WaterfallIcon,
  ShowChart as CandlestickIcon,
  BarChart as StackedBarIcon,
  Timeline as MultilineIcon,
  TableChart as TableIcon,
  GridOn as HeatmapIcon,
  Radar as RadarIcon,
  Speed as GaugeIcon,
  DataUsage as PolarIcon,
  AccountTree as TreemapIcon,
  Hub as SankeyIcon,
  GridOn as GridIcon,
  Map as MapIcon,
  Palette as PaletteIcon,
  FormatPaint as FormatPaintIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  Info as InfoIcon,
  SwapHoriz as SwapIcon,
  Functions as FunctionsIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut, Scatter, Bubble, Radar, PolarArea } from 'react-chartjs-2';

// Chart type definitions
const chartTypes = [
  { id: 'bar', name: 'Bar Chart', icon: <BarChartIcon />, description: 'Compare values across categories' },
  { id: 'line', name: 'Line Chart', icon: <LineChartIcon />, description: 'Show trends over time' },
  { id: 'pie', name: 'Pie Chart', icon: <PieChartIcon />, description: 'Show composition of a whole' },
  { id: 'doughnut', name: 'Doughnut Chart', icon: <DonutIcon />, description: 'Like pie chart with a hole' },
  { id: 'scatter', name: 'Scatter Plot', icon: <ScatterIcon />, description: 'Show correlation between variables' },
  { id: 'bubble', name: 'Bubble Chart', icon: <BubbleIcon />, description: 'Scatter plot with size dimension' },
  { id: 'area', name: 'Area Chart', icon: <AreaChartIcon />, description: 'Line chart with filled area' },
  { id: 'radar', name: 'Radar Chart', icon: <RadarIcon />, description: 'Compare multiple variables' },
  { id: 'polar', name: 'Polar Area', icon: <PolarIcon />, description: 'Like pie chart in polar coordinates' },
  { id: 'heatmap', name: 'Heatmap', icon: <HeatmapIcon />, description: 'Show density with color' },
  { id: 'treemap', name: 'Treemap', icon: <TreemapIcon />, description: 'Hierarchical data visualization' },
  { id: 'sankey', name: 'Sankey Diagram', icon: <SankeyIcon />, description: 'Show flow between nodes' },
  { id: 'gauge', name: 'Gauge Chart', icon: <GaugeIcon />, description: 'Show progress or metrics' },
  { id: 'waterfall', name: 'Waterfall Chart', icon: <WaterfallIcon />, description: 'Show cumulative changes' },
  { id: 'candlestick', name: 'Candlestick', icon: <CandlestickIcon />, description: 'Financial data visualization' },
];

// Aggregation functions
const aggregationFunctions = [
  { id: 'sum', name: 'Sum', description: 'Total of all values' },
  { id: 'avg', name: 'Average', description: 'Mean of values' },
  { id: 'count', name: 'Count', description: 'Number of records' },
  { id: 'min', name: 'Minimum', description: 'Smallest value' },
  { id: 'max', name: 'Maximum', description: 'Largest value' },
  { id: 'median', name: 'Median', description: 'Middle value' },
  { id: 'stddev', name: 'Std Dev', description: 'Standard deviation' },
];

// Color schemes
const colorSchemes = [
  { id: 'default', name: 'Default', colors: ['#1976d2', '#dc004e', '#f57c00', '#388e3c', '#7b1fa2'] },
  { id: 'pastel', name: 'Pastel', colors: ['#a8dadc', '#f1faee', '#e63946', '#a8b5d1', '#457b9d'] },
  { id: 'vibrant', name: 'Vibrant', colors: ['#f94144', '#f3722c', '#f8961e', '#90be6d', '#43aa8b'] },
  { id: 'earth', name: 'Earth Tones', colors: ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'] },
  { id: 'ocean', name: 'Ocean', colors: ['#03045e', '#023e8a', '#0077b6', '#0096c7', '#00b4d8'] },
  { id: 'sunset', name: 'Sunset', colors: ['#ffb700', '#ffaa00', '#ff9500', '#ff8800', '#ff7700'] },
];

const ChartBuilder = ({ open, onClose, data, onSave, existingConfig = null }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  
  // Chart configuration
  const [selectedType, setSelectedType] = useState(existingConfig?.type || 'bar');
  const [chartTitle, setChartTitle] = useState(existingConfig?.title || '');
  const [xAxis, setXAxis] = useState(existingConfig?.xAxis || '');
  const [yAxis, setYAxis] = useState(existingConfig?.yAxis || []);
  const [groupBy, setGroupBy] = useState(existingConfig?.groupBy || '');
  const [aggregation, setAggregation] = useState(existingConfig?.aggregation || 'sum');
  const [colorScheme, setColorScheme] = useState(existingConfig?.colorScheme || 'default');
  const [showLegend, setShowLegend] = useState(existingConfig?.showLegend !== false);
  const [showDataLabels, setShowDataLabels] = useState(existingConfig?.showDataLabels || false);
  const [stacked, setStacked] = useState(existingConfig?.stacked || false);
  
  // Data processing
  const [columns, setColumns] = useState([]);
  const [numericColumns, setNumericColumns] = useState([]);
  const [categoricalColumns, setCategoricalColumns] = useState([]);
  const [preview, setPreview] = useState(null);
  
  // Analyze data structure
  useEffect(() => {
    if (data?.rows && data.rows.length > 0) {
      const cols = Object.keys(data.rows[0]);
      setColumns(cols);
      
      // Identify column types
      const numeric = cols.filter(col => 
        typeof data.rows[0][col] === 'number' || 
        !isNaN(parseFloat(data.rows[0][col]))
      );
      const categorical = cols.filter(col => 
        typeof data.rows[0][col] === 'string' && 
        isNaN(parseFloat(data.rows[0][col]))
      );
      
      setNumericColumns(numeric);
      setCategoricalColumns(categorical);
      
      // Set default axes if not set
      if (!xAxis && categorical.length > 0) {
        setXAxis(categorical[0]);
      } else if (!xAxis && numeric.length > 0) {
        // Use first numeric column as x-axis if no categorical columns
        setXAxis(numeric[0]);
      }
      
      if (yAxis.length === 0 && numeric.length > 0) {
        // Set y-axis to a different numeric column than x-axis
        const yCol = numeric.find(col => col !== xAxis) || numeric[0];
        setYAxis([yCol]);
      }
    }
  }, [data]);
  
  // Generate preview when configuration changes
  useEffect(() => {
    if (xAxis || yAxis.length > 0) {
      generatePreview();
    }
  }, [selectedType, xAxis, yAxis, groupBy, aggregation, colorScheme, stacked]);
  
  const generatePreview = () => {
    if (!data?.rows || data.rows.length === 0) return;
    
    try {
      const config = createChartConfig();
      setPreview(config);
    } catch (error) {
      console.error('Failed to generate preview:', error);
      setPreview(null);
    }
  };
  
  const createChartConfig = () => {
    const colors = colorSchemes.find(cs => cs.id === colorScheme)?.colors || colorSchemes[0].colors;
    
    // Check if we have valid data
    if (!data || !data.rows || data.rows.length === 0) {
      console.warn('ChartBuilder: No data available');
      return { labels: [], datasets: [] };
    }
    
    // Process data based on selected axes and aggregation
    const processedData = processData(data.rows, xAxis, yAxis, groupBy, aggregation);
    
    const config = {
      labels: processedData.labels,
      datasets: processedData.datasets.map((dataset, idx) => ({
        ...dataset,
        backgroundColor: colors[idx % colors.length],
        borderColor: colors[idx % colors.length],
        borderWidth: 2,
        fill: selectedType === 'area',
      })),
    };
    
    console.log('ChartBuilder: Created config', { xAxis, yAxis, config });
    return config;
  };
  
  const processData = (rows, xCol, yCols, groupCol, aggFunc) => {
    if (!xCol && yCols.length === 0) {
      return { labels: [], datasets: [] };
    }
    
    // Simple data processing - in real app, this would be more sophisticated
    if (selectedType === 'pie' || selectedType === 'doughnut' || selectedType === 'polar') {
      // For pie-like charts, aggregate by category
      const aggregated = {};
      rows.forEach(row => {
        const key = row[xCol] || 'Unknown';
        if (!aggregated[key]) aggregated[key] = 0;
        aggregated[key] += parseFloat(row[yCols[0]] || 0);
      });
      
      return {
        labels: Object.keys(aggregated),
        datasets: [{
          data: Object.values(aggregated),
          label: yCols[0],
        }],
      };
    } else {
      // For other charts, create datasets for each y-axis column
      const labels = [...new Set(rows.map(row => row[xCol]))];
      const datasets = yCols.map(yCol => ({
        label: yCol,
        data: labels.map(label => {
          const values = rows
            .filter(row => row[xCol] === label)
            .map(row => parseFloat(row[yCol] || 0));
          
          // Apply aggregation
          switch (aggFunc) {
            case 'sum':
              return values.reduce((a, b) => a + b, 0);
            case 'avg':
              return values.reduce((a, b) => a + b, 0) / values.length;
            case 'count':
              return values.length;
            case 'min':
              return Math.min(...values);
            case 'max':
              return Math.max(...values);
            default:
              return values[0] || 0;
          }
        }),
      }));
      
      return { labels, datasets };
    }
  };
  
  const handleSave = () => {
    const chartConfig = {
      type: selectedType,
      title: chartTitle || `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Chart`,
      xAxis,
      yAxis,
      groupBy,
      aggregation,
      colorScheme,
      showLegend,
      showDataLabels,
      stacked,
      config: createChartConfig(),
    };
    
    onSave(chartConfig);
  };
  
  const renderChartTypeSelector = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Chart Type
      </Typography>
      <Grid container spacing={2}>
        {chartTypes.map((type) => (
          <Grid item xs={6} sm={4} md={3} key={type.id}>
            <Paper
              variant={selectedType === type.id ? 'elevation' : 'outlined'}
              sx={{
                p: 2,
                cursor: 'pointer',
                textAlign: 'center',
                bgcolor: selectedType === type.id ? 'primary.main' : 'background.paper',
                color: selectedType === type.id ? 'primary.contrastText' : 'text.primary',
                '&:hover': {
                  bgcolor: selectedType === type.id ? 'primary.dark' : 'action.hover',
                },
              }}
              onClick={() => setSelectedType(type.id)}
            >
              <Box sx={{ fontSize: 40, mb: 1 }}>{type.icon}</Box>
              <Typography variant="subtitle2">{type.name}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {type.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
  
  const renderDataMapping = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Map Your Data
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>X-Axis (Categories)</InputLabel>
            <Select
              value={xAxis}
              label="X-Axis (Categories)"
              onChange={(e) => setXAxis(e.target.value)}
            >
              <MenuItem value="">None</MenuItem>
              {categoricalColumns.map((col) => (
                <MenuItem key={col} value={col}>{col}</MenuItem>
              ))}
              {numericColumns.map((col) => (
                <MenuItem key={col} value={col}>{col} (Numeric)</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Y-Axis (Values)</InputLabel>
            <Select
              multiple
              value={yAxis}
              label="Y-Axis (Values)"
              onChange={(e) => setYAxis(e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {numericColumns.map((col) => (
                <MenuItem key={col} value={col}>{col}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Group By</InputLabel>
            <Select
              value={groupBy}
              label="Group By"
              onChange={(e) => setGroupBy(e.target.value)}
            >
              <MenuItem value="">None</MenuItem>
              {categoricalColumns.map((col) => (
                <MenuItem key={col} value={col}>{col}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth>
            <InputLabel>Aggregation</InputLabel>
            <Select
              value={aggregation}
              label="Aggregation"
              onChange={(e) => setAggregation(e.target.value)}
            >
              {aggregationFunctions.map((func) => (
                <MenuItem key={func.id} value={func.id}>
                  {func.name} - {func.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Data Preview
            </Typography>
            {preview ? (
              <Box sx={{ height: 300 }}>
                {renderPreviewChart()}
              </Box>
            ) : (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Select axes to see preview
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
  
  const renderCustomization = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Customize Appearance
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Chart Title"
            value={chartTitle}
            onChange={(e) => setChartTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Color Scheme</InputLabel>
            <Select
              value={colorScheme}
              label="Color Scheme"
              onChange={(e) => setColorScheme(e.target.value)}
            >
              {colorSchemes.map((scheme) => (
                <MenuItem key={scheme.id} value={scheme.id}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Stack direction="row" spacing={0.5}>
                      {scheme.colors.slice(0, 5).map((color, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            width: 16,
                            height: 16,
                            bgcolor: color,
                            borderRadius: 0.5,
                          }}
                        />
                      ))}
                    </Stack>
                    <Typography>{scheme.name}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControlLabel
            control={
              <Switch
                checked={showLegend}
                onChange={(e) => setShowLegend(e.target.checked)}
              />
            }
            label="Show Legend"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={showDataLabels}
                onChange={(e) => setShowDataLabels(e.target.checked)}
              />
            }
            label="Show Data Labels"
          />
          
          {(selectedType === 'bar' || selectedType === 'line' || selectedType === 'area') && (
            <FormControlLabel
              control={
                <Switch
                  checked={stacked}
                  onChange={(e) => setStacked(e.target.checked)}
                />
              }
              label="Stacked"
            />
          )}
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Style Preview
            </Typography>
            {preview ? (
              <Box sx={{ height: 300 }}>
                {renderPreviewChart()}
              </Box>
            ) : (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Configure data mapping first
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
  
  const renderPreviewChart = () => {
    if (!preview) return null;
    
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: showLegend,
          position: 'top',
        },
        title: {
          display: !!chartTitle,
          text: chartTitle,
        },
        datalabels: {
          display: showDataLabels,
        },
      },
      scales: stacked ? {
        x: { stacked: true },
        y: { stacked: true },
      } : {},
    };
    
    switch (selectedType) {
      case 'line':
        return <Line data={preview} options={options} />;
      case 'bar':
        return <Bar data={preview} options={options} />;
      case 'pie':
        return <Pie data={preview} options={options} />;
      case 'doughnut':
        return <Doughnut data={preview} options={options} />;
      case 'scatter':
        return <Scatter data={preview} options={options} />;
      case 'bubble':
        return <Bubble data={preview} options={options} />;
      case 'radar':
        return <Radar data={preview} options={options} />;
      case 'polar':
        return <PolarArea data={preview} options={options} />;
      case 'area':
        return <Line data={preview} options={{ ...options, elements: { line: { fill: true } } }} />;
      default:
        return <Typography>Preview not available for {selectedType}</Typography>;
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Chart Builder</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      
      <DialogContent dividers>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
          <Tab label="Chart Type" />
          <Tab label="Data Mapping" disabled={!selectedType} />
          <Tab label="Customization" disabled={!selectedType || !xAxis} />
        </Tabs>
        
        {activeTab === 0 && renderChartTypeSelector()}
        {activeTab === 1 && renderDataMapping()}
        {activeTab === 2 && renderCustomization()}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!selectedType || (!xAxis && yAxis.length === 0)}
        >
          Create Chart
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChartBuilder;