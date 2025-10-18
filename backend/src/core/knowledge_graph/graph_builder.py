"""Builder for populating the financial knowledge graph."""

from typing import Dict, List, Optional, Any
import structlog
from datetime import datetime
import json

from src.core.financial_hierarchy import FinancialHierarchyConfig
from src.core.business_config import BusinessConfigManager, mapping_registry
from .models import NodeType, RelationType, GraphNode, GraphRelationship
from .graph_client import FinancialKnowledgeGraph

logger = structlog.get_logger()


class KnowledgeGraphBuilder:
    """Builds and populates the financial knowledge graph."""
    
    def __init__(self, graph: FinancialKnowledgeGraph):
        self.graph = graph
        self.logger = logger.bind(component="graph_builder")
        
    def build_complete_graph(self, hierarchy_config: FinancialHierarchyConfig, 
                           client_id: str = "arizona_beverages") -> Dict[str, int]:
        """Build the complete financial knowledge graph."""
        self.logger.info(f"Building complete graph for client: {client_id}")
        
        # Initialize schema
        self.graph.initialize_schema()
        
        # Create client node
        self._create_client_node(client_id)
        
        # Build hierarchy
        stats = {
            "l1_metrics": self._build_l1_metrics(hierarchy_config, client_id),
            "l2_buckets": self._build_l2_buckets(hierarchy_config, client_id),
            "gl_accounts": self._build_gl_accounts(hierarchy_config, client_id),
            "formulas": self._build_formulas(hierarchy_config, client_id),
            "synonyms": self._build_synonyms(),
            "examples": self._build_examples(),
            "calculations": self._build_calculation_paths(hierarchy_config),
            "business_mappings": self._build_business_mappings(client_id)
        }
        
        # Create relationships
        self._create_hierarchy_relationships(hierarchy_config, client_id)
        
        # Infer additional relationships
        self._infer_relationships()
        
        total_nodes = sum(stats.values())
        self.logger.info(f"Graph built successfully with {total_nodes} nodes")
        
        return stats
    
    def _create_client_node(self, client_id: str):
        """Create the client root node."""
        client_node = GraphNode(
            id=client_id,
            type=NodeType.CLIENT,
            properties={
                "client_id": client_id,
                "name": client_id.replace("_", " ").title(),
                "active": True
            }
        )
        
        try:
            self.graph.create_node(client_node)
        except Exception as e:
            self.logger.warning(f"Client node may already exist: {e}")
    
    def _build_l1_metrics(self, config: FinancialHierarchyConfig, client_id: str) -> int:
        """Build L1 metric nodes."""
        count = 0
        
        for metric_code, metric in config.l1_metrics.items():
            node = GraphNode(
                id=f"{client_id}_{metric_code}",
                type=NodeType.L1_METRIC,
                properties={
                    "code": metric_code,
                    "name": metric.metric_name,
                    "description": metric.description,
                    "formula": metric.formula,
                    "calculation_order": metric.calculation_order,
                    "is_percentage": metric.is_percentage,
                    "client_id": client_id
                }
            )
            
            try:
                self.graph.create_node(node)
                count += 1
                
                # Create relationship to client
                self.graph.create_relationship(GraphRelationship(
                    source_id=client_id,
                    target_id=node.id,
                    type=RelationType.CONTAINS,
                    properties={"level": 1}
                ))
                
            except Exception as e:
                self.logger.error(f"Failed to create L1 metric {metric_code}: {e}")
        
        return count
    
    def _build_l2_buckets(self, config: FinancialHierarchyConfig, client_id: str) -> int:
        """Build L2 bucket nodes."""
        count = 0
        
        for bucket_code, bucket in config.l2_buckets.items():
            node = GraphNode(
                id=f"{client_id}_{bucket_code}",
                type=NodeType.L2_BUCKET,
                properties={
                    "code": bucket_code,
                    "name": bucket.bucket_name,
                    "description": bucket.description,
                    "parent_metric": bucket.parent_metric,
                    "client_id": client_id,
                    "gl_account_count": len(bucket.gl_accounts)
                }
            )
            
            try:
                self.graph.create_node(node)
                count += 1
                
                # Create relationship to parent metric
                parent_id = f"{client_id}_{bucket.parent_metric}"
                self.graph.create_relationship(GraphRelationship(
                    source_id=parent_id,
                    target_id=node.id,
                    type=RelationType.CONTAINS,
                    properties={"level": 2}
                ))
                
            except Exception as e:
                self.logger.error(f"Failed to create L2 bucket {bucket_code}: {e}")
        
        return count
    
    def _build_gl_accounts(self, config: FinancialHierarchyConfig, client_id: str) -> int:
        """Build GL account nodes."""
        count = 0
        
        # Get GL mappings from business config
        gl_mappings = {}
        # Get all GL accounts from the registry
        for bucket_name in mapping_registry.get_all_buckets(client_id):
            gl_accounts = mapping_registry.get_gl_accounts_for_bucket_name(client_id, bucket_name)
            for gl_account in gl_accounts:
                gl_mapping = mapping_registry.get_gl_account(client_id, gl_account)
                if gl_mapping:
                    gl_mappings[gl_account] = gl_mapping.gl_account_name
        
        # Combine with hierarchy GL accounts
        all_accounts = {}
        
        # From hierarchy config
        for account_num, account in config.l3_accounts.items():
            all_accounts[account_num] = {
                "account_number": account_num,
                "description": account.description,
                "account_type": account.account_type,
                "normal_balance": account.normal_balance,
                "parent_bucket": account.parent_bucket,
                "is_active": account.is_active
            }
        
        # From business mappings
        for account_num, description in gl_mappings.items():
            if account_num not in all_accounts:
                # Determine bucket from mapping registry
                bucket = None
                for bucket_name in mapping_registry.get_all_buckets(client_id):
                    if account_num in mapping_registry.get_gl_accounts_for_bucket_name(client_id, bucket_name):
                        bucket = self._map_bucket_name_to_code(bucket_name)
                        break
                
                all_accounts[account_num] = {
                    "account_number": account_num,
                    "description": description,
                    "account_type": self._infer_account_type(account_num),
                    "normal_balance": self._infer_normal_balance(account_num),
                    "parent_bucket": bucket,
                    "is_active": True
                }
        
        # Create nodes
        for account_num, account_data in all_accounts.items():
            node = GraphNode(
                id=f"{client_id}_GL_{account_num}",
                type=NodeType.GL_ACCOUNT,
                properties={
                    **account_data,
                    "client_id": client_id
                }
            )
            
            try:
                self.graph.create_node(node)
                count += 1
                
                # Create relationship to parent bucket
                if account_data["parent_bucket"]:
                    parent_id = f"{client_id}_{account_data['parent_bucket']}"
                    self.graph.create_relationship(GraphRelationship(
                        source_id=parent_id,
                        target_id=node.id,
                        type=RelationType.CONTAINS,
                        properties={"level": 3}
                    ))
                
            except Exception as e:
                self.logger.error(f"Failed to create GL account {account_num}: {e}")
        
        return count
    
    def _build_formulas(self, config: FinancialHierarchyConfig, client_id: str) -> int:
        """Build formula nodes."""
        count = 0
        
        for metric_code, metric in config.l1_metrics.items():
            # Convert formula components to JSON string for Neo4j storage
            components_json = json.dumps(metric.formula_components) if metric.formula_components else "{}"
            
            formula_node = GraphNode(
                id=f"{client_id}_FORMULA_{metric_code}",
                type=NodeType.FORMULA,
                properties={
                    "metric_code": metric_code,
                    "expression": metric.formula,
                    "components_json": components_json,
                    "client_id": client_id
                }
            )
            
            try:
                self.graph.create_node(formula_node)
                count += 1
                
                # Create relationship from metric to formula
                metric_id = f"{client_id}_{metric_code}"
                self.graph.create_relationship(GraphRelationship(
                    source_id=metric_id,
                    target_id=formula_node.id,
                    type=RelationType.USES_FORMULA,
                    properties={}
                ))
                
            except Exception as e:
                self.logger.error(f"Failed to create formula for {metric_code}: {e}")
        
        return count
    
    def _build_synonyms(self) -> int:
        """Build synonym nodes and relationships."""
        count = 0
        
        synonyms = [
            ("gross_margin", ["gross profit", "gp", "margin", "gross margin %", "gross margin percentage"]),
            ("revenue", ["sales", "income", "top line", "turnover", "receipts"]),
            ("cogs", ["cost of goods sold", "cost of sales", "direct costs", "cost of revenue"]),
            ("ebitda", ["earnings before interest taxes depreciation amortization", "ebitda margin"]),
            ("operating_income", ["operating profit", "ebit", "operating earnings"]),
            ("net_income", ["net profit", "net earnings", "bottom line", "net margin"]),
            ("opex", ["operating expenses", "operational costs", "overhead", "sg&a"])
        ]
        
        for primary_term, synonym_list in synonyms:
            for synonym in synonym_list:
                synonym_node = GraphNode(
                    id=f"SYNONYM_{synonym.replace(' ', '_')}",
                    type=NodeType.SYNONYM,
                    properties={
                        "term": synonym,
                        "primary_term": primary_term,
                        "language": "en"
                    }
                )
                
                try:
                    self.graph.create_node(synonym_node)
                    count += 1
                    
                    # Find and link to target nodes
                    self._link_synonym_to_targets(synonym_node.id, primary_term)
                    
                except Exception as e:
                    self.logger.warning(f"Synonym may already exist: {e}")
        
        return count
    
    def _build_examples(self) -> int:
        """Build example query nodes."""
        count = 0
        
        examples = [
            {
                "metric": "GROSS_MARGIN",
                "queries": [
                    "Show gross margin by customer",
                    "Calculate gross profit for last quarter",
                    "What's our gross margin percentage?",
                    "Gross margin trend over time"
                ]
            },
            {
                "metric": "EBITDA",
                "queries": [
                    "Calculate EBITDA for this year",
                    "Show EBITDA trend by month",
                    "Compare EBITDA vs last year",
                    "EBITDA by business unit"
                ]
            },
            {
                "metric": "NET_INCOME",
                "queries": [
                    "What's our net profit this quarter?",
                    "Show net income by region",
                    "Net margin percentage trend",
                    "Bottom line performance YTD"
                ]
            }
        ]
        
        for example_set in examples:
            for query in example_set["queries"]:
                example_node = GraphNode(
                    id=f"EXAMPLE_{hash(query)}",
                    type=NodeType.EXAMPLE,
                    properties={
                        "query": query,
                        "metric": example_set["metric"],
                        "complexity": self._estimate_query_complexity(query)
                    }
                )
                
                try:
                    self.graph.create_node(example_node)
                    count += 1
                    
                    # Link to metric (will handle multiple clients)
                    self._link_example_to_metrics(example_node.id, example_set["metric"])
                    
                except Exception as e:
                    self.logger.warning(f"Example may already exist: {e}")
        
        return count
    
    def _build_calculation_paths(self, config: FinancialHierarchyConfig) -> int:
        """Build calculation dependency nodes."""
        count = 0
        
        calculations = [
            {
                "name": "gross_margin_calc",
                "formula": "revenue - cogs",
                "requires": ["REVENUE_SALES", "REVENUE_SERVICE", "COGS_MATERIAL", "COGS_LABOR", "COGS_OVERHEAD"],
                "produces": "GROSS_MARGIN"
            },
            {
                "name": "operating_income_calc",
                "formula": "gross_margin - operating_expenses",
                "requires": ["GROSS_MARGIN", "OPEX_SALES", "OPEX_MARKETING", "OPEX_ADMIN", "OPEX_RND"],
                "produces": "OPERATING_INCOME"
            },
            {
                "name": "ebitda_calc",
                "formula": "operating_income + depreciation + amortization",
                "requires": ["OPERATING_INCOME", "OPEX_DEPRECIATION", "OPEX_AMORTIZATION"],
                "produces": "EBITDA"
            }
        ]
        
        for calc in calculations:
            # Store requires list as JSON string
            requires_json = json.dumps(calc.get("requires", []))
            
            calc_node = GraphNode(
                id=f"CALC_{calc['name']}",
                type=NodeType.CALCULATION,
                properties={
                    "name": calc["name"],
                    "formula": calc["formula"],
                    "produces": calc["produces"],
                    "requires_json": requires_json
                }
            )
            
            try:
                self.graph.create_node(calc_node)
                count += 1
                
                # Create relationships (will be linked in _create_hierarchy_relationships)
                
            except Exception as e:
                self.logger.warning(f"Calculation may already exist: {e}")
        
        return count
    
    def _build_business_mappings(self, client_id: str) -> int:
        """Build nodes for business-specific mappings."""
        count = 0
        
        # Get material hierarchy if exists
        material_hierarchy = mapping_registry.get_material_hierarchy(client_id)
        if material_hierarchy:
            for level_name, level_data in material_hierarchy.items():
                for item_code, item_desc in level_data.items():
                    dimension_node = GraphNode(
                        id=f"{client_id}_DIM_{level_name}_{item_code}",
                        type=NodeType.DIMENSION,
                        properties={
                            "dimension_type": "material_hierarchy",
                            "level": level_name,
                            "code": item_code,
                            "description": item_desc,
                            "client_id": client_id
                        }
                    )
                    
                    try:
                        self.graph.create_node(dimension_node)
                        count += 1
                    except Exception as e:
                        self.logger.warning(f"Dimension node may already exist: {e}")
        
        return count
    
    def _create_hierarchy_relationships(self, config: FinancialHierarchyConfig, client_id: str):
        """Create all hierarchical relationships."""
        # Relationships are created during node creation
        # This method handles additional cross-cutting relationships
        
        # Link calculations to their dependencies
        with self.graph.driver.session() as session:
            session.run("""
                MATCH (calc:Calculation)
                MATCH (bucket:L2Bucket)
                WHERE bucket.code IN ['REVENUE_SALES', 'REVENUE_SERVICE', 'COGS_MATERIAL', 'COGS_LABOR', 'COGS_OVERHEAD']
                  AND calc.name = 'gross_margin_calc'
                  AND bucket.client_id = $client_id
                CREATE (calc)-[:REQUIRES]->(bucket)
            """, client_id=client_id)
            
            session.run("""
                MATCH (calc:Calculation {name: 'gross_margin_calc'})
                MATCH (metric:L1Metric {code: 'GROSS_MARGIN'})
                WHERE metric.client_id = $client_id
                CREATE (metric)-[:CALCULATES_FROM]->(calc)
            """, client_id=client_id)
    
    def _infer_relationships(self):
        """Infer and create missing relationships."""
        with self.graph.driver.session() as session:
            # GL accounts contribute to their parent metric
            session.run("""
                MATCH (g:GLAccount)-[:PART_OF]->(b:L2Bucket)-[:PART_OF]->(m:L1Metric)
                WHERE NOT (g)-[:CONTRIBUTES_TO]->(m)
                CREATE (g)-[:CONTRIBUTES_TO {inferred: true}]->(m)
            """)
            
            # Metrics that derive from other metrics inherit dependencies
            session.run("""
                MATCH (m1:L1Metric)-[:DERIVED_FROM]->(m2:L1Metric)
                MATCH (m2)-[:CALCULATES_FROM]->(component)
                WHERE NOT (m1)-[:REQUIRES]->(component)
                CREATE (m1)-[:REQUIRES {inferred: true, via: m2.code}]->(component)
            """)
    
    # Helper methods
    def _map_bucket_name_to_code(self, bucket_name: str) -> Optional[str]:
        """Map business config bucket names to hierarchy bucket codes."""
        mapping = {
            "Revenue": "REVENUE_SALES",
            "COGS": "COGS_MATERIAL",
            "Selling Expenses": "OPEX_SALES",
            "G&A Expenses": "OPEX_ADMIN",
            "R&D Expenses": "OPEX_RND",
            "Depreciation & Amortization": "OPEX_DEPRECIATION",
            "Other Income/Expense": "OTHER_EXPENSE"
        }
        return mapping.get(bucket_name)
    
    def _infer_account_type(self, account_number: str) -> str:
        """Infer account type from account number."""
        first_digit = account_number[0] if account_number else "0"
        
        type_map = {
            "1": "asset",
            "2": "liability", 
            "3": "equity",
            "4": "revenue",
            "5": "expense",
            "6": "expense",
            "7": "other_income",
            "8": "other_expense"
        }
        
        return type_map.get(first_digit, "expense")
    
    def _infer_normal_balance(self, account_number: str) -> str:
        """Infer normal balance from account type."""
        account_type = self._infer_account_type(account_number)
        
        credit_types = ["liability", "equity", "revenue"]
        return "credit" if account_type in credit_types else "debit"
    
    def _estimate_query_complexity(self, query: str) -> str:
        """Estimate query complexity based on keywords."""
        complex_keywords = ["breakdown", "compare", "variance", "trend", "by month", "by quarter"]
        medium_keywords = ["by", "for", "last", "this"]
        
        query_lower = query.lower()
        
        if any(kw in query_lower for kw in complex_keywords):
            return "high"
        elif any(kw in query_lower for kw in medium_keywords):
            return "medium"
        else:
            return "low"
    
    def _link_synonym_to_targets(self, synonym_id: str, primary_term: str):
        """Link synonym to relevant metric/bucket nodes."""
        with self.graph.driver.session() as session:
            # First, try to match metrics by name or code
            session.run("""
                MATCH (s:Synonym {id: $synonym_id})
                MATCH (n:L1Metric)
                WHERE toLower(n.name) CONTAINS $primary
                   OR toLower(n.code) CONTAINS $primary
                CREATE (s)-[:SYNONYM_OF]->(n)
            """, synonym_id=synonym_id, primary=primary_term.lower())
            
            # Also match buckets
            session.run("""
                MATCH (s:Synonym {id: $synonym_id})
                MATCH (n:L2Bucket)
                WHERE toLower(n.name) CONTAINS $primary
                   OR toLower(n.code) CONTAINS $primary
                CREATE (s)-[:SYNONYM_OF]->(n)
            """, synonym_id=synonym_id, primary=primary_term.lower())
    
    def _link_example_to_metrics(self, example_id: str, metric_code: str):
        """Link example to all instances of a metric across clients."""
        with self.graph.driver.session() as session:
            session.run("""
                MATCH (e:Example {id: $example_id})
                MATCH (m:L1Metric {code: $metric})
                CREATE (e)-[:EXAMPLE_OF]->(m)
            """, example_id=example_id, metric=metric_code)