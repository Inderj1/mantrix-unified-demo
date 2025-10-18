"""
Neo4j-based query resolver that fetches all mappings from the knowledge graph.
This replaces the previous file-based mapping approach.
"""

from typing import Dict, List, Optional, Any, Tuple
import structlog
from dataclasses import dataclass
from datetime import datetime

from .graph_client import FinancialKnowledgeGraph
from .models import NodeType, RelationType

logger = structlog.get_logger()


@dataclass
class MetricFormula:
    """Represents a metric formula from Neo4j."""
    metric_code: str
    metric_name: str
    formula: str
    formula_components: Dict[str, str]
    sub_buckets: List[str]
    
    
@dataclass
class GLMapping:
    """Represents a GL account mapping from Neo4j."""
    account_number: str
    description: str
    bucket_code: Optional[str]
    client_id: Optional[str]
    is_active: bool = True


@dataclass
class ResolvedQuery:
    """Result of query resolution using Neo4j."""
    query_type: str  # 'L1', 'L2', 'L3', 'unknown'
    metrics: List[MetricFormula]
    gl_accounts: List[GLMapping]
    synonyms_resolved: Dict[str, str]
    business_rules: List[Dict[str, Any]]
    suggested_query: Optional[str] = None
    confidence_score: float = 0.0


class Neo4jQueryResolver:
    """Query resolver that uses Neo4j for all mapping lookups."""
    
    def __init__(self, graph_client: Optional[FinancialKnowledgeGraph] = None):
        self.graph = graph_client or FinancialKnowledgeGraph()
        
    def resolve_query(self, query: str, context: Optional[Dict[str, Any]] = None) -> ResolvedQuery:
        """Resolve a natural language query using Neo4j mappings."""
        logger.info(f"Resolving query: {query}")
        
        # 1. Resolve synonyms
        synonyms_resolved = self._resolve_synonyms(query)
        normalized_query = self._apply_synonyms(query, synonyms_resolved)
        
        # 2. Detect query type
        query_type = self._detect_query_type(normalized_query)
        
        # 3. Get relevant metrics
        metrics = self._get_relevant_metrics(normalized_query, query_type)
        
        # 4. Get GL accounts if needed
        gl_accounts = self._get_relevant_gl_accounts(normalized_query, metrics, context)
        
        # 5. Get applicable business rules
        business_rules = self._get_business_rules(metrics, context)
        
        # 6. Generate suggested query
        suggested_query = self._generate_suggested_query(query_type, metrics, gl_accounts)
        
        return ResolvedQuery(
            query_type=query_type,
            metrics=metrics,
            gl_accounts=gl_accounts,
            synonyms_resolved=synonyms_resolved,
            business_rules=business_rules,
            suggested_query=suggested_query,
            confidence_score=self._calculate_confidence(query_type, metrics, gl_accounts)
        )
    
    def _resolve_synonyms(self, query: str) -> Dict[str, str]:
        """Resolve synonyms from Neo4j."""
        synonyms = {}
        query_lower = query.lower()
        
        with self.graph.driver.session() as session:
            # Find all synonyms that might match terms in the query
            result = session.run("""
                MATCH (s:Synonym)-[:SYNONYM_OF]->(main:Synonym {is_primary: true})
                WHERE toLower($query_text) CONTAINS toLower(s.term)
                RETURN s.term as synonym, main.term as primary_term
            """, query_text=query)
            
            for record in result:
                synonym = record["synonym"]
                primary = record["primary_term"]
                if synonym.lower() in query_lower:
                    synonyms[synonym] = primary
                    
        logger.info(f"Resolved synonyms: {synonyms}")
        return synonyms
    
    def _apply_synonyms(self, query: str, synonyms: Dict[str, str]) -> str:
        """Apply synonym replacements to query."""
        normalized = query
        for synonym, primary in synonyms.items():
            normalized = normalized.replace(synonym, primary)
        return normalized
    
    def _detect_query_type(self, query: str) -> str:
        """Detect if query is L1, L2, or L3 based on keywords and patterns."""
        query_lower = query.lower()
        
        # Check for L1 metric keywords
        with self.graph.driver.session() as session:
            result = session.run("""
                MATCH (m:L1Metric)
                WHERE toLower($query_text) CONTAINS toLower(m.name) OR 
                      toLower($query_text) CONTAINS toLower(m.display_name)
                RETURN count(m) as count
            """, query_text=query)
            
            l1_count = result.single()["count"]
            
        # Check for L2 keywords (breakdown, components, etc.)
        l2_keywords = ["breakdown", "break down", "components", "detail", "composition"]
        has_l2_keyword = any(kw in query_lower for kw in l2_keywords)
        
        # Check for GL account patterns
        gl_pattern_keywords = ["gl account", "general ledger", "account number", "gl code"]
        has_gl_pattern = any(kw in query_lower for kw in gl_pattern_keywords)
        
        if l1_count > 0 and not has_l2_keyword:
            return "L1"
        elif has_l2_keyword or (l1_count > 0 and has_l2_keyword):
            return "L2"
        elif has_gl_pattern or "gl" in query_lower:
            return "L3"
        else:
            return "unknown"
    
    def _get_relevant_metrics(self, query: str, query_type: str) -> List[MetricFormula]:
        """Get relevant metrics from Neo4j based on query."""
        metrics = []
        
        with self.graph.driver.session() as session:
            # Find metrics mentioned in the query
            result = session.run("""
                MATCH (m:L1Metric)
                WHERE toLower($query_text) CONTAINS toLower(m.name) OR 
                      toLower($query_text) CONTAINS toLower(m.display_name)
                OPTIONAL MATCH (m)-[:USES_FORMULA]->(f:Formula)
                OPTIONAL MATCH (m)-[:CONTAINS]->(b:L2Bucket)
                RETURN m, collect(DISTINCT f) as formulas, collect(DISTINCT b.code) as buckets
            """, query_text=query)
            
            for record in result:
                metric_node = record["m"]
                formulas = record["formulas"]
                buckets = record["buckets"]
                
                # Build formula components dictionary
                formula_components = {}
                for formula in formulas:
                    component_name = formula.get("component_name", "")
                    sql_expr = formula.get("expression", "")
                    if component_name and sql_expr:
                        formula_components[component_name] = sql_expr
                
                metric = MetricFormula(
                    metric_code=metric_node["code"],
                    metric_name=metric_node["display_name"],
                    formula=metric_node.get("formula", ""),
                    formula_components=formula_components,
                    sub_buckets=buckets
                )
                metrics.append(metric)
                
        return metrics
    
    def _get_relevant_gl_accounts(self, query: str, metrics: List[MetricFormula], 
                                 context: Optional[Dict[str, Any]] = None) -> List[GLMapping]:
        """Get relevant GL accounts from Neo4j."""
        gl_accounts = []
        client_id = context.get("client_id") if context else None
        
        with self.graph.driver.session() as session:
            # If we have metrics with buckets, get GL accounts for those buckets
            if metrics:
                for metric in metrics:
                    for bucket_code in metric.sub_buckets:
                        query_str = """
                            MATCH (gl:GLAccount)-[:PART_OF]->(b:L2Bucket {code: $bucket_code})
                            WHERE gl.is_active = true
                        """
                        params = {"bucket_code": bucket_code}
                        
                        # Add client filter if specified
                        if client_id:
                            query_str += """
                                AND EXISTS((gl)-[:BELONGS_TO]->(:Client {client_id: $client_id}))
                            """
                            params["client_id"] = client_id
                            
                        query_str += " RETURN gl"
                        
                        result = session.run(query_str, **params)
                        
                        for record in result:
                            gl_node = record["gl"]
                            gl_mapping = GLMapping(
                                account_number=gl_node["account_number"],
                                description=gl_node.get("description", ""),
                                bucket_code=gl_node.get("bucket_code"),
                                client_id=client_id,
                                is_active=gl_node.get("is_active", True)
                            )
                            gl_accounts.append(gl_mapping)
            
            # Also check for direct GL account references in query
            # Look for patterns like "GL 6300" or "account 5000"
            import re
            gl_pattern = re.compile(r'\b(?:gl|account)\s*(\d{4,})\b', re.IGNORECASE)
            matches = gl_pattern.findall(query)
            
            for account_num in matches:
                result = session.run("""
                    MATCH (gl:GLAccount {account_number: $account_num})
                    RETURN gl
                """, account_num=account_num)
                
                record = result.single()
                if record:
                    gl_node = record["gl"]
                    gl_mapping = GLMapping(
                        account_number=gl_node["account_number"],
                        description=gl_node.get("description", ""),
                        bucket_code=gl_node.get("bucket_code"),
                        client_id=client_id,
                        is_active=gl_node.get("is_active", True)
                    )
                    gl_accounts.append(gl_mapping)
                    
        return gl_accounts
    
    def _get_business_rules(self, metrics: List[MetricFormula], 
                           context: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Get applicable business rules from Neo4j."""
        rules = []
        
        with self.graph.driver.session() as session:
            # Get rules for the metrics
            for metric in metrics:
                result = session.run("""
                    MATCH (r:BusinessRule)-[:APPLIES_TO]->(m:L1Metric {code: $metric_code})
                    WHERE r.is_active = true
                    RETURN r
                    ORDER BY r.priority
                """, metric_code=metric.metric_code)
                
                for record in result:
                    rule_node = record["r"]
                    rules.append({
                        "name": rule_node["name"],
                        "description": rule_node.get("description", ""),
                        "rule_type": rule_node.get("rule_type", ""),
                        "condition": rule_node.get("condition", ""),
                        "action": rule_node.get("action", ""),
                        "priority": rule_node.get("priority", 999)
                    })
                    
        return rules
    
    def _generate_suggested_query(self, query_type: str, metrics: List[MetricFormula], 
                                 gl_accounts: List[GLMapping]) -> Optional[str]:
        """Generate a suggested SQL query based on resolved components."""
        if query_type == "L1" and metrics:
            # Simple L1 metric query
            metric = metrics[0]
            if metric.formula_components:
                # Use the first component as the main calculation
                calc = list(metric.formula_components.values())[0]
                return f"""
SELECT 
    {calc} as {metric.metric_code.lower()},
    -- Add dimensions as needed
FROM your_table
GROUP BY dimension
"""
        
        elif query_type == "L2" and metrics:
            # L2 breakdown query
            metric = metrics[0]
            if metric.sub_buckets:
                return f"""
SELECT 
    CASE 
        -- Add bucket categorization logic
        WHEN gl_account IN (/* bucket accounts */) THEN '{metric.sub_buckets[0]}'
        -- Add more buckets
    END as bucket,
    SUM(amount) as total
FROM your_table
GROUP BY bucket
"""
        
        elif query_type == "L3" and gl_accounts:
            # L3 GL detail query
            account_list = ", ".join([f"'{gl.account_number}'" for gl in gl_accounts[:5]])
            return f"""
SELECT 
    gl_account,
    gl_description,
    SUM(amount) as total
FROM your_table  
WHERE gl_account IN ({account_list})
GROUP BY gl_account, gl_description
"""
        
        return None
    
    def _calculate_confidence(self, query_type: str, metrics: List[MetricFormula], 
                            gl_accounts: List[GLMapping]) -> float:
        """Calculate confidence score for the resolution."""
        score = 0.0
        
        if query_type != "unknown":
            score += 0.3
            
        if metrics:
            score += 0.4
            
        if gl_accounts:
            score += 0.2
            
        if metrics and all(m.formula_components for m in metrics):
            score += 0.1
            
        return min(score, 1.0)
    
    def get_metric_formula(self, metric_code: str) -> Optional[MetricFormula]:
        """Get a specific metric formula from Neo4j."""
        with self.graph.driver.session() as session:
            result = session.run("""
                MATCH (m:L1Metric {code: $metric_code})
                OPTIONAL MATCH (m)-[:USES_FORMULA]->(f:Formula)
                OPTIONAL MATCH (m)-[:CONTAINS]->(b:L2Bucket)
                RETURN m, collect(DISTINCT f) as formulas, collect(DISTINCT b.code) as buckets
            """, metric_code=metric_code)
            
            record = result.single()
            if record:
                metric_node = record["m"]
                formulas = record["formulas"]
                buckets = record["buckets"]
                
                # Build formula components
                formula_components = {}
                for formula in formulas:
                    component_name = formula.get("component_name", "")
                    sql_expr = formula.get("expression", "")
                    if component_name and sql_expr:
                        formula_components[component_name] = sql_expr
                
                return MetricFormula(
                    metric_code=metric_node["code"],
                    metric_name=metric_node["display_name"],
                    formula=metric_node.get("formula", ""),
                    formula_components=formula_components,
                    sub_buckets=buckets
                )
                
        return None
    
    def get_gl_accounts_for_bucket(self, bucket_code: str, client_id: Optional[str] = None) -> List[GLMapping]:
        """Get all GL accounts for a specific bucket."""
        gl_accounts = []
        
        with self.graph.driver.session() as session:
            query_str = """
                MATCH (gl:GLAccount)-[:PART_OF]->(b:L2Bucket {code: $bucket_code})
                WHERE gl.is_active = true
            """
            params = {"bucket_code": bucket_code}
            
            if client_id:
                query_str += """
                    AND EXISTS((gl)-[:BELONGS_TO]->(:Client {client_id: $client_id}))
                """
                params["client_id"] = client_id
                
            query_str += " RETURN gl"
            
            result = session.run(query_str, **params)
            
            for record in result:
                gl_node = record["gl"]
                gl_mapping = GLMapping(
                    account_number=gl_node["account_number"],
                    description=gl_node.get("description", ""),
                    bucket_code=bucket_code,
                    client_id=client_id,
                    is_active=gl_node.get("is_active", True)
                )
                gl_accounts.append(gl_mapping)
                
        return gl_accounts
    
    def close(self):
        """Close the graph connection."""
        self.graph.close()