# DataGrid Drill-Down Pattern Documentation

## Overview
This document captures the drill-down navigation pattern implemented in `DCDemandAggregation.jsx` for reuse in other STOX.AI modules where hierarchical data navigation is needed.

---

## Use Case
When you have parent-child hierarchical data and want to:
- Show only parent rows in the main view
- Click on a parent row to navigate to a detailed view showing its children
- Maintain navigation context with breadcrumbs and back button

---

## Implementation Pattern

### 1. State Management

```javascript
const [data, setData] = useState([]);  // All data (parents + children)
const [drillDownView, setDrillDownView] = useState(null);  // null = parent view, object = drill-down
const [quickFilterText, setQuickFilterText] = useState('');  // Search state
```

**Key State:**
- `drillDownView`: When `null`, show parent view. When set to `{ parent: parentRow, children: childRows }`, show drill-down view.

---

### 2. Data Structure

**Parent Rows:**
```javascript
{
  id: 'DA0001',
  isParent: true,
  // ... parent-specific fields (aggregated data)
}
```

**Child Rows:**
```javascript
{
  id: 'DA0001-Retail',
  parentId: 'DA0001',
  isChild: true,
  // ... child-specific fields (detailed data)
}
```

**Important:** Store both parent and child rows in the same `data` array, linked via `parentId`.

---

### 3. Navigation Functions

```javascript
// Navigate to drill-down view
const handleDrillDown = (parentRow) => {
  const children = data.filter(row => row.parentId === parentRow.id);
  setDrillDownView({
    parent: parentRow,
    children: children,
  });
};

// Navigate back to parent view
const handleBackToParent = () => {
  setDrillDownView(null);
  setQuickFilterText(''); // Optional: reset search
};
```

---

### 4. Filtered Rows Logic

```javascript
const filteredRows = useMemo(() => {
  if (drillDownView) {
    // Drill-down view: show only children
    const searchText = quickFilterText.toLowerCase().trim();
    if (!searchText) return drillDownView.children;

    return drillDownView.children.filter(row => {
      const searchableText = [
        row.field1,
        row.field2,
        // ... add all searchable fields
      ].join(' ').toLowerCase();
      return searchableText.includes(searchText);
    });
  } else {
    // Parent view: show only parent rows
    const parentRows = data.filter(row => row.isParent);
    const searchText = quickFilterText.toLowerCase().trim();
    if (!searchText) return parentRows;

    return parentRows.filter(row => {
      const searchableText = [
        row.field1,
        row.field2,
        // ... add all searchable fields
      ].join(' ').toLowerCase();
      return searchableText.includes(searchText);
    });
  }
}, [data, drillDownView, quickFilterText]);
```

---

### 5. Column Definitions

Create separate column sets for parent and child views:

```javascript
// Parent view columns
const parentColumns = [
  {
    field: 'id',
    headerName: 'ID',
    renderCell: (params) => (
      <Chip
        label={params.value}
        onClick={() => handleDrillDown(params.row)}
        sx={{ cursor: 'pointer' }}
      />
    ),
  },
  // ... other parent-specific columns
];

// Child view columns
const childColumns = [
  {
    field: 'channel_name',
    headerName: 'Channel',
    // ... child-specific rendering
  },
  // ... other child-specific columns
];
```

---

### 6. Header with Dynamic Breadcrumbs

```javascript
<Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
  <Link onClick={onBack}>STOX.AI</Link>
  <Link onClick={onBack}>DC System</Link>
  {drillDownView ? (
    <>
      <Link onClick={handleBackToParent}>Demand Aggregation</Link>
      <Typography color="primary">Channel Breakdown</Typography>
    </>
  ) : (
    <Typography color="primary">Demand Aggregation</Typography>
  )}
</Breadcrumbs>
```

---

### 7. Context-Aware Back Button

```javascript
<Button
  startIcon={<ArrowBackIcon />}
  onClick={drillDownView ? handleBackToParent : onBack}
  variant="outlined"
>
  Back
</Button>
```

---

### 8. Dynamic Title

```javascript
<Typography variant="h4" fontWeight={700}>
  {drillDownView
    ? `Channel Breakdown: ${drillDownView.parent.id}`
    : 'DC Demand Aggregation'}
</Typography>

<Typography variant="body2" color="text.secondary">
  {drillDownView
    ? `${drillDownView.parent.dc_location} - ${drillDownView.parent.product_sku}`
    : 'Aggregate demand forecasts from all channels'}
</Typography>
```

---

### 9. Lineage Tracker (Optional)

Show visual navigation path in drill-down view:

```javascript
{drillDownView && (
  <Paper sx={{ p: 2, mb: 2, bgcolor: alpha('#0ea5e9', 0.08) }}>
    <Stack direction="row" alignItems="center" spacing={2}>
      <Typography variant="body2" fontWeight={600}>Viewing:</Typography>
      <Chip
        label="DC Aggregation"
        onClick={handleBackToParent}
        onDelete={handleBackToParent}
        sx={{ cursor: 'pointer' }}
      />
      <ChevronRight />
      <Chip
        label={drillDownView.parent.id}
        sx={{ bgcolor: alpha('#0ea5e9', 0.15) }}
      />
      <Box sx={{ ml: 2 }}>
        <Typography variant="caption">
          {drillDownView.parent.dc_location} • {drillDownView.parent.product_sku} •
          {drillDownView.children.length} Channels
        </Typography>
      </Box>
    </Stack>
  </Paper>
)}
```

---

### 10. DataGrid with Dynamic Columns

```javascript
<DataGrid
  rows={filteredRows}
  columns={drillDownView ? childColumns : parentColumns}
  onRowClick={!drillDownView ? (params) => handleDrillDown(params.row) : undefined}
  sx={{
    '& .MuiDataGrid-row': {
      cursor: !drillDownView ? 'pointer' : 'default',
    },
  }}
/>
```

---

### 11. Conditional Metric Cards

```javascript
{metrics && !drillDownView && (
  <Grid container spacing={2}>
    {/* Show summary metrics only in parent view */}
  </Grid>
)}
```

---

## Key Features

### ✅ **Clean Separation**
- Parent view shows aggregated summary data
- Child view shows detailed breakdown
- No mixed rows in the table

### ✅ **Navigation Clarity**
- Breadcrumbs show current location
- Back button always works correctly
- Lineage tracker shows drill-down path

### ✅ **Search Works in Both Views**
- Parent view: searches parent fields
- Child view: searches child fields
- Filter state preserved during navigation

### ✅ **Click Anywhere**
- Click ID chip to drill down
- Click entire row to drill down (in parent view)
- Multiple entry points for better UX

---

## When to Use This Pattern

**✅ Good Use Cases:**
- Store → Products breakdown
- DC → SKU/Channel breakdown
- Supplier → Orders breakdown
- Category → Subcategory breakdown
- Any 1:N hierarchical relationship

**❌ Not Recommended For:**
- Simple parent-child where both levels fit comfortably on screen
- More than 2 levels deep (use tree data or different pattern)
- Real-time collaborative editing (state management complexity)

---

## Performance Considerations

- **Small datasets (<1000 rows)**: Works perfectly
- **Medium datasets (1000-5000 rows)**: Use pagination and virtualization
- **Large datasets (>5000 rows)**: Consider server-side filtering and pagination

---

## Accessibility

- ✅ Keyboard navigation supported
- ✅ Screen reader friendly breadcrumbs
- ✅ Clear focus indicators
- ✅ Semantic HTML structure

---

## Example Files

**Reference Implementation:**
- `/frontend/src/components/stox/DCDemandAggregation.jsx`

**Key Lines:**
- State: Lines 16-19
- Navigation: Lines 138-150
- Filtered Rows: Lines 157-191
- Columns: Lines 193-447
- UI: Lines 455-650

---

## Migration from Inline Expansion

If converting from expand/collapse to drill-down:

1. **Remove:**
   - `expandedRows` state
   - `toggleRowExpansion` function
   - Expand/collapse icons column
   - `getVisibleRows()` filtering logic

2. **Add:**
   - `drillDownView` state
   - `handleDrillDown` function
   - `handleBackToParent` function
   - Separate parent/child column definitions

3. **Update:**
   - `filteredRows` logic to switch based on view
   - Breadcrumbs to show drill-down state
   - Back button to handle both levels
   - DataGrid `columns` prop to be dynamic

---

## Summary

The drill-down pattern provides:
- **Cleaner UI**: No cluttered inline rows
- **Better scalability**: Works with large datasets
- **Clearer navigation**: Explicit view transitions
- **Better UX**: Full-screen detail views
- **Easier maintenance**: Separate concerns for parent/child

Use this pattern when you need hierarchical navigation with clear separation between summary and detail views.
