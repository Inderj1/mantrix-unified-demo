import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Chip,
  Stack,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
  Restore as RestoreIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

/**
 * EditableProcessExplorer - Interactive Process Flow with What-If Editing
 */
const EditableProcessExplorer = ({
  processModel,
  bottlenecks = [],
  summary = {},
  onModificationsChange
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [editMode, setEditMode] = useState(false);
  const [modifications, setModifications] = useState({
    activity_durations: {},
    transition_probabilities: {}
  });

  const [editDialog, setEditDialog] = useState({
    open: false,
    type: null, // 'node' or 'edge'
    data: null
  });

  // Convert process model to React Flow format with modification highlights
  useEffect(() => {
    if (!processModel || !processModel.nodes || !processModel.edges) {
      return;
    }

    // Create bottleneck lookup
    const bottleneckMap = {};
    bottlenecks.forEach(b => {
      bottleneckMap[b.transition] = b;
    });

    // Create nodes with modification indicators
    const layoutedNodes = processModel.nodes.map((node, index) => {
      const isStart = node.is_start;
      const isEnd = node.is_end;
      const isModified = modifications.activity_durations[node.id] !== undefined;

      return {
        id: node.id,
        type: 'default',
        position: { x: index * 250, y: 200 },
        data: {
          label: (
            <Box sx={{ textAlign: 'center', minWidth: 150 }}>
              <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                <Typography variant="body2" fontWeight="bold">
                  {node.label}
                </Typography>
                {editMode && (
                  <IconButton
                    size="small"
                    onClick={() => handleNodeEdit(node)}
                    sx={{ p: 0.25 }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
              </Stack>

              <Typography variant="caption" color="text.secondary">
                {node.frequency} occurrences
              </Typography>

              {isModified && (
                <Chip
                  label="Modified"
                  size="small"
                  color="warning"
                  sx={{ mt: 0.5, height: 16, fontSize: '0.6rem' }}
                />
              )}

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
          background: isModified ? '#fff3e0' : isStart ? '#e8f5e9' : isEnd ? '#e3f2fd' : '#ffffff',
          border: isModified ? '2px solid #ff9800' : isStart || isEnd ? '2px solid' : '1px solid #ccc',
          borderColor: isModified ? '#ff9800' : isStart ? '#4caf50' : isEnd ? '#2196f3' : '#ccc',
          borderRadius: 8,
          padding: 10,
          minWidth: 180,
        },
      };
    });

    // Create edges with modification indicators
    const layoutedEdges = processModel.edges.map((edge) => {
      const transition = `${edge.source} → ${edge.target}`;
      const isBottleneck = bottleneckMap[transition];
      const isModified = modifications.transition_probabilities[transition] !== undefined;

      return {
        id: `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        label: isModified ? `${edge.label} (Modified)` : edge.label,
        type: 'smoothstep',
        animated: isBottleneck && isBottleneck.avg_hours > 24,
        style: {
          stroke: isModified ? '#ff9800' : isBottleneck && isBottleneck.avg_hours > 24 ? '#f44336' : '#999',
          strokeWidth: isModified ? 3 : Math.min(edge.frequency / 10, 5),
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isModified ? '#ff9800' : isBottleneck && isBottleneck.avg_hours > 24 ? '#f44336' : '#999',
        },
        labelStyle: {
          fill: isModified ? '#ff9800' : isBottleneck && isBottleneck.avg_hours > 24 ? '#f44336' : '#666',
          fontWeight: isModified || isBottleneck ? 'bold' : 'normal',
        },
        data: {
          source: edge.source,
          target: edge.target,
          frequency: edge.frequency,
          transition: transition
        }
      };
    });

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [processModel, bottlenecks, modifications, editMode, setNodes, setEdges]);

  const handleNodeEdit = (node) => {
    setEditDialog({
      open: true,
      type: 'node',
      data: {
        id: node.id,
        label: node.label,
        currentDuration: modifications.activity_durations[node.id] || null,
        originalDuration: null // Could extract from performance data if available
      }
    });
  };

  const handleEdgeClick = (event, edge) => {
    if (!editMode) return;

    setEditDialog({
      open: true,
      type: 'edge',
      data: {
        transition: edge.data.transition,
        source: edge.data.source,
        target: edge.data.target,
        currentFrequency: modifications.transition_probabilities[edge.data.transition] || edge.data.frequency,
        originalFrequency: edge.data.frequency
      }
    });
  };

  const handleSaveEdit = (type, id, value) => {
    const newModifications = { ...modifications };

    if (type === 'node') {
      if (value === null || value === '') {
        delete newModifications.activity_durations[id];
      } else {
        newModifications.activity_durations[id] = parseFloat(value);
      }
    } else if (type === 'edge') {
      if (value === null || value === '') {
        delete newModifications.transition_probabilities[id];
      } else {
        newModifications.transition_probabilities[id] = parseFloat(value);
      }
    }

    setModifications(newModifications);

    // Notify parent component
    if (onModificationsChange) {
      onModificationsChange(newModifications);
    }

    setEditDialog({ open: false, type: null, data: null });
  };

  const handleResetModifications = () => {
    setModifications({
      activity_durations: {},
      transition_probabilities: {}
    });

    if (onModificationsChange) {
      onModificationsChange({
        activity_durations: {},
        transition_probabilities: {}
      });
    }
  };

  const hasModifications =
    Object.keys(modifications.activity_durations).length > 0 ||
    Object.keys(modifications.transition_probabilities).length > 0;

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
        {/* Header with Edit Controls */}
        <Box sx={{ p: 2, bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Box>
              <Typography variant="h6">Process Flow</Typography>
              <Typography variant="caption" color="text.secondary">
                {summary.total_cases} cases • {summary.unique_activities} activities
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} sx={{ ml: 'auto' }} alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={editMode}
                    onChange={(e) => setEditMode(e.target.checked)}
                    color="warning"
                  />
                }
                label="Edit Mode"
              />

              {hasModifications && (
                <>
                  <Chip
                    label={`${Object.keys(modifications.activity_durations).length + Object.keys(modifications.transition_probabilities).length} changes`}
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                  <Tooltip title="Reset all modifications">
                    <IconButton size="small" onClick={handleResetModifications} color="error">
                      <RestoreIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}

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

          {editMode && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Click on activities or transitions to modify durations and probabilities for What-If simulation
            </Alert>
          )}
        </Box>

        {/* React Flow Canvas */}
        <Box sx={{ height: 'calc(100% - 120px)' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onEdgeClick={handleEdgeClick}
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
              <Box sx={{ width: 12, height: 12, bgcolor: '#fff3e0', border: '2px solid #ff9800', borderRadius: 1 }} />
              <Typography variant="caption">Modified</Typography>
            </Stack>
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

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, type: null, data: null })}>
        <DialogTitle>
          {editDialog.type === 'node' ? 'Edit Activity Duration' : 'Edit Transition Probability'}
        </DialogTitle>
        <DialogContent>
          {editDialog.type === 'node' && editDialog.data && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Activity:</strong> {editDialog.data.label}
              </Typography>
              <TextField
                fullWidth
                label="Average Duration (hours)"
                type="number"
                defaultValue={editDialog.data.currentDuration || ''}
                placeholder="Enter new average duration"
                sx={{ mt: 2 }}
                id="duration-input"
                helperText="Leave empty to use original value"
                inputProps={{ step: 0.1, min: 0 }}
              />
            </Box>
          )}

          {editDialog.type === 'edge' && editDialog.data && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Transition:</strong> {editDialog.data.transition}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Original frequency: {editDialog.data.originalFrequency}
              </Typography>
              <TextField
                fullWidth
                label="Transition Frequency"
                type="number"
                defaultValue={editDialog.data.currentFrequency || ''}
                placeholder="Enter new frequency"
                sx={{ mt: 1 }}
                id="frequency-input"
                helperText="Higher = more likely. Leave empty to use original."
                inputProps={{ step: 1, min: 0 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, type: null, data: null })}>Cancel</Button>
          <Button
            onClick={() => {
              const inputId = editDialog.type === 'node' ? 'duration-input' : 'frequency-input';
              const value = document.getElementById(inputId)?.value;
              const id = editDialog.type === 'node' ? editDialog.data.id : editDialog.data.transition;
              handleSaveEdit(editDialog.type, id, value);
            }}
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditableProcessExplorer;
