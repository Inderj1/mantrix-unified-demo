"""
SQL Generator that uses Neo4j for all mapping lookups.
This is an enhanced version that fetches all mappings from the knowledge graph.
"""

import structlog
from typing import Dict, List, Optional, Any, Tuple

from .sql_generator import SQLGenerator
from .knowledge_graph.neo4j_query_resolver import Neo4jQueryResolver

logger = structlog.get_logger()


class Neo4jSQLGenerator(SQLGenerator):
    """SQL Generator that uses Neo4j for all mapping lookups instead of files."""
    
    def __init__(self, **kwargs):
        """Initialize with Neo4j resolver."""
        super().__init__(**kwargs)
        
        # Replace the default resolver with Neo4j resolver
        if self.knowledge_graph:
            self.neo4j_resolver = Neo4jQueryResolver(self.knowledge_graph)
            # Override the kg_query_resolver
            self.kg_query_resolver = self.neo4j_resolver
        else:
            self.neo4j_resolver = None
            
        logger.info("Initialized Neo4j SQL Generator")
    
    def _enhance_with_financial_context(self, query: str) -> Optional[Dict[str, Any]]:
        """Override to use Neo4j resolver directly."""
        if not self.neo4j_resolver:
            return super()._enhance_with_financial_context(query)
            
        try:
            # Use Neo4j resolver for all lookups
            resolved = self.neo4j_resolver.resolve_query(query)
            
            if resolved.query_type == "unknown":
                return None
                
            # Build financial context from Neo4j data
            financial_context = {
                "query_type": resolved.query_type,
                "confidence": resolved.confidence_score
            }
            
            # Add metrics if found
            if resolved.metrics:
                financial_context["metrics"] = []
                for metric in resolved.metrics:
                    metric_dict = {
                        "metric_code": metric.metric_code,
                        "metric_name": metric.metric_name,
                        "formula": metric.formula,
                        "formula_components": metric.formula_components,
                        "sub_buckets": metric.sub_buckets
                    }
                    financial_context["metrics"].append(metric_dict)
                    
            # Add GL accounts if found
            if resolved.gl_accounts:
                financial_context["gl_accounts"] = []
                for gl in resolved.gl_accounts:
                    gl_dict = {
                        "account_number": gl.account_number,
                        "description": gl.description,
                        "bucket_code": gl.bucket_code,
                        "is_active": gl.is_active
                    }
                    financial_context["gl_accounts"].append(gl_dict)
                    
            # Add synonyms resolved
            if resolved.synonyms_resolved:
                financial_context["synonyms_resolved"] = resolved.synonyms_resolved
                
            # Add business rules
            if resolved.business_rules:
                financial_context["business_rules"] = resolved.business_rules
                
            # Add suggested query if available
            if resolved.suggested_query:
                financial_context["suggested_query"] = resolved.suggested_query
                
            logger.info(f"Neo4j resolved query type: {resolved.query_type} with confidence: {resolved.confidence_score}")
            return financial_context
            
        except Exception as e:
            logger.error(f"Neo4j query resolution failed: {e}")
            # Fall back to parent implementation
            return super()._enhance_with_financial_context(query)
    
    def _get_metric_formula(self, metric_code: str) -> Optional[Dict[str, Any]]:
        """Get metric formula from Neo4j instead of files."""
        if not self.neo4j_resolver:
            return None
            
        metric = self.neo4j_resolver.get_metric_formula(metric_code)
        if metric:
            return {
                "metric_code": metric.metric_code,
                "metric_name": metric.metric_name,
                "formula": metric.formula,
                "formula_components": metric.formula_components,
                "sub_buckets": metric.sub_buckets
            }
        return None
    
    def _get_gl_accounts_for_bucket(self, bucket_code: str, client_id: Optional[str] = None) -> List[str]:
        """Get GL accounts for a bucket from Neo4j."""
        if not self.neo4j_resolver:
            return []
            
        gl_mappings = self.neo4j_resolver.get_gl_accounts_for_bucket(bucket_code, client_id)
        return [gl.account_number for gl in gl_mappings if gl.is_active]
    
    def generate_sql(self, query: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Generate SQL using Neo4j mappings."""
        # Add client context if available
        if context and "client_id" in context and self.neo4j_resolver:
            # Pass client context to resolver
            neo4j_context = {"client_id": context["client_id"]}
            resolved = self.neo4j_resolver.resolve_query(query, neo4j_context)
            
            # Merge resolved context with input context
            if resolved.query_type != "unknown":
                context = context or {}
                context["neo4j_resolved"] = {
                    "query_type": resolved.query_type,
                    "metrics": [m.__dict__ for m in resolved.metrics],
                    "gl_accounts": [g.__dict__ for g in resolved.gl_accounts],
                    "synonyms": resolved.synonyms_resolved,
                    "business_rules": resolved.business_rules,
                    "confidence": resolved.confidence_score
                }
                
        # Call parent implementation with enhanced context
        return super().generate_sql(query, context)
    
    def close(self):
        """Clean up resources."""
        if self.neo4j_resolver:
            self.neo4j_resolver.close()
        super().close()