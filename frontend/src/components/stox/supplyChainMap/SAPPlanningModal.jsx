import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Chip,
  Modal,
  Fade,
  Backdrop,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import SyncIcon from '@mui/icons-material/Sync';
import SaveIcon from '@mui/icons-material/Save';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';

export default function SAPPlanningModal({ open, action, onClose, onSaveToSAP }) {
  const [notes, setNotes] = useState('');
  const [executionDate, setExecutionDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveToSAP = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    onSaveToSAP?.(action, { notes, executionDate, priority, assignedTo });
    setSaving(false);
    onClose();
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  if (!action) return null;

  const getCostCenter = () => {
    switch (action.type) {
      case 'auto-transfer': return 'LOG-001';
      case 'auto-reroute': return 'TRN-002';
      case 'demand-adjust': return 'PRC-003';
      default: return 'OPS-004';
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 300,
          sx: { bgcolor: alpha('#1e293b', 0.6) }
        },
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            maxWidth: 600,
            maxHeight: '90vh',
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <Box sx={{
            p: 2.5,
            borderBottom: '1px solid',
            borderColor: alpha('#64748b', 0.15),
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                  Operation Planning
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                  <SmartToyIcon sx={{ fontSize: 14, color: '#002352' }} />
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {action.label} • AI Confidence: {action.confidence}%
                  </Typography>
                </Stack>
              </Box>
              <IconButton onClick={handleClose} disabled={saving} size="small" sx={{ color: '#64748b' }}>
                <CloseIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Stack>
          </Box>

          {/* Content */}
          <Box sx={{
            flex: 1,
            overflow: 'auto',
            p: 2.5,
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: alpha('#64748b', 0.3), borderRadius: 3 },
          }}>
            <Stack spacing={2.5}>
              {/* Action Summary */}
              <Box sx={{ bgcolor: '#f8fafc', borderRadius: 1.5, p: 2, border: '1px solid', borderColor: alpha('#64748b', 0.15) }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', mb: 1.5 }}>
                  Action Summary
                </Typography>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={2}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b', width: 100 }}>Description:</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#1e293b', flex: 1 }}>{action.description}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b', width: 100 }}>Type:</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#0284c7', textTransform: 'capitalize' }}>{action.type?.replace('-', ' ')}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b', width: 100 }}>Impact:</Typography>
                    <Chip
                      label={action.impact}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        bgcolor: action.impact === 'High' ? alpha('#002352', 0.12) : alpha('#0ea5e9', 0.12),
                        color: action.impact === 'High' ? '#002352' : '#0284c7',
                      }}
                    />
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b', width: 100 }}>AI Confidence:</Typography>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <LinearProgress
                        variant="determinate"
                        value={action.confidence}
                        sx={{
                          flex: 1,
                          height: 6,
                          borderRadius: 3,
                          bgcolor: alpha('#64748b', 0.15),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: action.confidence >= 90 ? '#10b981' : action.confidence >= 80 ? '#f59e0b' : '#f97316',
                            borderRadius: 3,
                          },
                        }}
                      />
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b' }}>{action.confidence}%</Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Box>

              {/* Execution Planning */}
              <Box sx={{ bgcolor: '#f8fafc', borderRadius: 1.5, p: 2, border: '1px solid', borderColor: alpha('#64748b', 0.15) }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', mb: 2 }}>
                  Execution Planning
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    type="date"
                    label="Scheduled Execution Date"
                    value={executionDate}
                    onChange={(e) => setExecutionDate(e.target.value)}
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '0.85rem',
                        bgcolor: 'white',
                      },
                    }}
                  />

                  <FormControl size="small" fullWidth>
                    <InputLabel>Priority Level</InputLabel>
                    <Select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      label="Priority Level"
                      sx={{ fontSize: '0.85rem', bgcolor: 'white' }}
                    >
                      <MenuItem value="high">High - Immediate Action Required</MenuItem>
                      <MenuItem value="medium">Medium - Schedule Within 24hrs</MenuItem>
                      <MenuItem value="low">Low - Can Wait</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Assign To"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    placeholder="Enter name or team..."
                    size="small"
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '0.85rem',
                        bgcolor: 'white',
                      },
                    }}
                  />

                  <TextField
                    label="Planning Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add execution notes, special instructions, or considerations..."
                    multiline
                    rows={3}
                    size="small"
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '0.85rem',
                        bgcolor: 'white',
                      },
                    }}
                  />
                </Stack>
              </Box>

              {/* SAP Integration */}
              <Box sx={{
                bgcolor: alpha('#0284c7', 0.08),
                border: '1px solid',
                borderColor: alpha('#0284c7', 0.25),
                borderRadius: 1.5,
                p: 2,
              }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                  <SyncIcon sx={{ fontSize: 18, color: '#0284c7' }} />
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7' }}>
                    SAP Integration
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#0284c7', mt: 0.75 }} />
                    <Typography sx={{ fontSize: '0.75rem', color: '#00357a' }}>
                      This will create a new work order in SAP MM module
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#0284c7', mt: 0.75 }} />
                    <Typography sx={{ fontSize: '0.75rem', color: '#00357a' }}>
                      Inventory movements will be tracked in real-time
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#0284c7', mt: 0.75 }} />
                    <Typography sx={{ fontSize: '0.75rem', color: '#00357a' }}>
                      Automatic notification to warehouse team via SAP Fiori
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#0284c7', mt: 0.75 }} />
                    <Typography sx={{ fontSize: '0.75rem', color: '#00357a' }}>
                      Cost center: <strong>{getCostCenter()}</strong>
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              {/* Execution Timeline */}
              <Box sx={{ bgcolor: '#f8fafc', borderRadius: 1.5, p: 2, border: '1px solid', borderColor: alpha('#64748b', 0.15) }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                  <ScheduleIcon sx={{ fontSize: 16, color: '#00357a' }} />
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>
                    Execution Timeline
                  </Typography>
                </Stack>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', width: 90 }}>Now</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#1e293b' }}>Plan created & saved to SAP</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#0284c7' }} />
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', width: 90 }}>+5 minutes</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#1e293b' }}>Warehouse team notified</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#0284c7' }} />
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', width: 90 }}>{executionDate}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#1e293b' }}>Execution scheduled</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#94a3b8' }} />
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', width: 90 }}>On completion</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#1e293b' }}>SAP updated, metrics tracked</Typography>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </Box>

          {/* Footer */}
          <Box sx={{
            p: 2,
            borderTop: '1px solid',
            borderColor: alpha('#64748b', 0.15),
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          }}>
            <Stack direction="row" spacing={1.5}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSaveToSAP}
                disabled={saving}
                startIcon={saving ? <SyncIcon sx={{ animation: 'spin 1s linear infinite' }} /> : <SaveIcon />}
                sx={{
                  bgcolor: '#0284c7',
                  color: 'white',
                  fontWeight: 600,
                  textTransform: 'none',
                  py: 1.25,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#0369a1', boxShadow: 'none' },
                  '&:disabled': { bgcolor: alpha('#0284c7', 0.6), color: 'white' },
                }}
              >
                {saving ? 'Syncing to SAP...' : 'Save & Sync to SAP'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleClose}
                disabled={saving}
                sx={{
                  borderColor: alpha('#64748b', 0.3),
                  color: '#00357a',
                  fontWeight: 600,
                  textTransform: 'none',
                  py: 1.25,
                  px: 3,
                  '&:hover': { bgcolor: alpha('#64748b', 0.08), borderColor: alpha('#64748b', 0.5) },
                }}
              >
                Cancel
              </Button>
            </Stack>
          </Box>

          {/* CSS for spin animation */}
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </Box>
      </Fade>
    </Modal>
  );
}
