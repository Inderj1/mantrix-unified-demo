"""
Base Mantrax Agent Class

This provides the foundation for all mantrax agents with common functionality.
"""

from typing import Dict, Any, Optional, List
from abc import ABC, abstractmethod
import structlog
from openai import OpenAI
import json
from datetime import datetime
from src.config import settings

logger = structlog.get_logger()


class MantraxAgent(ABC):
    """Base class for all Mantrax agents."""
    
    def __init__(self, name: str, description: str, model: str = "gpt-4-turbo-preview"):
        """
        Initialize a Mantrax agent.
        
        Args:
            name: Name of the agent
            description: Description of what the agent does
            model: OpenAI model to use
        """
        self.name = name
        self.description = description
        self.model = model
        self.execution_history: List[Dict[str, Any]] = []
        
        # Initialize OpenAI client with API key from settings
        try:
            if settings.openai_api_key:
                self.client = OpenAI(api_key=settings.openai_api_key)
                logger.info(f"Initialized Mantrax agent: {name}")
            else:
                self.client = None
                logger.warning(f"Mantrax agent {name} initialized without OpenAI API key. Agent functionality will be limited.")
        except Exception as e:
            self.client = None
            logger.error(f"Failed to initialize OpenAI client for agent {name}: {e}")
    
    @abstractmethod
    def get_system_prompt(self) -> str:
        """Get the system prompt for this agent."""
        pass
    
    @abstractmethod
    def get_tools(self) -> List[Dict[str, Any]]:
        """Get the tools/functions available to this agent."""
        pass
    
    def execute(self, input_data: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Execute the agent with given input.
        
        Args:
            input_data: Input data for the agent
            context: Optional context information
            
        Returns:
            Agent execution result
        """
        execution_id = f"exec_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        
        # Check if OpenAI client is available
        if not self.client:
            logger.error(f"Agent {self.name} cannot execute: OpenAI client not initialized")
            return {
                "error": "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.",
                "status": "failed",
                "execution_id": execution_id
            }
        
        try:
            # Build messages
            messages = [
                {"role": "system", "content": self.get_system_prompt()}
            ]
            
            # Add context if provided
            if context:
                messages.append({
                    "role": "system", 
                    "content": f"Context: {json.dumps(context, indent=2)}"
                })
            
            # Add user message
            user_message = self._format_input(input_data)
            messages.append({"role": "user", "content": user_message})
            
            # Get tools
            tools = self.get_tools()
            
            # Call OpenAI
            if tools:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    tools=tools,
                    tool_choice="auto"
                )
            else:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages
                )
            
            # Process response
            result = self._process_response(response, input_data)
            
            # Log execution
            execution_record = {
                "execution_id": execution_id,
                "timestamp": datetime.utcnow().isoformat(),
                "agent": self.name,
                "input": input_data,
                "context": context,
                "result": result,
                "status": "success"
            }
            self.execution_history.append(execution_record)
            
            logger.info(f"Agent {self.name} execution completed", execution_id=execution_id)
            
            return result
            
        except Exception as e:
            logger.error(f"Agent {self.name} execution failed", error=str(e))
            
            # Log failed execution
            execution_record = {
                "execution_id": execution_id,
                "timestamp": datetime.utcnow().isoformat(),
                "agent": self.name,
                "input": input_data,
                "context": context,
                "error": str(e),
                "status": "failed"
            }
            self.execution_history.append(execution_record)
            
            return {
                "error": str(e),
                "status": "failed",
                "execution_id": execution_id
            }
    
    def _format_input(self, input_data: Dict[str, Any]) -> str:
        """Format input data for the agent."""
        return json.dumps(input_data, indent=2)
    
    def _process_response(self, response: Any, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process the response from OpenAI."""
        message = response.choices[0].message
        
        # Check if there are tool calls
        if message.tool_calls:
            tool_results = []
            for tool_call in message.tool_calls:
                # Here you would execute the actual tool
                # For now, we'll just log it
                tool_results.append({
                    "tool": tool_call.function.name,
                    "arguments": json.loads(tool_call.function.arguments)
                })
            
            return {
                "content": message.content,
                "tool_calls": tool_results,
                "status": "success"
            }
        else:
            return {
                "content": message.content,
                "status": "success"
            }
    
    def get_execution_history(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get execution history for this agent."""
        if limit:
            return self.execution_history[-limit:]
        return self.execution_history