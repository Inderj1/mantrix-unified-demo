"""Schema-aware SQL generation helpers to avoid type casting issues."""

from typing import Dict, List, Any, Optional
import structlog

logger = structlog.get_logger()


class SchemaAwareGenerator:
    """Helper class to generate SQL with awareness of column types."""
    
    def __init__(self):
        self.numeric_types = {
            'FLOAT64', 'FLOAT', 'NUMERIC', 'DECIMAL', 'BIGNUMERIC',
            'INT64', 'INT', 'INTEGER', 'SMALLINT', 'BIGINT'
        }
        self.string_types = {'STRING', 'VARCHAR', 'TEXT', 'CHAR'}
        self.date_types = {'DATE', 'DATETIME', 'TIMESTAMP', 'TIME'}
        
    def get_column_type(self, column_name: str, table_schemas: List[Dict[str, Any]]) -> Optional[str]:
        """Get the data type of a column from table schemas."""
        for schema in table_schemas:
            for col in schema.get('columns', []):
                if col['name'].lower() == column_name.lower():
                    return col['type'].upper()
        return None
    
    def needs_casting(self, column_name: str, target_type: str, table_schemas: List[Dict[str, Any]]) -> bool:
        """Check if a column needs casting to the target type."""
        current_type = self.get_column_type(column_name, table_schemas)
        if not current_type:
            return True  # If we can't find the type, be safe and cast
        
        target_type_upper = target_type.upper()
        
        # If already the right type family, no cast needed
        if target_type_upper in self.numeric_types and current_type in self.numeric_types:
            return False
        if target_type_upper in self.string_types and current_type in self.string_types:
            return False
        if target_type_upper in self.date_types and current_type in self.date_types:
            return False
            
        return True
    
    def safe_numeric_aggregation(self, column_name: str, table_schemas: List[Dict[str, Any]], 
                                aggregation: str = 'SUM') -> str:
        """Generate safe numeric aggregation avoiding unnecessary casts."""
        column_type = self.get_column_type(column_name, table_schemas)
        
        if column_type and column_type in self.numeric_types:
            # Column is already numeric, no cast needed
            return f"{aggregation}({column_name})"
        elif column_type and column_type in self.string_types:
            # String column, needs safe casting
            return f"{aggregation}(SAFE_CAST({column_name} AS FLOAT64))"
        else:
            # Unknown type, use safe cast
            return f"{aggregation}(SAFE_CAST({column_name} AS FLOAT64))"
    
    def generate_safe_where_clause(self, column_name: str, value: Any, 
                                  table_schemas: List[Dict[str, Any]]) -> str:
        """Generate a safe WHERE clause considering column types."""
        column_type = self.get_column_type(column_name, table_schemas)
        
        if column_type:
            if column_type in self.numeric_types:
                # Numeric comparison
                if isinstance(value, str) and value.strip() == '':
                    return f"{column_name} IS NOT NULL"
                return f"{column_name} = {value}"
            elif column_type in self.string_types:
                # String comparison
                return f"{column_name} = '{value}'"
            elif column_type in self.date_types:
                # Date comparison
                return f"{column_name} = '{value}'"
        
        # Default safe comparison
        return f"{column_name} = '{value}'"
    
    def enhance_prompt_with_type_info(self, prompt: str, table_schemas: List[Dict[str, Any]]) -> str:
        """Enhance the prompt with explicit type information."""
        type_info = ["\n\nIMPORTANT: Column Type Information:"]
        
        for schema in table_schemas:
            table_name = schema['table_name']
            numeric_cols = []
            string_cols = []
            date_cols = []
            
            for col in schema.get('columns', []):
                col_type = col['type'].upper()
                if col_type in self.numeric_types:
                    numeric_cols.append(col['name'])
                elif col_type in self.string_types:
                    string_cols.append(col['name'])
                elif col_type in self.date_types:
                    date_cols.append(col['name'])
            
            if numeric_cols or string_cols or date_cols:
                type_info.append(f"\nTable {table_name}:")
                if numeric_cols:
                    type_info.append(f"  - Numeric columns (NO CAST needed for SUM/AVG): {', '.join(numeric_cols[:10])}")
                if string_cols:
                    type_info.append(f"  - String columns (need CAST for numeric operations): {', '.join(string_cols[:10])}")
                if date_cols:
                    type_info.append(f"  - Date/Time columns: {', '.join(date_cols[:10])}")
        
        type_info.append("\nDO NOT use CAST on numeric columns when performing SUM, AVG, etc.")
        type_info.append("DO NOT use NULLIF with empty string ('') on numeric columns.")
        
        return prompt + '\n'.join(type_info)