import React from 'react';
import Plot from 'react-plotly.js';
import createPlotlyRenderers from 'react-pivottable/PlotlyRenderers';
import { sapChartColors } from '../themes/sapFioriTheme';

// Custom Plot component with enhanced styling
const CustomPlot = (props) => {
  // Merge custom layout with the default layout
  const enhancedLayout = {
    ...props.layout,
    autosize: true,
    margin: { t: 50, r: 30, b: 100, l: 60 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(248,248,248,0.5)',
    colorway: sapChartColors,
    font: {
      family: '"Roboto", "Helvetica", "Arial", sans-serif',
      size: 12,
      color: '#333',
    },
    xaxis: {
      ...props.layout.xaxis,
      gridcolor: '#e0e0e0',
      tickangle: -45,
      automargin: true,
    },
    yaxis: {
      ...props.layout.yaxis,
      gridcolor: '#e0e0e0',
      automargin: true,
    },
    hoverlabel: {
      bgcolor: 'white',
      bordercolor: '#333',
      font: { size: 13 }
    },
    showlegend: true,
    legend: {
      orientation: 'h',
      yanchor: 'bottom',
      y: -0.3,
      xanchor: 'center',
      x: 0.5
    }
  };

  // Enhanced config
  const enhancedConfig = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
    responsive: true,
  };

  // Apply color enhancements to data
  const enhancedData = props.data.map((trace, index) => {
    const baseTrace = { ...trace };
    
    // Apply colors based on trace type
    if (trace.type === 'bar' || trace.type === 'scatter' || trace.type === 'line') {
      baseTrace.marker = {
        ...trace.marker,
        color: trace.marker?.color || sapChartColors[index % sapChartColors.length],
        line: {
          color: 'rgba(0,0,0,0.1)',
          width: 1
        }
      };
      if (trace.type === 'line') {
        baseTrace.line = {
          ...trace.line,
          color: sapChartColors[index % sapChartColors.length],
          width: 3
        };
      }
    } else if (trace.type === 'pie') {
      baseTrace.marker = {
        ...trace.marker,
        colors: trace.marker?.colors || sapChartColors,
        line: {
          color: '#fff',
          width: 2
        }
      };
      baseTrace.textposition = 'inside';
      baseTrace.textinfo = 'percent+label';
    } else if (trace.type === 'heatmap') {
      baseTrace.colorscale = baseTrace.colorscale || [
        [0, '#f5f5f5'],
        [0.2, sapChartColors[2]],
        [0.4, sapChartColors[1]],
        [0.6, sapChartColors[0]],
        [0.8, sapChartColors[4]],
        [1, sapChartColors[3]]
      ];
    }
    
    return baseTrace;
  });

  return (
    <Plot
      {...props}
      data={enhancedData}
      layout={enhancedLayout}
      config={enhancedConfig}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

// Create custom Plotly renderers using our enhanced Plot component
const CustomPlotlyRenderers = createPlotlyRenderers(CustomPlot);

export default CustomPlotlyRenderers;