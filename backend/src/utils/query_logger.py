import json
import os
from datetime import datetime
from typing import Dict, Any, List
from pathlib import Path
import structlog

logger = structlog.get_logger()


class QueryLogger:
    """Logger for tracking SQL queries and their generation process."""
    
    def __init__(self, log_dir: str = "query_logs"):
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(exist_ok=True)
        self.current_session = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.session_file = self.log_dir / f"session_{self.current_session}.json"
        self.queries: List[Dict[str, Any]] = []
    
    def log_query(self, 
                  natural_language: str,
                  generated_sql: str,
                  tables_found: List[str],
                  validation_result: Dict[str, Any],
                  execution_result: Dict[str, Any] = None,
                  metadata: Dict[str, Any] = None) -> str:
        """Log a complete query generation and execution."""
        query_id = f"query_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{len(self.queries) + 1}"
        
        log_entry = {
            "query_id": query_id,
            "timestamp": datetime.now().isoformat(),
            "natural_language": natural_language,
            "generated_sql": generated_sql,
            "tables_found": tables_found,
            "validation": validation_result,
            "execution": execution_result,
            "metadata": metadata or {}
        }
        
        self.queries.append(log_entry)
        self._save_session()
        
        # Also save individual query
        query_file = self.log_dir / f"{query_id}.sql"
        with open(query_file, 'w') as f:
            f.write(f"-- Natural Language: {natural_language}\n")
            f.write(f"-- Generated at: {log_entry['timestamp']}\n")
            f.write(f"-- Tables used: {', '.join(tables_found)}\n")
            f.write(f"-- Valid: {validation_result.get('valid', 'Unknown')}\n")
            if validation_result.get('valid'):
                f.write(f"-- Estimated cost: ${validation_result.get('estimated_cost_usd', 0):.8f}\n")
                f.write(f"-- Bytes to scan: {validation_result.get('total_bytes_processed', 0):,}\n")
            f.write("\n" + generated_sql)
        
        logger.info(f"Query logged: {query_id}")
        return query_id
    
    def _save_session(self):
        """Save the current session to file."""
        with open(self.session_file, 'w') as f:
            json.dump({
                "session_id": self.current_session,
                "queries": self.queries
            }, f, indent=2)
    
    def get_session_queries(self) -> List[Dict[str, Any]]:
        """Get all queries from the current session."""
        return self.queries
    
    def get_query_by_id(self, query_id: str) -> Dict[str, Any]:
        """Get a specific query by ID."""
        for query in self.queries:
            if query["query_id"] == query_id:
                return query
        return None
    
    def get_all_sessions(self) -> List[str]:
        """Get all available session files."""
        return sorted([f.stem for f in self.log_dir.glob("session_*.json")])
    
    def load_session(self, session_id: str) -> List[Dict[str, Any]]:
        """Load queries from a specific session."""
        session_file = self.log_dir / f"{session_id}.json"
        if session_file.exists():
            with open(session_file, 'r') as f:
                data = json.load(f)
                return data.get("queries", [])
        return []