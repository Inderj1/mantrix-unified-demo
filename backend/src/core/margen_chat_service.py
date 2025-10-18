"""
MargenAI Chat Service - Natural language interface for margin analytics
"""
from typing import Dict, Any, List, Optional
import structlog
from .postgresql_sql_generator import PostgreSQLGenerator

logger = structlog.get_logger()


class MargenChatService:
    """Service for processing natural language queries about margin data"""
    
    def __init__(self):
        # Use PostgreSQL SQL generator for MargenAI queries (customer analytics database only)
        self.sql_generator = PostgreSQLGenerator(database="customer_analytics")
        self.example_queries = self._get_example_queries()
    
    def _get_example_queries(self) -> List[Dict[str, str]]:
        """Get example queries for the chat interface - now with full transaction data"""
        return [
            {
                "category": "Sales & Revenue",
                "queries": [
                    "What is the total revenue for 2024?",
                    "Show me top 10 products by revenue",
                    "What are the sales trends by month?",
                    "Show revenue by region",
                    "What is the average order value?"
                ]
            },
            {
                "category": "Margin Analysis",
                "queries": [
                    "What is our overall margin percentage?",
                    "Show products with highest gross margin",
                    "What is the margin trend over time?",
                    "Which segments have the best margins?",
                    "Show margin analysis by region"
                ]
            },
            {
                "category": "Customer Segments",
                "queries": [
                    "Show revenue by customer segment",
                    "Which segment generates most profit?",
                    "List Champions customers with their revenue",
                    "Show At Risk customers and their last purchase",
                    "What is the average CLV by segment?"
                ]
            },
            {
                "category": "Product Performance",
                "queries": [
                    "Top 10 best selling products",
                    "Which products have declining sales?",
                    "Show product performance by region",
                    "What is the product mix by customer segment?",
                    "Show products with negative margins"
                ]
            },
            {
                "category": "Time Series Analysis",
                "queries": [
                    "Show monthly sales trend for 2024",
                    "Compare Q1 vs Q2 performance",
                    "What is the YoY growth rate?",
                    "Show seasonal patterns in sales",
                    "Which months have highest margins?"
                ]
            }
        ]
    
    def process_chat_query(
        self, 
        query: str,
        conversation_context: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """Process a natural language query and return results with explanation"""
        
        logger.info(f"Processing MargenAI chat query: {query}")
        
        try:
            # Add context about the domain
            enhanced_query = self._enhance_query_with_context(query)
            
            # Generate and execute SQL
            result = self.sql_generator.generate_and_execute(enhanced_query)
            
            # Format the response for chat interface
            response = self._format_chat_response(query, result)
            
            # Add example follow-up questions
            if response.get("success"):
                response["follow_up_suggestions"] = self._get_follow_up_suggestions(query, result)
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing chat query: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "I encountered an error processing your question. Please try rephrasing or ask a different question.",
                "suggestions": self._get_error_suggestions(query)
            }
    
    def _enhance_query_with_context(self, query: str) -> str:
        """Add context about the margen.ai domain to improve SQL generation"""
        
        context_additions = []
        query_lower = query.lower()
        
        # Add context based on keywords
        if "margin" in query_lower and "percentage" not in query_lower:
            context_additions.append("(margin means gross_margin, calculate percentage as gross_margin/net_sales*100)")
        
        if "profit" in query_lower and "margin" not in query_lower:
            context_additions.append("(profit refers to gross_margin)")
        
        if "customer" in query_lower and "segment" not in query_lower:
            context_additions.append("(customers have rfm_segment like Champions, Loyal Customers, At Risk)")
        
        if "product" in query_lower:
            context_additions.append("(products are identified by material_number)")
        
        # Combine query with context
        if context_additions:
            enhanced = f"{query} {' '.join(context_additions)}"
            logger.info(f"Enhanced query: {enhanced}")
            return enhanced
        
        return query
    
    def _format_chat_response(self, original_query: str, result: Dict[str, Any]) -> Dict[str, Any]:
        """Format the SQL result for chat interface display"""
        
        response = {
            "query": original_query,
            "success": not bool(result.get("error")),
            "sql": result.get("sql"),
            "from_cache": result.get("from_cache", False)
        }
        
        if result.get("error"):
            response["error"] = result["error"]
            response["message"] = self._get_error_message(result)
        else:
            execution = result.get("execution", {})
            
            if execution.get("success"):
                response["data"] = execution.get("data", [])
                response["columns"] = execution.get("columns", [])
                response["row_count"] = execution.get("row_count", 0)
                response["message"] = self._generate_result_summary(
                    original_query, 
                    execution.get("data", []),
                    execution.get("columns", [])
                )
                response["visualization_type"] = self._suggest_visualization(
                    original_query,
                    execution.get("columns", [])
                )
            else:
                response["error"] = execution.get("error")
                response["message"] = f"SQL execution failed: {execution.get('error')}"
        
        return response
    
    def _generate_result_summary(self, query: str, data: List[Dict], columns: List[str]) -> str:
        """Generate a natural language summary of the results"""
        
        if not data:
            return "Your query returned no results. Try adjusting your criteria or time period."
        
        row_count = len(data)
        query_lower = query.lower()
        
        # Generate contextual summary based on query type
        if "top" in query_lower or "highest" in query_lower:
            if row_count == 1:
                return f"I found the top result based on your criteria."
            else:
                return f"I found the top {row_count} results based on your criteria."
        
        elif "count" in query_lower or "how many" in query_lower:
            if row_count == 1 and "count" in columns[0].lower():
                return f"The count is {data[0][columns[0]]}."
            else:
                return f"I found {row_count} matching records."
        
        elif "average" in query_lower or "avg" in query_lower:
            avg_cols = [col for col in columns if "avg" in col.lower() or "average" in col.lower()]
            if avg_cols and row_count == 1:
                return f"The average value is {data[0][avg_cols[0]]}."
        
        elif "total" in query_lower or "sum" in query_lower:
            sum_cols = [col for col in columns if "sum" in col.lower() or "total" in col.lower()]
            if sum_cols and row_count == 1:
                return f"The total is {data[0][sum_cols[0]]}."
        
        # Default summary
        if row_count == 1:
            return "Here is the result of your query."
        else:
            return f"I found {row_count} results matching your query."
    
    def _suggest_visualization(self, query: str, columns: List[str]) -> str:
        """Suggest appropriate visualization type based on query and results"""
        
        query_lower = query.lower()
        
        # Time-based visualizations
        if any(word in query_lower for word in ["trend", "over time", "monthly", "daily", "yearly"]):
            return "line_chart"
        
        # Comparison visualizations
        if any(word in query_lower for word in ["compare", "versus", "vs", "comparison"]):
            return "bar_chart"
        
        # Distribution visualizations
        if any(word in query_lower for word in ["distribution", "breakdown", "by segment", "by category"]):
            return "pie_chart"
        
        # Top/Bottom visualizations
        if any(word in query_lower for word in ["top", "bottom", "highest", "lowest"]):
            return "bar_chart"
        
        # Single metric
        if len(columns) <= 2 and any(word in query_lower for word in ["total", "sum", "average", "count"]):
            return "metric_card"
        
        # Default to table
        return "table"
    
    def _get_follow_up_suggestions(self, query: str, result: Dict[str, Any]) -> List[str]:
        """Generate intelligent follow-up question suggestions - avoiding transaction-related queries"""
        
        suggestions = []
        query_lower = query.lower()
        
        # Based on what was queried
        if "product" in query_lower:
            suggestions.extend([
                "Show me products by brand",
                "List products in different categories",
                "What product groups do we have?"
            ])
        
        elif "customer" in query_lower or "segment" in query_lower:
            suggestions.extend([
                "Show me customers by region",
                "List Enterprise vs SMB customers",
                "Which cities have the most customers?"
            ])
        
        elif "lifetime" in query_lower or "value" in query_lower:
            suggestions.extend([
                "Show customers with highest lifetime value",
                "Compare lifetime values by segment",
                "List customers by total orders"
            ])
        
        elif "region" in query_lower or "location" in query_lower:
            suggestions.extend([
                "Show customers by country",
                "List all cities we serve",
                "Compare North America vs Europe customers"
            ])
        
        # Limit to 3 suggestions
        return suggestions[:3]
    
    def _get_error_suggestions(self, query: str) -> List[str]:
        """Get suggestions when a query fails"""
        
        return [
            "Try asking about customers or products",
            "Ask about customer segments like 'Champions' or 'At Risk'",
            "Use queries like 'Show all customers' or 'List products'",
            "Check our example queries for working questions"
        ]
    
    def _get_error_message(self, result: Dict[str, Any]) -> str:
        """Generate user-friendly error message"""
        
        error_type = result.get("error_type", "unknown")
        
        if error_type == "generation_error":
            return "I had trouble understanding your question. Please try rephrasing it."
        elif error_type == "execution_error":
            return "The query couldn't be executed. Please try a simpler question."
        else:
            return "I encountered an issue processing your request. Please try again."
    
    def get_examples(self) -> List[Dict[str, str]]:
        """Get example queries for the UI"""
        return self.example_queries