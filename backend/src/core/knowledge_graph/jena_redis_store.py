"""
Redis-based caching for Jena RDF graphs.
Uses the existing Redis instance for shared caching across processes.
"""

import os
import structlog
import hashlib
import json
from typing import Optional
from rdflib import Graph, Namespace, Literal, URIRef
from rdflib.plugins.stores.memory import Memory
from pathlib import Path
import redis
from src.config import settings

logger = structlog.get_logger()


class JenaRedisStore:
    """
    Redis-cached RDF store for better performance across processes.
    """
    
    def __init__(self, redis_client: Optional[redis.Redis] = None):
        self.redis = redis_client or self._create_redis_client()
        self.graph: Optional[Graph] = None
        self.ttl_file = "financial_kg.ttl"
        self.cache_key = "jena:financial_kg:triples"
        self.hash_key = "jena:financial_kg:hash"
        self.cache_ttl = 86400  # 24 hours
        
    def _create_redis_client(self) -> redis.Redis:
        """Create Redis client using app settings."""
        return redis.Redis(
            host=settings.redis_host,
            port=settings.redis_port,
            db=settings.redis_db,
            decode_responses=False,  # We'll handle encoding
            max_connections=settings.redis_max_connections
        )
        
    def _get_file_hash(self, filepath: Path) -> str:
        """Get MD5 hash of file for cache validation."""
        if not filepath.exists():
            return ""
        with open(filepath, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()
    
    def _serialize_graph(self, graph: Graph) -> bytes:
        """Serialize graph to N-Triples format for Redis storage."""
        return graph.serialize(format='nt').encode('utf-8')
    
    def _deserialize_graph(self, data: bytes) -> Graph:
        """Deserialize graph from N-Triples format."""
        g = Graph(store=Memory())
        g.parse(data=data.decode('utf-8'), format='nt')
        return g
    
    def _load_from_redis(self) -> bool:
        """Try to load graph from Redis cache."""
        try:
            # Check if cache exists
            cached_data = self.redis.get(self.cache_key)
            if not cached_data:
                return False
            
            # Check if TTL file has changed
            ttl_path = Path(self.ttl_file)
            if ttl_path.exists():
                current_hash = self._get_file_hash(ttl_path)
                stored_hash = self.redis.get(self.hash_key)
                
                if stored_hash and stored_hash.decode('utf-8') != current_hash:
                    logger.info("TTL file changed, Redis cache invalidated")
                    return False
            
            # Load from Redis
            self.graph = self._deserialize_graph(cached_data)
            
            # Re-bind namespaces
            self.graph.bind("fin", Namespace("http://example.com/finance#"))
            self.graph.bind("rdfs", Namespace("http://www.w3.org/2000/01/rdf-schema#"))
            self.graph.bind("owl", Namespace("http://www.w3.org/2002/07/owl#"))
            self.graph.bind("xsd", Namespace("http://www.w3.org/2001/XMLSchema#"))
            
            logger.info(f"Loaded RDF graph from Redis cache ({len(self.graph)} triples)")
            return True
            
        except Exception as e:
            logger.warning(f"Failed to load from Redis cache: {e}")
            return False
    
    def _save_to_redis(self):
        """Save graph to Redis cache."""
        try:
            # Serialize graph
            serialized = self._serialize_graph(self.graph)
            
            # Save to Redis with TTL
            self.redis.setex(self.cache_key, self.cache_ttl, serialized)
            
            # Save TTL file hash
            ttl_path = Path(self.ttl_file)
            if ttl_path.exists():
                current_hash = self._get_file_hash(ttl_path)
                self.redis.setex(self.hash_key, self.cache_ttl, current_hash)
            
            logger.info(f"Saved RDF graph to Redis cache ({len(serialized)} bytes)")
            
        except Exception as e:
            logger.warning(f"Failed to save to Redis cache: {e}")
    
    def get_graph(self) -> Graph:
        """Get or create the in-memory graph."""
        if self.graph is not None:
            return self.graph
        
        # Try to load from Redis first
        if self._load_from_redis():
            return self.graph
        
        # Otherwise load from TTL files
        logger.info("Loading RDF graph from TTL files...")
        self.graph = Graph(store=Memory())
        
        # Load ontology
        ontology_path = Path(__file__).parent.parent.parent.parent / "ontologies" / "financial-core.ttl"
        if ontology_path.exists():
            self.graph.parse(ontology_path, format="turtle")
            logger.info("Loaded financial ontology")
        
        # Load data
        if os.path.exists(self.ttl_file):
            self.graph.parse(self.ttl_file, format="turtle")
            logger.info(f"Loaded {len(self.graph)} triples from {self.ttl_file}")
        
        # Save to Redis for next time
        self._save_to_redis()
        
        return self.graph
    
    def clear_cache(self):
        """Clear Redis cache."""
        try:
            self.redis.delete(self.cache_key, self.hash_key)
            self.graph = None
            logger.info("Cleared RDF Redis cache")
        except Exception as e:
            logger.warning(f"Failed to clear Redis cache: {e}")
    
    def get_cache_info(self) -> dict:
        """Get cache information."""
        try:
            cache_exists = bool(self.redis.exists(self.cache_key))
            cache_size = self.redis.memory_usage(self.cache_key) if cache_exists else 0
            ttl = self.redis.ttl(self.cache_key) if cache_exists else 0
            
            return {
                "exists": cache_exists,
                "size_bytes": cache_size,
                "ttl_seconds": ttl,
                "triples_count": len(self.graph) if self.graph else 0
            }
        except Exception as e:
            logger.warning(f"Failed to get cache info: {e}")
            return {}


# Global singleton instance with Redis
_redis_store: Optional[JenaRedisStore] = None


def get_redis_graph(redis_client: Optional[redis.Redis] = None) -> Graph:
    """Get the singleton Redis-cached RDF graph."""
    global _redis_store
    if _redis_store is None:
        _redis_store = JenaRedisStore(redis_client)
    return _redis_store.get_graph()


def clear_redis_cache():
    """Clear the Redis cache."""
    global _redis_store
    if _redis_store:
        _redis_store.clear_cache()


def get_redis_cache_info() -> dict:
    """Get Redis cache information."""
    global _redis_store
    if _redis_store:
        return _redis_store.get_cache_info()
    return {"exists": False}