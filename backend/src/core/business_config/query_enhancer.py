"""Query enhancement with business configurations."""

from typing import Dict, List, Optional, Any, Tuple
import re
import structlog

from .mapping_registry import mapping_registry
from .models import BusinessConfiguration, BusinessRule

logger = structlog.get_logger()


class QueryContextEnhancer:
    """Enhance queries with client-specific mappings and business logic."""
    
    def __init__(self):
        self.logger = logger.bind(component="query_enhancer")
    
    def enhance_with_client_mappings(self, query: str, client_id: str) -> Dict[str, Any]:
        """Enhance query with client-specific mappings."""
        self.logger.info(f"Enhancing query for client {client_id}")
        
        # Get all mappings for the client
        mappings = mapping_registry.get_mapping_for_query({"client_id": client_id})
        
        enhanced_context = {
            "original_query": query,
            "client_id": client_id,
            "mappings": mappings,
            "resolved_terms": {},
            "gl_accounts": [],
            "material_filters": {},
            "custom_logic": []
        }
        
        # Resolve business terms to GL accounts
        self._resolve_gl_terms(query, client_id, enhanced_context)
        
        # Resolve material hierarchy terms
        self._resolve_material_terms(query, client_id, enhanced_context)
        
        # Apply custom business rules
        self._apply_business_rules(query, client_id, enhanced_context)
        
        return enhanced_context
    
    def _resolve_gl_terms(self, query: str, client_id: str, context: Dict[str, Any]):
        """Resolve GL-related terms in the query."""
        query_lower = query.lower()
        
        # Common financial terms to bucket mappings
        term_mappings = {
            "revenue": ["Revenue"],
            "sales": ["Revenue"],
            "cogs": ["COGS"],
            "cost of goods": ["COGS"],
            "operating expenses": ["Selling Expenses", "G&A Expenses", "R&D Expenses"],
            "opex": ["Selling Expenses", "G&A Expenses", "R&D Expenses"],
            "selling expenses": ["Selling Expenses"],
            "admin expenses": ["G&A Expenses"],
            "g&a": ["G&A Expenses"],
            "r&d": ["R&D Expenses"],
            "depreciation": ["Depreciation & Amortization"],
            "other income": ["Other Income/Expense"]
        }
        
        # Find matching terms
        for term, bucket_names in term_mappings.items():
            if term in query_lower:
                gl_accounts = []
                for bucket_name in bucket_names:
                    accounts = mapping_registry.get_gl_accounts_for_bucket_name(client_id, bucket_name)
                    gl_accounts.extend(accounts)
                
                if gl_accounts:
                    context["resolved_terms"][term] = {
                        "buckets": bucket_names,
                        "gl_accounts": gl_accounts
                    }
                    context["gl_accounts"].extend(gl_accounts)
                    self.logger.info(f"Resolved '{term}' to {len(gl_accounts)} GL accounts")
        
        # Look for specific GL account references
        gl_pattern = r'\b\d{8}\b'  # 8-digit GL accounts
        gl_matches = re.findall(gl_pattern, query)
        for gl_account in gl_matches:
            mapping = mapping_registry.get_gl_account(client_id, gl_account)
            if mapping:
                context["gl_accounts"].append(gl_account)
                context["resolved_terms"][gl_account] = {
                    "bucket": mapping.bucket_name,
                    "description": mapping.description
                }
    
    def _resolve_material_terms(self, query: str, client_id: str, context: Dict[str, Any]):
        """Resolve material hierarchy terms."""
        hierarchy = mapping_registry.get_material_hierarchy(client_id)
        if not hierarchy:
            return
        
        query_lower = query.lower()
        
        # Check for material group references
        material_filters = {}
        
        # Check MG1 - Business Units
        for code, desc in hierarchy.mg1_business_unit.items():
            if desc.lower() in query_lower:
                material_filters["mg1"] = {"code": code, "description": desc}
                context["resolved_terms"][desc] = {"type": "business_unit", "code": code}
        
        # Check MG2 - Brands
        for code, desc in hierarchy.mg2_brand.items():
            if desc.lower() in query_lower:
                material_filters["mg2"] = {"code": code, "description": desc}
                context["resolved_terms"][desc] = {"type": "brand", "code": code}
        
        # Check MG3 - Types
        for code, desc in hierarchy.mg3_type.items():
            if desc.lower() in query_lower:
                material_filters["mg3"] = {"code": code, "description": desc}
                context["resolved_terms"][desc] = {"type": "product_type", "code": code}
        
        # Check MG5 - Flavors
        for code, desc in hierarchy.mg5_flavor.items():
            if desc.lower() in query_lower:
                material_filters["mg5"] = {"code": code, "description": desc}
                context["resolved_terms"][desc] = {"type": "flavor", "code": code}
        
        if material_filters:
            context["material_filters"] = material_filters
            self.logger.info(f"Resolved material filters: {material_filters}")
    
    def _apply_business_rules(self, query: str, client_id: str, context: Dict[str, Any]):
        """Apply client-specific business rules."""
        rules = mapping_registry.get_business_rules(client_id)
        
        applicable_rules = []
        for rule in rules:
            if rule.is_active:
                # Check if rule applies to this query
                if self._rule_applies(rule, query, context):
                    applicable_rules.append({
                        "rule_id": rule.rule_id,
                        "rule_name": rule.rule_name,
                        "formula": rule.formula,
                        "priority": rule.priority
                    })
        
        if applicable_rules:
            # Sort by priority
            applicable_rules.sort(key=lambda x: x["priority"], reverse=True)
            context["custom_logic"] = applicable_rules
            self.logger.info(f"Applied {len(applicable_rules)} business rules")
    
    def _rule_applies(self, rule: BusinessRule, query: str, context: Dict[str, Any]) -> bool:
        """Check if a business rule applies to the query."""
        # Simple keyword matching for now
        if rule.applies_to:
            query_lower = query.lower()
            for keyword in rule.applies_to:
                if keyword.lower() in query_lower:
                    return True
        return False
    
    def apply_business_rules(self, query_context: Dict[str, Any]) -> Dict[str, Any]:
        """Apply business rules to query context."""
        # This is called after initial enhancement
        client_id = query_context.get("client_id")
        if not client_id:
            return query_context
        
        # Apply any transformation rules
        transform_rules = mapping_registry.get_business_rules(client_id, "transformation")
        for rule in transform_rules:
            if rule.is_active:
                # Apply transformation logic
                # This would be implemented based on specific rule types
                pass
        
        return query_context
    
    def resolve_custom_terms(self, query: str, client_glossary: Dict[str, str]) -> str:
        """Resolve custom terms using client-specific glossary."""
        resolved_query = query
        
        # Replace custom terms with technical terms
        for custom_term, technical_term in client_glossary.items():
            # Case-insensitive replacement
            pattern = re.compile(re.escape(custom_term), re.IGNORECASE)
            resolved_query = pattern.sub(technical_term, resolved_query)
        
        return resolved_query
    
    def get_gl_filter_sql(self, gl_accounts: List[str], gl_column: str = "GL_Account") -> str:
        """Generate SQL filter for GL accounts."""
        if not gl_accounts:
            return ""
        
        if len(gl_accounts) == 1:
            return f"{gl_column} = '{gl_accounts[0]}'"
        else:
            accounts_str = "', '".join(gl_accounts)
            return f"{gl_column} IN ('{accounts_str}')"
    
    def get_material_filter_sql(self, material_filters: Dict[str, Any]) -> str:
        """Generate SQL filter for material hierarchy."""
        filters = []
        
        column_mappings = {
            "mg1": "Material Group 1 (Business Unit)",
            "mg2": "Material Group 2 (Brand)",
            "mg3": "Material Group 3 (Type)",
            "mg4": "Material Group 4 (Classification)",
            "mg5": "Material Group 5 (Flavor)"
        }
        
        for level, filter_data in material_filters.items():
            if level in column_mappings:
                column = column_mappings[level]
                code = filter_data["code"]
                filters.append(f"`{column}` = '{code}'")
        
        return " AND ".join(filters) if filters else ""