"""
Claude Agent SDK - Integration layer that uses OpenAI Agent SDK patterns with Claude

This module provides a wrapper that mimics OpenAI's Agent SDK interface
but uses Claude for intelligence and reasoning.
"""

import asyncio
import json
import logging
import uuid
from datetime import datetime, date
from typing import Any, Dict, List, Optional, Callable, Union
from dataclasses import dataclass, field
from enum import Enum
from decimal import Decimal

import aiohttp
from anthropic import Anthropic
from pydantic import BaseModel, Field

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def safe_serialize(obj):
    """Safely serialize objects for JSON, handling Decimal, datetime, and other types"""
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, (datetime, date)):
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {k: safe_serialize(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [safe_serialize(item) for item in obj]
    elif hasattr(obj, '__dict__'):
        # Handle dataclass or other objects with __dict__
        return safe_serialize(obj.__dict__)
    else:
        try:
            # Try to convert to string if all else fails
            json.dumps(obj)
            return obj
        except (TypeError, ValueError):
            return str(obj)


class AgentStatus(Enum):
    """Agent execution status"""
    IDLE = "idle"
    THINKING = "thinking"
    EXECUTING = "executing"
    WAITING = "waiting"
    COMPLETED = "completed"
    ERROR = "error"


class ToolType(Enum):
    """Types of tools available to agents"""
    DATA_QUERY = "data_query"
    ANALYSIS = "analysis"
    CALCULATION = "calculation"
    VISUALIZATION = "visualization"
    RESEARCH = "research"
    HANDOFF = "handoff"


@dataclass
class ToolResult:
    """Result from tool execution"""
    success: bool
    data: Any = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    execution_time: float = 0.0


@dataclass
class AgentMessage:
    """Message in agent conversation"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    role: str = "assistant"  # user, assistant, system, tool
    content: str = ""
    timestamp: datetime = field(default_factory=datetime.now)
    agent_name: Optional[str] = None
    tool_calls: List[Dict] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


class Tool:
    """Tool that can be used by agents"""
    
    def __init__(
        self,
        name: str,
        description: str,
        function: Callable,
        tool_type: ToolType = ToolType.ANALYSIS,
        parameters: Optional[Dict] = None
    ):
        self.name = name
        self.description = description
        self.function = function
        self.tool_type = tool_type
        self.parameters = parameters or {}
        
    async def execute(self, **kwargs) -> ToolResult:
        """Execute the tool function"""
        start_time = asyncio.get_event_loop().time()
        
        try:
            # Execute the tool function
            if asyncio.iscoroutinefunction(self.function):
                result = await self.function(**kwargs)
            else:
                result = self.function(**kwargs)
                
            execution_time = asyncio.get_event_loop().time() - start_time
            
            return ToolResult(
                success=True,
                data=safe_serialize(result),
                execution_time=execution_time,
                metadata={"tool_name": self.name, "tool_type": self.tool_type.value}
            )
            
        except Exception as e:
            execution_time = asyncio.get_event_loop().time() - start_time
            logger.error(f"Tool {self.name} execution failed: {str(e)}")
            
            return ToolResult(
                success=False,
                error=str(e),
                execution_time=execution_time,
                metadata={"tool_name": self.name, "tool_type": self.tool_type.value}
            )
    
    def to_anthropic_tool(self) -> Dict:
        """Convert to Anthropic tool format"""
        return {
            "name": self.name,
            "description": self.description,
            "input_schema": {
                "type": "object",
                "properties": self.parameters,
                "required": list(self.parameters.keys()) if self.parameters else []
            }
        }


class Agent:
    """Agent that can think, plan, and execute tasks using Claude"""
    
    def __init__(
        self,
        name: str,
        instructions: str,
        model: str = "claude-3-5-sonnet-20241022",
        tools: Optional[List[Tool]] = None,
        max_iterations: int = 10,
        temperature: float = 0.1
    ):
        self.name = name
        self.instructions = instructions
        self.model = model
        self.tools = tools or []
        self.max_iterations = max_iterations
        self.temperature = temperature
        
        # State management
        self.status = AgentStatus.IDLE
        self.conversation_history: List[AgentMessage] = []
        self.current_objective: Optional[str] = None
        self.context_variables: Dict[str, Any] = {}
        
        # Tool registry
        self.tool_registry = {tool.name: tool for tool in self.tools}
        
    def add_tool(self, tool: Tool):
        """Add a tool to the agent's toolkit"""
        self.tools.append(tool)
        self.tool_registry[tool.name] = tool
        
    def set_context(self, **kwargs):
        """Set context variables for the agent"""
        self.context_variables.update(kwargs)
        
    def get_context(self, key: str, default=None):
        """Get context variable"""
        return self.context_variables.get(key, default)
        
    async def think(self, prompt: str, context: Optional[Dict] = None) -> str:
        """Use Claude to think about a problem"""
        self.status = AgentStatus.THINKING
        
        try:
            # Build messages for Claude
            messages = self._build_claude_messages(prompt, context)
            
            # Get Claude's response
            claude_response = await self._call_claude(messages)
            
            # Add to conversation history
            self.conversation_history.append(AgentMessage(
                role="assistant",
                content=claude_response,
                agent_name=self.name,
                metadata={"action": "thinking", "context": context}
            ))
            
            return claude_response
            
        except Exception as e:
            self.status = AgentStatus.ERROR
            logger.error(f"Agent {self.name} thinking failed: {str(e)}")
            raise
        finally:
            if self.status != AgentStatus.ERROR:
                self.status = AgentStatus.IDLE
    
    async def execute_task(self, task: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Execute a task with possible tool usage"""
        self.status = AgentStatus.EXECUTING
        self.current_objective = task
        
        try:
            # Build messages including task and available tools
            messages = self._build_claude_messages(task, context, include_tools=True)
            
            # Execute with Claude
            result = await self._execute_with_tools(messages)
            
            return {
                "success": True,
                "result": safe_serialize(result),
                "agent": self.name,
                "task": task,
                "context": safe_serialize(context)
            }
            
        except Exception as e:
            self.status = AgentStatus.ERROR
            logger.error(f"Agent {self.name} task execution failed: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "agent": self.name,
                "task": task,
                "context": safe_serialize(context)
            }
        finally:
            if self.status != AgentStatus.ERROR:
                self.status = AgentStatus.COMPLETED
                
    def _build_claude_messages(self, prompt: str, context: Optional[Dict] = None, include_tools: bool = False) -> List[Dict]:
        """Build messages for Claude API with token limit handling"""
        messages = []
        
        # System message with instructions
        system_content = self.instructions
        
        # Limit context size to prevent token overflow
        if context:
            context_str = json.dumps(context, indent=2, default=str)
            # Truncate context if too long (rough estimate: 4 chars per token)
            if len(context_str) > 100000:  # ~25K tokens
                context_str = context_str[:100000] + "...[truncated]"
            system_content += f"\n\nContext: {context_str}"
            
        if include_tools and self.tools:
            tools_description = "\n\nAvailable Tools:\n"
            for tool in self.tools:
                tools_description += f"- {tool.name}: {tool.description}\n"
            system_content += tools_description
        
        # Truncate system content if too long
        if len(system_content) > 150000:  # ~37K tokens
            system_content = system_content[:150000] + "...[truncated for length]"
            
        messages.append({"role": "system", "content": system_content})
        
        # Add conversation history (limited)
        for msg in self.conversation_history[-3:]:  # Reduced from 5 to 3
            content = msg.content
            if len(content) > 10000:  # Truncate long messages
                content = content[:10000] + "...[truncated]"
            messages.append({
                "role": msg.role,
                "content": content
            })
            
        # Truncate prompt if too long
        if len(prompt) > 50000:  # ~12K tokens
            prompt = prompt[:50000] + "...[truncated for length]"
            
        # Add current prompt
        messages.append({"role": "user", "content": prompt})
        
        return messages
    
    async def _call_claude(self, messages: List[Dict]) -> str:
        """Call Claude API"""
        try:
            # Try to use the Anthropic client if available
            import os
            anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
            
            if anthropic_api_key:
                from anthropic import Anthropic
                claude_client = Anthropic(api_key=anthropic_api_key)
                
                # Convert messages to Anthropic format
                system_message = None
                conversation_messages = []
                
                for msg in messages:
                    if msg["role"] == "system":
                        system_message = msg["content"]
                    else:
                        conversation_messages.append({
                            "role": msg["role"],
                            "content": msg["content"]
                        })
                
                # Make the API call
                response = claude_client.messages.create(
                    model=self.model,
                    max_tokens=2000,
                    temperature=self.temperature,
                    system=system_message or self.instructions,
                    messages=conversation_messages
                )
                
                return response.content[0].text if response.content else "No response from Claude"
                
            else:
                # Fallback for development/testing when no API key
                return f"[MOCK] Claude response for {self.name}: Analyzing the request and planning next steps based on: {messages[-1]['content'][:100]}..."
                
        except Exception as e:
            logger.error(f"Claude API call failed: {str(e)}")
            # Return a helpful mock response for development
            return f"[MOCK] {self.name} agent response: I would analyze the request '{messages[-1]['content'][:50]}...' and provide detailed insights based on my expertise."
    
    async def _execute_with_tools(self, messages: List[Dict]) -> str:
        """Execute task with tool calling capability"""
        iterations = 0
        
        while iterations < self.max_iterations:
            # Get Claude's response
            response = await self._call_claude(messages)
            
            # Check if Claude wants to use tools
            tool_requests = self._parse_tool_requests(response)
            
            if not tool_requests:
                # No tools needed, return response
                return response
                
            # Execute requested tools
            tool_results = []
            for tool_request in tool_requests:
                tool_name = tool_request.get("name")
                tool_args = tool_request.get("arguments", {})
                
                if tool_name in self.tool_registry:
                    tool_result = await self.tool_registry[tool_name].execute(**tool_args)
                    tool_results.append({
                        "tool": tool_name,
                        "result": tool_result.data if tool_result.success else tool_result.error,
                        "success": tool_result.success
                    })
                    
            # Add tool results to messages
            messages.append({
                "role": "tool",
                "content": json.dumps(tool_results, indent=2)
            })
            
            iterations += 1
            
        return "Maximum iterations reached. Task may be incomplete."
    
    def _parse_tool_requests(self, response: str) -> List[Dict]:
        """Parse tool requests from Claude's response"""
        # Simple parsing - in real implementation, would use Claude's tool calling format
        tool_requests = []
        
        # Look for tool usage patterns in the response
        # This is a simplified version - real implementation would use structured output
        if "use_tool:" in response.lower():
            # Parse tool usage from response
            # For now, return empty list
            pass
            
        return tool_requests


class ClaudeAgentSDK:
    """Main SDK class that orchestrates Claude-powered agents"""
    
    def __init__(self, anthropic_api_key: Optional[str] = None):
        self.claude_client = Anthropic(api_key=anthropic_api_key)
        self.agents: Dict[str, Agent] = {}
        self.active_conversations: Dict[str, List[AgentMessage]] = {}
        
    def create_agent(
        self,
        name: str,
        instructions: str,
        tools: Optional[List[Tool]] = None,
        **kwargs
    ) -> Agent:
        """Create a new agent"""
        agent = Agent(
            name=name,
            instructions=instructions,
            tools=tools,
            **kwargs
        )
        
        self.agents[name] = agent
        return agent
    
    def get_agent(self, name: str) -> Optional[Agent]:
        """Get agent by name"""
        return self.agents.get(name)
    
    async def run_conversation(
        self,
        agent_name: str,
        message: str,
        conversation_id: Optional[str] = None,
        context: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Run a conversation with an agent"""
        agent = self.get_agent(agent_name)
        if not agent:
            return {"error": f"Agent {agent_name} not found"}
            
        conversation_id = conversation_id or str(uuid.uuid4())
        
        # Execute task with the agent
        result = await agent.execute_task(message, context)
        
        # Store conversation
        if conversation_id not in self.active_conversations:
            self.active_conversations[conversation_id] = []
            
        self.active_conversations[conversation_id].extend(agent.conversation_history)
        
        return {
            "conversation_id": conversation_id,
            "agent": agent_name,
            "result": result,
            "status": agent.status.value
        }
    
    def get_conversation_history(self, conversation_id: str) -> List[AgentMessage]:
        """Get conversation history"""
        return self.active_conversations.get(conversation_id, [])
    
    def list_agents(self) -> List[str]:
        """List all available agents"""
        return list(self.agents.keys())
    
    def get_agent_status(self, agent_name: str) -> Optional[str]:
        """Get agent status"""
        agent = self.get_agent(agent_name)
        return agent.status.value if agent else None