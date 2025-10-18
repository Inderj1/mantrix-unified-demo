import React, { useEffect, useMemo, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

/**
 * ProcessExplorer - Interactive Process Flow Visualization
 * Displays discovered process models using React Flow
 */
const ProcessExplorer = ({ processModel, bottlenecks = [], summary = {} }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Convert process model to React Flow format
  useEffect(() => {
    if (!processModel || !processModel.nodes || !processModel.edges) {
      return;
    }

    // Create bottleneck lookup for quick access
    const bottleneckMap = {};
    bottlenecks.forEach(b => {
      bottleneckMap[b.transition] = b;
    });

    // Create nodes with positioning using Dagre layout algorithm (simple horizontal layout)
    const layoutedNodes = processModel.nodes.map((node, index) => {
      const isStart = node.is_start;
      const isEnd = node.is_end;

      return {
        id: node.id,
        type: 'default',
        position: { x: index * 250, y: 200 },
        data: {
          label: (
            <Box sx={{ textAlign: 'center', minWidth: 150 }}>
              <Typography variant="body2" fontWeight="bold">
                {node.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {node.frequency} occurrences
              </Typography>
              {isStart && (
                <Chip
                  label="Start"
                  size="small"
                  color="success"
                  sx={{ mt: 0.5, height: 18, fontSize: '0.65rem' }}
                />
              )}
              {isEnd && (
                <Chip
                  label="End"
                  size="small"
                  color="info"
                  sx={{ mt: 0.5, height: 18, fontSize: '0.65rem' }}
                />
              )}
            </Box>
          ),
        },
        style: {
          background: isStart ? '#e8f5e9' : isEnd ? '#e3f2fd' : '#ffffff',
          border: isStart || isEnd ? '2px solid' : '1px solid #ccc',
          borderColor: isStart ? '#4caf50' : isEnd ? '#2196f3' : '#ccc',
          borderRadius: 8,
          padding: 10,
          minWidth: 180,
        },
      };
    });

    // Create edges with bottleneck highlighting
    const layoutedEdges = processModel.edges.map((edge) => {
      const transition = `${edge.source} → ${edge.target}`;
      const isBottleneck = bottleneckMap[transition];

      return {
        id: `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        type: 'smoothstep',
        animated: isBottleneck && isBottleneck.avg_hours > 24, // Animate slow transitions
        style: {
          stroke: isBottleneck && isBottleneck.avg_hours > 24 ? '#f44336' : '#999',
          strokeWidth: Math.min(edge.frequency / 10, 5), // Width based on frequency
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isBottleneck && isBottleneck.avg_hours > 24 ? '#f44336' : '#999',
        },
        labelStyle: {
          fill: isBottleneck && isBottleneck.avg_hours > 24 ? '#f44336' : '#666',
          fontWeight: isBottleneck ? 'bold' : 'normal',
        },
      };
    });

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [processModel, bottlenecks, setNodes, setEdges]);

  if (!processModel) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No process model available. Run process discovery to visualize.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '600px', width: '100%' }}>
      <Paper elevation={2} sx={{ height: '100%', overflow: 'hidden' }}>
        {/* Process Summary Header */}
        <Box sx={{ p: 2, bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Box>
              <Typography variant="h6">Process Flow</Typography>
              <Typography variant="caption" color="text.secondary">
                {summary.total_cases} cases • {summary.unique_activities} activities
              </Typography>
            </Box>

            <Stack direction="row" spacing={2} sx={{ ml: 'auto' }}>
              <Tooltip title="Average cycle time">
                <Chip
                  icon={<TrendingUpIcon />}
                  label={`Avg: ${summary.avg_duration_hours?.toFixed(1)}h`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Tooltip>

              {bottlenecks.length > 0 && (
                <Tooltip title="Bottlenecks detected">
                  <Chip
                    icon={<WarningIcon />}
                    label={`${bottlenecks.length} bottlenecks`}
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                </Tooltip>
              )}
            </Stack>
          </Stack>
        </Box>

        {/* React Flow Canvas */}
        <Box sx={{ height: 'calc(100% - 80px)' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            attributionPosition="bottom-left"
          >
            <Background variant="dots" gap={12} size={1} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                if (node.style?.background) return node.style.background;
                return '#ffffff';
              }}
              maskColor="rgba(0, 0, 0, 0.1)"
            />
          </ReactFlow>
        </Box>

        {/* Legend */}
        <Box sx={{
          position: 'absolute',
          bottom: 60,
          right: 20,
          bgcolor: 'background.paper',
          p: 1.5,
          borderRadius: 1,
          boxShadow: 2,
          zIndex: 10
        }}>
          <Stack spacing={0.5}>
            <Typography variant="caption" fontWeight="bold">Legend</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 12, height: 12, bgcolor: '#e8f5e9', border: '2px solid #4caf50', borderRadius: 1 }} />
              <Typography variant="caption">Start Activity</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 12, height: 12, bgcolor: '#e3f2fd', border: '2px solid #2196f3', borderRadius: 1 }} />
              <Typography variant="caption">End Activity</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 20, height: 2, bgcolor: '#f44336' }} />
              <Typography variant="caption">Bottleneck (&gt;24h)</Typography>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProcessExplorer;
