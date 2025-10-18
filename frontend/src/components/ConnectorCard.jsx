import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Avatar,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  PlayArrow as TestIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Cable as CableIcon,
} from '@mui/icons-material';

const ConnectorCard = ({ connector, onConfigure, onTest }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'success';
      case 'disconnected':
        return 'default';
      case 'testing':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon sx={{ color: 'success.main', fontSize: 16 }} />;
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main', fontSize: 16 }} />;
      case 'testing':
        return <CircularProgress size={16} />;
      default:
        return <CableIcon sx={{ color: 'text.secondary', fontSize: 16 }} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'testing':
        return 'Testing...';
      case 'error':
        return 'Connection Error';
      default:
        return 'Unknown';
    }
  };

  const formatDataSize = (size) => {
    if (!size || size === '0 MB') return 'No data';
    return size;
  };

  const formatLastSync = (lastSync) => {
    if (!lastSync) return 'Never';
    return lastSync;
  };

  const getStatsLabel = (connector) => {
    switch (connector.type) {
      case 'nosql':
        return 'Collections';
      case 'vector':
        return connector.id === 'weaviate' ? 'Objects' : 'Vectors';
      case 'cache':
        return 'Keys';
      case 'search':
        return 'Indices';
      default:
        return 'Tables';
    }
  };

  const getStatsValue = (connector) => {
    switch (connector.type) {
      case 'nosql':
        return connector.stats.collections || 0;
      case 'vector':
        return connector.stats.objects || connector.stats.vectors || 0;
      case 'cache':
        return connector.stats.keys || 0;
      case 'search':
        return connector.stats.indices || 0;
      default:
        return connector.stats.tables || 0;
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: connector.status === 'connected' ? `2px solid ${connector.color}20` : '1px solid #e0e0e0',
        borderRadius: 3,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
          borderColor: `${connector.color}40`,
        },
        ...(connector.status === 'testing' && {
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': { boxShadow: `0 0 0 0 ${connector.color}40` },
            '70%': { boxShadow: `0 0 0 10px ${connector.color}00` },
            '100%': { boxShadow: `0 0 0 0 ${connector.color}00` },
          },
        }),
      }}
    >
      {connector.status === 'testing' && (
        <LinearProgress
          sx={{
            height: 2,
            backgroundColor: `${connector.color}20`,
            '& .MuiLinearProgress-bar': {
              backgroundColor: connector.color,
            },
          }}
        />
      )}

      <CardContent sx={{ flex: 1, p: 2.5 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                bgcolor: `${connector.color}20`,
                color: connector.color,
                width: 40,
                height: 40,
                fontSize: '1.2rem',
              }}
            >
              {connector.logo}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.2 }}>
                {connector.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {connector.type.toUpperCase()}
              </Typography>
            </Box>
          </Box>
          
          <Chip
            icon={getStatusIcon(connector.status)}
            label={getStatusText(connector.status)}
            color={getStatusColor(connector.status)}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, lineHeight: 1.4, minHeight: 40 }}
        >
          {connector.description}
        </Typography>

        {/* Stats */}
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {getStatsLabel(connector)}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {getStatsValue(connector).toLocaleString()}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Last Sync
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {formatLastSync(connector.stats.lastSync)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Data Size
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {formatDataSize(connector.stats.dataSize)}
            </Typography>
          </Box>
        </Stack>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SettingsIcon />}
            onClick={onConfigure}
            sx={{
              flex: 1,
              borderRadius: 2,
              borderColor: connector.color,
              color: connector.color,
              '&:hover': {
                borderColor: connector.color,
                backgroundColor: `${connector.color}10`,
              },
            }}
          >
            Configure
          </Button>
          
          <Tooltip title="Test Connection">
            <IconButton
              size="small"
              onClick={onTest}
              disabled={connector.status === 'testing'}
              sx={{
                border: '1px solid',
                borderColor: connector.color,
                color: connector.color,
                '&:hover': {
                  backgroundColor: `${connector.color}10`,
                },
                '&:disabled': {
                  borderColor: 'action.disabled',
                  color: 'action.disabled',
                },
              }}
            >
              {connector.status === 'testing' ? (
                <CircularProgress size={16} />
              ) : (
                <TestIcon />
              )}
            </IconButton>
          </Tooltip>
        </Stack>
      </CardActions>
    </Card>
  );
};

export default ConnectorCard;