"""GL Account Mapping System for Customer-Specific Financial Structures."""

import csv
import json
from typing import Dict, List, Optional, Set, Tuple, Any
from pathlib import Path
from datetime import datetime
import structlog
from pydantic import BaseModel, Field
from enum import Enum

logger = structlog.get_logger()


class GLBucketType(Enum):
    """Standard GL bucket types across customers."""
    # Revenue Categories
    REV = "Revenue (Sales)"
    SALE_DS = "Sale Deductions"
    
    # COGS Categories
    COGS_DM = "COGS - Direct Materials"
    COGS_PK = "COGS - Packaging & Supplies"
    COGS_FG = "COGS - Finished Goods"
    COGS_AD = "COGS – Inventory Adjustments"
    COGS_DL = "COGS - Direct Labor"
    COGS_EX = "COGS – Subcontracting / External Ops"
    COGS_OH = "COGS – Manufacturing Overhead"
    COGS_VR = "COGS – Price Variance"
    COGS_FR = "COGS – Freight-In & Logistics"
    COGS_WH = "COGS – Warehouse Allocation"
    COGS_OT = "COGS – Other Direct COGS"
    COGS_CR = "COGS – Credits / Contra COGS"
    COGS_DP = "COGS – Depreciation (Direct)"
    
    # G&A Categories
    GNA_PAY = "G&A – Payroll & Benefits"
    GNA_INS = "G&A – Insurance"
    GNA_FAC = "G&A – Facilities & Rent"
    GNA_DA = "G&A – Depreciation & Amortization (Admin)"
    GNA_SUP = "G&A – Office Supplies & Admin"
    GNA_OT = "G&A – Other G&A"
    GNA_PRO = "G&A – Legal & Professional Services"
    
    # Selling Categories
    SEL_PAY = "Selling – Payroll & Commissions"
    SEL_ADV = "Selling – Advertising & Promotions"
    SEL_EVT = "Selling – Trade Shows & Events"
    SEL_OT = "Selling – Other Selling Expense"
    SEL_TRV = "Selling – Travel & Client Entertainment"
    
    # Financial Categories
    FIN_INC = "Interest Income"
    FIN_EXP = "Interest Expense"
    
    # Other Categories
    OOI = "Other Operating Income"
    OOE = "Other Operating Expense"
    FX_GL = "Foreign Exchange Gain/Loss"
    TAX_INC = "Income Tax Expense"
    R_D = "R&D Expense"
    
    # Internal/Special Categories
    RA_COGS = "Result Analysis – COGS"
    RA_REV = "Result Analysis – Revenue"
    IA_GNA_PAY = "Internal Allocation – G&A – Payroll & Benefits"
    IA_GNA_PRO = "Internal Allocation – G&A – Professional Fees"


class GLAccountMapping(BaseModel):
    """GL account mapping entry."""
    account_number: str = Field(description="GL account number")
    description: str = Field(description="GL account description")
    bucket_code: str = Field(description="Bucket category code")
    bucket_description: str = Field(description="Bucket category description")
    is_active: bool = Field(default=True, description="Whether account is active")
    custom_attributes: Dict[str, Any] = Field(default_factory=dict, description="Customer-specific attributes")


class CustomerGLMapping(BaseModel):
    """Complete GL mapping for a customer."""
    customer_id: str = Field(description="Customer identifier")
    customer_name: str = Field(description="Customer display name")
    mapping_version: str = Field(description="Version of this mapping")
    created_date: datetime = Field(default_factory=datetime.now)
    last_updated: datetime = Field(default_factory=datetime.now)
    
    # GL account mappings
    accounts: Dict[str, GLAccountMapping] = Field(default_factory=dict, description="Account number -> mapping")
    
    # Bucket aggregations
    bucket_accounts: Dict[str, List[str]] = Field(default_factory=dict, description="Bucket code -> account list")
    
    # Custom bucket definitions (customer-specific)
    custom_buckets: Dict[str, str] = Field(default_factory=dict, description="Custom bucket code -> description")
    
    # Metadata
    total_accounts: int = 0
    total_buckets: int = 0
    source_file: Optional[str] = None


class GLMappingLoader:
    """Loads and manages customer-specific GL mappings."""
    
    def __init__(self, mappings_dir: str = "files/gl_mappings"):
        self.mappings_dir = Path(mappings_dir)
        self.mappings_dir.mkdir(exist_ok=True, parents=True)
        self.loaded_mappings: Dict[str, CustomerGLMapping] = {}
        
    def load_from_csv(self, csv_path: str, customer_id: str, customer_name: str) -> CustomerGLMapping:
        """Load GL mapping from CSV file."""
        logger.info(f"Loading GL mapping for {customer_name} from {csv_path}")
        
        mapping = CustomerGLMapping(
            customer_id=customer_id,
            customer_name=customer_name,
            mapping_version="1.0",
            source_file=csv_path
        )
        
        # Read CSV
        with open(csv_path, 'r', encoding='utf-8') as f:
            # Skip BOM if present
            first_char = f.read(1)
            if first_char != '\ufeff':
                f.seek(0)
            
            reader = csv.DictReader(f)
            
            for row in reader:
                # Extract fields (handle variations in column names)
                account_num = row.get('G/L Account', row.get('GL Account', '')).strip()
                description = row.get('G/L Acct Long Text', row.get('GL Description', '')).strip()
                bucket_code = row.get('CM_SS_GLACCOUNT_BUCKET_Code', row.get('Bucket Code', '')).strip()
                bucket_desc = row.get('New CM_SS_GLACCOUNT_BUCKET_Desc', row.get('Bucket Description', '')).strip()
                
                if not account_num or not bucket_code:
                    continue
                
                # Create GL account mapping
                gl_mapping = GLAccountMapping(
                    account_number=account_num,
                    description=description,
                    bucket_code=bucket_code,
                    bucket_description=bucket_desc
                )
                
                # Add to mapping
                mapping.accounts[account_num] = gl_mapping
                
                # Add to bucket aggregation
                if bucket_code not in mapping.bucket_accounts:
                    mapping.bucket_accounts[bucket_code] = []
                mapping.bucket_accounts[bucket_code].append(account_num)
                
                # Track custom buckets
                if bucket_code not in [b.name for b in GLBucketType]:
                    mapping.custom_buckets[bucket_code] = bucket_desc
        
        # Update statistics
        mapping.total_accounts = len(mapping.accounts)
        mapping.total_buckets = len(mapping.bucket_accounts)
        
        # Cache the mapping
        self.loaded_mappings[customer_id] = mapping
        
        # Save as JSON for faster loading
        self._save_mapping_json(mapping)
        
        logger.info(f"Loaded {mapping.total_accounts} GL accounts in {mapping.total_buckets} buckets for {customer_name}")
        
        return mapping
    
    def load_arizona_beverages_mapping(self) -> CustomerGLMapping:
        """Load the Arizona Beverages GL mapping."""
        csv_path = "files/Classified_P_L_Accounts_Arizona Beverages_revised _july 15.csv"
        return self.load_from_csv(csv_path, "arizona_beverages", "Arizona Beverages")
    
    def get_mapping(self, customer_id: str) -> Optional[CustomerGLMapping]:
        """Get GL mapping for a customer."""
        # Check cache first
        if customer_id in self.loaded_mappings:
            return self.loaded_mappings[customer_id]
        
        # Try to load from JSON
        json_path = self.mappings_dir / f"{customer_id}_mapping.json"
        if json_path.exists():
            try:
                with open(json_path, 'r') as f:
                    data = json.load(f)
                mapping = CustomerGLMapping(**data)
                self.loaded_mappings[customer_id] = mapping
                return mapping
            except Exception as e:
                logger.error(f"Failed to load mapping from JSON: {e}")
        
        # Special handling for known customers
        if customer_id == "arizona_beverages":
            return self.load_arizona_beverages_mapping()
        
        return None
    
    def _save_mapping_json(self, mapping: CustomerGLMapping):
        """Save mapping as JSON for faster loading."""
        json_path = self.mappings_dir / f"{mapping.customer_id}_mapping.json"
        with open(json_path, 'w') as f:
            json.dump(mapping.model_dump(), f, indent=2, default=str)
    
    def search_accounts(self, mapping: CustomerGLMapping, search_term: str) -> List[GLAccountMapping]:
        """Search GL accounts by number or description."""
        search_lower = search_term.lower()
        results = []
        
        for account in mapping.accounts.values():
            if (search_lower in account.account_number or 
                search_lower in account.description.lower() or
                search_lower in account.bucket_code.lower() or
                search_lower in account.bucket_description.lower()):
                results.append(account)
        
        return results
    
    def get_bucket_accounts(self, mapping: CustomerGLMapping, bucket_code: str) -> List[GLAccountMapping]:
        """Get all accounts in a bucket."""
        account_numbers = mapping.bucket_accounts.get(bucket_code, [])
        return [mapping.accounts[num] for num in account_numbers if num in mapping.accounts]
    
    def get_bucket_hierarchy(self, mapping: CustomerGLMapping) -> Dict[str, List[str]]:
        """Get P&L hierarchy based on bucket categories."""
        hierarchy = {
            "Revenue": ["REV", "SALE_DS"],
            "COGS": ["COGS_DM", "COGS_PK", "COGS_FG", "COGS_AD", "COGS_DL", "COGS_EX", 
                     "COGS_OH", "COGS_VR", "COGS_FR", "COGS_WH", "COGS_OT", "COGS_CR", "COGS_DP"],
            "Operating Expenses": {
                "G&A": ["GNA_PAY", "GNA_INS", "GNA_FAC", "GNA_DA", "GNA_SUP", "GNA_OT", "GNA_PRO"],
                "Selling": ["SEL_PAY", "SEL_ADV", "SEL_EVT", "SEL_OT", "SEL_TRV"],
                "R&D": ["R_D"]
            },
            "Other Income/Expense": ["OOI", "OOE", "FIN_INC", "FIN_EXP", "FX_GL"],
            "Taxes": ["TAX_INC"]
        }
        
        # Add custom buckets
        for bucket_code in mapping.custom_buckets:
            if bucket_code not in sum([v if isinstance(v, list) else [] for v in hierarchy.values()], []):
                hierarchy.setdefault("Other", []).append(bucket_code)
        
        return hierarchy
    
    def generate_bucket_summary(self, mapping: CustomerGLMapping) -> Dict[str, Any]:
        """Generate summary statistics for GL mapping."""
        summary = {
            "customer": mapping.customer_name,
            "total_accounts": mapping.total_accounts,
            "total_buckets": mapping.total_buckets,
            "bucket_distribution": {},
            "major_categories": {}
        }
        
        # Count accounts per bucket
        for bucket_code, accounts in mapping.bucket_accounts.items():
            bucket_desc = mapping.accounts[accounts[0]].bucket_description if accounts else bucket_code
            summary["bucket_distribution"][bucket_code] = {
                "description": bucket_desc,
                "account_count": len(accounts)
            }
        
        # Categorize into major P&L sections
        hierarchy = self.get_bucket_hierarchy(mapping)
        for category, buckets in hierarchy.items():
            if isinstance(buckets, dict):
                # Nested categories
                total = 0
                for sub_buckets in buckets.values():
                    total += sum(len(mapping.bucket_accounts.get(b, [])) for b in sub_buckets)
                summary["major_categories"][category] = total
            else:
                # Direct bucket list
                total = sum(len(mapping.bucket_accounts.get(b, [])) for b in buckets)
                summary["major_categories"][category] = total
        
        return summary
    
    def validate_gl_query(self, mapping: CustomerGLMapping, gl_accounts: List[str]) -> Dict[str, Any]:
        """Validate GL account numbers against mapping."""
        valid_accounts = []
        invalid_accounts = []
        
        for account in gl_accounts:
            if account in mapping.accounts:
                valid_accounts.append({
                    "account": account,
                    "description": mapping.accounts[account].description,
                    "bucket": mapping.accounts[account].bucket_code
                })
            else:
                invalid_accounts.append(account)
        
        return {
            "valid": len(invalid_accounts) == 0,
            "valid_accounts": valid_accounts,
            "invalid_accounts": invalid_accounts,
            "suggestions": self._suggest_similar_accounts(mapping, invalid_accounts) if invalid_accounts else []
        }
    
    def _suggest_similar_accounts(self, mapping: CustomerGLMapping, invalid_accounts: List[str]) -> List[Dict[str, Any]]:
        """Suggest similar valid accounts for invalid ones."""
        suggestions = []
        
        for invalid in invalid_accounts:
            # Find accounts with similar prefixes
            prefix = invalid[:4] if len(invalid) >= 4 else invalid
            similar = [
                acc for acc_num, acc in mapping.accounts.items()
                if acc_num.startswith(prefix)
            ][:3]  # Top 3 suggestions
            
            suggestions.append({
                "invalid_account": invalid,
                "suggestions": [
                    {
                        "account": acc.account_number,
                        "description": acc.description
                    }
                    for acc in similar
                ]
            })
        
        return suggestions


# Singleton instance
gl_mapping_loader = GLMappingLoader()