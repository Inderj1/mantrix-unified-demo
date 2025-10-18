import React from 'react';
import {
  EdgeLabelRenderer,
  BaseEdge,
  getStraightPath,
  getMarkerEnd,
} from 'reactflow';
import {
  Box,
  Typography,
  Chip,
  Paper,
} from '@mui/material';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}) => {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const {
    cases = 0,
    avgTime = '0h',
    percentage = '100%',
    isBottleneck = false,
  } = data || {};

  // Calculate edge thickness based on case volume
  const strokeWidth = Math.max(2, Math.min(8, cases / 10));
  
  // Color coding for performance
  const getEdgeColor = () => {
    if (isBottleneck) return '#FF5722';
    const percentageNum = parseFloat(percentage);
    if (percentageNum > 90) return '#4CAF50';
    if (percentageNum > 70) return '#FF9800';
    return '#F44336';
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth,
          stroke: getEdgeColor(),
          strokeDasharray: isBottleneck ? '5,5' : 'none',
          animation: isBottleneck ? 'flowAnimation 2s infinite linear' : 'none',
        }}
      />
      
      {/* Edge Label */}
      <EdgeLabelRenderer>
        <Box
          sx={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <Paper
            elevation={3}
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: 'white',
              border: `1px solid ${getEdgeColor()}`,
              minWidth: 80,
              textAlign: 'center',
              opacity: 0.95,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                opacity: 1,
                transform: 'scale(1.05)',
              },
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
              {cases} cases
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {avgTime}
            </Typography>
            <Chip
              label={percentage}
              size="small"
              sx={{
                height: 16,
                fontSize: '0.6rem',
                mt: 0.5,
                bgcolor: `${getEdgeColor()}20`,
                color: getEdgeColor(),
                fontWeight: 600,
              }}
            />
          </Paper>
        </Box>
      </EdgeLabelRenderer>

      <style>{`
        @keyframes flowAnimation {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: 10;
          }
        }
      `}</style>
    </>
  );
};

export default CustomEdge;