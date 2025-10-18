"""Business configuration data models for multi-tenant support."""

from typing import Dict, List, Optional, Set, Tuple, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from enum import Enum


class HierarchyType(Enum):
    """Types of hierarchies supported."""
    GL_ACCOUNT = "gl_account"
    MATERIAL = "material"
    COST_CENTER = "cost_center"
    PROFIT_CENTER = "profit_center"
    CUSTOMER = "customer"
    VENDOR = "vendor"
    CUSTOM = "custom"


class AggregationType(Enum):
    """Types of aggregation rules."""
    SUM = "sum"
    AVG = "average"
    MIN = "minimum"
    MAX = "maximum"
    COUNT = "count"
    CUSTOM = "custom"


class GLAccountMapping(BaseModel):
    """Individual GL account mapping."""
    gl_account: str
    description: str
    bucket_id: str
    bucket_name: str
    account_type: Optional[str] = None  # asset, liability, revenue, expense
    is_active: bool = True
    custom_attributes: Dict[str, Any] = {}


class MaterialGroupLevel(BaseModel):
    """Material group hierarchy level definition."""
    level: int  # 1-5 for MG1-MG5
    code: str
    description: str
    parent_code: Optional[str] = None


class MaterialGroupHierarchy(BaseModel):
    """Complete material group hierarchy."""
    mg1_business_unit: Dict[str, str] = {}  # code -> description
    mg2_brand: Dict[str, str] = {}
    mg3_type: Dict[str, str] = {}
    mg4_classification: Dict[str, str] = {}
    mg5_flavor: Dict[str, str] = {}
    
    def get_hierarchy_path(self, mg1: str, mg2: str = None, mg3: str = None, 
                          mg4: str = None, mg5: str = None) -> List[str]:
        """Get the full hierarchy path for a material."""
        path = []
        if mg1 and mg1 in self.mg1_business_unit:
            path.append(f"BU:{self.mg1_business_unit[mg1]}")
        if mg2 and mg2 in self.mg2_brand:
            path.append(f"Brand:{self.mg2_brand[mg2]}")
        if mg3 and mg3 in self.mg3_type:
            path.append(f"Type:{self.mg3_type[mg3]}")
        if mg4 and mg4 in self.mg4_classification:
            path.append(f"Class:{self.mg4_classification[mg4]}")
        if mg5 and mg5 in self.mg5_flavor:
            path.append(f"Flavor:{self.mg5_flavor[mg5]}")
        return path


class HierarchyLevel(BaseModel):
    """Definition of a hierarchy level."""
    model_config = ConfigDict(use_enum_values=True)
    
    level_number: int
    level_name: str
    level_code: str
    parent_level: Optional[str] = None
    aggregation_rule: AggregationType = AggregationType.SUM
    custom_formula: Optional[str] = None


class HierarchyDefinition(BaseModel):
    """Complete hierarchy definition."""
    model_config = ConfigDict(use_enum_values=True)
    
    hierarchy_type: HierarchyType
    hierarchy_name: str
    description: str
    levels: List[HierarchyLevel]
    root_level: str
    
    def get_level_by_number(self, level_num: int) -> Optional[HierarchyLevel]:
        """Get hierarchy level by number."""
        for level in self.levels:
            if level.level_number == level_num:
                return level
        return None


class GLMappingConfig(BaseModel):
    """GL account mapping configuration."""
    model_config = ConfigDict(use_enum_values=True)
    
    mappings: List[GLAccountMapping]
    hierarchy: HierarchyDefinition
    default_bucket: Optional[str] = None
    unmapped_behavior: str = "error"  # error, warn, default
    
    def get_bucket_for_account(self, gl_account: str) -> Optional[str]:
        """Get bucket ID for a GL account."""
        for mapping in self.mappings:
            if mapping.gl_account == gl_account:
                return mapping.bucket_id
        return self.default_bucket if self.unmapped_behavior == "default" else None


class BusinessRule(BaseModel):
    """Business rule definition."""
    rule_id: str
    rule_name: str
    description: str
    rule_type: str  # calculation, validation, transformation
    condition: Optional[str] = None
    formula: str
    applies_to: List[str] = []  # hierarchy levels or specific items
    priority: int = 0
    is_active: bool = True
    
    def evaluate(self, context: Dict[str, Any]) -> Any:
        """Evaluate the business rule (placeholder for actual implementation)."""
        # This would be implemented with a safe expression evaluator
        pass


class DimensionConfig(BaseModel):
    """Custom dimension configuration."""
    dimension_name: str
    dimension_code: str
    description: str
    data_type: str  # string, number, date, boolean
    allowed_values: Optional[List[Any]] = None
    hierarchy: Optional[HierarchyDefinition] = None
    default_value: Optional[Any] = None
    is_required: bool = False


class EntityRelationship(BaseModel):
    """Relationship between business entities."""
    relationship_id: str
    source_entity: str
    source_field: str
    target_entity: str
    target_field: str
    relationship_type: str  # one-to-one, one-to-many, many-to-many
    is_mandatory: bool = False
    cascade_operations: List[str] = []  # update, delete


class BusinessConfiguration(BaseModel):
    """Complete business configuration for a client/dataset."""
    model_config = ConfigDict(use_enum_values=True)
    
    client_id: str
    dataset_id: str
    version: str
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Core configurations
    hierarchies: Dict[str, HierarchyDefinition] = {}
    gl_mappings: Optional[GLMappingConfig] = None
    material_hierarchy: Optional[MaterialGroupHierarchy] = None
    
    # Business rules and logic
    business_rules: List[BusinessRule] = []
    custom_dimensions: Dict[str, DimensionConfig] = {}
    relationships: List[EntityRelationship] = []
    
    # Metadata
    description: Optional[str] = None
    tags: List[str] = []
    is_active: bool = True
    
    def get_hierarchy(self, hierarchy_type: str) -> Optional[HierarchyDefinition]:
        """Get hierarchy definition by type."""
        return self.hierarchies.get(hierarchy_type)
    
    def get_active_rules(self) -> List[BusinessRule]:
        """Get all active business rules."""
        return [rule for rule in self.business_rules if rule.is_active]
    
    def validate(self) -> List[str]:
        """Validate the configuration."""
        errors = []
        
        # Validate GL mappings
        if self.gl_mappings:
            account_set = set()
            for mapping in self.gl_mappings.mappings:
                if mapping.gl_account in account_set:
                    errors.append(f"Duplicate GL account: {mapping.gl_account}")
                account_set.add(mapping.gl_account)
        
        # Validate hierarchies
        for hierarchy_name, hierarchy in self.hierarchies.items():
            if not hierarchy.levels:
                errors.append(f"Hierarchy {hierarchy_name} has no levels defined")
        
        return errors