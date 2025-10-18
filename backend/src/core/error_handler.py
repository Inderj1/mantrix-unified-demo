"""Advanced error handling and recovery for SQL generation."""

import re
from typing import Dict, Any, List, Optional, Tuple
from enum import Enum
import structlog
from dataclasses import dataclass
import time

logger = structlog.get_logger()


class ErrorType(Enum):
    """Categorization of SQL generation errors."""
    SYNTAX_ERROR = "syntax_error"
    SEMANTIC_ERROR = "semantic_error"  
    PERMISSION_ERROR = "permission_error"
    DATA_NOT_FOUND = "data_not_found"
    AMBIGUOUS_REQUEST = "ambiguous_request"
    TIMEOUT = "timeout"
    RATE_LIMIT = "rate_limit"
    NETWORK_ERROR = "network_error"
    VALIDATION_ERROR = "validation_error"
    UNKNOWN = "unknown"


@dataclass
class ErrorContext:
    """Context information for an error."""
    error_type: ErrorType
    original_error: str
    sql_query: Optional[str]
    user_query: str
    tables_involved: List[str]
    timestamp: float
    retry_count: int = 0


class QueryErrorHandler:
    """Handles errors in SQL generation with intelligent recovery strategies."""
    
    # Common error patterns and their types
    ERROR_PATTERNS = {
        ErrorType.SYNTAX_ERROR: [
            r"syntax error",
            r"unexpected token",
            r"invalid.*syntax",
            r"parse error",
            r"expected.*but got"
        ],
        ErrorType.SEMANTIC_ERROR: [
            r"column.*not found",
            r"table.*not found", 
            r"ambiguous column",
            r"invalid column name",
            r"unknown field"
        ],
        ErrorType.PERMISSION_ERROR: [
            r"permission denied",
            r"access denied",
            r"unauthorized",
            r"insufficient privileges"
        ],
        ErrorType.DATA_NOT_FOUND: [
            r"no such table",
            r"dataset.*not found",
            r"table.*does not exist"
        ],
        ErrorType.TIMEOUT: [
            r"timeout",
            r"timed out",
            r"deadline exceeded"
        ],
        ErrorType.RATE_LIMIT: [
            r"rate limit",
            r"too many requests",
            r"quota exceeded"
        ]
    }
    
    def __init__(self, llm_client=None, cache_manager=None):
        self.llm_client = llm_client
        self.cache_manager = cache_manager
        self.error_history: List[ErrorContext] = []
        
    def classify_error(self, error_message: str) -> ErrorType:
        """Classify the error type based on the error message."""
        error_lower = error_message.lower()
        
        for error_type, patterns in self.ERROR_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, error_lower):
                    return error_type
        
        return ErrorType.UNKNOWN
    
    def handle_error(
        self, 
        error: Exception,
        context: Dict[str, Any],
        retry_count: int = 0
    ) -> Dict[str, Any]:
        """Handle an error with appropriate recovery strategy."""
        error_message = str(error)
        error_type = self.classify_error(error_message)
        
        error_context = ErrorContext(
            error_type=error_type,
            original_error=error_message,
            sql_query=context.get("sql"),
            user_query=context.get("user_query", ""),
            tables_involved=context.get("tables_used", []),
            timestamp=time.time(),
            retry_count=retry_count
        )
        
        self.error_history.append(error_context)
        
        # Log the error with context
        logger.error(
            "Query error occurred",
            error_type=error_type.value,
            error_message=error_message,
            retry_count=retry_count
        )
        
        # Get recovery strategy based on error type
        recovery_strategy = self._get_recovery_strategy(error_context)
        
        return {
            "error": error_message,
            "error_type": error_type.value,
            "recovery_suggestions": recovery_strategy["suggestions"],
            "can_retry": recovery_strategy["can_retry"],
            "alternative_queries": recovery_strategy.get("alternatives", []),
            "user_friendly_message": self._get_user_friendly_message(error_type, error_message),
            "technical_details": {
                "original_error": error_message,
                "error_classification": error_type.value,
                "retry_count": retry_count,
                "context": context
            }
        }
    
    def _get_recovery_strategy(self, error_context: ErrorContext) -> Dict[str, Any]:
        """Get appropriate recovery strategy based on error type."""
        strategies = {
            ErrorType.SYNTAX_ERROR: self._handle_syntax_error,
            ErrorType.SEMANTIC_ERROR: self._handle_semantic_error,
            ErrorType.PERMISSION_ERROR: self._handle_permission_error,
            ErrorType.DATA_NOT_FOUND: self._handle_data_not_found,
            ErrorType.TIMEOUT: self._handle_timeout,
            ErrorType.RATE_LIMIT: self._handle_rate_limit,
            ErrorType.AMBIGUOUS_REQUEST: self._handle_ambiguous_request,
            ErrorType.VALIDATION_ERROR: self._handle_validation_error
        }
        
        handler = strategies.get(error_context.error_type, self._handle_unknown_error)
        return handler(error_context)
    
    def _handle_syntax_error(self, context: ErrorContext) -> Dict[str, Any]:
        """Handle SQL syntax errors."""
        suggestions = []
        
        # Common syntax fixes
        if "expected" in context.original_error.lower():
            suggestions.append("Check for missing commas, parentheses, or keywords")
        
        if "group by" in context.original_error.lower():
            suggestions.append("Ensure all non-aggregated columns are in GROUP BY clause")
        
        if context.sql_query:
            # Analyze the SQL for common issues
            issues = self._analyze_sql_syntax(context.sql_query)
            suggestions.extend(issues)
        
        return {
            "can_retry": True,
            "suggestions": suggestions,
            "alternatives": self._suggest_simpler_query(context.user_query)
        }
    
    def _handle_semantic_error(self, context: ErrorContext) -> Dict[str, Any]:
        """Handle semantic errors like missing columns or tables."""
        suggestions = []
        
        # Extract the problematic element
        match = re.search(r"column ['\"]?(\w+)['\"]? not found", context.original_error, re.IGNORECASE)
        if match:
            column = match.group(1)
            suggestions.append(f"Column '{column}' does not exist in the specified tables")
            suggestions.append("Check the table schema for available columns")
            
            # Try to find similar column names
            if context.tables_involved and self.llm_client:
                similar = self._find_similar_columns(column, context.tables_involved)
                if similar:
                    suggestions.append(f"Did you mean: {', '.join(similar)}?")
        
        return {
            "can_retry": True,
            "suggestions": suggestions,
            "alternatives": []
        }
    
    def _handle_permission_error(self, context: ErrorContext) -> Dict[str, Any]:
        """Handle permission and access errors."""
        return {
            "can_retry": False,
            "suggestions": [
                "Check that you have access to the requested tables",
                "Verify your BigQuery permissions",
                "Contact your administrator if you need access"
            ],
            "alternatives": []
        }
    
    def _handle_data_not_found(self, context: ErrorContext) -> Dict[str, Any]:
        """Handle cases where tables or datasets don't exist."""
        suggestions = ["Verify the table name and dataset are correct"]
        
        # Extract table name if possible
        match = re.search(r"table ['\"]?(\w+)['\"]?", context.original_error, re.IGNORECASE)
        if match:
            table = match.group(1)
            suggestions.append(f"Table '{table}' was not found in the dataset")
            
        return {
            "can_retry": True,
            "suggestions": suggestions,
            "alternatives": []
        }
    
    def _handle_timeout(self, context: ErrorContext) -> Dict[str, Any]:
        """Handle timeout errors."""
        return {
            "can_retry": True,
            "suggestions": [
                "The query took too long to execute",
                "Try adding more specific filters to reduce data scanned",
                "Consider using LIMIT to test with smaller data",
                "Check if you can use partitioned tables"
            ],
            "alternatives": self._suggest_optimized_query(context.sql_query)
        }
    
    def _handle_rate_limit(self, context: ErrorContext) -> Dict[str, Any]:
        """Handle rate limiting errors."""
        return {
            "can_retry": True,
            "suggestions": [
                "Rate limit exceeded - please wait before retrying",
                f"Retry after {self._calculate_backoff(context.retry_count)} seconds"
            ],
            "alternatives": []
        }
    
    def _handle_ambiguous_request(self, context: ErrorContext) -> Dict[str, Any]:
        """Handle ambiguous user requests."""
        return {
            "can_retry": True,
            "suggestions": [
                "The request is ambiguous - please be more specific",
                "Specify which tables or time periods you're interested in",
                "Add more context to your query"
            ],
            "alternatives": self._suggest_clarifying_questions(context.user_query)
        }
    
    def _handle_validation_error(self, context: ErrorContext) -> Dict[str, Any]:
        """Handle query validation errors."""
        return {
            "can_retry": True,
            "suggestions": [
                "The generated SQL failed validation",
                "Check the query structure and syntax"
            ],
            "alternatives": []
        }
    
    def _handle_unknown_error(self, context: ErrorContext) -> Dict[str, Any]:
        """Handle unknown errors."""
        return {
            "can_retry": True,
            "suggestions": [
                "An unexpected error occurred",
                "Try rephrasing your question",
                "Check the error details for more information"
            ],
            "alternatives": []
        }
    
    def _get_user_friendly_message(self, error_type: ErrorType, error_message: str) -> str:
        """Generate user-friendly error message."""
        messages = {
            ErrorType.SYNTAX_ERROR: "There's a problem with the SQL syntax. Try rephrasing your question.",
            ErrorType.SEMANTIC_ERROR: "Some columns or tables referenced don't exist. Please check the available data.",
            ErrorType.PERMISSION_ERROR: "You don't have permission to access this data.",
            ErrorType.DATA_NOT_FOUND: "The requested data couldn't be found. Please verify the table names.",
            ErrorType.TIMEOUT: "The query took too long. Try adding filters to reduce the data processed.",
            ErrorType.RATE_LIMIT: "Too many requests. Please wait a moment before trying again.",
            ErrorType.AMBIGUOUS_REQUEST: "Your question is unclear. Could you provide more specific details?",
            ErrorType.VALIDATION_ERROR: "The generated query has validation errors.",
            ErrorType.UNKNOWN: "An unexpected error occurred. Please try again or rephrase your question."
        }
        
        return messages.get(error_type, messages[ErrorType.UNKNOWN])
    
    def _analyze_sql_syntax(self, sql: str) -> List[str]:
        """Analyze SQL for common syntax issues."""
        issues = []
        
        # Check for unmatched parentheses
        if sql.count('(') != sql.count(')'):
            issues.append("Unmatched parentheses detected")
        
        # Check for common missing keywords
        sql_upper = sql.upper()
        if 'SELECT' in sql_upper and 'FROM' not in sql_upper:
            issues.append("Missing FROM clause")
        
        if 'GROUP BY' in sql_upper:
            # Simple check for non-aggregated columns
            select_part = re.search(r'SELECT\s+(.*?)\s+FROM', sql_upper, re.DOTALL)
            if select_part and 'AVG' not in sql_upper and 'SUM' not in sql_upper and 'COUNT' not in sql_upper:
                issues.append("GROUP BY without aggregation functions")
        
        return issues
    
    def _suggest_simpler_query(self, user_query: str) -> List[str]:
        """Suggest simpler alternative queries."""
        alternatives = []
        
        # If query mentions multiple operations, suggest breaking them down
        if any(word in user_query.lower() for word in ['and', 'also', 'plus', 'with']):
            alternatives.append("Try asking for one piece of information at a time")
        
        # If query is very long, suggest simplification
        if len(user_query.split()) > 20:
            alternatives.append("Try a shorter, more focused question")
        
        return alternatives
    
    def _find_similar_columns(self, column: str, tables: List[str]) -> List[str]:
        """Find columns with similar names (placeholder for fuzzy matching)."""
        # This would integrate with schema information
        # For now, return empty list
        return []
    
    def _suggest_optimized_query(self, sql: Optional[str]) -> List[str]:
        """Suggest query optimizations."""
        if not sql:
            return []
        
        suggestions = []
        
        # Check for missing WHERE clause
        if 'WHERE' not in sql.upper():
            suggestions.append("Add a WHERE clause to filter data")
        
        # Check for SELECT *
        if 'SELECT *' in sql.upper():
            suggestions.append("Specify only the columns you need instead of SELECT *")
        
        return suggestions
    
    def _suggest_clarifying_questions(self, user_query: str) -> List[str]:
        """Suggest questions to clarify ambiguous requests."""
        questions = []
        
        # Time-related ambiguity
        if not any(word in user_query.lower() for word in ['today', 'yesterday', 'month', 'year', 'date']):
            questions.append("What time period are you interested in?")
        
        # Missing specifics
        if 'show' in user_query.lower() or 'get' in user_query.lower():
            questions.append("What specific metrics or columns do you want to see?")
        
        return questions
    
    def _calculate_backoff(self, retry_count: int) -> int:
        """Calculate exponential backoff time."""
        return min(2 ** retry_count, 60)  # Max 60 seconds
    
    def should_retry(self, error_context: ErrorContext) -> bool:
        """Determine if the query should be retried."""
        # Don't retry permission errors
        if error_context.error_type == ErrorType.PERMISSION_ERROR:
            return False
        
        # Don't retry after too many attempts
        if error_context.retry_count >= 3:
            return False
        
        # Retry most other errors
        return error_context.error_type in [
            ErrorType.TIMEOUT,
            ErrorType.RATE_LIMIT,
            ErrorType.NETWORK_ERROR,
            ErrorType.SYNTAX_ERROR,
            ErrorType.SEMANTIC_ERROR
        ]
    
    def get_retry_delay(self, error_context: ErrorContext) -> float:
        """Get appropriate retry delay based on error type."""
        if error_context.error_type == ErrorType.RATE_LIMIT:
            return self._calculate_backoff(error_context.retry_count)
        elif error_context.error_type == ErrorType.TIMEOUT:
            return 2.0  # Fixed 2 second delay for timeouts
        else:
            return 0.5  # Short delay for other errors