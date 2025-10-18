"""GL Accounting Advisor for Financial Query Intelligence."""

from typing import Dict, List, Optional, Any, Tuple, Set
from enum import Enum
import re
import structlog
from pydantic import BaseModel, Field

from src.core.gl_account_mapping import (
    GLMappingLoader, CustomerGLMapping, GLAccountMapping, GLBucketType
)
from src.core.financial_hierarchy import HierarchyLevel
from src.core.llm_client import LLMClient

logger = structlog.get_logger()


class FinancialConcept(Enum):
    """Common financial concepts."""
    GROSS_MARGIN = "gross_margin"
    OPERATING_INCOME = "operating_income"
    EBITDA = "ebitda"
    NET_INCOME = "net_income"
    REVENUE = "revenue"
    COGS = "cogs"
    OPEX = "operating_expenses"
    WORKING_CAPITAL = "working_capital"
    CASH_FLOW = "cash_flow"


class GLQueryContext(BaseModel):
    """Context for GL-based financial queries."""
    query: str
    identified_concepts: List[str] = Field(default_factory=list)
    required_buckets: List[str] = Field(default_factory=list)
    gl_accounts: List[str] = Field(default_factory=list)
    time_period: Optional[str] = None
    dimensions: List[str] = Field(default_factory=list)
    clarification_needed: bool = False
    clarification_questions: List[str] = Field(default_factory=list)
    suggested_calculation: Optional[str] = None


class FinancialCalculation(BaseModel):
    """Definition of a financial calculation."""
    name: str
    formula: str
    required_buckets: List[str]
    optional_buckets: List[str] = Field(default_factory=list)
    description: str
    sql_template: str


class GLAccountingAdvisor:
    """Provides GL accounting intelligence for financial queries."""
    
    # Standard financial calculations
    FINANCIAL_CALCULATIONS = {
        FinancialConcept.GROSS_MARGIN: FinancialCalculation(
            name="Gross Margin",
            formula="Revenue - COGS",
            required_buckets=["REV", "SALE_DS", "COGS_DM", "COGS_PK", "COGS_FG", "COGS_DL", "COGS_OH"],
            optional_buckets=["COGS_FR", "COGS_WH", "COGS_AD"],
            description="Revenue minus all direct costs of goods sold",
            sql_template="""
            SUM(CASE 
                WHEN bucket_code = 'REV' THEN amount
                WHEN bucket_code = 'SALE_DS' THEN -amount
                WHEN bucket_code LIKE 'COGS_%' THEN -amount
                ELSE 0
            END) as gross_margin
            """
        ),
        FinancialConcept.OPERATING_INCOME: FinancialCalculation(
            name="Operating Income",
            formula="Gross Margin - Operating Expenses",
            required_buckets=["REV", "SALE_DS", "COGS_*", "GNA_*", "SEL_*"],
            optional_buckets=["R_D"],
            description="Income from operations before interest and taxes",
            sql_template="""
            SUM(CASE 
                WHEN bucket_code = 'REV' THEN amount
                WHEN bucket_code = 'SALE_DS' THEN -amount
                WHEN bucket_code LIKE 'COGS_%' THEN -amount
                WHEN bucket_code LIKE 'GNA_%' THEN -amount
                WHEN bucket_code LIKE 'SEL_%' THEN -amount
                WHEN bucket_code = 'R_D' THEN -amount
                ELSE 0
            END) as operating_income
            """
        ),
        FinancialConcept.EBITDA: FinancialCalculation(
            name="EBITDA",
            formula="Operating Income + Depreciation + Amortization",
            required_buckets=["REV", "SALE_DS", "COGS_*", "GNA_*", "SEL_*", "GNA_DA", "COGS_DP"],
            optional_buckets=["R_D"],
            description="Earnings before interest, taxes, depreciation, and amortization",
            sql_template="""
            SUM(CASE 
                WHEN bucket_code = 'REV' THEN amount
                WHEN bucket_code = 'SALE_DS' THEN -amount
                WHEN bucket_code LIKE 'COGS_%' AND bucket_code != 'COGS_DP' THEN -amount
                WHEN bucket_code LIKE 'GNA_%' AND bucket_code != 'GNA_DA' THEN -amount
                WHEN bucket_code LIKE 'SEL_%' THEN -amount
                WHEN bucket_code = 'R_D' THEN -amount
                ELSE 0
            END) as ebitda
            """
        ),
        FinancialConcept.NET_INCOME: FinancialCalculation(
            name="Net Income",
            formula="Operating Income - Interest - Taxes + Other Income/Expense",
            required_buckets=["REV", "SALE_DS", "COGS_*", "GNA_*", "SEL_*", "FIN_EXP", "TAX_INC"],
            optional_buckets=["FIN_INC", "OOI", "OOE", "FX_GL"],
            description="Final profit after all expenses and taxes",
            sql_template="""
            SUM(CASE 
                WHEN bucket_code = 'REV' THEN amount
                WHEN bucket_code = 'SALE_DS' THEN -amount
                WHEN bucket_code LIKE 'COGS_%' THEN -amount
                WHEN bucket_code LIKE 'GNA_%' THEN -amount
                WHEN bucket_code LIKE 'SEL_%' THEN -amount
                WHEN bucket_code = 'FIN_INC' THEN amount
                WHEN bucket_code = 'FIN_EXP' THEN -amount
                WHEN bucket_code = 'OOI' THEN amount
                WHEN bucket_code = 'OOE' THEN -amount
                WHEN bucket_code = 'TAX_INC' THEN -amount
                ELSE 0
            END) as net_income
            """
        ),
        FinancialConcept.REVENUE: FinancialCalculation(
            name="Net Revenue",
            formula="Gross Revenue - Sales Deductions",
            required_buckets=["REV", "SALE_DS"],
            description="Total revenue after deductions",
            sql_template="""
            SUM(CASE 
                WHEN bucket_code = 'REV' THEN amount
                WHEN bucket_code = 'SALE_DS' THEN -amount
                ELSE 0
            END) as net_revenue
            """
        ),
        FinancialConcept.COGS: FinancialCalculation(
            name="Total COGS",
            formula="Sum of all COGS components",
            required_buckets=["COGS_DM", "COGS_PK", "COGS_FG", "COGS_DL", "COGS_OH"],
            optional_buckets=["COGS_FR", "COGS_WH", "COGS_AD", "COGS_VR", "COGS_EX"],
            description="Total cost of goods sold",
            sql_template="""
            SUM(CASE 
                WHEN bucket_code LIKE 'COGS_%' THEN amount
                ELSE 0
            END) as total_cogs
            """
        ),
        FinancialConcept.OPEX: FinancialCalculation(
            name="Operating Expenses",
            formula="G&A + Selling + R&D",
            required_buckets=["GNA_*", "SEL_*"],
            optional_buckets=["R_D"],
            description="Total operating expenses",
            sql_template="""
            SUM(CASE 
                WHEN bucket_code LIKE 'GNA_%' THEN amount
                WHEN bucket_code LIKE 'SEL_%' THEN amount
                WHEN bucket_code = 'R_D' THEN amount
                ELSE 0
            END) as operating_expenses
            """
        )
    }
    
    def __init__(self, gl_mapping_loader: GLMappingLoader, llm_client: Optional[LLMClient] = None):
        self.gl_loader = gl_mapping_loader
        self.llm_client = llm_client
        self.concept_patterns = self._build_concept_patterns()
    
    def _build_concept_patterns(self) -> Dict[FinancialConcept, List[str]]:
        """Build regex patterns for detecting financial concepts."""
        return {
            FinancialConcept.GROSS_MARGIN: [
                r"gross\s+margin", r"gm", r"gross\s+profit", r"revenue\s*-\s*cogs"
            ],
            FinancialConcept.OPERATING_INCOME: [
                r"operating\s+income", r"operating\s+profit", r"ebit(?!da)", r"income\s+from\s+operations"
            ],
            FinancialConcept.EBITDA: [
                r"ebitda", r"earnings\s+before\s+interest"
            ],
            FinancialConcept.NET_INCOME: [
                r"net\s+income", r"net\s+profit", r"bottom\s+line", r"net\s+earnings"
            ],
            FinancialConcept.REVENUE: [
                r"revenue", r"sales", r"top\s+line", r"turnover"
            ],
            FinancialConcept.COGS: [
                r"cogs", r"cost\s+of\s+goods", r"cost\s+of\s+sales", r"direct\s+costs"
            ],
            FinancialConcept.OPEX: [
                r"operating\s+expenses", r"opex", r"operational\s+expenses", r"overhead"
            ]
        }
    
    def analyze_query(self, query: str, customer_id: str) -> GLQueryContext:
        """Analyze a financial query and extract GL context."""
        context = GLQueryContext(query=query)
        query_lower = query.lower()
        
        # Get customer GL mapping
        mapping = self.gl_loader.get_mapping(customer_id)
        if not mapping:
            context.clarification_needed = True
            context.clarification_questions.append(
                f"GL mapping not found for customer '{customer_id}'. Please ensure GL mappings are configured."
            )
            return context
        
        # Identify financial concepts
        for concept, patterns in self.concept_patterns.items():
            for pattern in patterns:
                if re.search(pattern, query_lower):
                    context.identified_concepts.append(concept.value)
                    break
        
        # Extract specific GL accounts mentioned
        gl_pattern = r"\b\d{8}\b"  # 8-digit GL accounts for Arizona
        gl_matches = re.findall(gl_pattern, query)
        context.gl_accounts.extend(gl_matches)
        
        # Determine required buckets based on concepts
        for concept_str in context.identified_concepts:
            concept = FinancialConcept(concept_str)
            if concept in self.FINANCIAL_CALCULATIONS:
                calc = self.FINANCIAL_CALCULATIONS[concept]
                context.required_buckets.extend(calc.required_buckets)
        
        # Check for breakdown requests
        if self._is_breakdown_query(query):
            context = self._handle_breakdown_query(context, query, mapping)
        
        # Generate calculation suggestion
        if context.identified_concepts:
            context.suggested_calculation = self._suggest_calculation(context, mapping)
        
        # Check if clarification is needed
        if not context.identified_concepts and not context.gl_accounts:
            context.clarification_needed = True
            context.clarification_questions.append(
                "What financial metric would you like to analyze? (e.g., gross margin, operating income, revenue)"
            )
        
        return context
    
    def _is_breakdown_query(self, query: str) -> bool:
        """Check if query requests a breakdown of components."""
        breakdown_keywords = ["breakdown", "break down", "components", "detail", "composition", "what makes up"]
        return any(keyword in query.lower() for keyword in breakdown_keywords)
    
    def _handle_breakdown_query(self, context: GLQueryContext, query: str, mapping: CustomerGLMapping) -> GLQueryContext:
        """Handle queries requesting component breakdowns."""
        query_lower = query.lower()
        
        # Map concepts to their component buckets
        concept_components = {
            FinancialConcept.GROSS_MARGIN: {
                "Revenue": ["REV", "SALE_DS"],
                "COGS": ["COGS_DM", "COGS_PK", "COGS_FG", "COGS_DL", "COGS_OH", "COGS_FR"]
            },
            FinancialConcept.COGS: {
                "Direct Materials": ["COGS_DM"],
                "Packaging": ["COGS_PK"],
                "Direct Labor": ["COGS_DL"],
                "Manufacturing Overhead": ["COGS_OH"],
                "Freight & Logistics": ["COGS_FR"],
                "Other": ["COGS_AD", "COGS_VR", "COGS_EX"]
            },
            FinancialConcept.OPEX: {
                "G&A": ["GNA_PAY", "GNA_INS", "GNA_FAC", "GNA_DA", "GNA_SUP", "GNA_PRO"],
                "Selling": ["SEL_PAY", "SEL_ADV", "SEL_EVT", "SEL_TRV"],
                "R&D": ["R_D"]
            }
        }
        
        # Add component buckets for identified concepts
        for concept_str in context.identified_concepts:
            concept = FinancialConcept(concept_str)
            if concept in concept_components:
                for category, buckets in concept_components[concept].items():
                    context.required_buckets.extend(buckets)
        
        return context
    
    def _suggest_calculation(self, context: GLQueryContext, mapping: CustomerGLMapping) -> str:
        """Suggest SQL calculation based on context."""
        if not context.identified_concepts:
            return None
        
        # Get primary concept
        primary_concept = FinancialConcept(context.identified_concepts[0])
        if primary_concept not in self.FINANCIAL_CALCULATIONS:
            return None
        
        calc = self.FINANCIAL_CALCULATIONS[primary_concept]
        
        # Build SQL with customer-specific GL accounts
        sql_parts = []
        
        # Map buckets to actual GL accounts
        for bucket in calc.required_buckets:
            if "*" in bucket:
                # Wildcard bucket - match all with prefix
                prefix = bucket.replace("*", "")
                matching_buckets = [b for b in mapping.bucket_accounts.keys() if b.startswith(prefix)]
                for mb in matching_buckets:
                    accounts = mapping.bucket_accounts.get(mb, [])
                    if accounts:
                        sql_parts.append(f"gl_account IN ({','.join(accounts)})")
            else:
                accounts = mapping.bucket_accounts.get(bucket, [])
                if accounts:
                    sql_parts.append(f"gl_account IN ({','.join(accounts)})")
        
        return calc.sql_template
    
    def generate_clarifying_questions(self, context: GLQueryContext, mapping: CustomerGLMapping) -> List[str]:
        """Generate clarifying questions for ambiguous queries."""
        questions = []
        
        # Ask about time period if not specified
        if not context.time_period:
            questions.append("What time period would you like to analyze? (e.g., last month, Q2 2024, year-to-date)")
        
        # Ask about dimensions if analyzing high-level metrics
        if context.identified_concepts and not context.dimensions:
            questions.append("Would you like to break this down by any dimension? (e.g., by product, region, department)")
        
        # Ask about specific components if multiple options
        if len(context.identified_concepts) > 1:
            questions.append(f"Which metric are you most interested in: {', '.join(context.identified_concepts)}?")
        
        # Ask about COGS components if analyzing COGS
        if FinancialConcept.COGS.value in context.identified_concepts:
            questions.append("Which COGS components would you like to include? (materials, labor, overhead, freight, all)")
        
        return questions
    
    def build_gl_filter(self, context: GLQueryContext, mapping: CustomerGLMapping) -> str:
        """Build SQL filter for GL accounts based on context."""
        filters = []
        
        # Add bucket-based filters
        if context.required_buckets:
            bucket_filters = []
            for bucket in set(context.required_buckets):
                if "*" in bucket:
                    prefix = bucket.replace("*", "")
                    bucket_filters.append(f"bucket_code LIKE '{prefix}%'")
                else:
                    bucket_filters.append(f"bucket_code = '{bucket}'")
            
            if bucket_filters:
                filters.append(f"({' OR '.join(bucket_filters)})")
        
        # Add specific GL account filters
        if context.gl_accounts:
            valid_accounts = [acc for acc in context.gl_accounts if acc in mapping.accounts]
            if valid_accounts:
                account_list = ','.join(f"'{acc}'" for acc in valid_accounts)
                filters.append(f"gl_account IN ({account_list})")
        
        return " AND ".join(filters) if filters else "1=1"
    
    def validate_financial_query(self, query: str, customer_id: str) -> Dict[str, Any]:
        """Validate if a financial query can be answered with available GL data."""
        context = self.analyze_query(query, customer_id)
        mapping = self.gl_loader.get_mapping(customer_id)
        
        if not mapping:
            return {
                "valid": False,
                "error": f"No GL mapping found for customer {customer_id}",
                "suggestions": ["Please configure GL account mappings for this customer"]
            }
        
        # Check if we have required buckets
        missing_buckets = []
        for bucket in context.required_buckets:
            if "*" not in bucket and bucket not in mapping.bucket_accounts:
                missing_buckets.append(bucket)
        
        # Validate specific GL accounts
        invalid_accounts = []
        for account in context.gl_accounts:
            if account not in mapping.accounts:
                invalid_accounts.append(account)
        
        validation_result = {
            "valid": len(missing_buckets) == 0 and len(invalid_accounts) == 0,
            "context": context.model_dump(),
            "missing_buckets": missing_buckets,
            "invalid_accounts": invalid_accounts,
            "clarification_needed": context.clarification_needed,
            "clarifying_questions": context.clarification_questions
        }
        
        if not validation_result["valid"]:
            validation_result["suggestions"] = self._generate_suggestions(missing_buckets, invalid_accounts, mapping)
        
        return validation_result
    
    def _generate_suggestions(self, missing_buckets: List[str], invalid_accounts: List[str], 
                            mapping: CustomerGLMapping) -> List[str]:
        """Generate helpful suggestions for invalid queries."""
        suggestions = []
        
        if missing_buckets:
            available_buckets = list(mapping.bucket_accounts.keys())
            suggestions.append(f"Available buckets: {', '.join(available_buckets[:10])}")
        
        if invalid_accounts:
            for account in invalid_accounts:
                similar = self.gl_loader.search_accounts(mapping, account[:4])
                if similar:
                    suggestions.append(f"Did you mean: {similar[0].account_number} - {similar[0].description}?")
        
        return suggestions
    
    async def enhance_query_with_gl_context(self, query: str, customer_id: str) -> str:
        """Enhance query with GL-specific context using LLM."""
        if not self.llm_client:
            return query
        
        context = self.analyze_query(query, customer_id)
        mapping = self.gl_loader.get_mapping(customer_id)
        
        if not mapping or not context.identified_concepts:
            return query
        
        # Build context for LLM
        gl_context = f"""
        Customer: {mapping.customer_name}
        Financial Concepts Identified: {', '.join(context.identified_concepts)}
        Required GL Buckets: {', '.join(context.required_buckets)}
        
        Available bucket mappings:
        """
        
        for bucket in context.required_buckets[:5]:  # Limit context size
            if bucket in mapping.bucket_accounts:
                accounts = mapping.bucket_accounts[bucket][:3]  # Show sample accounts
                gl_context += f"\n{bucket}: {', '.join(accounts)} (and {len(accounts)-3} more)"
        
        # Enhance query using LLM
        enhanced_prompt = f"""
        Original query: {query}
        
        GL Context:
        {gl_context}
        
        Please enhance this query with specific GL account information and ensure it's clear
        what financial calculation is being requested. Keep the enhanced query concise.
        """
        
        try:
            response = await self.llm_client.generate(enhanced_prompt, max_tokens=200)
            return response.get("enhanced_query", query)
        except Exception as e:
            logger.error(f"Failed to enhance query with GL context: {e}")
            return query


# Create singleton instance
from src.core.gl_account_mapping import gl_mapping_loader
gl_advisor = GLAccountingAdvisor(gl_mapping_loader=gl_mapping_loader)