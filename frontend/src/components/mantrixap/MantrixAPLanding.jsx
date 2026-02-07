import React from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Avatar, Stack,
  Button, Breadcrumbs, Link, Paper,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Receipt as ReceiptIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  DocumentScanner as DocumentScannerIcon,
  ViewList as ViewListIcon,
  ReportProblem as ReportProblemIcon,
  FactCheck as FactCheckIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { MODULE_COLOR } from '../../config/brandColors';
import { workflowTiles } from './apMockData';

const tileIcons = {
  DocumentScanner: DocumentScannerIcon,
  ViewList: ViewListIcon,
  ReportProblem: ReportProblemIcon,
  FactCheck: FactCheckIcon,
  Assessment: AssessmentIcon,
};

const MantrixAPLanding = ({ onBack, darkMode = false, onNavigate }) => {
  const bgColor = darkMode ? '#0d1117' : '#f8fafc';
  const cardBg = darkMode ? '#161b22' : '#fff';
  const textColor = darkMode ? '#e6edf3' : '#1e293b';
  const textSecondary = darkMode ? '#8b949e' : '#64748b';
  const borderColor = darkMode ? '#30363d' : '#e2e8f0';

  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto', bgcolor: bgColor }}>

      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 2 }}
      >
        <Link
          underline="hover"
          color="inherit"
          onClick={onBack}
          sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}
        >
          CORE.AI
        </Link>
        <Typography
          color={textColor}
          sx={{ fontSize: '0.85rem', fontWeight: 600 }}
        >
          AP.AI
        </Typography>
      </Breadcrumbs>

      {/* Module Identity Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 3,
          mb: 3,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
          boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: alpha(MODULE_COLOR, 0.1),
              color: MODULE_COLOR,
            }}
          >
            <ReceiptIcon sx={{ fontSize: 28 }} />
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="h5" fontWeight={700} sx={{ color: MODULE_COLOR }}>
                AP.AI
              </Typography>
              <Chip
                label="5 Tiles"
                size="small"
                sx={{
                  bgcolor: alpha(MODULE_COLOR, 0.1),
                  color: MODULE_COLOR,
                  fontWeight: 600,
                  fontSize: '0.7rem',
                }}
              />
            </Stack>
            <Typography variant="body2" sx={{ color: textSecondary }}>
              Accounts Payable Intelligence — AI-Assisted Invoice Processing
            </Typography>
          </Box>

          <Button
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{ color: textSecondary }}
          >
            Back
          </Button>
        </Box>
      </Paper>

      {/* 5-Tile Workflow Grid — matches CORE.AI module card pattern */}
      <Grid container spacing={2}>
        {workflowTiles.map((tile) => {
          const IconComponent = tileIcons[tile.icon] || ReceiptIcon;
          return (
            <Grid item xs={12} sm={6} md={2.4} key={tile.id}>
              <Card
                onClick={() => onNavigate && onNavigate(tile.id)}
                sx={{
                  height: 200,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: `1px solid ${borderColor}`,
                  borderRadius: 3,
                  overflow: 'hidden',
                  bgcolor: cardBg,
                  boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: `0 20px 40px ${alpha(tile.color, 0.12)}, 0 8px 16px rgba(0,0,0,0.06)`,
                    '& .tile-icon': {
                      transform: 'scale(1.1)',
                      bgcolor: tile.color,
                      color: 'white',
                    },
                    '& .tile-arrow': {
                      opacity: 1,
                      transform: 'translateX(4px)',
                    },
                  },
                }}
              >
                <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Icon */}
                  <Box sx={{ mb: 1.5 }}>
                    <Avatar
                      className="tile-icon"
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: alpha(tile.color, darkMode ? 0.2 : 0.1),
                        color: tile.color,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <IconComponent sx={{ fontSize: 22 }} />
                    </Avatar>
                  </Box>

                  {/* Title */}
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 700, color: tile.color, mb: 0.5, fontSize: '0.9rem', lineHeight: 1.3 }}
                  >
                    {tile.title}
                  </Typography>

                  {/* Subtitle */}
                  <Typography
                    variant="caption"
                    sx={{ color: textSecondary, fontWeight: 500, mb: 1, fontSize: '0.7rem', opacity: 0.8 }}
                  >
                    {tile.subtitle}
                  </Typography>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: textSecondary,
                      mb: 'auto',
                      lineHeight: 1.4,
                      fontSize: '0.7rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {tile.description}
                  </Typography>

                  {/* Footer: metric chip + arrow */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 1,
                      pt: 1,
                      borderTop: '1px solid',
                      borderColor: alpha(tile.color, darkMode ? 0.2 : 0.1),
                    }}
                  >
                    <Chip
                      label={`${tile.stats.value} ${tile.stats.label}`}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.65rem',
                        bgcolor: alpha(tile.color, darkMode ? 0.2 : 0.08),
                        color: tile.color,
                        fontWeight: 600,
                      }}
                    />
                    <ArrowForwardIcon
                      className="tile-arrow"
                      sx={{
                        color: tile.color,
                        fontSize: 18,
                        opacity: 0.5,
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default MantrixAPLanding;
