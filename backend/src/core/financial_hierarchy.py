"""Three-tiered GL hierarchy configuration for financial query resolution."""

from typing import Dict, List, Optional, Set, Tuple
from pydantic import BaseModel, Field
import re
from enum import Enum
import structlog

logger = structlog.get_logger()


class HierarchyLevel(Enum):
    """GL hierarchy levels."""
    L1_METRIC = 1  # Financial metrics with formulas
    L2_BUCKET = 2  # Sub-buckets for grouping
    L3_ACCOUNT = 3  # Individual GL accounts


class GLAccount(BaseModel):
    """Individual GL account definition."""
    account_number: str
    description: str
    account_type: str  # asset, liability, revenue, expense, equity
    normal_balance: str = "debit"  # debit or credit
    is_active: bool = True
    parent_bucket: Optional[str] = None


class L2Bucket(BaseModel):
    """Level 2 sub-bucket definition."""
    bucket_code: str
    bucket_name: str
    description: str
    parent_metric: str  # L1 metric this belongs to
    gl_accounts: List[str] = []  # GL account numbers
    gl_account_ranges: List[Tuple[str, str]] = []  # Account ranges (from, to)


class L1Metric(BaseModel):
    """Level 1 financial metric definition."""
    metric_code: str
    metric_name: str
    description: str
    formula: str  # Human-readable formula
    formula_components: Dict[str, str]  # Component name -> SQL expression
    sub_buckets: List[str] = []  # L2 bucket codes
    calculation_order: int = 0  # For dependent calculations
    is_percentage: bool = False


class FinancialHierarchyConfig:
    """Three-tier GL hierarchy configuration."""
    
    def __init__(self):
        # Level 1: Financial Metrics with Formulas
        self.l1_metrics = {
            "GROSS_MARGIN": L1Metric(
                metric_code="GROSS_MARGIN",
                metric_name="Gross Margin",
                description="Revenue minus Cost of Goods Sold",
                formula="Revenue - COGS",
                formula_components={
                    "revenue": "SUM(CASE WHEN gl_account BETWEEN '4000' AND '4999' THEN amount ELSE 0 END)",
                    "cogs": "SUM(CASE WHEN gl_account BETWEEN '5000' AND '5999' THEN amount ELSE 0 END)"
                },
                sub_buckets=["REVENUE_SALES", "REVENUE_SERVICE", "COGS_MATERIAL", "COGS_LABOR", "COGS_OVERHEAD"],
                calculation_order=1
            ),
            "GROSS_MARGIN_PCT": L1Metric(
                metric_code="GROSS_MARGIN_PCT",
                metric_name="Gross Margin %",
                description="Gross Margin as percentage of Revenue",
                formula="(Revenue - COGS) / Revenue * 100",
                formula_components={
                    "gross_margin_pct": "SAFE_DIVIDE(SUM(CASE WHEN gl_account BETWEEN '4000' AND '4999' THEN amount ELSE 0 END) - SUM(CASE WHEN gl_account BETWEEN '5000' AND '5999' THEN amount ELSE 0 END), SUM(CASE WHEN gl_account BETWEEN '4000' AND '4999' THEN amount ELSE 0 END)) * 100"
                },
                sub_buckets=["REVENUE_SALES", "REVENUE_SERVICE", "COGS_MATERIAL", "COGS_LABOR", "COGS_OVERHEAD"],
                calculation_order=2,
                is_percentage=True
            ),
            "OPERATING_INCOME": L1Metric(
                metric_code="OPERATING_INCOME",
                metric_name="Operating Income",
                description="Gross Margin minus Operating Expenses",
                formula="Gross Margin - Operating Expenses",
                formula_components={
                    "gross_margin": "SUM(CASE WHEN gl_account BETWEEN '4000' AND '4999' THEN amount WHEN gl_account BETWEEN '5000' AND '5999' THEN -amount ELSE 0 END)",
                    "operating_expenses": "SUM(CASE WHEN gl_account BETWEEN '6000' AND '6999' THEN amount ELSE 0 END)"
                },
                sub_buckets=["OPEX_SALES", "OPEX_MARKETING", "OPEX_ADMIN", "OPEX_RND"],
                calculation_order=3
            ),
            "EBITDA": L1Metric(
                metric_code="EBITDA",
                metric_name="EBITDA",
                description="Earnings Before Interest, Taxes, Depreciation, and Amortization",
                formula="Operating Income + Depreciation + Amortization",
                formula_components={
                    "operating_income": "SUM(CASE WHEN gl_account BETWEEN '4000' AND '4999' THEN amount WHEN gl_account BETWEEN '5000' AND '6999' THEN -amount ELSE 0 END)",
                    "depreciation": "SUM(CASE WHEN gl_account IN ('6810', '6820', '6830') THEN amount ELSE 0 END)",
                    "amortization": "SUM(CASE WHEN gl_account IN ('6840', '6850') THEN amount ELSE 0 END)"
                },
                sub_buckets=["OPEX_DEPRECIATION", "OPEX_AMORTIZATION"],
                calculation_order=4
            ),
            "NET_INCOME": L1Metric(
                metric_code="NET_INCOME",
                metric_name="Net Income",
                description="Final profit after all expenses and taxes",
                formula="Operating Income - Interest - Taxes - Other Expenses",
                formula_components={
                    "net_income": "SUM(CASE WHEN gl_account BETWEEN '4000' AND '4999' THEN amount WHEN gl_account BETWEEN '5000' AND '8999' THEN -amount ELSE 0 END)"
                },
                sub_buckets=["OTHER_INCOME", "OTHER_EXPENSE", "INTEREST_EXPENSE", "TAX_EXPENSE"],
                calculation_order=5
            ),
            "NET_MARGIN_PCT": L1Metric(
                metric_code="NET_MARGIN_PCT",
                metric_name="Net Margin %",
                description="Net Income as percentage of Revenue",
                formula="Net Income / Revenue * 100",
                formula_components={
                    "net_margin_pct": "SAFE_DIVIDE(SUM(CASE WHEN gl_account BETWEEN '4000' AND '4999' THEN amount WHEN gl_account BETWEEN '5000' AND '8999' THEN -amount ELSE 0 END), SUM(CASE WHEN gl_account BETWEEN '4000' AND '4999' THEN amount ELSE 0 END)) * 100"
                },
                sub_buckets=[],
                calculation_order=6,
                is_percentage=True
            )
        }
        
        # Level 2: Sub-Buckets
        self.l2_buckets = {
            # Revenue Buckets
            "REVENUE_SALES": L2Bucket(
                bucket_code="REVENUE_SALES",
                bucket_name="Sales Revenue",
                description="Revenue from product sales",
                parent_metric="GROSS_MARGIN",
                gl_accounts=["4000", "4010", "4020", "4030"],
                gl_account_ranges=[("4000", "4299")]
            ),
            "REVENUE_SERVICE": L2Bucket(
                bucket_code="REVENUE_SERVICE",
                bucket_name="Service Revenue",
                description="Revenue from services",
                parent_metric="GROSS_MARGIN",
                gl_accounts=["4300", "4310", "4320"],
                gl_account_ranges=[("4300", "4499")]
            ),
            
            # COGS Buckets
            "COGS_MATERIAL": L2Bucket(
                bucket_code="COGS_MATERIAL",
                bucket_name="Material Costs",
                description="Direct material costs",
                parent_metric="GROSS_MARGIN",
                gl_accounts=["5000", "5010", "5020"],
                gl_account_ranges=[("5000", "5299")]
            ),
            "COGS_LABOR": L2Bucket(
                bucket_code="COGS_LABOR",
                bucket_name="Direct Labor",
                description="Direct labor costs",
                parent_metric="GROSS_MARGIN",
                gl_accounts=["5300", "5310", "5320"],
                gl_account_ranges=[("5300", "5499")]
            ),
            "COGS_OVERHEAD": L2Bucket(
                bucket_code="COGS_OVERHEAD",
                bucket_name="Manufacturing Overhead",
                description="Manufacturing overhead costs",
                parent_metric="GROSS_MARGIN",
                gl_accounts=["5500", "5510", "5520", "5530"],
                gl_account_ranges=[("5500", "5799")]
            ),
            
            # Operating Expense Buckets
            "OPEX_SALES": L2Bucket(
                bucket_code="OPEX_SALES",
                bucket_name="Sales Expenses",
                description="Sales and distribution expenses",
                parent_metric="OPERATING_INCOME",
                gl_accounts=["6000", "6010", "6020"],
                gl_account_ranges=[("6000", "6199")]
            ),
            "OPEX_MARKETING": L2Bucket(
                bucket_code="OPEX_MARKETING",
                bucket_name="Marketing Expenses",
                description="Marketing and advertising expenses",
                parent_metric="OPERATING_INCOME",
                gl_accounts=["6200", "6210", "6220"],
                gl_account_ranges=[("6200", "6299")]
            ),
            "OPEX_ADMIN": L2Bucket(
                bucket_code="OPEX_ADMIN",
                bucket_name="Administrative Expenses",
                description="General and administrative expenses",
                parent_metric="OPERATING_INCOME",
                gl_accounts=["6300", "6310", "6320", "6330"],
                gl_account_ranges=[("6300", "6499")]
            ),
            "OPEX_RND": L2Bucket(
                bucket_code="OPEX_RND",
                bucket_name="R&D Expenses",
                description="Research and development expenses",
                parent_metric="OPERATING_INCOME",
                gl_accounts=["6500", "6510", "6520"],
                gl_account_ranges=[("6500", "6599")]
            ),
            "OPEX_DEPRECIATION": L2Bucket(
                bucket_code="OPEX_DEPRECIATION",
                bucket_name="Depreciation",
                description="Depreciation expense",
                parent_metric="EBITDA",
                gl_accounts=["6810", "6820", "6830"]
            ),
            "OPEX_AMORTIZATION": L2Bucket(
                bucket_code="OPEX_AMORTIZATION",
                bucket_name="Amortization",
                description="Amortization expense",
                parent_metric="EBITDA",
                gl_accounts=["6840", "6850"]
            ),
            
            # Other Buckets
            "OTHER_INCOME": L2Bucket(
                bucket_code="OTHER_INCOME",
                bucket_name="Other Income",
                description="Non-operating income",
                parent_metric="NET_INCOME",
                gl_accounts=["7000", "7010", "7020"],
                gl_account_ranges=[("7000", "7499")]
            ),
            "OTHER_EXPENSE": L2Bucket(
                bucket_code="OTHER_EXPENSE",
                bucket_name="Other Expenses",
                description="Non-operating expenses",
                parent_metric="NET_INCOME",
                gl_accounts=["7500", "7510", "7520"],
                gl_account_ranges=[("7500", "7999")]
            ),
            "INTEREST_EXPENSE": L2Bucket(
                bucket_code="INTEREST_EXPENSE",
                bucket_name="Interest Expense",
                description="Interest on debt",
                parent_metric="NET_INCOME",
                gl_accounts=["8000", "8010", "8020"],
                gl_account_ranges=[("8000", "8099")]
            ),
            "TAX_EXPENSE": L2Bucket(
                bucket_code="TAX_EXPENSE",
                bucket_name="Tax Expense",
                description="Income tax expense",
                parent_metric="NET_INCOME",
                gl_accounts=["8500", "8510", "8520"],
                gl_account_ranges=[("8500", "8599")]
            )
        }
        
        # Level 3: Sample GL Accounts (would be loaded from database in production)
        self.l3_accounts = {
            "4000": GLAccount(
                account_number="4000",
                description="Product Sales - Domestic",
                account_type="revenue",
                normal_balance="credit",
                parent_bucket="REVENUE_SALES"
            ),
            "4010": GLAccount(
                account_number="4010",
                description="Product Sales - International",
                account_type="revenue",
                normal_balance="credit",
                parent_bucket="REVENUE_SALES"
            ),
            "5000": GLAccount(
                account_number="5000",
                description="Raw Materials",
                account_type="expense",
                normal_balance="debit",
                parent_bucket="COGS_MATERIAL"
            ),
            "5300": GLAccount(
                account_number="5300",
                description="Direct Labor - Production",
                account_type="expense",
                normal_balance="debit",
                parent_bucket="COGS_LABOR"
            ),
            "5500": GLAccount(
                account_number="5500",
                description="Factory Rent",
                account_type="expense",
                normal_balance="debit",
                parent_bucket="COGS_OVERHEAD"
            ),
            "5510": GLAccount(
                account_number="5510",
                description="Freight In",
                account_type="expense",
                normal_balance="debit",
                parent_bucket="COGS_OVERHEAD"
            ),
            "6000": GLAccount(
                account_number="6000",
                description="Sales Salaries",
                account_type="expense",
                normal_balance="debit",
                parent_bucket="OPEX_SALES"
            ),
            "6200": GLAccount(
                account_number="6200",
                description="Advertising - Digital",
                account_type="expense",
                normal_balance="debit",
                parent_bucket="OPEX_MARKETING"
            ),
            "6300": GLAccount(
                account_number="6300",
                description="Office Rent",
                account_type="expense",
                normal_balance="debit",
                parent_bucket="OPEX_ADMIN"
            ),
            "6310": GLAccount(
                account_number="6310",
                description="Office Utilities",
                account_type="expense",
                normal_balance="debit",
                parent_bucket="OPEX_ADMIN"
            ),
            "6320": GLAccount(
                account_number="6320",
                description="Professional Fees",
                account_type="expense",
                normal_balance="debit",
                parent_bucket="OPEX_ADMIN"
            )
        }
    
    def get_metric_by_name(self, name: str) -> Optional[L1Metric]:
        """Find L1 metric by name (case-insensitive)."""
        name_lower = name.lower()
        for metric in self.l1_metrics.values():
            if (metric.metric_name.lower() == name_lower or 
                metric.metric_code.lower() == name_lower or
                any(word in name_lower for word in metric.metric_name.lower().split())):
                return metric
        return None
    
    def get_bucket_by_name(self, name: str) -> Optional[L2Bucket]:
        """Find L2 bucket by name or code."""
        name_lower = name.lower()
        for bucket in self.l2_buckets.values():
            if (bucket.bucket_name.lower() == name_lower or 
                bucket.bucket_code.lower() == name_lower or
                any(word in name_lower for word in bucket.bucket_name.lower().split())):
                return bucket
        return None
    
    def get_gl_accounts_for_metric(self, metric_code: str) -> Set[str]:
        """Get all GL accounts associated with an L1 metric."""
        metric = self.l1_metrics.get(metric_code)
        if not metric:
            return set()
        
        accounts = set()
        for bucket_code in metric.sub_buckets:
            bucket = self.l2_buckets.get(bucket_code)
            if bucket:
                accounts.update(bucket.gl_accounts)
                # Add accounts from ranges
                for start, end in bucket.gl_account_ranges:
                    # In production, this would query the actual GL accounts in range
                    pass
        
        return accounts
    
    def get_gl_accounts_for_bucket(self, bucket_code: str) -> Set[str]:
        """Get all GL accounts in an L2 bucket."""
        bucket = self.l2_buckets.get(bucket_code)
        if not bucket:
            return set()
        
        accounts = set(bucket.gl_accounts)
        # In production, would expand ranges to actual accounts
        return accounts
    
    def search_gl_accounts(self, search_term: str) -> List[GLAccount]:
        """Fuzzy search GL accounts by description."""
        search_lower = search_term.lower()
        matches = []
        
        for account in self.l3_accounts.values():
            if search_lower in account.description.lower():
                matches.append(account)
        
        return matches
    
    def get_hierarchy_path(self, gl_account: str) -> Dict[str, str]:
        """Get the full hierarchy path for a GL account."""
        path = {"gl_account": gl_account}
        
        # Find L3 account
        account = self.l3_accounts.get(gl_account)
        if account:
            path["gl_description"] = account.description
            path["l2_bucket"] = account.parent_bucket
            
            # Find L2 bucket
            if account.parent_bucket:
                bucket = self.l2_buckets.get(account.parent_bucket)
                if bucket:
                    path["l2_name"] = bucket.bucket_name
                    path["l1_metric"] = bucket.parent_metric
                    
                    # Find L1 metric
                    metric = self.l1_metrics.get(bucket.parent_metric)
                    if metric:
                        path["l1_name"] = metric.metric_name
        
        return path
    
    def generate_metric_sql(self, metric_code: str, filters: Optional[Dict[str, str]] = None) -> str:
        """Generate SQL for an L1 metric calculation."""
        metric = self.l1_metrics.get(metric_code)
        if not metric:
            return ""
        
        # Build base SQL with formula components
        sql_parts = []
        for component_name, sql_expr in metric.formula_components.items():
            sql_parts.append(f"{sql_expr} as {component_name}")
        
        base_sql = f"""
        SELECT 
            {', '.join(sql_parts)}
        FROM gl_transactions
        WHERE 1=1
        """
        
        # Add filters
        if filters:
            for field, value in filters.items():
                base_sql += f"\n    AND {field} = '{value}'"
        
        return base_sql.strip()
    
    def get_metric_dependencies(self, metric_code: str) -> List[str]:
        """Get metrics that need to be calculated before this metric."""
        metric = self.l1_metrics.get(metric_code)
        if not metric:
            return []
        
        dependencies = []
        for m_code, m in self.l1_metrics.items():
            if m.calculation_order < metric.calculation_order:
                dependencies.append(m_code)
        
        return sorted(dependencies, key=lambda x: self.l1_metrics[x].calculation_order)


# Singleton instance
financial_hierarchy = FinancialHierarchyConfig()