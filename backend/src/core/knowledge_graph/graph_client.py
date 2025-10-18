"""Neo4j client for the financial knowledge graph."""

from typing import Dict, List, Optional, Any, Tuple
import structlog
from neo4j import GraphDatabase, Driver
from neo4j.exceptions import Neo4jError
import networkx as nx
from datetime import datetime, timezone

from src.config import settings
from .models import NodeType, RelationType, GraphNode, GraphRelationship

logger = structlog.get_logger()


class FinancialKnowledgeGraph:
    """Main knowledge graph client for financial hierarchy and relationships."""
    
    def __init__(self, uri: Optional[str] = None, auth: Optional[Tuple[str, str]] = None):
        """Initialize the graph database connection."""
        self.uri = uri or settings.neo4j_uri
        self.auth = auth or (settings.neo4j_user, settings.neo4j_password)
        self.driver: Optional[Driver] = None
        self.nx_graph = nx.DiGraph()  # In-memory graph for fast operations
        self._connect()
        
    def _connect(self):
        """Establish connection to Neo4j."""
        try:
            self.driver = GraphDatabase.driver(self.uri, auth=self.auth)
            # Verify connectivity
            self.driver.verify_connectivity()
            logger.info("Connected to Neo4j successfully")
        except Exception as e:
            logger.error(f"Failed to connect to Neo4j: {e}")
            raise
    
    def close(self):
        """Close the database connection."""
        if self.driver:
            self.driver.close()
            logger.info("Closed Neo4j connection")
    
    def __enter__(self):
        """Context manager entry."""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.close()
    
    def initialize_schema(self):
        """Create constraints and indexes for the graph schema."""
        constraints = [
            # Unique constraints
            "CREATE CONSTRAINT IF NOT EXISTS FOR (m:L1Metric) REQUIRE m.code IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (b:L2Bucket) REQUIRE b.code IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (g:GLAccount) REQUIRE g.account_number IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (c:Client) REQUIRE c.client_id IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (d:Dataset) REQUIRE d.dataset_id IS UNIQUE",
            
            # Indexes for performance
            "CREATE INDEX IF NOT EXISTS FOR (n:L1Metric) ON (n.name)",
            "CREATE INDEX IF NOT EXISTS FOR (n:L2Bucket) ON (n.name)",
            "CREATE INDEX IF NOT EXISTS FOR (n:GLAccount) ON (n.description)",
            "CREATE INDEX IF NOT EXISTS FOR (n:Synonym) ON (n.term)",
            "CREATE INDEX IF NOT EXISTS FOR (n:Example) ON (n.query)",
            "CREATE INDEX IF NOT EXISTS FOR (n:Formula) ON (n.metric_code)",
            "CREATE INDEX IF NOT EXISTS FOR (n:Calculation) ON (n.name)",
        ]
        
        with self.driver.session() as session:
            for constraint in constraints:
                try:
                    session.run(constraint)
                    logger.info(f"Created constraint/index: {constraint[:50]}...")
                except Neo4jError as e:
                    if "already exists" not in str(e):
                        logger.error(f"Failed to create constraint: {e}")
                        raise
    
    def create_node(self, node: GraphNode) -> Dict[str, Any]:
        """Create a node in the graph."""
        with self.driver.session() as session:
            # Set timestamps
            node.created_at = datetime.now(timezone.utc)
            node.updated_at = datetime.now(timezone.utc)
            
            query = f"""
                CREATE (n:{node.type.value} $props)
                RETURN n
            """
            
            result = session.run(query, props=node.to_dict())
            created_node = result.single()
            
            if created_node:
                logger.info(f"Created {node.type.value} node: {node.id}")
                return dict(created_node["n"])
            else:
                raise ValueError(f"Failed to create node: {node.id}")
    
    def create_relationship(self, relationship: GraphRelationship) -> Dict[str, Any]:
        """Create a relationship between nodes."""
        with self.driver.session() as session:
            # Set timestamp
            relationship.created_at = datetime.now(timezone.utc)
            
            # Build dynamic query based on node types
            query = f"""
                MATCH (source), (target)
                WHERE (source.id = $source_id OR source.code = $source_id OR source.account_number = $source_id)
                  AND (target.id = $target_id OR target.code = $target_id OR target.account_number = $target_id)
                CREATE (source)-[r:{relationship.type.value} $props]->(target)
                RETURN r, source, target
            """
            
            result = session.run(
                query,
                source_id=relationship.source_id,
                target_id=relationship.target_id,
                props=relationship.properties
            )
            
            record = result.single()
            if record:
                logger.info(
                    f"Created {relationship.type.value} relationship: "
                    f"{relationship.source_id} -> {relationship.target_id}"
                )
                return {
                    "relationship": dict(record["r"]),
                    "source": dict(record["source"]),
                    "target": dict(record["target"])
                }
            else:
                raise ValueError(
                    f"Failed to create relationship: {relationship.source_id} -> {relationship.target_id}"
                )
    
    def find_node(self, node_id: str, node_type: Optional[NodeType] = None) -> Optional[Dict[str, Any]]:
        """Find a node by ID and optionally by type."""
        with self.driver.session() as session:
            if node_type:
                query = f"""
                    MATCH (n:{node_type.value})
                    WHERE n.id = $id OR n.code = $id OR n.account_number = $id
                    RETURN n
                """
            else:
                query = """
                    MATCH (n)
                    WHERE n.id = $id OR n.code = $id OR n.account_number = $id
                    RETURN n
                """
            
            result = session.run(query, id=node_id)
            record = result.single()
            
            if record:
                return dict(record["n"])
            return None
    
    def find_nodes_by_property(self, property_name: str, property_value: Any, 
                             node_type: Optional[NodeType] = None) -> List[Dict[str, Any]]:
        """Find nodes by a property value."""
        with self.driver.session() as session:
            if node_type:
                query = f"""
                    MATCH (n:{node_type.value})
                    WHERE n.{property_name} = $value
                    RETURN n
                """
            else:
                query = f"""
                    MATCH (n)
                    WHERE n.{property_name} = $value
                    RETURN n
                """
            
            result = session.run(query, value=property_value)
            return [dict(record["n"]) for record in result]
    
    def get_node_relationships(self, node_id: str, 
                             relationship_type: Optional[RelationType] = None,
                             direction: str = "both") -> List[Dict[str, Any]]:
        """Get all relationships for a node."""
        with self.driver.session() as session:
            # Build query based on direction
            if direction == "outgoing":
                pattern = "(n)-[r]->(m)"
            elif direction == "incoming":
                pattern = "(n)<-[r]-(m)"
            else:
                pattern = "(n)-[r]-(m)"
            
            # Add relationship type filter if specified
            if relationship_type:
                pattern = pattern.replace("[r]", f"[r:{relationship_type.value}]")
            
            query = f"""
                MATCH {pattern}
                WHERE n.id = $id OR n.code = $id OR n.account_number = $id
                RETURN r, n, m
            """
            
            result = session.run(query, id=node_id)
            relationships = []
            
            for record in result:
                relationships.append({
                    "relationship": dict(record["r"]),
                    "source": dict(record["n"]),
                    "target": dict(record["m"]),
                    "type": record["r"].type
                })
            
            return relationships
    
    def execute_cypher(self, query: str, parameters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Execute a raw Cypher query."""
        with self.driver.session() as session:
            result = session.run(query, parameters or {})
            return [dict(record) for record in result]
    
    def get_subgraph(self, start_nodes: List[str], max_depth: int = 3) -> nx.DiGraph:
        """Get a subgraph starting from specified nodes."""
        with self.driver.session() as session:
            query = """
                MATCH path = (n)-[*0..$depth]-(m)
                WHERE n.id IN $nodes OR n.code IN $nodes OR n.account_number IN $nodes
                WITH nodes(path) as nodes, relationships(path) as rels
                UNWIND nodes as node
                WITH collect(DISTINCT node) as all_nodes, rels
                UNWIND rels as rel
                WITH all_nodes, collect(DISTINCT rel) as all_rels
                RETURN all_nodes, all_rels
            """
            
            result = session.run(query, nodes=start_nodes, depth=max_depth)
            record = result.single()
            
            if record:
                # Build NetworkX graph
                subgraph = nx.DiGraph()
                
                # Add nodes
                for node in record["all_nodes"]:
                    node_dict = dict(node)
                    node_id = node_dict.get("id", node_dict.get("code", node_dict.get("account_number")))
                    subgraph.add_node(node_id, **node_dict)
                
                # Add edges
                for rel in record["all_rels"]:
                    source = dict(rel.start_node)
                    target = dict(rel.end_node)
                    source_id = source.get("id", source.get("code", source.get("account_number")))
                    target_id = target.get("id", target.get("code", target.get("account_number")))
                    
                    subgraph.add_edge(source_id, target_id, 
                                    type=rel.type, 
                                    **dict(rel))
                
                return subgraph
            
            return nx.DiGraph()
    
    def clear_graph(self):
        """Clear all nodes and relationships (use with caution!)."""
        with self.driver.session() as session:
            session.run("MATCH (n) DETACH DELETE n")
            logger.warning("Cleared entire graph database")
    
    def get_statistics(self) -> Dict[str, int]:
        """Get graph statistics."""
        with self.driver.session() as session:
            stats_query = """
                MATCH (n)
                WITH labels(n) as node_labels
                UNWIND node_labels as label
                WITH label, count(*) as count
                RETURN collect({label: label, count: count}) as node_counts
            """
            
            rel_stats_query = """
                MATCH ()-[r]->()
                WITH type(r) as rel_type, count(*) as count
                RETURN collect({type: rel_type, count: count}) as rel_counts
            """
            
            node_result = session.run(stats_query).single()
            rel_result = session.run(rel_stats_query).single()
            
            stats = {
                "total_nodes": sum(item["count"] for item in node_result["node_counts"]),
                "total_relationships": sum(item["count"] for item in rel_result["rel_counts"]),
                "node_types": {item["label"]: item["count"] for item in node_result["node_counts"]},
                "relationship_types": {item["type"]: item["count"] for item in rel_result["rel_counts"]}
            }
            
            return stats