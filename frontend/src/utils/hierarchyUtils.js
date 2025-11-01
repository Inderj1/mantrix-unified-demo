/**
 * Hierarchy Utilities for STOX.AI Tree Data Structures
 *
 * Functions to transform flat data into hierarchical tree structures
 * for use with TreeDataGrid component
 */

/**
 * Build hierarchical tree data from flat array
 *
 * @param {Array} flatData - Flat array of data rows
 * @param {Object} config - Configuration object
 * @param {string} config.groupBy - Field to group by for parent rows
 * @param {Function} config.aggregateFn - Function to aggregate child rows into parent
 * @param {Function} config.childrenFn - Function to generate children for a parent
 * @returns {Array} Hierarchical array with parentId and level metadata
 */
export const buildTreeData = (flatData, config) => {
  const { groupBy, aggregateFn, childrenFn } = config;
  const treeRows = [];

  if (!groupBy || !aggregateFn) {
    // No hierarchy - return flat data with level 0
    return flatData.map(row => ({ ...row, level: 0 }));
  }

  // Group data by specified field
  const grouped = {};
  flatData.forEach(row => {
    const key = row[groupBy];
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(row);
  });

  // Create parent and child rows
  Object.entries(grouped).forEach(([groupKey, children], index) => {
    // Create parent row using aggregation function
    const parentRow = aggregateFn(groupKey, children);
    parentRow.level = 0;
    parentRow.isParent = true;
    treeRows.push(parentRow);

    // Add children if childrenFn provided
    if (childrenFn) {
      const childRows = childrenFn(groupKey, children, parentRow.id);
      childRows.forEach(child => {
        child.parentId = parentRow.id;
        child.level = 1;
        treeRows.push(child);
      });
    } else {
      // Default: add original children
      children.forEach(child => {
        treeRows.push({
          ...child,
          parentId: parentRow.id,
          level: 1,
        });
      });
    }
  });

  return treeRows;
};

/**
 * Build 3-level hierarchy (Parent → Child → Grandchild)
 *
 * @param {Array} flatData - Flat array of data
 * @param {Object} config - Configuration for 3 levels
 * @param {Object} config.level1 - Level 1 (parent) configuration
 * @param {Object} config.level2 - Level 2 (child) configuration
 * @param {Object} config.level3 - Level 3 (grandchild) configuration
 * @returns {Array} 3-level hierarchical array
 */
export const buildThreeLevelTree = (flatData, config) => {
  const { level1, level2, level3 } = config;
  const treeRows = [];

  // Level 1: Group by first field
  const level1Groups = {};
  flatData.forEach(row => {
    const key = row[level1.groupBy];
    if (!level1Groups[key]) {
      level1Groups[key] = [];
    }
    level1Groups[key].push(row);
  });

  // Create level 1 parent rows
  Object.entries(level1Groups).forEach(([groupKey1, rows1]) => {
    const parent = level1.aggregateFn(groupKey1, rows1);
    parent.level = 0;
    parent.isParent = true;
    treeRows.push(parent);

    // Level 2: Group level 1 children by second field
    if (level2) {
      const level2Groups = {};
      rows1.forEach(row => {
        const key = row[level2.groupBy];
        if (!level2Groups[key]) {
          level2Groups[key] = [];
        }
        level2Groups[key].push(row);
      });

      // Create level 2 child rows
      Object.entries(level2Groups).forEach(([groupKey2, rows2]) => {
        const child = level2.aggregateFn(groupKey2, rows2, parent.id);
        child.parentId = parent.id;
        child.level = 1;
        child.isParent = level3 ? true : false;
        treeRows.push(child);

        // Level 3: Add grandchildren
        if (level3 && level3.childrenFn) {
          const grandchildren = level3.childrenFn(groupKey2, rows2, child.id);
          grandchildren.forEach(grandchild => {
            grandchild.parentId = child.id;
            grandchild.level = 2;
            treeRows.push(grandchild);
          });
        } else if (level3) {
          // Default: add original rows as grandchildren
          rows2.forEach(row => {
            treeRows.push({
              ...row,
              parentId: child.id,
              level: 2,
            });
          });
        }
      });
    }
  });

  return treeRows;
};

/**
 * Aggregate numeric fields from array of child rows
 *
 * @param {Array} children - Array of child rows
 * @param {Array} fields - Array of field names to sum
 * @returns {Object} Object with aggregated sums
 */
export const aggregateSum = (children, fields) => {
  const aggregated = {};
  fields.forEach(field => {
    aggregated[field] = children.reduce((sum, child) => sum + (child[field] || 0), 0);
  });
  return aggregated;
};

/**
 * Calculate average of numeric fields from array of child rows
 *
 * @param {Array} children - Array of child rows
 * @param {Array} fields - Array of field names to average
 * @returns {Object} Object with averaged values
 */
export const aggregateAvg = (children, fields) => {
  const aggregated = {};
  fields.forEach(field => {
    const sum = children.reduce((acc, child) => acc + (child[field] || 0), 0);
    aggregated[field] = Math.round(sum / children.length);
  });
  return aggregated;
};

/**
 * Count occurrences by a specific field value
 *
 * @param {Array} children - Array of child rows
 * @param {string} field - Field to count
 * @param {*} value - Value to count
 * @returns {number} Count of matching rows
 */
export const countByValue = (children, field, value) => {
  return children.filter(child => child[field] === value).length;
};

/**
 * Get unique values from a field across children
 *
 * @param {Array} children - Array of child rows
 * @param {string} field - Field to extract unique values from
 * @returns {Array} Array of unique values
 */
export const getUniqueValues = (children, field) => {
  return [...new Set(children.map(child => child[field]))];
};
