"""Table registry for managing domain-based table mappings and relationships."""

from typing import Dict, List, Optional, Set, Tuple
from enum import Enum
import re
import structlog
from dataclasses import dataclass

logger = structlog.get_logger()


class TableDomain(Enum):
    """Business domains for table classification."""
    FINANCIAL = "financial"
    SALES_OPERATIONS = "sales_operations"
    INVENTORY = "inventory"
    CUSTOMER = "customer"
    PRODUCT = "product"
    GENERAL = "general"


@dataclass
class TableRelationship:
    """Defines a relationship between two tables."""
    source_table: str
    target_table: str
    join_keys: List[Tuple[str, str]]  # [(source_col, target_col)]
    join_type: str = "left"  # inner, left, right, full
    relationship_type: str = "one_to_many"  # one_to_one, one_to_many, many_to_many


@dataclass
class DomainConfig:
    """Configuration for a business domain."""
    domain: TableDomain
    table_patterns: List[str]  # Regex patterns for table names
    keywords: List[str]  # Keywords that indicate this domain
    priority: int  # Priority for selection (lower = higher priority)
    default_tables: List[str] = None  # Default tables to include


class TableRegistry:
    """Registry for managing table domains and relationships."""
    
    def __init__(self):
        self.domain_configs = self._initialize_domain_configs()
        self.table_relationships = self._initialize_relationships()
        self.table_cache: Dict[str, TableDomain] = {}
        
    def _initialize_domain_configs(self) -> Dict[TableDomain, DomainConfig]:
        """Initialize domain configurations."""
        return {
            TableDomain.FINANCIAL: DomainConfig(
                domain=TableDomain.FINANCIAL,
                table_patterns=[
                    r"copa_export.*",
                    r"gl_.*",
                    r"general_ledger.*",
                    r"profit_loss.*",
                    r"financial_.*"
                ],
                keywords=[
                    "revenue", "margin", "profit", "costs", "expenses",
                    "ebitda", "income", "earnings", "financial", "gl"
                ],
                priority=1,
                default_tables=["copa_export_copa_data_000000000000"]
            ),
            
            TableDomain.SALES_OPERATIONS: DomainConfig(
                domain=TableDomain.SALES_OPERATIONS,
                table_patterns=[
                    r"sales_order.*",
                    r"order_.*",
                    r"delivery.*",
                    r"shipment.*",
                    r"billing.*"
                ],
                keywords=[
                    "order", "delivery", "shipment", "fulfillment",
                    "billing", "dispatch", "cockpit", "sales order"
                ],
                priority=2,
                default_tables=["sales_order_cockpit_export"]
            ),
            
            TableDomain.INVENTORY: DomainConfig(
                domain=TableDomain.INVENTORY,
                table_patterns=[
                    r"inventory.*",
                    r"stock.*",
                    r"warehouse.*",
                    r"material_movement.*"
                ],
                keywords=[
                    "inventory", "stock", "warehouse", "materials",
                    "storage", "supply"
                ],
                priority=3
            ),
            
            TableDomain.CUSTOMER: DomainConfig(
                domain=TableDomain.CUSTOMER,
                table_patterns=[
                    r"customer.*",
                    r"client.*",
                    r"account.*",
                    r"contact.*"
                ],
                keywords=[
                    "customer", "client", "account", "buyer",
                    "purchaser", "contact"
                ],
                priority=4
            ),
            
            TableDomain.PRODUCT: DomainConfig(
                domain=TableDomain.PRODUCT,
                table_patterns=[
                    r"product.*",
                    r"material.*",
                    r"item.*",
                    r"sku.*",
                    r"catalog.*"
                ],
                keywords=[
                    "product", "item", "sku", "material",
                    "merchandise", "goods"
                ],
                priority=5
            ),
            
            TableDomain.GENERAL: DomainConfig(
                domain=TableDomain.GENERAL,
                table_patterns=[r".*"],  # Matches everything
                keywords=[],
                priority=99
            )
        }
    
    def _initialize_relationships(self) -> List[TableRelationship]:
        """Initialize known table relationships with actual schema column names."""
        return [
            # COPA (dataset_25m_table) to Sales Order Cockpit relationship
            # Primary join on Sales Order number
            TableRelationship(
                source_table="dataset_25m_table",
                target_table="sales_order_cockpit_export",
                join_keys=[
                    ("Sales_Order_KDAUF", "SalesDocument_VBELN"),  # Primary: Order number
                ],
                join_type="left",
                relationship_type="one_to_many"
            ),

            # Alternative COPA to Sales Order join paths
            TableRelationship(
                source_table="dataset_25m_table",
                target_table="sales_order_cockpit_export",
                join_keys=[
                    ("Customer", "SoldToParty_KUNNR"),  # Join by customer
                ],
                join_type="left",
                relationship_type="one_to_many"
            ),

            TableRelationship(
                source_table="dataset_25m_table",
                target_table="sales_order_cockpit_export",
                join_keys=[
                    ("Material_Number", "Material_MATNR"),  # Join by material
                ],
                join_type="left",
                relationship_type="one_to_many"
            ),

            # Legacy relationships for backward compatibility
            # Sales Order to Customer Master
            TableRelationship(
                source_table="sales_order_cockpit_export",
                target_table="customer_master",
                join_keys=[("SoldToParty_KUNNR", "CustomerCode")],
                join_type="left",
                relationship_type="many_to_one"
            ),

            # Sales Order to Product Master
            TableRelationship(
                source_table="sales_order_cockpit_export",
                target_table="product_master",
                join_keys=[("Material_MATNR", "MaterialNumber")],
                join_type="left",
                relationship_type="many_to_one"
            )
        ]
    
    def classify_table(self, table_name: str) -> TableDomain:
        """Classify a table into a business domain."""
        # Check cache first
        if table_name in self.table_cache:
            return self.table_cache[table_name]
        
        table_lower = table_name.lower()
        
        # Check each domain's patterns (in priority order)
        sorted_domains = sorted(
            self.domain_configs.values(),
            key=lambda x: x.priority
        )
        
        for config in sorted_domains:
            for pattern in config.table_patterns:
                if re.match(pattern, table_lower):
                    self.table_cache[table_name] = config.domain
                    return config.domain
        
        # Default to general
        self.table_cache[table_name] = TableDomain.GENERAL
        return TableDomain.GENERAL
    
    def get_domains_for_query(self, query: str) -> List[TableDomain]:
        """Identify relevant domains based on query keywords."""
        query_lower = query.lower()
        domains = []
        
        for config in self.domain_configs.values():
            if config.domain == TableDomain.GENERAL:
                continue  # Skip general domain in keyword matching
                
            for keyword in config.keywords:
                if keyword in query_lower:
                    if config.domain not in domains:
                        domains.append(config.domain)
                    break
        
        # If no specific domains found, add general
        if not domains:
            domains.append(TableDomain.GENERAL)
        
        return domains
    
    def get_tables_for_domains(
        self, 
        domains: List[TableDomain],
        all_tables: List[str]
    ) -> List[str]:
        """Get tables that belong to specified domains."""
        result_tables = []
        
        for domain in domains:
            config = self.domain_configs.get(domain)
            if not config:
                continue
            
            # Add default tables if specified
            if config.default_tables:
                for table in config.default_tables:
                    if table not in result_tables:
                        result_tables.append(table)
            
            # Check all available tables against domain patterns
            for table in all_tables:
                if self.classify_table(table) == domain:
                    if table not in result_tables:
                        result_tables.append(table)
        
        return result_tables
    
    def find_relationships(
        self,
        tables: List[str]
    ) -> List[TableRelationship]:
        """Find relationships between given tables."""
        relationships = []
        table_set = set(tables)
        
        for rel in self.table_relationships:
            if (rel.source_table in table_set and 
                rel.target_table in table_set):
                relationships.append(rel)
        
        return relationships
    
    def get_join_hints(
        self,
        source_table: str,
        target_table: str
    ) -> Optional[Dict]:
        """Get join hints for two tables."""
        for rel in self.table_relationships:
            if (rel.source_table == source_table and 
                rel.target_table == target_table):
                return {
                    "join_keys": rel.join_keys,
                    "join_type": rel.join_type,
                    "relationship": rel.relationship_type
                }
            # Check reverse relationship
            elif (rel.source_table == target_table and 
                  rel.target_table == source_table):
                # Reverse the join keys
                reversed_keys = [(t, s) for s, t in rel.join_keys]
                return {
                    "join_keys": reversed_keys,
                    "join_type": "right" if rel.join_type == "left" else rel.join_type,
                    "relationship": rel.relationship_type
                }
        
        return None
    
    def suggest_tables_for_query(
        self,
        query: str,
        available_tables: List[str],
        max_tables: int = 5
    ) -> Dict:
        """Suggest tables for a query based on domains and relationships."""
        # Identify relevant domains
        domains = self.get_domains_for_query(query)
        
        # Get tables for those domains
        domain_tables = self.get_tables_for_domains(domains, available_tables)
        
        # Limit to max_tables
        selected_tables = domain_tables[:max_tables]
        
        # Find relationships between selected tables
        relationships = self.find_relationships(selected_tables)
        
        # Build join hints
        join_hints = []
        for rel in relationships:
            join_hints.append({
                "source": rel.source_table,
                "target": rel.target_table,
                "keys": rel.join_keys,
                "type": rel.join_type
            })
        
        return {
            "tables": selected_tables,
            "domains": [d.value for d in domains],
            "join_hints": join_hints,
            "requires_join": len(selected_tables) > 1
        }


# Singleton instance
table_registry = TableRegistry()