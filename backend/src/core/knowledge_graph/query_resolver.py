"""Query resolver using the financial knowledge graph."""

from typing import Dict, List, Optional, Any, Set, Tuple
import structlog
from dataclasses import dataclass
import json

from src.core.financial_hierarchy import financial_hierarchy
from .graph_client import FinancialKnowledgeGraph
from .models import NodeType, RelationType

logger = structlog.get_logger()


@dataclass
class GraphQueryResult:
    """Result from graph query resolution."""
    
    matched_nodes: List[Dict[str, Any]]
    related_nodes: List[Dict[str, Any]]
    suggested_metrics: List[Dict[str, Any]]
    suggested_buckets: List[Dict[str, Any]]
    suggested_gl_accounts: List[Dict[str, Any]]
    synonyms_resolved: Dict[str, str]
    example_queries: List[str]
    confidence_score: float
    explanation: str


class KnowledgeGraphQueryResolver:
    """Resolves queries using the financial knowledge graph."""
    
    def __init__(self, graph: Optional[FinancialKnowledgeGraph] = None):
        """Initialize the query resolver."""
        self.graph = graph or FinancialKnowledgeGraph()
        self.logger = logger.bind(component="graph_query_resolver")
        
    def resolve_query(self, query: str, financial_context: Optional[Dict[str, Any]] = None) -> GraphQueryResult:
        """Resolve a query using the knowledge graph."""
        self.logger.info(f"Resolving query: {query}")
        
        # Extract key terms from query
        query_terms = self._extract_query_terms(query)
        
        # Resolve synonyms first
        synonyms_resolved = self._resolve_synonyms(query_terms)
        
        # Create expanded query terms including synonyms
        expanded_terms = list(query_terms)
        for term, info in synonyms_resolved.items():
            # Add the target code as a search term
            if info['target_code']:
                expanded_terms.append(info['target_code'].lower())
            # Add the target name words as search terms
            if info['target_name']:
                expanded_terms.extend(info['target_name'].lower().split())
        
        # Find matching nodes with expanded terms
        matched_nodes = self._find_matching_nodes(expanded_terms, financial_context)
        
        # Get related nodes through relationships
        related_nodes = self._get_related_nodes(matched_nodes)
        
        # Suggest metrics, buckets, and GL accounts
        suggestions = self._generate_suggestions(matched_nodes, related_nodes, financial_context)
        
        # Find relevant example queries
        example_queries = self._find_example_queries(matched_nodes, query_terms)
        
        # Calculate confidence score
        confidence_score = self._calculate_confidence(
            matched_nodes, 
            synonyms_resolved, 
            financial_context
        )
        
        # Generate explanation
        explanation = self._generate_explanation(
            matched_nodes,
            synonyms_resolved,
            suggestions,
            confidence_score
        )
        
        return GraphQueryResult(
            matched_nodes=matched_nodes,
            related_nodes=related_nodes,
            suggested_metrics=suggestions['metrics'],
            suggested_buckets=suggestions['buckets'],
            suggested_gl_accounts=suggestions['gl_accounts'],
            synonyms_resolved=synonyms_resolved,
            example_queries=example_queries,
            confidence_score=confidence_score,
            explanation=explanation
        )
    
    def _extract_query_terms(self, query: str) -> List[str]:
        """Extract meaningful terms from the query."""
        # Convert to lowercase
        query_lower = query.lower()
        words = query_lower.split()
        
        # Remove common stop words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
                     'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were',
                     'show', 'me', 'get', 'find', 'list', 'what', 'how', 'all', "what's", "our"}
        
        # Known multi-word terms to preserve
        multi_word_terms = [
            'bottom line', 'top line', 'gross profit', 'gross margin',
            'net profit', 'net income', 'operating income', 'operating margin',
            'cost of goods sold', 'operating expenses'
        ]
        
        # Extract multi-word terms first
        terms = []
        for term in multi_word_terms:
            if term in query_lower:
                terms.append(term)
                # Remove from query to avoid duplicate extraction
                query_lower = query_lower.replace(term, '')
        
        # Extract remaining meaningful single words
        remaining_words = query_lower.split()
        terms.extend([word for word in remaining_words if word not in stop_words and len(word) > 2])
        
        # Also extract bigrams for compound terms not in our list
        for i in range(len(words) - 1):
            bigram = f"{words[i]} {words[i+1]}"
            if (words[i] not in stop_words and words[i+1] not in stop_words and 
                bigram not in terms and bigram not in multi_word_terms):
                terms.append(bigram)
        
        return terms
    
    def _find_matching_nodes(self, query_terms: List[str], 
                           financial_context: Optional[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Find nodes matching the query terms."""
        matched_nodes = []
        
        with self.graph.driver.session() as session:
            # Search for metrics
            hierarchy_level = financial_context.get('hierarchy_level') if financial_context else None
            if not financial_context or hierarchy_level in [1, None]:
                for term in query_terms:
                    result = session.run("""
                        MATCH (m:L1Metric)
                        WHERE toLower(m.name) CONTAINS $term 
                           OR toLower(m.code) CONTAINS $term
                           OR toLower(m.description) CONTAINS $term
                        RETURN m, labels(m) as labels
                    """, term=term)
                    
                    for record in result:
                        node_data = dict(record["m"])
                        node_data['_labels'] = record["labels"]
                        node_data['_match_term'] = term
                        matched_nodes.append(node_data)
            
            # Search for buckets
            if not financial_context or hierarchy_level in [2, None]:
                for term in query_terms:
                    result = session.run("""
                        MATCH (b:L2Bucket)
                        WHERE toLower(b.name) CONTAINS $term
                           OR toLower(b.code) CONTAINS $term
                           OR toLower(b.description) CONTAINS $term
                        RETURN b, labels(b) as labels
                    """, term=term)
                    
                    for record in result:
                        node_data = dict(record["b"])
                        node_data['_labels'] = record["labels"]
                        node_data['_match_term'] = term
                        matched_nodes.append(node_data)
            
            # Search for GL accounts
            if not financial_context or hierarchy_level in [3, None]:
                for term in query_terms:
                    # Check for GL account numbers
                    if term.isdigit() and len(term) >= 4:
                        result = session.run("""
                            MATCH (g:GLAccount)
                            WHERE g.account_number = $term
                               OR g.account_number STARTS WITH $term
                            RETURN g, labels(g) as labels
                        """, term=term)
                    else:
                        # Search by description
                        result = session.run("""
                            MATCH (g:GLAccount)
                            WHERE toLower(g.description) CONTAINS $term
                            RETURN g, labels(g) as labels
                            LIMIT 10
                        """, term=term)
                    
                    for record in result:
                        node_data = dict(record["g"])
                        node_data['_labels'] = record["labels"]
                        node_data['_match_term'] = term
                        matched_nodes.append(node_data)
        
        # Remove duplicates
        seen = set()
        unique_nodes = []
        for node in matched_nodes:
            node_id = node.get('id', node.get('code', node.get('account_number')))
            if node_id not in seen:
                seen.add(node_id)
                unique_nodes.append(node)
        
        return unique_nodes
    
    def _resolve_synonyms(self, query_terms: List[str]) -> Dict[str, str]:
        """Resolve synonyms in query terms."""
        synonyms_resolved = {}
        
        with self.graph.driver.session() as session:
            for term in query_terms:
                # Check if term is a synonym
                result = session.run("""
                    MATCH (s:Synonym)-[:SYNONYM_OF]->(target)
                    WHERE toLower(s.term) = $term
                    RETURN s.term as synonym, 
                           target.name as target_name,
                           target.code as target_code,
                           labels(target) as target_labels
                """, term=term)
                
                record = result.single()
                if record:
                    synonyms_resolved[term] = {
                        'synonym': record['synonym'],
                        'target_name': record['target_name'],
                        'target_code': record['target_code'],
                        'target_type': record['target_labels'][0] if record['target_labels'] else None
                    }
        
        return synonyms_resolved
    
    def _get_related_nodes(self, matched_nodes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Get nodes related to the matched nodes."""
        related_nodes = []
        
        with self.graph.driver.session() as session:
            for node in matched_nodes[:5]:  # Limit to prevent explosion
                node_id = node.get('id', node.get('code', node.get('account_number')))
                
                # Get related nodes through various relationships
                result = session.run("""
                    MATCH (n)-[r]-(related)
                    WHERE (n.id = $node_id OR n.code = $node_id OR n.account_number = $node_id)
                      AND type(r) IN ['CONTAINS', 'PART_OF', 'USES_FORMULA', 'CALCULATES_FROM']
                    RETURN related, type(r) as rel_type, labels(related) as labels
                    LIMIT 10
                """, node_id=node_id)
                
                for record in result:
                    rel_node = dict(record["related"])
                    rel_node['_labels'] = record["labels"]
                    rel_node['_relationship'] = record["rel_type"]
                    rel_node['_source_node'] = node_id
                    related_nodes.append(rel_node)
        
        return related_nodes
    
    def _generate_suggestions(self, matched_nodes: List[Dict[str, Any]], 
                            related_nodes: List[Dict[str, Any]],
                            financial_context: Optional[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """Generate suggestions based on matched and related nodes."""
        suggestions = {
            'metrics': [],
            'buckets': [],
            'gl_accounts': []
        }
        
        # Process matched and related nodes
        all_nodes = matched_nodes + related_nodes
        
        for node in all_nodes:
            labels = node.get('_labels', [])
            
            if 'L1Metric' in labels:
                metric_info = {
                    'code': node.get('code'),
                    'name': node.get('name'),
                    'formula': node.get('formula'),
                    'source': 'matched' if node in matched_nodes else 'related'
                }
                if metric_info not in suggestions['metrics']:
                    suggestions['metrics'].append(metric_info)
                    
            elif 'L2Bucket' in labels:
                bucket_info = {
                    'code': node.get('code'),
                    'name': node.get('name'),
                    'parent_metric': node.get('parent_metric'),
                    'gl_account_count': node.get('gl_account_count', 0),
                    'source': 'matched' if node in matched_nodes else 'related'
                }
                if bucket_info not in suggestions['buckets']:
                    suggestions['buckets'].append(bucket_info)
                    
            elif 'GLAccount' in labels:
                gl_info = {
                    'account_number': node.get('account_number'),
                    'description': node.get('description'),
                    'parent_bucket': node.get('parent_bucket'),
                    'source': 'matched' if node in matched_nodes else 'related'
                }
                if gl_info not in suggestions['gl_accounts']:
                    suggestions['gl_accounts'].append(gl_info)
        
        # Get formulas for suggested metrics
        with self.graph.driver.session() as session:
            for metric in suggestions['metrics']:
                if metric['code'] and not metric.get('formula_components'):
                    result = session.run("""
                        MATCH (m:L1Metric {code: $code})-[:USES_FORMULA]->(f:Formula)
                        RETURN f.components_json as components
                    """, code=metric['code'])
                    
                    record = result.single()
                    if record and record['components']:
                        metric['formula_components'] = json.loads(record['components'])
        
        return suggestions
    
    def _find_example_queries(self, matched_nodes: List[Dict[str, Any]], 
                            query_terms: List[str]) -> List[str]:
        """Find relevant example queries."""
        example_queries = []
        
        with self.graph.driver.session() as session:
            # Get examples for matched metrics
            metric_codes = [node.get('code') for node in matched_nodes 
                          if 'L1Metric' in node.get('_labels', [])]
            
            if metric_codes:
                result = session.run("""
                    MATCH (e:Example)-[:EXAMPLE_OF]->(m:L1Metric)
                    WHERE m.code IN $codes
                    RETURN DISTINCT e.query as query
                    LIMIT 5
                """, codes=metric_codes)
                
                for record in result:
                    example_queries.append(record['query'])
            
            # Also search for examples containing query terms
            for term in query_terms[:3]:  # Limit to prevent too many results
                result = session.run("""
                    MATCH (e:Example)
                    WHERE toLower(e.query) CONTAINS $term
                    RETURN e.query as query
                    LIMIT 3
                """, term=term)
                
                for record in result:
                    if record['query'] not in example_queries:
                        example_queries.append(record['query'])
        
        return example_queries[:8]  # Return max 8 examples
    
    def _calculate_confidence(self, matched_nodes: List[Dict[str, Any]], 
                            synonyms_resolved: Dict[str, str],
                            financial_context: Optional[Dict[str, Any]]) -> float:
        """Calculate confidence score for the resolution."""
        confidence = 0.5  # Base confidence
        
        # Boost for matched nodes
        if matched_nodes:
            confidence += min(0.3, len(matched_nodes) * 0.1)
        
        # Boost for resolved synonyms
        if synonyms_resolved:
            confidence += min(0.2, len(synonyms_resolved) * 0.1)
        
        # Boost for matching hierarchy level
        if financial_context and matched_nodes:
            hierarchy_level = financial_context.get('hierarchy_level')
            if hierarchy_level:
                # Convert enum to int if needed
                if hasattr(hierarchy_level, 'value'):
                    hierarchy_level = hierarchy_level.value
                    
                hierarchy_matches = 0
                for node in matched_nodes:
                    labels = node.get('_labels', [])
                    if (hierarchy_level == 1 and 'L1Metric' in labels) or \
                       (hierarchy_level == 2 and 'L2Bucket' in labels) or \
                       (hierarchy_level == 3 and 'GLAccount' in labels):
                        hierarchy_matches += 1
                
                if hierarchy_matches > 0:
                    confidence += 0.2
        
        # Penalty for no matches
        if not matched_nodes and not synonyms_resolved:
            confidence = 0.2
        
        return min(1.0, confidence)
    
    def _generate_explanation(self, matched_nodes: List[Dict[str, Any]],
                            synonyms_resolved: Dict[str, str],
                            suggestions: Dict[str, List[Dict[str, Any]]],
                            confidence_score: float) -> str:
        """Generate explanation of the resolution."""
        explanations = []
        
        if matched_nodes:
            node_types = {}
            for node in matched_nodes:
                labels = node.get('_labels', [])
                for label in labels:
                    if label in ['L1Metric', 'L2Bucket', 'GLAccount']:
                        node_types[label] = node_types.get(label, 0) + 1
            
            for node_type, count in node_types.items():
                type_name = {
                    'L1Metric': 'financial metrics',
                    'L2Bucket': 'account categories', 
                    'GLAccount': 'GL accounts'
                }.get(node_type, 'nodes')
                explanations.append(f"Found {count} matching {type_name}")
        
        if synonyms_resolved:
            for term, info in synonyms_resolved.items():
                explanations.append(f"Resolved '{term}' to '{info['target_name']}'")
        
        if suggestions['metrics']:
            explanations.append(f"Suggested {len(suggestions['metrics'])} relevant metrics")
        
        if not explanations:
            explanations.append("No direct matches found in knowledge graph")
        
        confidence_level = "high" if confidence_score > 0.7 else "medium" if confidence_score > 0.4 else "low"
        explanations.append(f"Confidence: {confidence_level} ({confidence_score:.0%})")
        
        return ". ".join(explanations)
    
    def enhance_context_dict(self, query: str, 
                           context_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance the context dictionary using graph knowledge."""
        # Resolve the query
        result = self.resolve_query(query, context_dict)
        
        # Enhance metrics with formula components
        metrics = context_dict.get('metrics', [])
        for metric in metrics:
            for suggested_metric in result.suggested_metrics:
                if metric.get('code') == suggested_metric['code'] and 'formula_components' in suggested_metric:
                    metric['sql_components'] = suggested_metric['formula_components']
        
        # Add discovered GL accounts
        gl_accounts = context_dict.get('gl_accounts', [])
        for gl_account in result.suggested_gl_accounts:
            if gl_account['account_number'] not in gl_accounts:
                gl_accounts.append(gl_account['account_number'])
        
        context_dict['gl_accounts'] = gl_accounts
        
        # Update confidence
        context_dict['confidence_score'] = result.confidence_score
        context_dict['graph_explanation'] = result.explanation
        
        return context_dict
    
    def get_metric_formula_components(self, metric_code: str) -> Optional[Dict[str, str]]:
        """Get formula components for a specific metric."""
        with self.graph.driver.session() as session:
            result = session.run("""
                MATCH (m:L1Metric {code: $code})-[:USES_FORMULA]->(f:Formula)
                RETURN f.components_json as components
            """, code=metric_code)
            
            record = result.single()
            if record and record['components']:
                return json.loads(record['components'])
        
        return None
    
    def find_related_metrics(self, metric_code: str) -> List[Dict[str, Any]]:
        """Find metrics related to a given metric."""
        related_metrics = []
        
        with self.graph.driver.session() as session:
            # Find metrics that share buckets or calculations
            result = session.run("""
                MATCH (m1:L1Metric {code: $code})-[:CONTAINS]->(b:L2Bucket)<-[:CONTAINS]-(m2:L1Metric)
                WHERE m1 <> m2
                RETURN DISTINCT m2.code as code, m2.name as name, m2.formula as formula
                
                UNION
                
                MATCH (m1:L1Metric {code: $code})-[:CALCULATES_FROM]->(c:Calculation)<-[:CALCULATES_FROM]-(m2:L1Metric)
                WHERE m1 <> m2
                RETURN DISTINCT m2.code as code, m2.name as name, m2.formula as formula
            """, code=metric_code)
            
            for record in result:
                related_metrics.append({
                    'code': record['code'],
                    'name': record['name'],
                    'formula': record['formula']
                })
        
        return related_metrics