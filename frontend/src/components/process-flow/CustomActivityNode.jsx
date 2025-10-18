import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import {
  PlayCircle as StartIcon,
  Stop as EndIcon,
  Settings as ProcessIcon,
} from '@mui/icons-material';

const CustomActivityNode = ({ data, isConnectable }) => {
  const {
    label,
    frequency = 0,
    avgDuration = '0h',
    throughput = '100%',
    nodeType = 'activity', // 'start', 'end', 'activity'
    color = '#4285F4',
    isBottleneck = false,
  } = data;

  const getNodeIcon = () => {
    switch (nodeType) {
      case 'start':
        return <StartIcon sx={{ color: '#4CAF50', fontSize: 20 }} />;
      case 'end':
        return <EndIcon sx={{ color: '#F44336', fontSize: 20 }} />;
      default:
        return <ProcessIcon sx={{ color: color, fontSize: 20 }} />;
    }
  };

  const getNodeColor = () => {
    if (isBottleneck) return '#FF5722';
    if (nodeType === 'start') return '#4CAF50';
    if (nodeType === 'end') return '#F44336';
    return color;
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Input Handle */}
      {nodeType !== 'start' && (
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          style={{
            background: getNodeColor(),
            width: 12,
            height: 12,
            border: '2px solid white',
          }}
        />
      )}

      {/* Node Content */}
      <Card
        sx={{
          minWidth: 200,
          maxWidth: 250,
          border: `2px solid ${getNodeColor()}`,
          borderRadius: 3,
          boxShadow: 3,
          bgcolor: 'white',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 6,
            borderColor: isBottleneck ? '#FF5722' : color,
          },
          ...(isBottleneck && {
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { boxShadow: `0 0 0 0 ${getNodeColor()}40` },
              '70%': { boxShadow: `0 0 0 10px ${getNodeColor()}00` },
              '100%': { boxShadow: `0 0 0 0 ${getNodeColor()}00` },
            },
          }),
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          {/* Header with Icon and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: `${getNodeColor()}20`,
              }}
            >
              {getNodeIcon()}
            </Avatar>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                lineHeight: 1.2,
                flex: 1,
              }}
            >
              {label}
            </Typography>
          </Box>

          {/* Metrics */}
          {nodeType === 'activity' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Cases
                </Typography>
                <Chip
                  label={frequency}
                  size="small"
                  sx={{
                    bgcolor: `${getNodeColor()}20`,
                    color: getNodeColor(),
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 20,
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  {avgDuration}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Throughput
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 500,
                    color: parseFloat(throughput) > 90 ? 'success.main' : 'warning.main',
                  }}
                >
                  {throughput}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Bottleneck Indicator */}
          {isBottleneck && (
            <Chip
              label="Bottleneck"
              size="small"
              sx={{
                mt: 1,
                bgcolor: '#FF572220',
                color: '#FF5722',
                fontWeight: 600,
                fontSize: '0.6rem',
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Output Handle */}
      {nodeType !== 'end' && (
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
          style={{
            background: getNodeColor(),
            width: 12,
            height: 12,
            border: '2px solid white',
          }}
        />
      )}
    </Box>
  );
};

export default memo(CustomActivityNode);