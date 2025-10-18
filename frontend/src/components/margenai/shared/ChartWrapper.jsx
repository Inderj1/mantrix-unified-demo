import React, { useEffect, useRef, useId } from 'react';
import { Line, Bar, Pie, Doughnut, Scatter } from 'react-chartjs-2';

const ChartWrapper = ({ type = 'line', data, options, ...props }) => {
  const chartRef = useRef(null);
  const chartInstanceId = useId();
  
  // Force new instance on each render to avoid canvas reuse issues
  const chartKey = `${type}-${chartInstanceId}-${JSON.stringify(data.labels || []).substring(0, 20)}`;

  const ChartComponent = {
    line: Line,
    bar: Bar,
    pie: Pie,
    doughnut: Doughnut,
    scatter: Scatter,
  }[type] || Line;

  return (
    <ChartComponent 
      key={chartKey}
      ref={chartRef}
      data={data}
      options={{
        ...options,
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0 // Disable animations to prevent issues
        }
      }}
      redraw={true}
      {...props}
    />
  );
};

export default ChartWrapper;