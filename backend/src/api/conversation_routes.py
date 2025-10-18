"""API routes for conversation management."""
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query
import structlog
from ..models.conversation import (
    CreateConversationRequest,
    CreateConversationResponse,
    ConversationListResponse,
    Conversation,
    Message,
    UpdateConversationRequest,
    AddMessageRequest,
    SearchConversationsRequest
)
from ..core.conversation_service import ConversationService

logger = structlog.get_logger()
router = APIRouter(prefix="/api/v1/conversations", tags=["conversations"])

# Dependency to get conversation service
_conversation_service = None

def get_conversation_service() -> ConversationService:
    """Get or create conversation service instance."""
    global _conversation_service
    if _conversation_service is None:
        _conversation_service = ConversationService()
    return _conversation_service


@router.post("", response_model=CreateConversationResponse)
async def create_conversation(
    request: CreateConversationRequest = CreateConversationRequest(),
    service: ConversationService = Depends(get_conversation_service)
):
    """Create a new conversation."""
    try:
        logger.info(f"Creating conversation for user: {request.user_id}")
        response = service.create_conversation(request)
        return response
    except Exception as e:
        logger.error(f"Failed to create conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=ConversationListResponse)
async def list_conversations(
    user_id: str = Query(default="default", description="User ID"),
    limit: int = Query(default=50, le=100, description="Maximum number of conversations to return"),
    skip: int = Query(default=0, ge=0, description="Number of conversations to skip"),
    service: ConversationService = Depends(get_conversation_service)
):
    """List conversations for a user."""
    try:
        logger.info(f"Listing conversations for user: {user_id}")
        response = service.list_conversations(user_id, limit, skip)
        return response
    except Exception as e:
        logger.error(f"Failed to list conversations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{conversation_id}", response_model=Conversation)
async def get_conversation(
    conversation_id: str,
    service: ConversationService = Depends(get_conversation_service)
):
    """Get a specific conversation by ID."""
    try:
        logger.info(f"Getting conversation: {conversation_id}")
        conversation = service.get_conversation(conversation_id)
        
        if not conversation:
            raise HTTPException(status_code=404, detail=f"Conversation {conversation_id} not found")
        
        return conversation
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{conversation_id}/messages")
async def add_message_to_conversation(
    conversation_id: str,
    request: AddMessageRequest,
    service: ConversationService = Depends(get_conversation_service)
):
    """Add a message to a conversation."""
    try:
        logger.info(f"Adding message to conversation: {conversation_id}")
        success = service.add_message(conversation_id, request.message)
        
        if not success:
            raise HTTPException(status_code=404, detail=f"Conversation {conversation_id} not found")
        
        return {"success": True, "message": "Message added successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to add message: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{conversation_id}")
async def update_conversation(
    conversation_id: str,
    request: UpdateConversationRequest,
    service: ConversationService = Depends(get_conversation_service)
):
    """Update conversation metadata."""
    try:
        logger.info(f"Updating conversation: {conversation_id}")
        success = service.update_conversation(conversation_id, request)
        
        if not success:
            raise HTTPException(status_code=404, detail=f"Conversation {conversation_id} not found")
        
        return {"success": True, "message": "Conversation updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    service: ConversationService = Depends(get_conversation_service)
):
    """Delete a conversation."""
    try:
        logger.info(f"Deleting conversation: {conversation_id}")
        success = service.delete_conversation(conversation_id)
        
        if not success:
            raise HTTPException(status_code=404, detail=f"Conversation {conversation_id} not found")
        
        return {"success": True, "message": "Conversation deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search")
async def search_conversations(
    request: SearchConversationsRequest,
    service: ConversationService = Depends(get_conversation_service)
):
    """Search conversations by text."""
    try:
        logger.info(f"Searching conversations for user: {request.user_id}")
        conversations = service.search_conversations(
            request.user_id,
            request.query,
            request.limit
        )
        
        return {
            "conversations": conversations,
            "total": len(conversations),
            "query": request.query
        }
    except Exception as e:
        logger.error(f"Failed to search conversations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/user/{user_id}/all")
async def delete_all_user_conversations(
    user_id: str,
    service: ConversationService = Depends(get_conversation_service)
):
    """Delete all conversations for a user."""
    try:
        logger.info(f"Deleting all conversations for user: {user_id}")
        count = service.delete_all_conversations(user_id)
        
        return {
            "success": True,
            "message": f"Deleted {count} conversations",
            "deleted_count": count
        }
    except Exception as e:
        logger.error(f"Failed to delete all conversations: {e}")
        raise HTTPException(status_code=500, detail=str(e))