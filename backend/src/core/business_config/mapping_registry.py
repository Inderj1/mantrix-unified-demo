"""Registry for storing and retrieving business mappings."""

from typing import Dict, List, Optional, Any, Set
import structlog
from collections import defaultdict

from .models import (
    GLAccountMapping,
    MaterialGroupHierarchy,
    BusinessRule,
    DimensionConfig
)

logger = structlog.get_logger()


class MappingRegistry:
    """Central registry for all business mappings."""
    
    def __init__(self):
        self.logger = logger.bind(component="mapping_registry")
        
        # GL Account mappings by client
        self.gl_mappings: Dict[str, Dict[str, GLAccountMapping]] = defaultdict(dict)
        
        # Material hierarchies by client
        self.material_hierarchies: Dict[str, MaterialGroupHierarchy] = {}
        
        # Business rules by client and rule type
        self.business_rules: Dict[str, Dict[str, List[BusinessRule]]] = defaultdict(lambda: defaultdict(list))
        
        # Dimension mappings
        self.dimension_mappings: Dict[str, Dict[str, DimensionConfig]] = defaultdict(dict)
        
        # Reverse lookup for GL accounts to buckets
        self.gl_to_bucket: Dict[str, Dict[str, str]] = defaultdict(dict)
        
        # Bucket to GL accounts mapping
        self.bucket_to_gl: Dict[str, Dict[str, List[str]]] = defaultdict(lambda: defaultdict(list))
    
    def register_gl_mapping(self, client_id: str, mapping_data: List[GLAccountMapping]):
        """Register GL account mappings for a client."""
        self.logger.info(f"Registering {len(mapping_data)} GL mappings for {client_id}")
        
        for mapping in mapping_data:
            # Store in main registry
            self.gl_mappings[client_id][mapping.gl_account] = mapping
            
            # Store reverse lookup
            self.gl_to_bucket[client_id][mapping.gl_account] = mapping.bucket_id
            
            # Store bucket to GL mapping
            self.bucket_to_gl[client_id][mapping.bucket_id].append(mapping.gl_account)
    
    def register_material_hierarchy(self, client_id: str, hierarchy: MaterialGroupHierarchy):
        """Register material hierarchy for a client."""
        self.logger.info(f"Registering material hierarchy for {client_id}")
        self.material_hierarchies[client_id] = hierarchy
    
    def register_business_rule(self, client_id: str, rule: BusinessRule):
        """Register a business rule for a client."""
        self.business_rules[client_id][rule.rule_type].append(rule)
        self.logger.info(f"Registered {rule.rule_type} rule '{rule.rule_name}' for {client_id}")
    
    def register_dimension_mapping(self, client_id: str, dimension: DimensionConfig):
        """Register a custom dimension for a client."""
        self.dimension_mappings[client_id][dimension.dimension_code] = dimension
        self.logger.info(f"Registered dimension '{dimension.dimension_name}' for {client_id}")
    
    def get_gl_account(self, client_id: str, gl_account: str) -> Optional[GLAccountMapping]:
        """Get GL account mapping for a specific account."""
        return self.gl_mappings[client_id].get(gl_account)
    
    def get_gl_accounts_for_bucket(self, client_id: str, bucket_id: str) -> List[str]:
        """Get all GL accounts for a bucket."""
        return self.bucket_to_gl[client_id].get(bucket_id, [])
    
    def get_gl_accounts_for_bucket_name(self, client_id: str, bucket_name: str) -> List[str]:
        """Get all GL accounts for a bucket by name."""
        gl_accounts = []
        for gl_account, mapping in self.gl_mappings[client_id].items():
            if mapping.bucket_name.lower() == bucket_name.lower():
                gl_accounts.append(gl_account)
        return gl_accounts
    
    def get_bucket_for_gl(self, client_id: str, gl_account: str) -> Optional[str]:
        """Get bucket ID for a GL account."""
        return self.gl_to_bucket[client_id].get(gl_account)
    
    def get_material_hierarchy(self, client_id: str) -> Optional[MaterialGroupHierarchy]:
        """Get material hierarchy for a client."""
        return self.material_hierarchies.get(client_id)
    
    def get_business_rules(self, client_id: str, rule_type: Optional[str] = None) -> List[BusinessRule]:
        """Get business rules for a client."""
        if rule_type:
            return self.business_rules[client_id].get(rule_type, [])
        
        # Return all rules
        all_rules = []
        for rules in self.business_rules[client_id].values():
            all_rules.extend(rules)
        return all_rules
    
    def get_mapping_for_query(self, query_context: Dict[str, Any]) -> Dict[str, Any]:
        """Get all relevant mappings for a query context."""
        client_id = query_context.get("client_id", "arizona_beverages")
        
        mappings = {
            "gl_mappings": self.gl_mappings.get(client_id, {}),
            "material_hierarchy": self.material_hierarchies.get(client_id),
            "business_rules": self.get_business_rules(client_id),
            "dimensions": self.dimension_mappings.get(client_id, {})
        }
        
        # Add bucket mappings
        mappings["bucket_to_gl"] = dict(self.bucket_to_gl.get(client_id, {}))
        mappings["gl_to_bucket"] = dict(self.gl_to_bucket.get(client_id, {}))
        
        return mappings
    
    def search_gl_accounts(self, client_id: str, search_term: str) -> List[GLAccountMapping]:
        """Search GL accounts by account number or description."""
        results = []
        search_lower = search_term.lower()
        
        for gl_account, mapping in self.gl_mappings[client_id].items():
            if (search_lower in gl_account.lower() or 
                search_lower in mapping.description.lower() or
                search_lower in mapping.bucket_name.lower()):
                results.append(mapping)
        
        return results
    
    def get_all_buckets(self, client_id: str) -> List[str]:
        """Get all unique bucket names for a client."""
        bucket_names = set()
        
        for mapping in self.gl_mappings[client_id].values():
            bucket_names.add(mapping.bucket_name)
        
        return list(bucket_names)
    
    def get_all_bucket_mappings(self, client_id: str) -> Dict[str, Set[str]]:
        """Get all unique buckets with their IDs and names for a client."""
        buckets = defaultdict(set)
        
        for mapping in self.gl_mappings[client_id].values():
            buckets[mapping.bucket_id].add(mapping.bucket_name)
        
        return dict(buckets)
    
    def clear_client_mappings(self, client_id: str):
        """Clear all mappings for a client."""
        self.gl_mappings.pop(client_id, None)
        self.material_hierarchies.pop(client_id, None)
        self.business_rules.pop(client_id, None)
        self.dimension_mappings.pop(client_id, None)
        self.gl_to_bucket.pop(client_id, None)
        self.bucket_to_gl.pop(client_id, None)
        
        self.logger.info(f"Cleared all mappings for {client_id}")


# Global registry instance
mapping_registry = MappingRegistry()