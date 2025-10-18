import React, { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Panel,
} from 'reactflow';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  IconButton,
  Tooltip,
  Drawer,
} from '@mui/material';
import {
  CenterFocusStrong as CenterIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

import CustomActivityNode from './CustomActivityNode';
import CustomEdge from './CustomEdge';

import 'reactflow/dist/style.css';

const ProcessFlowDiagram = ({ processData, height = 400 }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Define custom node and edge types
  const nodeTypes = useMemo(
    () => ({
      activity: CustomActivityNode,
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      custom: CustomEdge,
    }),
    []
  );

  // Generate process flow data based on the selected process
  const generateFlowData = () => {
    const processFlows = {
      'Accounts Payable': {
        nodes: [
          {
            id: 'start',
            type: 'activity',
            position: { x: 50, y: 150 },
            data: {
              label: 'Start',
              nodeType: 'start',
            },
          },
          {
            id: 'invoice-created',
            type: 'activity',
            position: { x: 300, y: 150 },
            data: {
              label: 'Invoice Created',
              frequency: 45,
              avgDuration: '2.3h',
              throughput: '100%',
              color: '#4285F4',
            },
          },
          {
            id: 'invoice-received',
            type: 'activity',
            position: { x: 600, y: 150 },
            data: {
              label: 'Invoice Received in Oracle',
              frequency: 42,
              avgDuration: '4.1h',
              throughput: '93%',
              color: '#4285F4',
              isBottleneck: true,
            },
          },
          {
            id: 'payment-processed',
            type: 'activity',
            position: { x: 900, y: 150 },
            data: {
              label: 'Payment Processed',
              frequency: 40,
              avgDuration: '1.8h',
              throughput: '95%',
              color: '#4285F4',
            },
          },
          {
            id: 'end',
            type: 'activity',
            position: { x: 1150, y: 150 },
            data: {
              label: 'End',
              nodeType: 'end',
            },
          },
        ],
        edges: [
          {
            id: 'e1',
            source: 'start',
            target: 'invoice-created',
            type: 'custom',
            data: { cases: 45, avgTime: '0h', percentage: '100%' },
          },
          {
            id: 'e2',
            source: 'invoice-created',
            target: 'invoice-received',
            type: 'custom',
            data: { cases: 42, avgTime: '1.2d', percentage: '93%', isBottleneck: true },
          },
          {
            id: 'e3',
            source: 'invoice-received',
            target: 'payment-processed',
            type: 'custom',
            data: { cases: 40, avgTime: '0.8d', percentage: '95%' },
          },
          {
            id: 'e4',
            source: 'payment-processed',
            target: 'end',
            type: 'custom',
            data: { cases: 40, avgTime: '0h', percentage: '100%' },
          },
        ],
      },
      'Order Management': {
        nodes: [
          {
            id: 'start',
            type: 'activity',
            position: { x: 50, y: 150 },
            data: { label: 'Start', nodeType: 'start' },
          },
          {
            id: 'order-created',
            type: 'activity',
            position: { x: 250, y: 150 },
            data: {
              label: 'Order Created',
              frequency: 128,
              avgDuration: '0.5h',
              throughput: '100%',
              color: '#4285F4',
            },
          },
          {
            id: 'order-validated',
            type: 'activity',
            position: { x: 450, y: 150 },
            data: {
              label: 'Order Validated',
              frequency: 125,
              avgDuration: '1.2h',
              throughput: '98%',
              color: '#4285F4',
            },
          },
          {
            id: 'inventory-check',
            type: 'activity',
            position: { x: 650, y: 150 },
            data: {
              label: 'Inventory Check',
              frequency: 120,
              avgDuration: '0.8h',
              throughput: '96%',
              color: '#4285F4',
            },
          },
          {
            id: 'order-shipped',
            type: 'activity',
            position: { x: 850, y: 150 },
            data: {
              label: 'Order Shipped',
              frequency: 118,
              avgDuration: '2.1h',
              throughput: '98%',
              color: '#4285F4',
            },
          },
          {
            id: 'end',
            type: 'activity',
            position: { x: 1050, y: 150 },
            data: { label: 'End', nodeType: 'end' },
          },
        ],
        edges: [
          {
            id: 'e1',
            source: 'start',
            target: 'order-created',
            type: 'custom',
            data: { cases: 128, avgTime: '0h', percentage: '100%' },
          },
          {
            id: 'e2',
            source: 'order-created',
            target: 'order-validated',
            type: 'custom',
            data: { cases: 125, avgTime: '0.3d', percentage: '98%' },
          },
          {
            id: 'e3',
            source: 'order-validated',
            target: 'inventory-check',
            type: 'custom',
            data: { cases: 120, avgTime: '0.2d', percentage: '96%' },
          },
          {
            id: 'e4',
            source: 'inventory-check',
            target: 'order-shipped',
            type: 'custom',
            data: { cases: 118, avgTime: '0.5d', percentage: '98%' },
          },
          {
            id: 'e5',
            source: 'order-shipped',
            target: 'end',
            type: 'custom',
            data: { cases: 118, avgTime: '0h', percentage: '100%' },
          },
        ],
      },
      'Procurement': {
        nodes: [
          {
            id: 'start',
            type: 'activity',
            position: { x: 50, y: 150 },
            data: { label: 'Start', nodeType: 'start' },
          },
          {
            id: 'req-rate-import',
            type: 'activity',
            position: { x: 280, y: 150 },
            data: {
              label: 'Req Rate Import',
              frequency: 67,
              avgDuration: '1.5h',
              throughput: '100%',
              color: '#4285F4',
            },
          },
          {
            id: 'vendor-selection',
            type: 'activity',
            position: { x: 540, y: 150 },
            data: {
              label: 'Vendor Selection',
              frequency: 65,
              avgDuration: '24h',
              throughput: '97%',
              color: '#4285F4',
              isBottleneck: true,
            },
          },
          {
            id: 'purchase-order',
            type: 'activity',
            position: { x: 800, y: 150 },
            data: {
              label: 'Purchase Order',
              frequency: 63,
              avgDuration: '2.3h',
              throughput: '97%',
              color: '#4285F4',
            },
          },
          {
            id: 'goods-receipt',
            type: 'activity',
            position: { x: 1060, y: 150 },
            data: {
              label: 'Goods Receipt',
              frequency: 62,
              avgDuration: '1.1h',
              throughput: '98%',
              color: '#4285F4',
            },
          },
          {
            id: 'end',
            type: 'activity',
            position: { x: 1300, y: 150 },
            data: { label: 'End', nodeType: 'end' },
          },
        ],
        edges: [
          {
            id: 'e1',
            source: 'start',
            target: 'req-rate-import',
            type: 'custom',
            data: { cases: 67, avgTime: '0h', percentage: '100%' },
          },
          {
            id: 'e2',
            source: 'req-rate-import',
            target: 'vendor-selection',
            type: 'custom',
            data: { cases: 65, avgTime: '0.5d', percentage: '97%' },
          },
          {
            id: 'e3',
            source: 'vendor-selection',
            target: 'purchase-order',
            type: 'custom',
            data: { cases: 63, avgTime: '1.2d', percentage: '97%', isBottleneck: true },
          },
          {
            id: 'e4',
            source: 'purchase-order',
            target: 'goods-receipt',
            type: 'custom',
            data: { cases: 62, avgTime: '2.1d', percentage: '98%' },
          },
          {
            id: 'e5',
            source: 'goods-receipt',
            target: 'end',
            type: 'custom',
            data: { cases: 62, avgTime: '0h', percentage: '100%' },
          },
        ],
      },
      'Case Management': {
        nodes: [
          {
            id: 'start',
            type: 'activity',
            position: { x: 50, y: 150 },
            data: { label: 'Start', nodeType: 'start' },
          },
          {
            id: 'case-created',
            type: 'activity',
            position: { x: 250, y: 150 },
            data: {
              label: 'Case Created',
              frequency: 156,
              avgDuration: '0.2h',
              throughput: '100%',
              color: '#00A1E0',
            },
          },
          {
            id: 'case-assigned',
            type: 'activity',
            position: { x: 450, y: 150 },
            data: {
              label: 'Case Assigned',
              frequency: 154,
              avgDuration: '2.1h',
              throughput: '99%',
              color: '#00A1E0',
            },
          },
          {
            id: 'investigation',
            type: 'activity',
            position: { x: 650, y: 150 },
            data: {
              label: 'Investigation',
              frequency: 152,
              avgDuration: '8.5h',
              throughput: '99%',
              color: '#00A1E0',
            },
          },
          {
            id: 'resolution',
            type: 'activity',
            position: { x: 850, y: 150 },
            data: {
              label: 'Resolution',
              frequency: 150,
              avgDuration: '3.2h',
              throughput: '99%',
              color: '#00A1E0',
            },
          },
          {
            id: 'end',
            type: 'activity',
            position: { x: 1050, y: 150 },
            data: { label: 'End', nodeType: 'end' },
          },
        ],
        edges: [
          {
            id: 'e1',
            source: 'start',
            target: 'case-created',
            type: 'custom',
            data: { cases: 156, avgTime: '0h', percentage: '100%' },
          },
          {
            id: 'e2',
            source: 'case-created',
            target: 'case-assigned',
            type: 'custom',
            data: { cases: 154, avgTime: '0.1d', percentage: '99%' },
          },
          {
            id: 'e3',
            source: 'case-assigned',
            target: 'investigation',
            type: 'custom',
            data: { cases: 152, avgTime: '0.2d', percentage: '99%' },
          },
          {
            id: 'e4',
            source: 'investigation',
            target: 'resolution',
            type: 'custom',
            data: { cases: 150, avgTime: '0.5d', percentage: '99%' },
          },
          {
            id: 'e5',
            source: 'resolution',
            target: 'end',
            type: 'custom',
            data: { cases: 150, avgTime: '0h', percentage: '100%' },
          },
        ],
      },
      'Incident Management': {
        nodes: [
          {
            id: 'start',
            type: 'activity',
            position: { x: 50, y: 80 },
            data: { label: 'Start', nodeType: 'start' },
          },
          {
            id: 'incident-reported',
            type: 'activity',
            position: { x: 250, y: 80 },
            data: {
              label: 'Incident Reported',
              frequency: 203,
              avgDuration: '0.1h',
              throughput: '100%',
              color: '#81B441',
            },
          },
          {
            id: 'incident-assigned',
            type: 'activity',
            position: { x: 450, y: 80 },
            data: {
              label: 'Incident Assigned',
              frequency: 201,
              avgDuration: '0.5h',
              throughput: '99%',
              color: '#81B441',
            },
          },
          {
            id: 'diagnosis',
            type: 'activity',
            position: { x: 650, y: 80 },
            data: {
              label: 'Diagnosis',
              frequency: 199,
              avgDuration: '2.1h',
              throughput: '99%',
              color: '#81B441',
            },
          },
          {
            id: 'resolution',
            type: 'activity',
            position: { x: 850, y: 80 },
            data: {
              label: 'Resolution',
              frequency: 195,
              avgDuration: '4.2h',
              throughput: '98%',
              color: '#81B441',
            },
          },
          {
            id: 'verification',
            type: 'activity',
            position: { x: 650, y: 220 },
            data: {
              label: 'Verification',
              frequency: 194,
              avgDuration: '1.1h',
              throughput: '99%',
              color: '#81B441',
            },
          },
          {
            id: 'closure',
            type: 'activity',
            position: { x: 450, y: 220 },
            data: {
              label: 'Closure',
              frequency: 194,
              avgDuration: '0.3h',
              throughput: '100%',
              color: '#81B441',
            },
          },
          {
            id: 'end',
            type: 'activity',
            position: { x: 250, y: 220 },
            data: { label: 'End', nodeType: 'end' },
          },
        ],
        edges: [
          {
            id: 'e1',
            source: 'start',
            target: 'incident-reported',
            type: 'custom',
            data: { cases: 203, avgTime: '0h', percentage: '100%' },
          },
          {
            id: 'e2',
            source: 'incident-reported',
            target: 'incident-assigned',
            type: 'custom',
            data: { cases: 201, avgTime: '0.02d', percentage: '99%' },
          },
          {
            id: 'e3',
            source: 'incident-assigned',
            target: 'diagnosis',
            type: 'custom',
            data: { cases: 199, avgTime: '0.05d', percentage: '99%' },
          },
          {
            id: 'e4',
            source: 'diagnosis',
            target: 'resolution',
            type: 'custom',
            data: { cases: 195, avgTime: '0.1d', percentage: '98%' },
          },
          {
            id: 'e5',
            source: 'resolution',
            target: 'verification',
            type: 'custom',
            data: { cases: 194, avgTime: '0.2d', percentage: '99%' },
          },
          {
            id: 'e6',
            source: 'verification',
            target: 'closure',
            type: 'custom',
            data: { cases: 194, avgTime: '0.05d', percentage: '100%' },
          },
          {
            id: 'e7',
            source: 'closure',
            target: 'end',
            type: 'custom',
            data: { cases: 194, avgTime: '0h', percentage: '100%' },
          },
        ],
      },
    };

    // Default to Accounts Payable if process not found
    return processFlows[processData?.title] || processFlows['Accounts Payable'];
  };

  const flowData = generateFlowData();
  const [nodes, setNodes, onNodesChange] = useNodesState(flowData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowData.edges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setDrawerOpen(true);
  }, []);

  const fitView = () => {
    // This would be implemented with useReactFlow hook in real implementation
    console.log('Fit view to diagram');
  };

  return (
    <Box sx={{ height, position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            if (node.data.nodeType === 'start') return '#4CAF50';
            if (node.data.nodeType === 'end') return '#F44336';
            if (node.data.isBottleneck) return '#FF5722';
            return '#4285F4';
          }}
          nodeStrokeWidth={3}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid #ccc',
          }}
        />
        <Background variant="dots" gap={12} size={1} />
        
        {/* Custom Control Panel */}
        <Panel position="top-left">
          <Paper elevation={2} sx={{ p: 1, borderRadius: 2 }}>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Fit to view">
                <IconButton size="small" onClick={fitView}>
                  <CenterIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Process Information">
                <IconButton size="small" onClick={() => setDrawerOpen(true)}>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Paper>
        </Panel>

        {/* Process Stats Panel */}
        <Panel position="top-right">
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2, minWidth: 200 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Process Overview
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption">Total Activities</Typography>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  {nodes.filter(n => n.data.nodeType === 'activity').length}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption">Avg. Cases</Typography>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  {Math.round(
                    nodes
                      .filter(n => n.data.frequency)
                      .reduce((sum, n) => sum + n.data.frequency, 0) /
                    nodes.filter(n => n.data.frequency).length || 0
                  )}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption">Bottlenecks</Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 500,
                    color: nodes.some(n => n.data.isBottleneck) ? 'error.main' : 'success.main'
                  }}
                >
                  {nodes.filter(n => n.data.isBottleneck).length}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Panel>
      </ReactFlow>

      {/* Node Details Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: 350, p: 3 }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            {selectedNode ? 'Activity Details' : 'Process Information'}
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        {selectedNode ? (
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {selectedNode.data.label}
            </Typography>
            
            {selectedNode.data.frequency && (
              <>
                <Box>
                  <Typography variant="body2" color="text.secondary">Cases Processed</Typography>
                  <Typography variant="h5" sx={{ color: '#4285F4', fontWeight: 600 }}>
                    {selectedNode.data.frequency}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Average Duration</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedNode.data.avgDuration}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Throughput Rate</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedNode.data.throughput}
                  </Typography>
                </Box>

                {selectedNode.data.isBottleneck && (
                  <Paper sx={{ p: 2, bgcolor: '#FF572220', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ color: '#FF5722', fontWeight: 600 }}>
                      ⚠️ Bottleneck Detected
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      This activity is causing delays in the process flow
                    </Typography>
                  </Paper>
                )}
              </>
            )}
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Typography variant="body2">
              This interactive diagram shows the flow of your {processData?.title || 'business'} process.
            </Typography>
            <Typography variant="body2">
              Click on any activity node to see detailed metrics and performance data.
            </Typography>
            <Typography variant="body2">
              Red nodes indicate bottlenecks that may need attention.
            </Typography>
          </Stack>
        )}
      </Drawer>
    </Box>
  );
};

export default ProcessFlowDiagram;