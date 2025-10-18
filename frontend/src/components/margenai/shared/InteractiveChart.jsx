import React, { useRef, useState, useEffect, useId } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Paper,
  Typography,
  Divider,
} from '@mui/material';
import {
  FullscreenOutlined as FullscreenIcon,
  GetApp as DownloadIcon,
  MoreVert as MoreVertIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as ResetIcon,
} from '@mui/icons-material';
import { Line, Bar, Pie, Doughnut, Scatter } from 'react-chartjs-2';
import './chartSetup'; // Import Chart.js setup to register components
import { Chart as ChartJS } from 'chart.js';

const InteractiveChart = ({
  type = 'line',
  data,
  options = {},
  height = 300,
  onElementClick,
  onZoom,
  enableZoom = true,
  enableDownload = true,
  title,
}) => {
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const chartId = useId();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // State to force re-render
  const [chartKey, setChartKey] = useState(0);
  
  // Force re-mount when data changes
  useEffect(() => {
    setChartKey(prev => prev + 1);
  }, [type, data]);

  const ChartComponent = {
    line: Line,
    bar: Bar,
    pie: Pie,
    doughnut: Doughnut,
    scatter: Scatter,
  }[type] || Line;

  const handleChartClick = (event, elements) => {
    if (elements.length > 0 && onElementClick) {
      const element = elements[0];
      const datasetIndex = element.datasetIndex;
      const dataIndex = element.index;
      onElementClick(datasetIndex, dataIndex, type);
    }
  };

  const handleDownload = (format) => {
    const chart = chartRef.current;
    if (!chart) return;

    if (format === 'png') {
      const url = chart.toBase64Image();
      const link = document.createElement('a');
      link.download = `chart-${Date.now()}.png`;
      link.href = url;
      link.click();
    } else if (format === 'csv') {
      // Export data as CSV
      const csvData = exportToCSV();
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `chart-data-${Date.now()}.csv`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
    
    setAnchorEl(null);
  };

  const exportToCSV = () => {
    const rows = [];
    const labels = data.labels || [];
    
    // Header row
    const header = ['Label'];
    data.datasets.forEach(dataset => {
      header.push(dataset.label || 'Dataset');
    });
    rows.push(header.join(','));
    
    // Data rows
    labels.forEach((label, index) => {
      const row = [label];
      data.datasets.forEach(dataset => {
        row.push(dataset.data[index] || '');
      });
      rows.push(row.join(','));
    });
    
    return rows.join('\n');
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel * 1.2, 3);
    setZoomLevel(newZoom);
    if (onZoom) {
      onZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel / 1.2, 0.5);
    setZoomLevel(newZoom);
    if (onZoom) {
      onZoom(newZoom);
    }
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    if (onZoom) {
      onZoom(1);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const enhancedOptions = {
    ...options,
    responsive: true,
    maintainAspectRatio: false,
    onClick: handleChartClick,
    plugins: {
      ...options.plugins,
      zoom: enableZoom ? {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'xy',
        },
        pan: {
          enabled: true,
          mode: 'xy',
        },
      } : undefined,
      tooltip: {
        ...options.plugins?.tooltip,
        callbacks: {
          ...options.plugins?.tooltip?.callbacks,
          afterLabel: (context) => {
            return 'Click to drill down';
          },
        },
      },
    },
  };

  return (
    <Paper 
      ref={containerRef}
      sx={{ 
        p: 2, 
        height: isFullscreen ? '100vh' : 'auto',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        right: isFullscreen ? 0 : 'auto',
        bottom: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 1300 : 'auto',
        bgcolor: 'background.paper'
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        {title && (
          <Typography variant="h6">{title}</Typography>
        )}
        <Box display="flex" gap={1} ml="auto">
          {enableZoom && (
            <>
              <Tooltip title="Zoom In">
                <IconButton size="small" onClick={handleZoomIn}>
                  <ZoomInIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom Out">
                <IconButton size="small" onClick={handleZoomOut}>
                  <ZoomOutIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reset Zoom">
                <IconButton size="small" onClick={handleResetZoom}>
                  <ResetIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Divider orientation="vertical" flexItem />
            </>
          )}
          <Tooltip title="Fullscreen">
            <IconButton size="small" onClick={toggleFullscreen}>
              <FullscreenIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {enableDownload && (
            <>
              <Tooltip title="More Options">
                <IconButton 
                  size="small" 
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem onClick={() => handleDownload('png')}>
                  <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
                  Download as PNG
                </MenuItem>
                <MenuItem onClick={() => handleDownload('csv')}>
                  <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
                  Download as CSV
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Box>
      
      <Box 
        sx={{ 
          height: isFullscreen ? 'calc(100vh - 100px)' : height,
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top left',
          transition: 'transform 0.3s ease',
        }}
      >
        <div key={chartKey} style={{ position: 'relative', height: '100%', width: '100%' }}>
          <ChartComponent
            ref={chartRef}
            data={data}
            options={enhancedOptions}
          />
        </div>
      </Box>
      
      {onElementClick && (
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ mt: 1, display: 'block', textAlign: 'center' }}
        >
          Click on any data point to drill down
        </Typography>
      )}
    </Paper>
  );
};

export default InteractiveChart;