"""
User Profile Data Models

Defines user profiles and role-based templates for personalized AI insights.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum


class UserRole(str, Enum):
    """Predefined user roles with specific business contexts."""
    CFO = "cfo"
    COO = "coo"
    CEO = "ceo"
    FINANCE_ANALYST = "finance_analyst"
    OPERATIONS_MANAGER = "operations_manager"
    SALES_DIRECTOR = "sales_director"
    CUSTOM = "custom"


class InsightFocus(str, Enum):
    """Areas of focus for insights and recommendations."""
    FINANCIAL_PERFORMANCE = "financial_performance"
    OPERATIONAL_EFFICIENCY = "operational_efficiency"
    REVENUE_GROWTH = "revenue_growth"
    COST_OPTIMIZATION = "cost_optimization"
    CUSTOMER_ANALYTICS = "customer_analytics"
    PRODUCT_PERFORMANCE = "product_performance"
    PROFITABILITY = "profitability"
    CASH_FLOW = "cash_flow"


class RoleTemplate(BaseModel):
    """Template defining role-specific preferences and contexts."""
    role: UserRole
    display_name: str
    description: str
    insight_focuses: List[InsightFocus]
    key_metrics: List[str]
    preferred_visualizations: List[str]
    system_prompt_additions: str

    class Config:
        json_schema_extra = {
            "example": {
                "role": "cfo",
                "display_name": "Chief Financial Officer",
                "description": "Financial executive focused on profitability, cash flow, and financial performance",
                "insight_focuses": ["financial_performance", "profitability", "cash_flow"],
                "key_metrics": ["gross_margin", "ebitda", "net_profit", "cash_flow"],
                "preferred_visualizations": ["line", "bar", "pie"],
                "system_prompt_additions": "Focus on financial implications, ROI, and bottom-line impact."
            }
        }


class UserProfile(BaseModel):
    """User profile containing personalization preferences."""
    user_id: str = Field(..., description="Unique user identifier")
    email: Optional[str] = None
    name: Optional[str] = None
    role: UserRole = Field(default=UserRole.CUSTOM, description="User's business role")
    custom_role_name: Optional[str] = Field(None, description="Custom role name if role is CUSTOM")

    # Preferences
    insight_focuses: List[InsightFocus] = Field(
        default_factory=list,
        description="Areas of interest for insights"
    )
    key_metrics: List[str] = Field(
        default_factory=list,
        description="Metrics most important to this user"
    )
    preferred_visualizations: List[str] = Field(
        default_factory=list,
        description="Preferred chart types"
    )

    # Context
    department: Optional[str] = None
    business_unit: Optional[str] = None
    reporting_frequency: Optional[str] = Field(
        default="weekly",
        description="How often user reviews reports (daily, weekly, monthly)"
    )

    # Customization
    custom_context: Optional[str] = Field(
        None,
        description="Additional context for personalized insights"
    )

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user123",
                "email": "cfo@company.com",
                "name": "Jane Smith",
                "role": "cfo",
                "insight_focuses": ["financial_performance", "profitability"],
                "key_metrics": ["gross_margin", "ebitda", "net_profit"],
                "preferred_visualizations": ["line", "bar"],
                "department": "Finance",
                "reporting_frequency": "weekly"
            }
        }


class UserProfileCreate(BaseModel):
    """Request model for creating a user profile."""
    user_id: str
    email: Optional[str] = None
    name: Optional[str] = None
    role: UserRole = UserRole.CUSTOM
    custom_role_name: Optional[str] = None
    insight_focuses: List[InsightFocus] = []
    key_metrics: List[str] = []
    preferred_visualizations: List[str] = []
    department: Optional[str] = None
    business_unit: Optional[str] = None
    reporting_frequency: Optional[str] = "weekly"
    custom_context: Optional[str] = None


class UserProfileUpdate(BaseModel):
    """Request model for updating a user profile."""
    email: Optional[str] = None
    name: Optional[str] = None
    role: Optional[UserRole] = None
    custom_role_name: Optional[str] = None
    insight_focuses: Optional[List[InsightFocus]] = None
    key_metrics: Optional[List[str]] = None
    preferred_visualizations: Optional[List[str]] = None
    department: Optional[str] = None
    business_unit: Optional[str] = None
    reporting_frequency: Optional[str] = None
    custom_context: Optional[str] = None


# Predefined role templates
ROLE_TEMPLATES: Dict[UserRole, RoleTemplate] = {
    UserRole.CFO: RoleTemplate(
        role=UserRole.CFO,
        display_name="Chief Financial Officer",
        description="Financial executive focused on profitability, cash flow, and strategic financial performance",
        insight_focuses=[
            InsightFocus.FINANCIAL_PERFORMANCE,
            InsightFocus.PROFITABILITY,
            InsightFocus.CASH_FLOW,
            InsightFocus.COST_OPTIMIZATION
        ],
        key_metrics=[
            "gross_margin", "ebitda", "net_profit", "operating_margin",
            "free_cash_flow", "working_capital", "debt_to_equity", "roi"
        ],
        preferred_visualizations=["line", "bar", "area"],
        system_prompt_additions="""🔴 CRITICAL: You are speaking DIRECTLY to a CFO (Chief Financial Officer). This is the top financial executive.

YOUR MANDATORY FOCUS:
1. **Lead with Financial Impact**: Start EVERY insight with dollar amounts, percentages, or margin impact
2. **Executive Language**: Use terms like "bottom-line impact", "EBITDA implications", "cash flow risks", "shareholder value"
3. **Strategic Financial View**: Don't just report numbers - explain what they mean for financial strategy
4. **Risk & Opportunity**: Always highlight financial risks AND opportunities for margin improvement

REQUIRED OUTPUT STRUCTURE:
- **Financial Summary**: Lead with the key financial metric (revenue, profit, margin, cash flow)
- **P&L Impact**: How does this affect the income statement?
- **Strategic Recommendations**: 2-3 HIGH-LEVEL financial actions (e.g., "Consider renegotiating supplier contracts to improve COGS by 3-5%")
- **Risk Flags**: Call out any concerning financial trends (declining margins, cash flow issues, etc.)

TONE: Executive, strategic, focused on financial outcomes. Avoid operational details - the CFO cares about FINANCIAL IMPLICATIONS, not how things get done.

Example: Instead of "Customer X purchased $500K in products", say "Customer X represents 8% of total revenue with a 42% gross margin - significantly above our 35% company average. Expanding this relationship could improve overall profitability by 2-3 points."

Remember: CFOs make capital allocation decisions. Frame EVERYTHING in terms of financial return, risk, and strategic financial positioning."""
    ),

    UserRole.COO: RoleTemplate(
        role=UserRole.COO,
        display_name="Chief Operating Officer",
        description="Operations executive focused on efficiency, productivity, and operational excellence",
        insight_focuses=[
            InsightFocus.OPERATIONAL_EFFICIENCY,
            InsightFocus.COST_OPTIMIZATION,
            InsightFocus.PRODUCT_PERFORMANCE,
            InsightFocus.CUSTOMER_ANALYTICS
        ],
        key_metrics=[
            "operational_efficiency", "production_cost", "inventory_turnover",
            "order_fulfillment_rate", "capacity_utilization", "quality_metrics"
        ],
        preferred_visualizations=["bar", "heatmap", "scatter"],
        system_prompt_additions="""🔴 CRITICAL: You are speaking DIRECTLY to a COO (Chief Operating Officer). This person runs day-to-day operations.

YOUR MANDATORY FOCUS:
1. **Lead with Operational Metrics**: Start with efficiency %, throughput, cycle times, utilization rates
2. **Process & Execution**: Focus on HOW things get done, not just financial outcomes
3. **Bottlenecks & Constraints**: Identify what's slowing operations down
4. **Resource Optimization**: Labor, equipment, inventory - how can we use resources better?

REQUIRED OUTPUT STRUCTURE:
- **Operational Summary**: Lead with key operational metric (efficiency, throughput, capacity utilization, quality %)
- **Process Analysis**: What's working well? What's creating bottlenecks?
- **Actionable Improvements**: 3-5 SPECIFIC operational actions (e.g., "Reduce inventory holding time by consolidating SKUs in Warehouse B")
- **Resource Implications**: How can we better utilize people, equipment, or facilities?

TONE: Tactical, action-oriented, focused on execution and process improvement. COOs care about GETTING THINGS DONE efficiently.

Example: Instead of "Revenue was $2M", say "Processed 5,000 orders at 94% on-time fulfillment (target: 95%). Main bottleneck: Warehouse picking - average 28 mins/order vs benchmark of 20 mins. Recommend implementing zone-based picking to reduce by 6-8 minutes per order."

Remember: COOs optimize operations. Frame EVERYTHING in terms of process efficiency, resource utilization, and operational execution. Focus on WHAT TO DO and HOW TO DO IT."""
    ),

    UserRole.CEO: RoleTemplate(
        role=UserRole.CEO,
        display_name="Chief Executive Officer",
        description="Executive leader focused on overall business performance and strategic growth",
        insight_focuses=[
            InsightFocus.REVENUE_GROWTH,
            InsightFocus.PROFITABILITY,
            InsightFocus.CUSTOMER_ANALYTICS,
            InsightFocus.FINANCIAL_PERFORMANCE
        ],
        key_metrics=[
            "revenue_growth", "market_share", "customer_acquisition_cost",
            "customer_lifetime_value", "net_profit", "ebitda"
        ],
        preferred_visualizations=["line", "bar", "pie"],
        system_prompt_additions="""🔴 CRITICAL: You are speaking DIRECTLY to a CEO (Chief Executive Officer). This is the company leader responsible for overall strategy and growth.

YOUR MANDATORY FOCUS:
1. **Lead with Business Impact**: Start with top-line growth, market position, competitive dynamics
2. **Strategic Lens**: Everything should connect to company strategy and long-term value creation
3. **Big Picture**: CEOs don't want details - they want strategic implications and key decisions
4. **Growth & Competition**: Always frame insights in terms of market position and competitive advantage

REQUIRED OUTPUT STRUCTURE:
- **Business Summary**: One sentence capturing the strategic story (e.g., "Revenue up 15% YoY driven by enterprise segment expansion")
- **Strategic Implications**: What does this mean for our market position and competitive standing?
- **Key Decisions**: 2-3 STRATEGIC decisions the CEO should consider (not tactical actions)
- **Opportunities & Threats**: External market opportunities or competitive threats to address

TONE: Executive, big-picture, strategic. CEOs allocate resources across the entire company and think 3-5 years ahead.

Example: Instead of "Product A sales were $800K", say "Product A is capturing 23% market share in the enterprise segment - our fastest growth area. This positions us to challenge the market leader (35% share) if we double down on enterprise sales investment. Recommend prioritizing enterprise over SMB for next 12-18 months to establish category leadership."

Remember: CEOs balance growth, profitability, and market position. Frame EVERYTHING in terms of strategic business building, competitive advantage, and long-term value creation. Focus on WHERE to compete and HOW to win."""
    ),

    UserRole.FINANCE_ANALYST: RoleTemplate(
        role=UserRole.FINANCE_ANALYST,
        display_name="Finance Analyst",
        description="Financial analyst focused on detailed financial analysis and reporting",
        insight_focuses=[
            InsightFocus.FINANCIAL_PERFORMANCE,
            InsightFocus.PROFITABILITY,
            InsightFocus.COST_OPTIMIZATION
        ],
        key_metrics=[
            "variance_analysis", "budget_vs_actual", "gross_margin",
            "operating_expenses", "revenue_breakdown"
        ],
        preferred_visualizations=["bar", "line", "area"],
        system_prompt_additions="""🔴 CRITICAL: You are speaking DIRECTLY to a Finance Analyst. This person digs deep into numbers and builds financial reports.

YOUR MANDATORY FOCUS:
1. **Lead with Detailed Numbers**: Show exact figures, breakdowns, and variance analysis
2. **Drill-Down Analysis**: Don't just show totals - break down by category, period, segment
3. **Variance & Trends**: Always compare to budget, prior period, or benchmarks
4. **Data Quality**: Flag any anomalies, outliers, or data issues that need investigation

REQUIRED OUTPUT STRUCTURE:
- **Numerical Summary**: Lead with exact figures and key variances (e.g., "Q2 Revenue: $2.4M, +12% vs Q1, -3% vs budget")
- **Detailed Breakdown**: Show granular splits (by month, by category, by customer segment, etc.)
- **Variance Analysis**: What's driving differences? (e.g., "Volume up 8%, Price/Mix down 2%")
- **Investigation Items**: 2-3 specific line items or trends that need deeper analysis
- **Data Tables**: Include detailed numerical breakdowns when relevant

TONE: Analytical, detail-oriented, precise. Finance analysts need NUMBERS and DETAILS to build reports and answer questions.

Example: Instead of "Revenue grew", say "Q2 Revenue: $2,456,892 (+12.3% QoQ, -2.8% vs budget of $2,527,000). Breakdown: Product A $1.2M (+18%), Product B $890K (+8%), Product C $367K (-5%). Main variance driver: Product C underperformance in West region (-$85K vs budget). Recommend investigating West region sales pipeline and pricing."

Remember: Finance analysts build the reports that executives read. Provide DETAILED, ACCURATE numbers with thorough breakdowns. Focus on WHAT THE NUMBERS ARE and WHY they differ from expectations."""
    ),

    UserRole.SALES_DIRECTOR: RoleTemplate(
        role=UserRole.SALES_DIRECTOR,
        display_name="Sales Director",
        description="Sales leader focused on revenue growth and customer performance",
        insight_focuses=[
            InsightFocus.REVENUE_GROWTH,
            InsightFocus.CUSTOMER_ANALYTICS,
            InsightFocus.PRODUCT_PERFORMANCE
        ],
        key_metrics=[
            "revenue", "sales_growth", "customer_count", "average_order_value",
            "top_customers", "product_mix", "sales_pipeline"
        ],
        preferred_visualizations=["bar", "pie", "line"],
        system_prompt_additions="""🔴 CRITICAL: You are speaking DIRECTLY to a Sales Director. This person leads the sales team and owns revenue growth.

YOUR MANDATORY FOCUS:
1. **Lead with Revenue & Customers**: Start with revenue trends, top customers, win/loss patterns
2. **Sales Opportunities**: Identify which customers/segments to target for growth
3. **Customer Insights**: Who are our best customers? What patterns drive high-value sales?
4. **Actionable Sales Tactics**: Give specific recommendations the sales team can execute

REQUIRED OUTPUT STRUCTURE:
- **Revenue Summary**: Lead with revenue trends and top-line sales metrics (e.g., "$2.4M revenue, +15% YoY, driven by 3 key accounts")
- **Customer Analysis**: Who are the top customers? What makes them valuable? Which segments are growing?
- **Sales Opportunities**: 3-5 SPECIFIC actions to drive more revenue (e.g., "Upsell Product B to Customer X who currently only buys Product A")
- **Pipeline Insights**: What's in the pipeline? Conversion rates? Deal velocity?

TONE: Action-oriented, customer-focused, revenue-driven. Sales directors care about CLOSING DEALS and GROWING ACCOUNTS.

Example: Instead of "Customer A purchased $500K", say "Customer A: $487K revenue (+22% YoY), currently buying Products A & C. HIGH OPPORTUNITY: They're not using Product B (avg $180K/customer in similar accounts). Recommend sales team pitch Product B bundle - potential $150-200K upsell. Customer has 98% on-time payment history and 4.8/5 satisfaction score."

Remember: Sales directors build revenue. Frame EVERYTHING in terms of customer opportunities, revenue growth, and specific sales actions the team can take. Focus on WHO to sell to, WHAT to sell, and HOW to close deals."""
    )
}
