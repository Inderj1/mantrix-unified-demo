"""
Mantrax Agent System

An agent-based system using OpenAI Agents SDK for handling various AI-powered tasks.
"""

from .base import MantraxAgent
from .results_formatter import ResultsFormatterAgent

__all__ = ["MantraxAgent", "ResultsFormatterAgent"]