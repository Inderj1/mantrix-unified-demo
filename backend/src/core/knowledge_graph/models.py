"""Data models for the financial knowledge graph."""

from typing import Dict, List, Optional, Any
from enum import Enum
from dataclasses import dataclass
from datetime import datetime


class NodeType(Enum):
    """Types of nodes in the financial knowledge graph."""
    L1_METRIC = "L1Metric"
    L2_BUCKET = "L2Bucket" 
    GL_ACCOUNT = "GLAccount"
    DIMENSION = "Dimension"
    TIME_PERIOD = "TimePeriod"
    BUSINESS_RULE = "BusinessRule"
    CALCULATION = "Calculation"
    TABLE = "Table"
    COLUMN = "Column"
    FORMULA = "Formula"
    SYNONYM = "Synonym"
    EXAMPLE = "Example"
    CLIENT = "Client"
    DATASET = "Dataset"
    QUERY_TEMPLATE = "QueryTemplate"


class RelationType(Enum):
    """Types of relationships in the knowledge graph."""
    CONTAINS = "CONTAINS"
    CALCULATES_FROM = "CALCULATES_FROM"
    PART_OF = "PART_OF"
    MAPS_TO = "MAPS_TO"
    FILTERED_BY = "FILTERED_BY"
    GROUPED_BY = "GROUPED_BY"
    USES_FORMULA = "USES_FORMULA"
    HAS_SYNONYM = "HAS_SYNONYM"
    SYNONYM_OF = "SYNONYM_OF"
    REQUIRES = "REQUIRES"
    EXAMPLE_OF = "EXAMPLE_OF"
    DERIVED_FROM = "DERIVED_FROM"
    TEMPORAL_NEXT = "TEMPORAL_NEXT"
    AGGREGATES_TO = "AGGREGATES_TO"
    BELONGS_TO = "BELONGS_TO"
    USES_TABLE = "USES_TABLE"
    HAS_COLUMN = "HAS_COLUMN"
    APPLIES_TO = "APPLIES_TO"


@dataclass
class GraphNode:
    """Node in the financial knowledge graph."""
    id: str
    type: NodeType
    properties: Dict[str, Any]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert node to dictionary for Neo4j."""
        return {
            "id": self.id,
            "type": self.type.value,
            **self.properties,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


@dataclass
class GraphRelationship:
    """Relationship between nodes."""
    source_id: str
    target_id: str
    type: RelationType
    properties: Dict[str, Any]
    created_at: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert relationship to dictionary."""
        return {
            "source_id": self.source_id,
            "target_id": self.target_id,
            "type": self.type.value,
            **self.properties,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


@dataclass
class QueryPath:
    """Represents a path through the graph for query resolution."""
    nodes: List[GraphNode]
    relationships: List[GraphRelationship]
    score: float
    path_type: str  # "metric", "breakdown", "detail", etc.
    
    def get_terminal_nodes(self) -> List[GraphNode]:
        """Get the terminal (leaf) nodes in the path."""
        return [n for n in self.nodes if n.type == NodeType.GL_ACCOUNT]
    
    def get_metric_nodes(self) -> List[GraphNode]:
        """Get L1 metric nodes in the path."""
        return [n for n in self.nodes if n.type == NodeType.L1_METRIC]
    
    def get_calculation_formula(self) -> Optional[str]:
        """Extract calculation formula from the path."""
        for node in self.nodes:
            if node.type == NodeType.FORMULA:
                return node.properties.get("expression")
        return None