"""Graph traversal engine for complex path finding in the financial knowledge graph."""

from typing import Dict, List, Optional, Set, Tuple, Any
import structlog
from dataclasses import dataclass
from enum import Enum
import json

from .graph_client import FinancialKnowledgeGraph
from .models import NodeType, RelationType, QueryPath, GraphNode, GraphRelationship

logger = structlog.get_logger()


class TraversalStrategy(Enum):
    """Strategies for graph traversal."""
    BREADTH_FIRST = "breadth_first"
    DEPTH_FIRST = "depth_first"
    SHORTEST_PATH = "shortest_path"
    ALL_PATHS = "all_paths"
    WEIGHTED = "weighted"


@dataclass
class TraversalOptions:
    """Options for graph traversal."""
    max_depth: int = 5
    strategy: TraversalStrategy = TraversalStrategy.SHORTEST_PATH
    include_relationships: Set[RelationType] = None
    exclude_relationships: Set[RelationType] = None
    node_filters: Dict[str, Any] = None
    path_scoring_fn: Optional[callable] = None
    max_paths: int = 10


@dataclass
class TraversalResult:
    """Result from graph traversal."""
    paths: List[QueryPath]
    visited_nodes: Set[str]
    execution_time_ms: float
    total_paths_found: int
    
    def get_best_path(self) -> Optional[QueryPath]:
        """Get the highest scoring path."""
        if not self.paths:
            return None
        return max(self.paths, key=lambda p: p.score)
    
    def get_terminal_nodes(self) -> List[GraphNode]:
        """Get all unique terminal nodes from paths."""
        terminals = []
        seen = set()
        for path in self.paths:
            for node in path.get_terminal_nodes():
                if node.id not in seen:
                    seen.add(node.id)
                    terminals.append(node)
        return terminals


class GraphTraversalEngine:
    """Engine for traversing the financial knowledge graph."""
    
    def __init__(self, graph: Optional[FinancialKnowledgeGraph] = None):
        """Initialize the traversal engine."""
        self.graph = graph or FinancialKnowledgeGraph()
        self.logger = logger.bind(component="graph_traversal")
        
    def find_paths(self, 
                   start_node_id: str,
                   target_node_type: Optional[NodeType] = None,
                   target_node_id: Optional[str] = None,
                   options: Optional[TraversalOptions] = None) -> TraversalResult:
        """Find paths from start node to target nodes."""
        options = options or TraversalOptions()
        self.logger.info(f"Finding paths from {start_node_id} with strategy {options.strategy}")
        
        import time
        start_time = time.time()
        
        if options.strategy == TraversalStrategy.SHORTEST_PATH:
            paths = self._find_shortest_paths(start_node_id, target_node_type, target_node_id, options)
        elif options.strategy == TraversalStrategy.ALL_PATHS:
            paths = self._find_all_paths(start_node_id, target_node_type, target_node_id, options)
        elif options.strategy == TraversalStrategy.BREADTH_FIRST:
            paths = self._bfs_traversal(start_node_id, target_node_type, target_node_id, options)
        else:
            paths = self._dfs_traversal(start_node_id, target_node_type, target_node_id, options)
        
        # Score paths
        scored_paths = []
        for path in paths[:options.max_paths]:
            score = self._score_path(path, options)
            path.score = score
            scored_paths.append(path)
        
        # Sort by score
        scored_paths.sort(key=lambda p: p.score, reverse=True)
        
        execution_time = (time.time() - start_time) * 1000
        visited_nodes = {node.id for path in scored_paths for node in path.nodes}
        
        return TraversalResult(
            paths=scored_paths,
            visited_nodes=visited_nodes,
            execution_time_ms=execution_time,
            total_paths_found=len(paths)
        )
    
    def find_metric_calculation_path(self, metric_code: str, client_id: str = "arizona_beverages") -> TraversalResult:
        """Find the calculation path for a specific metric."""
        metric_id = f"{client_id}_{metric_code}"
        
        # Find paths from metric to GL accounts
        options = TraversalOptions(
            strategy=TraversalStrategy.ALL_PATHS,
            include_relationships={RelationType.CONTAINS, RelationType.USES_FORMULA, RelationType.CALCULATES_FROM},
            max_depth=4,
            max_paths=5
        )
        
        return self.find_paths(
            start_node_id=metric_id,
            target_node_type=NodeType.GL_ACCOUNT,
            options=options
        )
    
    def find_related_metrics(self, metric_code: str, client_id: str = "arizona_beverages") -> List[Dict[str, Any]]:
        """Find metrics related through shared components."""
        metric_id = f"{client_id}_{metric_code}"
        
        with self.graph.driver.session() as session:
            # Find metrics that share buckets
            result = session.run("""
                MATCH (m1:L1Metric {id: $metric_id})-[:CONTAINS]->(b:L2Bucket)<-[:CONTAINS]-(m2:L1Metric)
                WHERE m1 <> m2
                RETURN DISTINCT m2.code as code, m2.name as name, 
                       collect(DISTINCT b.code) as shared_buckets
                
                UNION
                
                MATCH (m1:L1Metric {id: $metric_id})-[:CALCULATES_FROM]->(c:Calculation)<-[:CALCULATES_FROM]-(m2:L1Metric)
                WHERE m1 <> m2
                RETURN DISTINCT m2.code as code, m2.name as name,
                       [] as shared_buckets
            """, metric_id=metric_id)
            
            related = []
            for record in result:
                related.append({
                    'code': record['code'],
                    'name': record['name'],
                    'shared_buckets': record['shared_buckets'],
                    'relationship_type': 'shared_components'
                })
            
            return related
    
    def find_bucket_hierarchy(self, bucket_code: str, client_id: str = "arizona_beverages") -> Dict[str, Any]:
        """Find the complete hierarchy for a bucket."""
        bucket_id = f"{client_id}_{bucket_code}"
        
        with self.graph.driver.session() as session:
            # Get parent metric
            parent_result = session.run("""
                MATCH (m:L1Metric)-[:CONTAINS]->(b:L2Bucket {id: $bucket_id})
                RETURN m.code as code, m.name as name
            """, bucket_id=bucket_id)
            
            parent_metric = None
            for record in parent_result:
                parent_metric = {
                    'code': record['code'],
                    'name': record['name']
                }
            
            # Get child GL accounts
            children_result = session.run("""
                MATCH (b:L2Bucket {id: $bucket_id})-[:CONTAINS]->(g:GLAccount)
                RETURN g.account_number as account_number, 
                       g.description as description
                ORDER BY g.account_number
            """, bucket_id=bucket_id)
            
            gl_accounts = []
            for record in children_result:
                gl_accounts.append({
                    'account_number': record['account_number'],
                    'description': record['description']
                })
            
            return {
                'bucket_code': bucket_code,
                'parent_metric': parent_metric,
                'gl_accounts': gl_accounts,
                'gl_account_count': len(gl_accounts)
            }
    
    def _find_shortest_paths(self, start_id: str, target_type: Optional[NodeType], 
                           target_id: Optional[str], options: TraversalOptions) -> List[QueryPath]:
        """Find shortest paths using Neo4j's shortest path algorithm."""
        paths = []
        
        with self.graph.driver.session() as session:
            # Build relationship filter
            rel_filter = self._build_relationship_filter(options)
            
            # Build target match
            if target_id:
                target_match = "n2.id = $target_id"
            elif target_type:
                target_match = f"'{target_type.value}' IN labels(n2)"
            else:
                target_match = "n2 <> n1"
            
            query = f"""
                MATCH (n1 {{id: $start_id}})
                MATCH (n2)
                WHERE {target_match}
                MATCH p = shortestPath((n1)-[{rel_filter}*..{options.max_depth}]-(n2))
                RETURN p
                LIMIT {options.max_paths}
            """
            
            result = session.run(query, start_id=start_id, target_id=target_id)
            
            for record in result:
                path = self._neo4j_path_to_query_path(record['p'])
                paths.append(path)
        
        return paths
    
    def _find_all_paths(self, start_id: str, target_type: Optional[NodeType],
                       target_id: Optional[str], options: TraversalOptions) -> List[QueryPath]:
        """Find all paths up to max depth."""
        paths = []
        
        with self.graph.driver.session() as session:
            # Build relationship filter
            rel_filter = self._build_relationship_filter(options)
            
            # Build target match
            if target_id:
                target_match = "n2.id = $target_id"
            elif target_type:
                target_match = f"'{target_type.value}' IN labels(n2)"
            else:
                target_match = "n2 <> n1"
            
            query = f"""
                MATCH (n1 {{id: $start_id}})
                MATCH (n2)
                WHERE {target_match}
                MATCH p = (n1)-[{rel_filter}*1..{options.max_depth}]-(n2)
                RETURN p
                LIMIT {options.max_paths * 10}
            """
            
            result = session.run(query, start_id=start_id, target_id=target_id)
            
            for record in result:
                path = self._neo4j_path_to_query_path(record['p'])
                paths.append(path)
        
        return paths
    
    def _bfs_traversal(self, start_id: str, target_type: Optional[NodeType],
                      target_id: Optional[str], options: TraversalOptions) -> List[QueryPath]:
        """Breadth-first traversal."""
        paths = []
        visited = set()
        queue = [(start_id, [])]  # (node_id, path_so_far)
        
        with self.graph.driver.session() as session:
            while queue and len(paths) < options.max_paths:
                current_id, current_path = queue.pop(0)
                
                if current_id in visited:
                    continue
                
                visited.add(current_id)
                
                # Get current node
                node_result = session.run("""
                    MATCH (n {id: $node_id})
                    RETURN n, labels(n) as labels
                """, node_id=current_id)
                
                node_record = node_result.single()
                if not node_record:
                    continue
                
                current_node = self._record_to_graph_node(node_record)
                new_path = current_path + [current_node]
                
                # Check if this is a target node
                if self._is_target_node(current_node, target_type, target_id):
                    paths.append(QueryPath(
                        nodes=new_path,
                        relationships=[],  # Would need to track these
                        score=0.0,
                        path_type="bfs"
                    ))
                
                # Continue traversal if not at max depth
                if len(new_path) < options.max_depth:
                    # Get neighbors
                    neighbors = self._get_neighbors(current_id, options, session)
                    for neighbor_id in neighbors:
                        if neighbor_id not in visited:
                            queue.append((neighbor_id, new_path))
        
        return paths
    
    def _dfs_traversal(self, start_id: str, target_type: Optional[NodeType],
                      target_id: Optional[str], options: TraversalOptions) -> List[QueryPath]:
        """Depth-first traversal."""
        paths = []
        
        def dfs(node_id: str, path: List[GraphNode], visited: Set[str], session):
            if len(paths) >= options.max_paths:
                return
            
            if node_id in visited or len(path) > options.max_depth:
                return
            
            visited.add(node_id)
            
            # Get current node
            node_result = session.run("""
                MATCH (n {id: $node_id})
                RETURN n, labels(n) as labels
            """, node_id=node_id)
            
            node_record = node_result.single()
            if not node_record:
                visited.remove(node_id)
                return
            
            current_node = self._record_to_graph_node(node_record)
            new_path = path + [current_node]
            
            # Check if this is a target node
            if self._is_target_node(current_node, target_type, target_id):
                paths.append(QueryPath(
                    nodes=new_path,
                    relationships=[],
                    score=0.0,
                    path_type="dfs"
                ))
            
            # Continue traversal
            neighbors = self._get_neighbors(node_id, options, session)
            for neighbor_id in neighbors:
                dfs(neighbor_id, new_path, visited.copy(), session)
        
        with self.graph.driver.session() as session:
            dfs(start_id, [], set(), session)
        
        return paths
    
    def _build_relationship_filter(self, options: TraversalOptions) -> str:
        """Build Neo4j relationship filter string."""
        if options.include_relationships:
            rel_types = [r.value for r in options.include_relationships]
            return ":" + "|".join(rel_types)
        elif options.exclude_relationships:
            # This is more complex in Cypher, would need WHERE clause
            return ""
        else:
            return ""
    
    def _neo4j_path_to_query_path(self, neo4j_path) -> QueryPath:
        """Convert Neo4j path to QueryPath."""
        nodes = []
        relationships = []
        
        # Extract nodes
        for i, node in enumerate(neo4j_path.nodes):
            graph_node = GraphNode(
                id=node.get('id'),
                type=self._get_node_type(node),
                properties=dict(node)
            )
            nodes.append(graph_node)
        
        # Extract relationships
        for rel in neo4j_path.relationships:
            graph_rel = GraphRelationship(
                source_id=rel.start_node.get('id'),
                target_id=rel.end_node.get('id'),
                type=self._get_relationship_type(rel.type),
                properties=dict(rel)
            )
            relationships.append(graph_rel)
        
        return QueryPath(
            nodes=nodes,
            relationships=relationships,
            score=0.0,
            path_type="neo4j"
        )
    
    def _record_to_graph_node(self, record) -> GraphNode:
        """Convert Neo4j record to GraphNode."""
        node_data = dict(record['n'])
        labels = record['labels']
        
        # Determine node type from labels
        node_type = None
        for label in labels:
            try:
                node_type = NodeType(label)
                break
            except ValueError:
                continue
        
        return GraphNode(
            id=node_data.get('id'),
            type=node_type or NodeType.L1_METRIC,
            properties=node_data
        )
    
    def _get_node_type(self, node) -> NodeType:
        """Get NodeType from Neo4j node."""
        for label in node.labels:
            try:
                return NodeType(label)
            except ValueError:
                continue
        return NodeType.L1_METRIC  # Default
    
    def _get_relationship_type(self, rel_type: str) -> RelationType:
        """Get RelationType from string."""
        try:
            return RelationType(rel_type)
        except ValueError:
            return RelationType.CONTAINS  # Default
    
    def _is_target_node(self, node: GraphNode, target_type: Optional[NodeType], 
                       target_id: Optional[str]) -> bool:
        """Check if node matches target criteria."""
        if target_id and node.id == target_id:
            return True
        if target_type and node.type == target_type:
            return True
        if not target_id and not target_type:
            return True
        return False
    
    def _get_neighbors(self, node_id: str, options: TraversalOptions, session) -> List[str]:
        """Get neighbor node IDs based on options."""
        rel_filter = self._build_relationship_filter(options)
        
        query = f"""
            MATCH (n {{id: $node_id}})-[{rel_filter}]-(neighbor)
            RETURN DISTINCT neighbor.id as id
        """
        
        result = session.run(query, node_id=node_id)
        return [record['id'] for record in result if record['id']]
    
    def _score_path(self, path: QueryPath, options: TraversalOptions) -> float:
        """Score a path based on various factors."""
        if options.path_scoring_fn:
            return options.path_scoring_fn(path)
        
        # Default scoring: shorter paths score higher
        base_score = 1.0 / (len(path.nodes) + 1)
        
        # Bonus for paths ending in GL accounts
        if path.nodes and path.nodes[-1].type == NodeType.GL_ACCOUNT:
            base_score += 0.2
        
        # Bonus for paths with formula nodes
        if any(n.type == NodeType.FORMULA for n in path.nodes):
            base_score += 0.1
        
        return min(1.0, base_score)