import React, { useState } from 'react';
import {
  Box, Typography, Chip, Stack, Paper, Collapse, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  KeyboardArrowDown as ExpandIcon,
  KeyboardArrowUp as CollapseIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Block as BlockIcon,
  Visibility as VisibilityIcon,
  CompareArrows as CompareArrowsIcon,
  Key as KeyIcon,
  MenuBook as MenuBookIcon,
  Psychology as PsychologyIcon,
  Calculate as CalculateIcon,
  Inventory as InventoryIcon,
  FilterAlt as FilterAltIcon,
} from '@mui/icons-material';
import {
  invoiceLineItems, poLineItems, lineMatchResults,
  matchStrategies, guardrailDefs, invoiceList,
} from './apMockData';
import { apTheme, MODULE_NAVY, NAVY_DARK, NAVY_BLUE } from './apTheme';

const TILE_COLOR = MODULE_NAVY;

const strategyIcons = {
  'key-based': KeyIcon,
  'vendor-material': MenuBookIcon,
  'semantic': PsychologyIcon,
  'qty-price': CalculateIcon,
  'gr-xref': InventoryIcon,
  'elimination': FilterAltIcon,
};

const guardrailIcons = {
  Block: BlockIcon,
  Warning: WarningIcon,
  Visibility: VisibilityIcon,
};

const formatCurrency = (v) => {
  if (v == null) return '—';
  return v.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
};

// Expandable row component
const MatchRow = ({ invLine, poLine, matchResult, darkMode, invoice }) => {
  const [open, setOpen] = useState(false);
  const textColor = darkMode ? '#e6edf3' : '#1e293b';
  const textSecondary = darkMode ? '#8b949e' : '#64748b';
  const borderColor = darkMode ? '#30363d' : '#e2e8f0';

  const statusChipStyle = apTheme.chips.lineMatch[invLine.matchStatus] || apTheme.chips.lineMatch.unmatched;
  const strategyChipStyle = apTheme.chips.matchStrategy[invLine.matchStrategy] || {};
  const statusLabels = { matched: 'Matched', partial: 'Partial', exception: 'Exception', unplanned: 'Unplanned', unmatched: 'Unmatched' };

  const rowBg = invLine.matchStatus === 'matched'
    ? (darkMode ? alpha('#10b981', 0.04) : alpha('#10b981', 0.03))
    : invLine.matchStatus === 'partial'
      ? (darkMode ? alpha('#f59e0b', 0.04) : alpha('#f59e0b', 0.03))
      : invLine.matchStatus === 'exception'
        ? (darkMode ? alpha('#ef4444', 0.04) : alpha('#ef4444', 0.03))
        : invLine.matchStatus === 'unplanned'
          ? (darkMode ? alpha('#7c3aed', 0.04) : alpha('#7c3aed', 0.03))
          : 'transparent';

  const strategy = matchStrategies.find((s) => s.id === invLine.matchStrategy);
  const flaggedGuardrails = matchResult?.guardrailFlags?.map((gid) => guardrailDefs.find((g) => g.id === gid)).filter(Boolean) || [];

  return (
    <>
      <TableRow
        hover
        onClick={() => setOpen(!open)}
        sx={{ bgcolor: rowBg, cursor: 'pointer', '& td': { borderBottom: `1px solid ${borderColor}` } }}
      >
        <TableCell sx={{ width: 32, p: 0.5 }}>
          <IconButton size="small" sx={{ color: textSecondary }}>
            {open ? <CollapseIcon sx={{ fontSize: 16 }} /> : <ExpandIcon sx={{ fontSize: 16 }} />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ color: textColor, fontSize: '0.75rem', fontWeight: 600, width: 40 }}>
          {invLine.lineNum}
        </TableCell>
        <TableCell sx={{ color: textColor, fontSize: '0.72rem', maxWidth: 160 }}>
          <Typography noWrap sx={{ fontSize: '0.72rem' }}>{invLine.description}</Typography>
        </TableCell>
        <TableCell align="right" sx={{ color: textColor, fontSize: '0.72rem', fontWeight: 600 }}>
          {invLine.qty} {invLine.unit}
        </TableCell>
        <TableCell align="right" sx={{ color: textColor, fontSize: '0.72rem' }}>
          {formatCurrency(invLine.unitPrice)}
        </TableCell>
        <TableCell align="right" sx={{ color: textColor, fontSize: '0.75rem', fontWeight: 700 }}>
          {formatCurrency(invLine.amount)}
        </TableCell>
        <TableCell align="center" sx={{ width: 30 }}>
          <CompareArrowsIcon sx={{ fontSize: 14, color: textSecondary, opacity: 0.5 }} />
        </TableCell>
        <TableCell sx={{ color: textSecondary, fontSize: '0.72rem', width: 40 }}>
          {poLine ? poLine.lineNum : '—'}
        </TableCell>
        <TableCell sx={{ color: textSecondary, fontSize: '0.72rem', maxWidth: 140 }}>
          <Typography noWrap sx={{ fontSize: '0.72rem', color: textSecondary }}>{poLine ? poLine.description : '—'}</Typography>
        </TableCell>
        <TableCell align="center" sx={{ width: 90 }}>
          <Chip
            label={strategy?.name || invLine.matchStrategy}
            size="small"
            sx={{ ...strategyChipStyle, height: 20, fontSize: '0.58rem', letterSpacing: 0.3 }}
          />
        </TableCell>
        <TableCell align="center" sx={{ width: 55 }}>
          <Typography sx={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: invLine.confidence > 90 ? '#059669' : invLine.confidence > 60 ? '#d97706' : '#dc2626',
          }}>
            {invLine.confidence}
          </Typography>
        </TableCell>
        <TableCell align="center" sx={{ width: 80 }}>
          <Chip
            label={statusLabels[invLine.matchStatus] || invLine.matchStatus}
            size="small"
            sx={{ ...statusChipStyle, height: 20, fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: 0.5 }}
          />
        </TableCell>
      </TableRow>

      {/* Expanded detail */}
      <TableRow>
        <TableCell colSpan={12} sx={{ p: 0, borderBottom: open ? `1px solid ${borderColor}` : 'none' }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, bgcolor: darkMode ? alpha('#fff', 0.02) : alpha('#f0f4f8', 0.5) }}>
              <Stack direction="row" spacing={3} flexWrap="wrap">
                {/* Strategy Breakdown */}
                <Box sx={{ minWidth: 220 }}>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: TILE_COLOR, textTransform: 'uppercase', letterSpacing: 0.5, mb: 1 }}>
                    Strategy Breakdown
                  </Typography>
                  {strategy && (
                    <Box sx={{ mb: 1 }}>
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
                        <Chip label={strategy.name} size="small" sx={{ ...strategyChipStyle, height: 20, fontSize: '0.6rem' }} />
                        <Typography sx={{ fontSize: '0.65rem', color: textSecondary }}>
                          Weight: {strategy.weight}%
                        </Typography>
                      </Stack>
                      <Typography sx={{ fontSize: '0.68rem', color: textSecondary, lineHeight: 1.5 }}>
                        {strategy.description}
                      </Typography>
                    </Box>
                  )}
                  {invLine.grRef && (
                    <Typography sx={{ fontSize: '0.65rem', color: textSecondary }}>
                      GR Ref: <strong style={{ color: textColor }}>{invLine.grRef}</strong>
                    </Typography>
                  )}
                </Box>

                {/* Variance Details */}
                {matchResult && (matchResult.varianceType || matchResult.variancePct !== 0) && (
                  <Box sx={{ minWidth: 200 }}>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1 }}>
                      Variance Details
                    </Typography>
                    <Stack spacing={0.5}>
                      {matchResult.varianceType && (
                        <Typography sx={{ fontSize: '0.68rem', color: textColor }}>
                          Type: <strong>{matchResult.varianceType === 'price' ? 'Price Variance' : matchResult.varianceType === 'qty' ? 'Quantity Mismatch' : 'Unplanned Cost'}</strong>
                        </Typography>
                      )}
                      {matchResult.variancePct != null && (
                        <Typography sx={{ fontSize: '0.68rem', color: Math.abs(matchResult.variancePct) > 2 ? '#dc2626' : '#d97706', fontWeight: 600 }}>
                          Variance: {matchResult.variancePct > 0 ? '+' : ''}{matchResult.variancePct}%
                        </Typography>
                      )}
                      {poLine && invLine.matchStatus === 'exception' && (
                        <Typography sx={{ fontSize: '0.65rem', color: textSecondary }}>
                          Invoice: {formatCurrency(invLine.unitPrice)} vs PO: {formatCurrency(poLine.unitPrice)}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                )}

                {/* Guardrail Flags */}
                {flaggedGuardrails.length > 0 && (
                  <Box sx={{ minWidth: 220 }}>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1 }}>
                      Guardrail Flags
                    </Typography>
                    <Stack spacing={0.5}>
                      {flaggedGuardrails.map((g) => {
                        const gStyle = apTheme.chips.guardrail[g.type] || {};
                        return (
                          <Stack key={g.id} direction="row" spacing={0.5} alignItems="center">
                            <Chip
                              label={g.type.toUpperCase()}
                              size="small"
                              sx={{ ...gStyle, height: 18, fontSize: '0.55rem', letterSpacing: 0.5 }}
                            />
                            <Typography sx={{ fontSize: '0.65rem', color: textColor }}>{g.name}</Typography>
                            <Typography sx={{ fontSize: '0.6rem', color: textSecondary }}>— {g.rule}</Typography>
                          </Stack>
                        );
                      })}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const LineItemMatchEngine = ({ invoiceId, darkMode = false }) => {
  const textColor = darkMode ? '#e6edf3' : '#1e293b';
  const textSecondary = darkMode ? '#8b949e' : '#64748b';
  const borderColor = darkMode ? '#30363d' : '#e2e8f0';
  const cardBg = darkMode ? '#161b22' : '#fff';

  const invLines = invoiceLineItems[invoiceId];
  if (!invLines) return null;

  const invoice = invoiceList.find((inv) => inv.id === invoiceId);
  const poRef = invoice?.poRef;
  const poLines = poRef ? poLineItems[poRef] : null;
  const matchResults = lineMatchResults[invoiceId] || [];

  const getPoLine = (poLineNum) => poLines?.find((p) => p.lineNum === poLineNum) || null;
  const getMatchResult = (lineNum) => matchResults.find((r) => r.invoiceLine === lineNum) || null;

  // Summary counts
  const matchedCount = invLines.filter((l) => l.matchStatus === 'matched').length;
  const totalCount = invLines.length;
  const hasExceptions = invLines.some((l) => ['exception', 'partial', 'unplanned'].includes(l.matchStatus));

  // Active guardrails on this invoice
  const allFlags = matchResults.flatMap((r) => r.guardrailFlags || []);
  const uniqueFlags = [...new Set(allFlags)];
  const activeGuardrails = uniqueFlags.map((gid) => guardrailDefs.find((g) => g.id === gid)).filter(Boolean);
  const hardCount = activeGuardrails.filter((g) => g.type === 'hard').length;
  const softCount = activeGuardrails.filter((g) => g.type === 'soft').length;
  const auditCount = activeGuardrails.filter((g) => g.type === 'audit').length;

  return (
    <Paper
      elevation={0}
      sx={{ mt: 2, borderRadius: 3, border: `1px solid ${borderColor}`, bgcolor: cardBg, overflow: 'hidden' }}
    >
      {/* Section Header */}
      <Box sx={{
        px: 2.5, py: 1.5,
        bgcolor: darkMode ? '#21262d' : '#f0f4f8',
        borderBottom: darkMode ? '2px solid #42a5f5' : `2px solid ${NAVY_BLUE}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: TILE_COLOR, boxShadow: `0 0 8px ${alpha(TILE_COLOR, 0.5)}` }} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: darkMode ? '#e6edf3' : TILE_COLOR, textTransform: 'uppercase', letterSpacing: 1 }}>
            Line-Item Match Engine
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={`${matchedCount}/${totalCount} lines matched`}
            size="small"
            sx={{
              bgcolor: matchedCount === totalCount ? alpha('#10b981', 0.12) : alpha('#f59e0b', 0.12),
              color: matchedCount === totalCount ? '#059669' : '#d97706',
              fontWeight: 700, fontSize: '0.65rem', height: 22,
            }}
          />
          {hasExceptions && (
            <Chip
              label={`${totalCount - matchedCount} exception${totalCount - matchedCount > 1 ? 's' : ''}`}
              size="small"
              sx={{ ...apTheme.chips.lineMatch.exception, height: 22, fontSize: '0.65rem' }}
            />
          )}
        </Stack>
      </Box>

      {/* Strategy Pipeline Bar */}
      <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: 1, overflowX: 'auto' }}>
        <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap', mr: 0.5 }}>
          6-Strategy Pipeline
        </Typography>
        {matchStrategies.map((s, idx) => {
          const StratIcon = strategyIcons[s.id];
          const usedOnThisInvoice = invLines.some((l) => l.matchStrategy === s.id);
          const chipStyle = apTheme.chips.matchStrategy[s.id] || {};
          return (
            <React.Fragment key={s.id}>
              <Tooltip title={`${s.name} (${s.weight}%) — ${s.description}`} arrow>
                <Chip
                  icon={StratIcon ? <StratIcon sx={{ fontSize: 12 }} /> : undefined}
                  label={`${s.name} ${s.weight}%`}
                  size="small"
                  sx={{
                    ...chipStyle,
                    height: 24,
                    fontSize: '0.6rem',
                    opacity: usedOnThisInvoice ? 1 : 0.4,
                    border: usedOnThisInvoice ? `1.5px solid ${chipStyle.color || '#64748b'}` : '1px solid transparent',
                  }}
                />
              </Tooltip>
              {idx < matchStrategies.length - 1 && (
                <Typography sx={{ fontSize: '0.6rem', color: alpha(textSecondary, 0.3) }}>|</Typography>
              )}
            </React.Fragment>
          );
        })}
      </Box>

      {/* Line Match Table */}
      <TableContainer sx={{ maxHeight: 400 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{
              '& th': {
                bgcolor: darkMode ? '#21262d' : '#f8fafc',
                color: darkMode ? '#e6edf3' : TILE_COLOR,
                fontSize: '0.62rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                borderBottom: `1px solid ${borderColor}`,
                py: 1,
              },
            }}>
              <TableCell sx={{ width: 32 }} />
              <TableCell sx={{ width: 40 }}>Line</TableCell>
              <TableCell>Invoice Description</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell align="right">Unit Price</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="center" sx={{ width: 30 }} />
              <TableCell sx={{ width: 40 }}>PO Ln</TableCell>
              <TableCell>PO Description</TableCell>
              <TableCell align="center">Strategy</TableCell>
              <TableCell align="center" sx={{ width: 55 }}>Conf.</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invLines.map((line) => (
              <MatchRow
                key={line.lineNum}
                invLine={line}
                poLine={getPoLine(line.poLine)}
                matchResult={getMatchResult(line.lineNum)}
                darkMode={darkMode}
                invoice={invoice}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Guardrails Summary */}
      <Box sx={{ px: 2.5, py: 2, borderTop: `1px solid ${borderColor}` }}>
        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.5 }}>
          Guardrails — {uniqueFlags.length} of {guardrailDefs.length} triggered
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          {/* Hard Stops */}
          <Box sx={{
            flex: 1, minWidth: 180, p: 1.5, borderRadius: 2,
            bgcolor: darkMode ? alpha('#ef4444', 0.06) : alpha('#ef4444', 0.03),
            border: `1px solid ${alpha('#ef4444', hardCount > 0 ? 0.3 : 0.1)}`,
          }}>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
              <BlockIcon sx={{ fontSize: 14, color: '#dc2626' }} />
              <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>
                Hard Stops ({hardCount})
              </Typography>
            </Stack>
            {guardrailDefs.filter((g) => g.type === 'hard').map((g) => {
              const triggered = uniqueFlags.includes(g.id);
              return (
                <Stack key={g.id} direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.3 }}>
                  {triggered
                    ? <BlockIcon sx={{ fontSize: 10, color: '#dc2626' }} />
                    : <CheckCircleIcon sx={{ fontSize: 10, color: '#059669' }} />
                  }
                  <Typography sx={{ fontSize: '0.6rem', color: triggered ? '#dc2626' : textSecondary, fontWeight: triggered ? 600 : 400 }}>
                    {g.name}
                  </Typography>
                </Stack>
              );
            })}
          </Box>

          {/* Soft Warnings */}
          <Box sx={{
            flex: 1, minWidth: 180, p: 1.5, borderRadius: 2,
            bgcolor: darkMode ? alpha('#f59e0b', 0.06) : alpha('#f59e0b', 0.03),
            border: `1px solid ${alpha('#f59e0b', softCount > 0 ? 0.3 : 0.1)}`,
          }}>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
              <WarningIcon sx={{ fontSize: 14, color: '#d97706' }} />
              <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>
                Soft Warnings ({softCount})
              </Typography>
            </Stack>
            {guardrailDefs.filter((g) => g.type === 'soft').map((g) => {
              const triggered = uniqueFlags.includes(g.id);
              return (
                <Stack key={g.id} direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.3 }}>
                  {triggered
                    ? <WarningIcon sx={{ fontSize: 10, color: '#d97706' }} />
                    : <CheckCircleIcon sx={{ fontSize: 10, color: '#059669' }} />
                  }
                  <Typography sx={{ fontSize: '0.6rem', color: triggered ? '#d97706' : textSecondary, fontWeight: triggered ? 600 : 400 }}>
                    {g.name}
                  </Typography>
                </Stack>
              );
            })}
          </Box>

          {/* Audit Rules */}
          <Box sx={{
            flex: 1, minWidth: 180, p: 1.5, borderRadius: 2,
            bgcolor: darkMode ? alpha(NAVY_BLUE, 0.06) : alpha(NAVY_BLUE, 0.03),
            border: `1px solid ${alpha(NAVY_BLUE, auditCount > 0 ? 0.3 : 0.1)}`,
          }}>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
              <VisibilityIcon sx={{ fontSize: 14, color: '#1565c0' }} />
              <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#1565c0', textTransform: 'uppercase' }}>
                Audit Rules ({auditCount})
              </Typography>
            </Stack>
            {guardrailDefs.filter((g) => g.type === 'audit').map((g) => {
              const triggered = uniqueFlags.includes(g.id);
              return (
                <Stack key={g.id} direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.3 }}>
                  {triggered
                    ? <VisibilityIcon sx={{ fontSize: 10, color: '#1565c0' }} />
                    : <CheckCircleIcon sx={{ fontSize: 10, color: '#059669' }} />
                  }
                  <Typography sx={{ fontSize: '0.6rem', color: triggered ? '#1565c0' : textSecondary, fontWeight: triggered ? 600 : 400 }}>
                    {g.name}
                  </Typography>
                </Stack>
              );
            })}
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};

export default LineItemMatchEngine;
