import React, { useEffect, useRef, useState } from 'react';
import { Line, Bar, Pie, Doughnut, Scatter } from 'react-chartjs-2';
import './chartSetup'; // Import Chart.js setup to register components

const SafeChart = ({ type = 'line', data, options, ...props }) => {
  const [chartKey, setChartKey] = useState(0);
  const containerRef = useRef(null);
  
  // Force re-mount of chart component to avoid canvas reuse
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

  // Wrap in a div to ensure proper cleanup
  return (
    <div ref={containerRef} style={{ position: 'relative', height: '100%', width: '100%' }}>
      {data && (
        <ChartComponent 
          key={chartKey}
          data={data}
          options={{
            ...options,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              ...options?.plugins,
            }
          }}
          {...props}
        />
      )}
    </div>
  );
};

export default SafeChart;