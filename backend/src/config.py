from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Anthropic
    anthropic_api_key: str = Field(..., alias="ANTHROPIC_API_KEY")
    anthropic_model: str = Field(default="claude-3-opus-20240229", alias="ANTHROPIC_MODEL")

    # OpenAI (for embeddings)
    openai_api_key: Optional[str] = Field(None, alias="OPENAI_API_KEY")
    openai_embedding_model: str = Field(
        default="text-embedding-3-small", alias="OPENAI_EMBEDDING_MODEL"
    )

    # Google Cloud / BigQuery (Optional - deprecated in favor of PostgreSQL)
    google_cloud_project: Optional[str] = Field(None, alias="GOOGLE_CLOUD_PROJECT")
    google_application_credentials: Optional[str] = Field(
        None, alias="GOOGLE_APPLICATION_CREDENTIALS"
    )
    bigquery_dataset: Optional[str] = Field(None, alias="BIGQUERY_DATASET")

    # Weaviate
    weaviate_url: str = Field(default="http://localhost:8082", alias="WEAVIATE_URL")
    weaviate_api_key: Optional[str] = Field(None, alias="WEAVIATE_API_KEY")

    # Markets.AI API Keys (all free)
    fred_api_key: Optional[str] = Field(None, alias="FRED_API_KEY")
    eia_api_key: Optional[str] = Field(None, alias="EIA_API_KEY")
    bls_api_key: Optional[str] = Field(None, alias="BLS_API_KEY")

    # API Configuration
    api_host: str = Field(default="0.0.0.0", alias="API_HOST")
    api_port: int = Field(default=8000, alias="API_PORT")
    api_env: str = Field(default="development", alias="API_ENV")

    # Logging
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    # Industry configuration - Disabled (using GL mappings only)
    industry: str = Field(default="gl_mappings", alias="INDUSTRY")
    enable_industry_features: bool = Field(default=False, alias="ENABLE_INDUSTRY_FEATURES")

    # Explanation Mode - Set to True for technical SQL details, False for user-friendly explanations
    enable_technical_explanations: bool = Field(default=False, alias="ENABLE_TECHNICAL_EXPLANATIONS")

    # MongoDB Configuration
    mongodb_url: str = Field(default="mongodb://localhost:27017", alias="MONGODB_URL")

    # Neo4j Configuration
    neo4j_uri: str = Field(default="bolt://localhost:7687", alias="NEO4J_URI")
    neo4j_user: str = Field(default="neo4j", alias="NEO4J_USER")
    neo4j_password: str = Field(default="password123", alias="NEO4J_PASSWORD")
    mongodb_db_name: str = Field(default="mantrix_nexxt_conversations", alias="MONGODB_DB_NAME")
    mongodb_database: str = Field(default="mantrix_nexxt_conversations", alias="MONGODB_DATABASE")
    mongodb_conversations_collection: str = Field(
        default="conversations", alias="MONGODB_CONVERSATIONS_COLLECTION"
    )

    # Redis Cache Configuration
    redis_host: str = Field(default="localhost", alias="REDIS_HOST")
    redis_port: int = Field(default=6379, alias="REDIS_PORT")
    redis_db: int = Field(default=0, alias="REDIS_DB")
    redis_url: Optional[str] = Field(None, alias="REDIS_URL")  # For cloud deployments
    redis_decode_responses: bool = Field(default=True, alias="REDIS_DECODE_RESPONSES")
    redis_max_connections: int = Field(default=50, alias="REDIS_MAX_CONNECTIONS")

    # Cache TTL settings (in seconds)
    cache_ttl_sql_frequent: int = Field(
        default=7 * 24 * 60 * 60, alias="CACHE_TTL_SQL_FREQUENT"
    )  # 7 days
    cache_ttl_sql_infrequent: int = Field(
        default=24 * 60 * 60, alias="CACHE_TTL_SQL_INFREQUENT"
    )  # 1 day
    cache_ttl_schema: int = Field(default=24 * 60 * 60, alias="CACHE_TTL_SCHEMA")  # 24 hours
    cache_ttl_embedding: int = Field(
        default=30 * 24 * 60 * 60, alias="CACHE_TTL_EMBEDDING"
    )  # 30 days
    cache_ttl_validation: int = Field(default=60 * 60, alias="CACHE_TTL_VALIDATION")  # 1 hour
    cache_ttl_result: int = Field(default=5 * 60, alias="CACHE_TTL_RESULT")  # 5 minutes
    cache_ttl_session: int = Field(default=24 * 60 * 60, alias="CACHE_TTL_SESSION")  # 24 hours

    # Cache feature flags
    cache_enabled: bool = Field(default=True, alias="CACHE_ENABLED")
    cache_sql_enabled: bool = Field(default=True, alias="CACHE_SQL_ENABLED")
    cache_schema_enabled: bool = Field(default=True, alias="CACHE_SCHEMA_ENABLED")
    cache_embedding_enabled: bool = Field(default=True, alias="CACHE_EMBEDDING_ENABLED")
    cache_validation_enabled: bool = Field(default=True, alias="CACHE_VALIDATION_ENABLED")
    cache_result_enabled: bool = Field(
        default=False, alias="CACHE_RESULT_ENABLED"
    )  # Off by default for fresh data

    # PostgreSQL Configuration (Primary Database)
    postgres_host: str = Field(default="localhost", alias="POSTGRES_HOST")
    postgres_port: int = Field(default=5433, alias="POSTGRES_PORT")  # Docker maps to 5433
    postgres_user: str = Field(default="mantrix", alias="POSTGRES_USER")
    postgres_password: str = Field(default="mantrix123", alias="POSTGRES_PASSWORD")
    postgres_database: str = Field(default="mantrix_nexxt", alias="POSTGRES_DATABASE")
    
    # Clerk Authentication
    clerk_secret_key: Optional[str] = Field(None, alias="CLERK_SECRET_KEY")
    production_domain: Optional[str] = Field(None, alias="PRODUCTION_DOMAIN")

    # Apache Jena Fuseki Configuration
    fuseki_url: str = Field(default="http://localhost:3030", alias="FUSEKI_URL")
    fuseki_dataset: str = Field(default="mantrix_csg", alias="FUSEKI_DATASET")
    fuseki_user: str = Field(default="admin", alias="FUSEKI_USER")
    fuseki_password: str = Field(default="mantrix123", alias="FUSEKI_PASSWORD")


settings = Settings()
