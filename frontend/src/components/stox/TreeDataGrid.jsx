import React, { useState, useMemo } from 'react';
import { Box, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ChevronRight, ExpandMore } from '@mui/icons-material';

/**
 * TreeDataGrid - Reusable DataGrid with hierarchical drill-down capability
 *
 * Adds SAP-style chevron expansion (▶/▼) to MUI DataGrid for parent-child relationships
 *
 * @param {Array} rows - Flat array of data rows with hierarchy metadata
 * @param {Array} columns - Column definitions (chevron column will be prepended)
 * @param {Object} gridProps - Additional DataGrid props to pass through
 */
const TreeDataGrid = ({ rows, columns, ...gridProps }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (rowId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
      // Collapse all descendants
      const collapseDescendants = (parentId) => {
        rows.forEach(row => {
          if (row.parentId === parentId) {
            newExpanded.delete(row.id);
            collapseDescendants(row.id);
          }
        });
      };
      collapseDescendants(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  // Filter rows based on expansion state
  const visibleRows = useMemo(() => {
    const visible = [];
    const processRow = (row, parentExpanded = true) => {
      if (!row.parentId || parentExpanded) {
        visible.push(row);
        const isExpanded = expandedRows.has(row.id);
        // Find and process children
        rows.forEach(child => {
          if (child.parentId === row.id) {
            processRow(child, isExpanded);
          }
        });
      }
    };

    // Process root rows (no parentId)
    rows.forEach(row => {
      if (!row.parentId) {
        processRow(row);
      }
    });

    return visible;
  }, [rows, expandedRows]);

  // Chevron column definition
  const chevronColumn = {
    field: '__chevron',
    headerName: '',
    width: 60,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    renderCell: (params) => {
      const row = params.row;
      const hasChildren = rows.some(r => r.parentId === row.id);

      if (!hasChildren) {
        return <Box sx={{ width: 40 }} />;
      }

      const isExpanded = expandedRows.has(row.id);

      return (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            toggleRow(row.id);
          }}
          sx={{ ml: row.level * 2 }}
        >
          {isExpanded ? (
            <ExpandMore sx={{ fontSize: 20, color: '#2b88d8' }} />
          ) : (
            <ChevronRight sx={{ fontSize: 20, color: '#64748b' }} />
          )}
        </IconButton>
      );
    },
  };

  // Prepend chevron column to existing columns
  const enhancedColumns = [chevronColumn, ...columns];

  // Apply row styling based on hierarchy level
  const getRowClassName = (params) => {
    const level = params.row.level || 0;
    const isParent = rows.some(r => r.parentId === params.row.id);

    if (level === 0 && isParent) return 'tree-row-parent';
    if (level === 1) return 'tree-row-child';
    if (level === 2) return 'tree-row-grandchild';
    return '';
  };

  return (
    <DataGrid
      {...gridProps}
      rows={visibleRows}
      columns={enhancedColumns}
      getRowClassName={getRowClassName}
      density="compact"
      disableRowSelectionOnClick
      sx={{
        ...gridProps.sx,
        '& .tree-row-parent': {
          bgcolor: 'rgba(59, 130, 246, 0.08)',
          fontWeight: 700,
          fontSize: '0.85rem',
          '&:hover': {
            bgcolor: 'rgba(59, 130, 246, 0.12)',
          },
        },
        '& .tree-row-child': {
          bgcolor: 'rgba(248, 250, 252, 1)',
          fontWeight: 500,
          fontSize: '0.8rem',
          '&:hover': {
            bgcolor: 'rgba(59, 130, 246, 0.05)',
          },
          '& .MuiDataGrid-cell': {
            paddingLeft: (theme) => theme.spacing(3),
          },
        },
        '& .tree-row-grandchild': {
          bgcolor: 'rgba(241, 245, 249, 1)',
          fontWeight: 400,
          fontSize: '0.75rem',
          '&:hover': {
            bgcolor: 'rgba(59, 130, 246, 0.03)',
          },
          '& .MuiDataGrid-cell': {
            paddingLeft: (theme) => theme.spacing(6),
          },
        },
      }}
    />
  );
};

export default TreeDataGrid;
