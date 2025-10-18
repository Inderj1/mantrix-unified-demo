"""Dynamic financial hierarchy that uses business configuration mappings."""

from typing import Dict, List, Optional, Set, Tuple, Any
import structlog
from src.core.financial_hierarchy import (
    HierarchyLevel, L1Metric, L2Bucket, GLAccount,
    FinancialHierarchyConfig
)
from src.core.business_config import mapping_registry
from src.core.gl_account_mapping import GLMappingLoader, CustomerGLMapping

logger = structlog.get_logger()


class DynamicFinancialHierarchy(FinancialHierarchyConfig):
    """Financial hierarchy that uses dynamic GL mappings from business config."""
    
    def __init__(self, client_id: str = "arizona_beverages", gl_mapping_loader: Optional[GLMappingLoader] = None):
        super().__init__()
        self.client_id = client_id
        self.logger = logger.bind(component="dynamic_hierarchy")
        self.gl_loader = gl_mapping_loader
        self.customer_mapping = None
        
        # Try to load customer GL mapping if loader provided
        if self.gl_loader:
            self.customer_mapping = self.gl_loader.get_mapping(client_id)
            if self.customer_mapping:
                self._update_from_gl_mapping()
        
        # Fall back to business config mappings
        self._update_from_mappings()
    
    def _update_from_mappings(self):
        """Update hierarchy with dynamic mappings from the registry."""
        # Get all buckets from the registry
        all_buckets = mapping_registry.get_all_buckets(self.client_id)
        
        if not all_buckets:
            # Try to load GL mappings if available
            if self.gl_loader or self.client_id == "arizona_beverages":
                self._try_load_gl_mappings()
                all_buckets = mapping_registry.get_all_buckets(self.client_id)
            
            if not all_buckets:
                self.logger.warning(f"No mappings found for client {self.client_id}, using defaults")
                return
        
        # Update L1 metrics with actual GL accounts
        self._update_l1_metrics()
        
        # Update L2 buckets with actual GL accounts
        self._update_l2_buckets()
        
        self.logger.info(f"Updated hierarchy with {len(all_buckets)} buckets from business config")
    
    def _update_l1_metrics(self):
        """Update L1 metric formulas to use actual GL accounts."""
        # Update Gross Margin
        if "GROSS_MARGIN" in self.l1_metrics:
            revenue_accounts = mapping_registry.get_gl_accounts_for_bucket_name(self.client_id, "Revenue")
            cogs_accounts = mapping_registry.get_gl_accounts_for_bucket_name(self.client_id, "COGS")
            
            # For revenue, use Gross_Revenue column directly
            revenue_sql = "SUM(COALESCE(Gross_Revenue, 0))"
            
            if cogs_accounts:
                # For COGS, we still use GL accounts
                cogs_sql = self._build_gl_sum_sql(cogs_accounts, positive=True)
            else:
                cogs_sql = "SUM(COALESCE(Total_COGS, 0))"
                
            self.l1_metrics["GROSS_MARGIN"].formula_components = {
                "revenue": revenue_sql,
                "cogs": cogs_sql
            }
        
        # Update Operating Income
        if "OPERATING_INCOME" in self.l1_metrics:
            opex_accounts = []
            for bucket_name in ["Selling Expenses", "G&A Expenses", "R&D Expenses", "Other Operating Expenses"]:
                opex_accounts.extend(mapping_registry.get_gl_accounts_for_bucket_name(self.client_id, bucket_name))
            
            if opex_accounts:
                opex_sql = self._build_gl_sum_sql(opex_accounts, positive=True)
                self.l1_metrics["OPERATING_INCOME"].formula_components["operating_expenses"] = opex_sql
        
        # Update EBITDA
        if "EBITDA" in self.l1_metrics:
            depreciation_accounts = mapping_registry.get_gl_accounts_for_bucket_name(
                self.client_id, "Depreciation & Amortization"
            )
            if depreciation_accounts:
                depreciation_sql = self._build_gl_sum_sql(depreciation_accounts, positive=True)
                self.l1_metrics["EBITDA"].formula_components["depreciation"] = depreciation_sql
                self.l1_metrics["EBITDA"].formula_components["amortization"] = "0"  # Combined in depreciation
        
        # Update Net Income
        if "NET_INCOME" in self.l1_metrics:
            # For net income, use Gross_Revenue directly and subtract expenses
            all_expense_accounts = []
            
            expense_buckets = [
                "COGS", "Selling Expenses", "G&A Expenses", "R&D Expenses",
                "Other Operating Expenses", "Depreciation & Amortization", "Other Income/Expense"
            ]
            
            for bucket in expense_buckets:
                accounts = mapping_registry.get_gl_accounts_for_bucket_name(self.client_id, bucket)
                if accounts:
                    all_expense_accounts.extend(accounts)
            
            # Build net income SQL using Gross_Revenue for revenue
            if all_expense_accounts:
                accounts_str = "', '".join(all_expense_accounts)
                expense_condition = f"GL_Account IN ('{accounts_str}')"
                net_income_sql = f"""
                    SUM(COALESCE(Gross_Revenue, 0)) - 
                    SUM(CASE WHEN {expense_condition} THEN GL_Amount_in_CC ELSE 0 END)
                """.strip()
            else:
                # Fallback to using available columns
                net_income_sql = "SUM(COALESCE(Gross_Revenue, 0)) - SUM(COALESCE(Total_COS, 0))"
            
            self.l1_metrics["NET_INCOME"].formula_components["net_income"] = net_income_sql
    
    def _update_l2_buckets(self):
        """Update L2 buckets with actual GL accounts from mappings."""
        # Map business config bucket names to L2 bucket codes
        bucket_name_to_code = {
            "Revenue": "REVENUE_SALES",  # Will use Gross_Revenue column directly
            "COGS": "COGS_MATERIAL",
            "Selling Expenses": "OPEX_SALES",
            "G&A Expenses": "OPEX_ADMIN",
            "R&D Expenses": "OPEX_RND",
            "Depreciation & Amortization": "OPEX_DEPRECIATION",
            "Other Income/Expense": "OTHER_EXPENSE",
            "Other Operating Expenses": "OTHER_OPERATING"
        }
        
        for bucket_name, bucket_code in bucket_name_to_code.items():
            gl_accounts = mapping_registry.get_gl_accounts_for_bucket_name(self.client_id, bucket_name)
            
            if gl_accounts and bucket_code in self.l2_buckets:
                # Update the bucket with actual GL accounts
                self.l2_buckets[bucket_code].gl_accounts = gl_accounts
                self.l2_buckets[bucket_code].gl_account_ranges = []  # Clear ranges
                
                self.logger.info(
                    f"Updated {bucket_code} with {len(gl_accounts)} GL accounts from {bucket_name}"
                )
    
    def _build_gl_sum_sql(self, gl_accounts: List[str], positive: bool = True) -> str:
        """Build SQL SUM expression for a list of GL accounts."""
        if not gl_accounts:
            return "0"
        
        # CRITICAL: For revenue accounts, use Gross_Revenue, not GL_Amount_in_CC
        # Check if these are revenue accounts (typically GL accounts 4000-4999)
        is_revenue = any(acc.startswith('4') for acc in gl_accounts if acc)
        
        # Use appropriate column based on account type
        if is_revenue:
            amount_column = "Gross_Revenue"
        else:
            amount_column = "GL_Amount_in_CC"
        
        # Build condition
        if len(gl_accounts) == 1:
            condition = f"GL_Account = '{gl_accounts[0]}'"
        else:
            accounts_str = "', '".join(gl_accounts)
            condition = f"GL_Account IN ('{accounts_str}')"
        
        sign = "" if positive else "-"
        return f"SUM(CASE WHEN {condition} THEN {sign}{amount_column} ELSE 0 END)"
    
    def get_gl_accounts_for_metric(self, metric_code: str) -> List[str]:
        """Get all GL accounts associated with a metric."""
        gl_accounts = []
        
        if metric_code in self.l1_metrics:
            metric = self.l1_metrics[metric_code]
            # Get GL accounts from all sub-buckets
            for bucket_code in metric.sub_buckets:
                if bucket_code in self.l2_buckets:
                    gl_accounts.extend(self.l2_buckets[bucket_code].gl_accounts)
        
        return list(set(gl_accounts))  # Remove duplicates
    
    def get_bucket_gl_accounts(self, bucket_code: str) -> List[str]:
        """Get GL accounts for a specific L2 bucket."""
        if bucket_code in self.l2_buckets:
            return self.l2_buckets[bucket_code].gl_accounts
        return []
    
    def _update_from_gl_mapping(self):
        """Update hierarchy using GL account mapping."""
        if not self.customer_mapping:
            return
        
        self.logger.info(f"Updating hierarchy from GL mapping for {self.client_id}")
        
        # Update L3 accounts with customer data
        self.l3_accounts.clear()
        for account_num, mapping in self.customer_mapping.accounts.items():
            self.l3_accounts[account_num] = GLAccount(
                account_number=account_num,
                description=mapping.description,
                account_type=self._determine_account_type(mapping.bucket_code),
                normal_balance=self._determine_normal_balance(mapping.bucket_code),
                parent_bucket=mapping.bucket_code
            )
        
        # Update L2 buckets based on customer mapping
        for bucket_code, account_list in self.customer_mapping.bucket_accounts.items():
            if not account_list:
                continue
            
            # Get bucket description from first account
            first_account = self.customer_mapping.accounts.get(account_list[0])
            if first_account:
                parent_metric = self._determine_parent_metric(bucket_code)
                
                self.l2_buckets[bucket_code] = L2Bucket(
                    bucket_code=bucket_code,
                    bucket_name=first_account.bucket_description,
                    description=first_account.bucket_description,
                    parent_metric=parent_metric,
                    gl_accounts=account_list
                )
        
        # Update L1 metrics with customer GL accounts
        self._update_metrics_from_gl_mapping()
    
    def _determine_account_type(self, bucket_code: str) -> str:
        """Determine account type from bucket code."""
        if bucket_code in ["REV", "SALE_DS"]:
            return "revenue"
        elif bucket_code.startswith("COGS_") or bucket_code.startswith("GNA_") or bucket_code.startswith("SEL_"):
            return "expense"
        elif bucket_code in ["FIN_INC", "OOI"]:
            return "revenue"
        elif bucket_code in ["FIN_EXP", "OOE", "TAX_INC"]:
            return "expense"
        else:
            return "expense"
    
    def _determine_normal_balance(self, bucket_code: str) -> str:
        """Determine normal balance from bucket code."""
        account_type = self._determine_account_type(bucket_code)
        return "credit" if account_type == "revenue" else "debit"
    
    def _determine_parent_metric(self, bucket_code: str) -> str:
        """Determine which L1 metric a bucket belongs to."""
        if bucket_code in ["REV", "SALE_DS"] or bucket_code.startswith("COGS_"):
            return "GROSS_MARGIN"
        elif bucket_code.startswith("GNA_") or bucket_code.startswith("SEL_") or bucket_code == "R_D":
            return "OPERATING_INCOME"
        elif bucket_code in ["GNA_DA", "COGS_DP"]:
            return "EBITDA"
        else:
            return "NET_INCOME"
    
    def _update_metrics_from_gl_mapping(self):
        """Update L1 metrics using GL mapping data."""
        if not self.customer_mapping:
            return
        
        # Update Gross Margin
        if "GROSS_MARGIN" in self.l1_metrics:
            revenue_accounts = []
            cogs_accounts = []
            
            for bucket, accounts in self.customer_mapping.bucket_accounts.items():
                if bucket == "REV":
                    revenue_accounts.extend(accounts)
                elif bucket == "SALE_DS":
                    revenue_accounts.extend(accounts)  # Will be negative in formula
                elif bucket.startswith("COGS_"):
                    cogs_accounts.extend(accounts)
            
            if revenue_accounts or cogs_accounts:
                self.l1_metrics["GROSS_MARGIN"].formula_components = {
                    "revenue": self._build_gl_sum_sql(
                        [a for a in revenue_accounts if self.customer_mapping.accounts[a].bucket_code == "REV"]
                    ),
                    "deductions": self._build_gl_sum_sql(
                        [a for a in revenue_accounts if self.customer_mapping.accounts[a].bucket_code == "SALE_DS"]
                    ),
                    "cogs": self._build_gl_sum_sql(cogs_accounts)
                }
        
        # Similar updates for other metrics...
    
    def get_customer_specific_accounts(self, concept: str) -> List[str]:
        """Get GL accounts for a financial concept using GL mapping."""
        if not self.customer_mapping:
            return []
        
        accounts = []
        concept_bucket_map = {
            "revenue": ["REV", "SALE_DS"],
            "cogs": [b for b in self.customer_mapping.bucket_accounts if b.startswith("COGS_")],
            "opex": [b for b in self.customer_mapping.bucket_accounts if b.startswith("GNA_") or b.startswith("SEL_")],
            "gross_margin": ["REV", "SALE_DS"] + [b for b in self.customer_mapping.bucket_accounts if b.startswith("COGS_")],
        }
        
        buckets = concept_bucket_map.get(concept.lower(), [])
        for bucket in buckets:
            if bucket in self.customer_mapping.bucket_accounts:
                accounts.extend(self.customer_mapping.bucket_accounts[bucket])
        
        return list(set(accounts))
    
    def refresh_mappings(self):
        """Refresh mappings from the registry."""
        # Try GL mapping first
        if self.gl_loader and self.customer_mapping:
            self._update_from_gl_mapping()
        
        # Then update from business config
        self._update_from_mappings()
    
    def _try_load_gl_mappings(self):
        """Try to load GL mappings into business config registry."""
        try:
            if self.client_id == "arizona_beverages":
                # Load Arizona GL mappings
                if not self.gl_loader:
                    from src.core.gl_account_mapping import gl_mapping_loader as default_loader
                    self.gl_loader = default_loader
                
                # Load mapping
                customer_mapping = self.gl_loader.get_mapping(self.client_id)
                if not customer_mapping:
                    customer_mapping = self.gl_loader.load_arizona_beverages_mapping()
                
                if customer_mapping:
                    # Convert to business config format and register
                    from src.core.business_config.models import GLAccountMapping as BusinessGLMapping
                    
                    gl_mappings = []
                    for account_num, account_mapping in customer_mapping.accounts.items():
                        gl_mapping = BusinessGLMapping(
                            gl_account=account_num,
                            description=account_mapping.description,  # Changed from gl_description
                            bucket_id=account_mapping.bucket_code,
                            bucket_name=account_mapping.bucket_description,
                            is_active=True
                        )
                        gl_mappings.append(gl_mapping)
                    
                    # Register with business config
                    mapping_registry.register_gl_mapping(self.client_id, gl_mappings)
                    self.logger.info(f"Loaded {len(gl_mappings)} GL mappings into business config")
                    
        except Exception as e:
            self.logger.error(f"Failed to load GL mappings: {e}")


# Create a singleton instance
dynamic_financial_hierarchy = None

def get_dynamic_hierarchy(client_id: str = "arizona_beverages", gl_mapping_loader: Optional[GLMappingLoader] = None) -> DynamicFinancialHierarchy:
    """Get or create the dynamic financial hierarchy."""
    global dynamic_financial_hierarchy
    
    # If GL mapping loader provided, always create new instance with it
    if gl_mapping_loader:
        return DynamicFinancialHierarchy(client_id, gl_mapping_loader)
    
    # Otherwise use cached instance
    if dynamic_financial_hierarchy is None or dynamic_financial_hierarchy.client_id != client_id:
        dynamic_financial_hierarchy = DynamicFinancialHierarchy(client_id)
    return dynamic_financial_hierarchy

def refresh_dynamic_hierarchy(client_id: str = "arizona_beverages", gl_mapping_loader: Optional[GLMappingLoader] = None) -> DynamicFinancialHierarchy:
    """Force refresh of the dynamic financial hierarchy after mappings are loaded."""
    global dynamic_financial_hierarchy
    dynamic_financial_hierarchy = DynamicFinancialHierarchy(client_id, gl_mapping_loader)
    return dynamic_financial_hierarchy