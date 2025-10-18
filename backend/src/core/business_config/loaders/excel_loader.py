"""Excel loader for business configurations."""

import pandas as pd
from typing import Dict, List, Optional, Any
import structlog
from pathlib import Path

from ..models import (
    GLAccountMapping,
    GLMappingConfig,
    MaterialGroupHierarchy,
    HierarchyDefinition,
    HierarchyLevel,
    HierarchyType,
    AggregationType
)

logger = structlog.get_logger()


class ExcelLoader:
    """Load business configurations from Excel files."""
    
    def __init__(self):
        self.logger = logger.bind(loader="excel")
    
    def load_gl_mappings(self, file_path: str, 
                        gl_column: str = "G/L Account",
                        desc_column: str = "G/L Acct Long Text",
                        bucket_id_column: str = "CM_SS_GLACCOUNT_BUCKET_ID ",
                        bucket_desc_column: str = "CM_SS_GLACCOUNT_BUCKET_Desc ") -> GLMappingConfig:
        """Load GL account mappings from Excel file."""
        self.logger.info(f"Loading GL mappings from {file_path}")
        
        try:
            # Read Excel file
            df = pd.read_excel(file_path)
            
            # Clean column names (remove trailing spaces)
            df.columns = df.columns.str.strip()
            
            # Handle column name variations
            if bucket_id_column.strip() in df.columns:
                bucket_id_column = bucket_id_column.strip()
            if bucket_desc_column.strip() in df.columns:
                bucket_desc_column = bucket_desc_column.strip()
            
            # Create GL mappings
            mappings = []
            for _, row in df.iterrows():
                if pd.notna(row.get(gl_column)):
                    mapping = GLAccountMapping(
                        gl_account=str(row[gl_column]),
                        description=str(row.get(desc_column, "")),
                        bucket_id=str(row.get(bucket_id_column, "UNMAPPED")),
                        bucket_name=str(row.get(bucket_desc_column, "Unmapped"))
                    )
                    mappings.append(mapping)
            
            # Create hierarchy definition for GL accounts
            hierarchy = self._create_gl_hierarchy(df, bucket_id_column, bucket_desc_column)
            
            # Create GL mapping config
            config = GLMappingConfig(
                mappings=mappings,
                hierarchy=hierarchy,
                unmapped_behavior="warn"
            )
            
            self.logger.info(f"Loaded {len(mappings)} GL account mappings")
            return config
            
        except Exception as e:
            self.logger.error(f"Failed to load GL mappings: {e}")
            raise
    
    def load_material_hierarchy(self, file_path: str, 
                               main_sheet: str = "Main",
                               mg_sheets: Optional[Dict[str, str]] = None) -> MaterialGroupHierarchy:
        """Load material group hierarchy from Excel file."""
        self.logger.info(f"Loading material hierarchy from {file_path}")
        
        if mg_sheets is None:
            mg_sheets = {
                "mg1": "Material Group 1",
                "mg2": "Material Group 2", 
                "mg3": "Material Group 3",
                "mg4": "Material Group 4",
                "mg5": "Material Group 5"
            }
        
        try:
            hierarchy = MaterialGroupHierarchy()
            
            # Load each material group sheet
            for sheet_name, column_prefix in mg_sheets.items():
                try:
                    df = pd.read_excel(file_path, sheet_name=sheet_name)
                    
                    # Get mappings from code to description
                    mappings = {}
                    for _, row in df.iterrows():
                        code = str(row.iloc[0]) if pd.notna(row.iloc[0]) else None
                        desc = str(row.iloc[1]) if pd.notna(row.iloc[1]) else None
                        
                        if code and desc:
                            # Remove .0 from numeric codes
                            if code.endswith('.0'):
                                code = code[:-2]
                            mappings[code] = desc
                    
                    # Assign to appropriate level
                    if sheet_name == "mg1":
                        hierarchy.mg1_business_unit = mappings
                    elif sheet_name == "mg2":
                        hierarchy.mg2_brand = mappings
                    elif sheet_name == "mg3":
                        hierarchy.mg3_type = mappings
                    elif sheet_name == "mg4":
                        hierarchy.mg4_classification = mappings
                    elif sheet_name == "mg5":
                        hierarchy.mg5_flavor = mappings
                    
                    self.logger.info(f"Loaded {len(mappings)} mappings for {sheet_name}")
                    
                except Exception as e:
                    self.logger.warning(f"Could not load sheet {sheet_name}: {e}")
            
            return hierarchy
            
        except Exception as e:
            self.logger.error(f"Failed to load material hierarchy: {e}")
            raise
    
    def _create_gl_hierarchy(self, df: pd.DataFrame, 
                           bucket_id_col: str, 
                           bucket_desc_col: str) -> HierarchyDefinition:
        """Create GL hierarchy definition from bucket mappings."""
        # Get unique buckets
        buckets = df[[bucket_id_col, bucket_desc_col]].drop_duplicates()
        buckets = buckets[buckets[bucket_id_col].notna()]
        
        # Create hierarchy levels
        levels = []
        
        # L1: Financial statement level (Revenue, COGS, OPEX, etc.)
        l1_mapping = {
            "Revenue": "REVENUE",
            "COGS": "COGS",
            "Selling Expenses": "OPEX_SALES",
            "G&A Expenses": "OPEX_ADMIN",
            "R&D Expenses": "OPEX_RND",
            "Other Income/Expense": "OTHER",
            "Depreciation & Amortization": "DEPRECIATION"
        }
        
        levels.append(HierarchyLevel(
            level_number=1,
            level_name="Financial Statement Category",
            level_code="L1_FINANCIAL",
            aggregation_rule=AggregationType.SUM.value
        ))
        
        # L2: Bucket level
        levels.append(HierarchyLevel(
            level_number=2,
            level_name="GL Bucket",
            level_code="L2_BUCKET",
            parent_level="L1_FINANCIAL",
            aggregation_rule=AggregationType.SUM.value
        ))
        
        # L3: Individual GL accounts
        levels.append(HierarchyLevel(
            level_number=3,
            level_name="GL Account",
            level_code="L3_ACCOUNT",
            parent_level="L2_BUCKET",
            aggregation_rule=AggregationType.SUM.value
        ))
        
        hierarchy = HierarchyDefinition(
            hierarchy_type=HierarchyType.GL_ACCOUNT.value,
            hierarchy_name="GL Account Hierarchy",
            description="Three-level GL account hierarchy",
            levels=levels,
            root_level="L1_FINANCIAL"
        )
        
        return hierarchy
    
    def load_complete_configuration(self, 
                                  gl_file: str,
                                  material_file: Optional[str] = None) -> Dict[str, Any]:
        """Load complete configuration from Excel files."""
        config = {}
        
        # Load GL mappings
        if gl_file and Path(gl_file).exists():
            config['gl_mappings'] = self.load_gl_mappings(gl_file)
        
        # Load material hierarchy
        if material_file and Path(material_file).exists():
            config['material_hierarchy'] = self.load_material_hierarchy(material_file)
        
        return config