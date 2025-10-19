"""PostgreSQL database connection and utilities."""
import psycopg2
import psycopg2.pool
from contextlib import contextmanager
from typing import Optional, List, Dict, Any
import structlog
from src.config import settings

logger = structlog.get_logger()

# Create a connection pool
_connection_pool: Optional[psycopg2.pool.SimpleConnectionPool] = None


def get_connection_pool():
    """Get or create the PostgreSQL connection pool."""
    global _connection_pool

    if _connection_pool is None:
        try:
            _connection_pool = psycopg2.pool.SimpleConnectionPool(
                minconn=1,
                maxconn=20,
                host=settings.postgres_host,
                port=settings.postgres_port,
                database=settings.postgres_database,
                user=settings.postgres_user,
                password=settings.postgres_password,
            )
            logger.info("PostgreSQL connection pool created successfully")
        except Exception as e:
            logger.error("Failed to create PostgreSQL connection pool", error=str(e))
            raise

    return _connection_pool


@contextmanager
def get_db_connection():
    """Context manager for database connections."""
    pool = get_connection_pool()
    conn = None

    try:
        conn = pool.getconn()
        yield conn
        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error("Database error", error=str(e))
        raise
    finally:
        if conn:
            pool.putconn(conn)


def execute_query(query: str, params: tuple = None) -> List[Dict[str, Any]]:
    """Execute a SELECT query and return results as list of dicts."""
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(query, params or ())
            columns = [desc[0] for desc in cursor.description]
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]
            return results


def execute_update(query: str, params: tuple = None) -> int:
    """Execute an INSERT/UPDATE/DELETE query and return affected row count."""
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(query, params or ())
            return cursor.rowcount


def close_connection_pool():
    """Close all connections in the pool."""
    global _connection_pool

    if _connection_pool:
        _connection_pool.closeall()
        _connection_pool = None
        logger.info("PostgreSQL connection pool closed")
