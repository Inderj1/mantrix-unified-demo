from typing import List, Optional
from abc import ABC, abstractmethod
import structlog
from openai import OpenAI
import hashlib
from src.config import settings

logger = structlog.get_logger()


class EmbeddingProvider(ABC):
    """Abstract base class for embedding providers."""
    
    @abstractmethod
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for given text."""
        pass
    
    @abstractmethod
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts."""
        pass
    
    @property
    @abstractmethod
    def dimension(self) -> int:
        """Return the dimension of embeddings."""
        pass


class OpenAIEmbeddings(EmbeddingProvider):
    """OpenAI embeddings provider."""
    
    def __init__(self):
        if not settings.openai_api_key:
            raise ValueError("OpenAI API key not configured")
        
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_embedding_model
        self._dimension = 1536 if "text-embedding-3-small" in self.model else 3072
        logger.info(f"Initialized OpenAI embeddings with model: {self.model}")
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for a single text."""
        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=text,
                encoding_format="float"
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Failed to generate OpenAI embedding: {e}")
            raise
    
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts in batch."""
        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=texts,
                encoding_format="float"
            )
            return [item.embedding for item in response.data]
        except Exception as e:
            logger.error(f"Failed to generate OpenAI embeddings: {e}")
            raise
    
    @property
    def dimension(self) -> int:
        return self._dimension


class FallbackEmbeddings(EmbeddingProvider):
    """Fallback embedding provider using deterministic hashing."""
    
    def __init__(self, dimension: int = 1536):
        self._dimension = dimension
        logger.warning("Using fallback embeddings. For production, configure OpenAI API key.")
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate a deterministic embedding using hashing."""
        # Create multiple hash values from the text
        embeddings = []
        
        # Use different hash functions and seeds
        for i in range(self._dimension):
            # Create a unique hash for each dimension
            hash_input = f"{text}_{i}".encode('utf-8')
            hash_value = hashlib.sha256(hash_input).hexdigest()
            
            # Convert first 8 hex chars to float in range [-1, 1]
            int_value = int(hash_value[:8], 16)
            float_value = (int_value / 0xFFFFFFFF) * 2 - 1
            embeddings.append(float_value)
        
        return embeddings
    
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts."""
        return [self.generate_embedding(text) for text in texts]
    
    @property
    def dimension(self) -> int:
        return self._dimension


class EmbeddingService:
    """Service for managing embeddings with automatic fallback."""
    
    def __init__(self):
        self.provider = self._initialize_provider()
    
    def _initialize_provider(self) -> EmbeddingProvider:
        """Initialize the best available embedding provider."""
        # Try OpenAI first
        if settings.openai_api_key and settings.openai_api_key != "your_openai_api_key_here":
            try:
                return OpenAIEmbeddings()
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI embeddings: {e}")
        
        # Fallback to deterministic embeddings
        return FallbackEmbeddings()
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for text."""
        return self.provider.generate_embedding(text)
    
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts."""
        return self.provider.generate_embeddings(texts)
    
    @property
    def dimension(self) -> int:
        """Get embedding dimension."""
        return self.provider.dimension
    
    @property
    def provider_type(self) -> str:
        """Get the type of embedding provider being used."""
        return type(self.provider).__name__