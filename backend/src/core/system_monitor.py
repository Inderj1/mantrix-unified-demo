"""
System Monitor - Collect real-time system and service metrics
"""
import psutil
import time
from typing import Dict, Any, List
from datetime import datetime, timedelta
from collections import deque
import structlog

logger = structlog.get_logger()


class SystemMonitor:
    """Monitor system resources and service health"""

    def __init__(self):
        # Store metrics history (last 24 hours, 1 data point per minute)
        self.metrics_history = deque(maxlen=1440)
        self.last_collection_time = None

    def get_system_metrics(self) -> Dict[str, Any]:
        """Get current system metrics (CPU, memory, disk)"""
        try:
            cpu_percent = psutil.cpu_percent(interval=0.1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')

            return {
                "cpu": {
                    "percent": round(cpu_percent, 1),
                    "cores": psutil.cpu_count(),
                },
                "memory": {
                    "percent": round(memory.percent, 1),
                    "used_gb": round(memory.used / (1024**3), 2),
                    "total_gb": round(memory.total / (1024**3), 2),
                    "available_gb": round(memory.available / (1024**3), 2),
                },
                "disk": {
                    "percent": round(disk.percent, 1),
                    "used_gb": round(disk.used / (1024**3), 2),
                    "total_gb": round(disk.total / (1024**3), 2),
                    "free_gb": round(disk.free / (1024**3), 2),
                },
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error collecting system metrics: {e}")
            return {}

    def collect_metrics(self) -> Dict[str, Any]:
        """Collect and store metrics"""
        metrics = self.get_system_metrics()

        # Add to history
        self.metrics_history.append({
            "time": datetime.now(),
            "cpu": metrics.get("cpu", {}).get("percent", 0),
            "memory": metrics.get("memory", {}).get("percent", 0),
        })

        self.last_collection_time = datetime.now()
        return metrics

    def get_metrics_history(self, hours: int = 24) -> List[Dict[str, Any]]:
        """Get metrics history for the last N hours"""
        cutoff_time = datetime.now() - timedelta(hours=hours)

        history = [
            {
                "time": m["time"].strftime("%H:%M"),
                "cpu": m["cpu"],
                "memory": m["memory"],
            }
            for m in self.metrics_history
            if m["time"] >= cutoff_time
        ]

        return history

    def get_process_info(self) -> Dict[str, Any]:
        """Get current process information"""
        try:
            process = psutil.Process()

            return {
                "pid": process.pid,
                "cpu_percent": round(process.cpu_percent(interval=0.1), 1),
                "memory_mb": round(process.memory_info().rss / (1024**2), 2),
                "num_threads": process.num_threads(),
                "create_time": datetime.fromtimestamp(process.create_time()).isoformat(),
            }
        except Exception as e:
            logger.error(f"Error getting process info: {e}")
            return {}

    def check_service_health(self, services: Dict[str, Any]) -> Dict[str, Any]:
        """
        Check health of various services

        Args:
            services: Dict with service checkers
                {
                    'bigquery': bq_client,
                    'redis': redis_client,
                    'weaviate': weaviate_client,
                    etc.
                }
        """
        health_status = {}

        # BigQuery
        if 'bigquery' in services:
            try:
                bq = services['bigquery']
                tables = bq.list_tables()
                health_status['bigquery'] = {
                    'status': 'healthy',
                    'tables': len(tables),
                    'latency_ms': 0,  # Could add timing
                }
            except Exception as e:
                health_status['bigquery'] = {
                    'status': 'error',
                    'error': str(e),
                }

        # Redis
        if 'redis' in services and services['redis']:
            try:
                redis = services['redis']
                start = time.time()
                redis.ping()
                latency = (time.time() - start) * 1000

                info = redis.info()
                health_status['redis'] = {
                    'status': 'healthy',
                    'latency_ms': round(latency, 2),
                    'memory_used_mb': round(info.get('used_memory', 0) / (1024**2), 2),
                    'connected_clients': info.get('connected_clients', 0),
                    'total_commands': info.get('total_commands_processed', 0),
                }
            except Exception as e:
                health_status['redis'] = {
                    'status': 'error',
                    'error': str(e),
                }

        # Weaviate
        if 'weaviate' in services:
            try:
                wv = services['weaviate']
                if wv and wv.client:
                    # Check if client is alive
                    start = time.time()
                    # Weaviate v4 API - get collections instead of schema
                    collections = list(wv.client.collections.list_all())
                    latency = (time.time() - start) * 1000

                    health_status['weaviate'] = {
                        'status': 'healthy',
                        'latency_ms': round(latency, 2),
                        'collections': len(collections),
                    }
                else:
                    health_status['weaviate'] = {
                        'status': 'disconnected',
                        'error': 'Client not initialized',
                    }
            except Exception as e:
                health_status['weaviate'] = {
                    'status': 'error',
                    'error': str(e),
                }

        # MongoDB
        if 'mongodb' in services and services['mongodb']:
            try:
                mongo = services['mongodb']
                start = time.time()
                # Ping MongoDB
                mongo.admin.command('ping')
                latency = (time.time() - start) * 1000

                health_status['mongodb'] = {
                    'status': 'healthy',
                    'latency_ms': round(latency, 2),
                }
            except Exception as e:
                health_status['mongodb'] = {
                    'status': 'error',
                    'error': str(e),
                }

        return health_status


# Global instance
_monitor = None

def get_system_monitor() -> SystemMonitor:
    """Get or create global system monitor instance"""
    global _monitor
    if _monitor is None:
        _monitor = SystemMonitor()
    return _monitor
