"""
Deep Research Financial Expert Agent System

This module implements a sophisticated agent orchestration system that combines:
- OpenAI Agent SDK patterns for orchestration
- Claude for intelligence and reasoning
- Existing NLP-to-SQL architecture for data access
- Financial expertise for analysis and interpretation
"""

from .claude_agent_sdk import ClaudeAgentSDK, Agent, Tool
from .financial_agents import (
    FinancialAnalystAgent,
    DataAnalystAgent, 
    TrendAnalystAgent,
    VarianceAnalystAgent,
    ReportAnalystAgent
)
from .orchestrator import DeepResearchOrchestrator

__all__ = [
    'ClaudeAgentSDK',
    'Agent', 
    'Tool',
    'FinancialAnalystAgent',
    'DataAnalystAgent',
    'TrendAnalystAgent', 
    'VarianceAnalystAgent',
    'ReportAnalystAgent',
    'DeepResearchOrchestrator'
]