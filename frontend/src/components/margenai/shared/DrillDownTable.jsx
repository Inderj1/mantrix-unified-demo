import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  IconButton,
  Tooltip,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  ZoomIn as ZoomInIcon,
  GetApp as DownloadIcon,
} from '@mui/icons-material';

const DrillDownTable = ({
  data,
  columns,
  onRowClick,
  onCellClick,
  expandableRowRender,
  drillDownPath = [],
  showPagination = true,
  defaultRowsPerPage = 10,
  showActions = true,
  onExport,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [expandedRows, setExpandedRows] = useState(new Set());

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleRowClick = (row, event) => {
    // Don't trigger row click if clicking on action buttons
    if (event.target.closest('.action-button')) {
      return;
    }
    
    if (onRowClick) {
      onRowClick(row);
    }
  };

  const handleCellClick = (row, column, event) => {
    event.stopPropagation();
    if (onCellClick) {
      onCellClick(row, column);
    }
  };

  const toggleRowExpansion = (rowId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  const sortedData = React.useMemo(() => {
    if (!orderBy) return data;

    return [...data].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (bValue < aValue) {
        return order === 'asc' ? 1 : -1;
      }
      if (bValue > aValue) {
        return order === 'asc' ? -1 : 1;
      }
      return 0;
    });
  }, [data, orderBy, order]);

  const paginatedData = showPagination
    ? sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : sortedData;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderCellValue = (row, column) => {
    const value = row[column.id];
    
    if (column.format) {
      return column.format(value, row);
    }
    
    if (column.type === 'chip' && value) {
      return (
        <Chip 
          label={value} 
          size="small" 
          color={column.getColor ? column.getColor(value) : 'default'}
        />
      );
    }
    
    if (column.type === 'progress' && typeof value === 'number') {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ flex: 1, height: 6, bgcolor: 'grey.300', borderRadius: 1 }}>
            <Box 
              sx={{ 
                width: `${Math.min(100, value)}%`, 
                height: '100%', 
                bgcolor: value >= 80 ? 'success.main' : value >= 50 ? 'warning.main' : 'error.main',
                borderRadius: 1,
                transition: 'width 0.3s ease'
              }} 
            />
          </Box>
          <Typography variant="caption">{value}%</Typography>
        </Box>
      );
    }
    
    return value;
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {expandableRowRender && (
                <TableCell padding="checkbox" />
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {showActions && (
                <TableCell align="center" style={{ minWidth: 100 }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => {
              const rowId = row.id || index;
              const isExpanded = expandedRows.has(rowId);
              
              return (
                <React.Fragment key={rowId}>
                  <TableRow
                    hover
                    onClick={(event) => handleRowClick(row, event)}
                    sx={{ 
                      cursor: onRowClick ? 'pointer' : 'default',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }}
                  >
                    {expandableRowRender && (
                      <TableCell padding="checkbox">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRowExpansion(rowId);
                          }}
                          className="action-button"
                        >
                          {isExpanded ? <ArrowUpIcon /> : <ArrowDownIcon />}
                        </IconButton>
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align || 'left'}
                        onClick={(event) => column.clickable && handleCellClick(row, column, event)}
                        sx={{
                          cursor: column.clickable ? 'pointer' : 'default',
                          '&:hover': column.clickable ? {
                            backgroundColor: 'action.selected',
                            textDecoration: 'underline'
                          } : {}
                        }}
                      >
                        {renderCellValue(row, column)}
                      </TableCell>
                    ))}
                    {showActions && (
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRowClick && onRowClick(row);
                            }}
                            className="action-button"
                          >
                            <ZoomInIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {onExport && (
                          <Tooltip title="Export">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onExport(row);
                              }}
                              className="action-button"
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                  {expandableRowRender && isExpanded && (
                    <TableRow>
                      <TableCell colSpan={columns.length + (showActions ? 2 : 1)}>
                        <Box sx={{ py: 2 }}>
                          {expandableRowRender(row)}
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (expandableRowRender ? 1 : 0) + (showActions ? 1 : 0)} 
                  align="center"
                >
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No data available
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {showPagination && data.length > rowsPerPage && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Paper>
  );
};

export default DrillDownTable;