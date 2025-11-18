"""Knowledge Graph components for enhanced financial query understanding."""

# Make imports optional to allow independent module usage
__all__ = []

try:
    from .models import NodeType, RelationType, GraphNode, GraphRelationship, QueryPath
    __all__.extend(["NodeType", "RelationType", "GraphNode", "GraphRelationship", "QueryPath"])
except ImportError:
    pass

try:
    from .graph_client import FinancialKnowledgeGraph
    __all__.append("FinancialKnowledgeGraph")
except ImportError:
    pass

try:
    from .graph_builder import KnowledgeGraphBuilder
    __all__.append("KnowledgeGraphBuilder")
except ImportError:
    pass

try:
    from .query_resolver import KnowledgeGraphQueryResolver, GraphQueryResult
    __all__.extend(["KnowledgeGraphQueryResolver", "GraphQueryResult"])
except ImportError:
    pass

try:
    from .graph_traversal import GraphTraversalEngine, TraversalOptions, TraversalStrategy, TraversalResult
    __all__.extend(["GraphTraversalEngine", "TraversalOptions", "TraversalStrategy", "TraversalResult"])
except ImportError:
    pass

try:
    from .jena_client import JenaKnowledgeGraph
    __all__.append("JenaKnowledgeGraph")
except ImportError:
    pass

try:
    from .jena_query_resolver import JenaQueryResolver, MetricFormula, GLMapping, ResolvedQuery
    __all__.extend(["JenaQueryResolver", "MetricFormula", "GLMapping", "ResolvedQuery"])
except ImportError:
    pass

# CSG entity resolver can be imported directly
try:
    from .csg_entity_resolver import CSGEntityResolver, get_entity_resolver
    __all__.extend(["CSGEntityResolver", "get_entity_resolver"])
except ImportError:
    pass