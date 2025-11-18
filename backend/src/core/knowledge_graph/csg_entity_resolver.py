"""
CSG Entity Resolver using RDF graph for entity type disambiguation.
Resolves whether a person name is a surgeon or distributor.
"""
import os
from typing import Optional, Dict, List, Tuple
from rdflib import Graph, Namespace, Literal, URIRef
from rdflib.namespace import RDF, RDFS
import psycopg2
from psycopg2.extras import RealDictCursor
import structlog

logger = structlog.get_logger()

# Define namespaces
CSG = Namespace("http://mantrix.ai/ontology/csg#")
DATA = Namespace("http://mantrix.ai/data/csg/")


class CSGEntityResolver:
    """Resolves entity types (surgeon vs distributor) using RDF knowledge graph."""

    def __init__(self):
        self.graph = None
        self._entity_cache = {}  # Cache for quick lookups
        self._initialized = False

    def initialize(self, postgres_config: Dict):
        """Initialize the RDF graph with CSG data."""
        if self._initialized:
            return

        logger.info("Initializing CSG Entity Resolver...")
        self.graph = Graph()
        self.graph.bind('csg', CSG)
        self.graph.bind('data', DATA)

        # Load ontology
        self._load_ontology()

        # Load entity mappings from PostgreSQL
        self._load_entities(postgres_config)

        self._initialized = True
        logger.info(f"✅ Entity Resolver initialized with {len(self.graph)} triples")
        logger.info(f"   Cached {len(self._entity_cache)} entities")

    def _load_ontology(self):
        """Load the CSG ontology."""
        ontology_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            'ontology', 'csg_ontology.ttl'
        )

        if os.path.exists(ontology_path):
            self.graph.parse(ontology_path, format='turtle')
            logger.info(f"Loaded ontology from {ontology_path}")
        else:
            logger.warning(f"Ontology not found at {ontology_path}")

    def _load_entities(self, config: Dict):
        """Load surgeon and distributor entities from PostgreSQL."""
        try:
            conn = psycopg2.connect(
                host=config.get('host', 'localhost'),
                port=config.get('port', 5433),
                user=config.get('user', 'mantrix'),
                password=config.get('password', 'mantrix123'),
                database=config.get('database', 'mantrix_nexxt')
            )

            cursor = conn.cursor(cursor_factory=RealDictCursor)

            # Get unique surgeons
            cursor.execute("""
                SELECT DISTINCT surgeon as name, 'surgeon' as type
                FROM csg_data
                WHERE surgeon IS NOT NULL
            """)
            surgeons = cursor.fetchall()

            # Get unique distributors
            cursor.execute("""
                SELECT DISTINCT distributor as name, 'distributor' as type
                FROM csg_data
                WHERE distributor IS NOT NULL
            """)
            distributors = cursor.fetchall()

            cursor.close()
            conn.close()

            # Add to graph and cache
            for item in surgeons:
                name = item['name']
                uri = self._create_uri('surgeon', name)
                self.graph.add((uri, RDF.type, CSG.Surgeon))
                self.graph.add((uri, CSG.personName, Literal(name)))
                self._entity_cache[name.lower()] = {
                    'name': name,
                    'type': 'surgeon',
                    'uri': str(uri)
                }

            for item in distributors:
                name = item['name']
                uri = self._create_uri('distributor', name)
                self.graph.add((uri, RDF.type, CSG.Distributor))
                self.graph.add((uri, CSG.personName, Literal(name)))

                # Add to cache (distributors override if name conflict)
                self._entity_cache[name.lower()] = {
                    'name': name,
                    'type': 'distributor',
                    'uri': str(uri)
                }

            logger.info(f"Loaded {len(surgeons)} surgeons and {len(distributors)} distributors")

        except Exception as e:
            logger.error(f"Failed to load entities from PostgreSQL: {e}")

    def _create_uri(self, entity_type: str, name: str) -> URIRef:
        """Create a URI for an entity."""
        from urllib.parse import quote
        clean_name = name.strip().replace(' ', '_').replace('/', '_')
        encoded = quote(clean_name)
        return DATA[f"{entity_type}/{encoded}"]

    def resolve_entity_type(self, name: str) -> Optional[str]:
        """
        Resolve what type of entity a name is.

        Args:
            name: Person name to resolve

        Returns:
            'surgeon', 'distributor', or None if not found
        """
        if not self._initialized:
            logger.warning("Entity resolver not initialized")
            return None

        # Check cache first
        cached = self._entity_cache.get(name.lower())
        if cached:
            return cached['type']

        # Query the graph
        surgeon_query = f"""
            SELECT ?s WHERE {{
                ?s a <{CSG.Surgeon}> .
                ?s <{CSG.personName}> "{name}" .
            }}
        """

        distributor_query = f"""
            SELECT ?s WHERE {{
                ?s a <{CSG.Distributor}> .
                ?s <{CSG.personName}> "{name}" .
            }}
        """

        if len(list(self.graph.query(surgeon_query))) > 0:
            return 'surgeon'
        elif len(list(self.graph.query(distributor_query))) > 0:
            return 'distributor'

        return None

    def get_entity_info(self, name: str) -> Optional[Dict]:
        """
        Get full entity information.

        Returns:
            Dict with 'name', 'type', 'uri' or None
        """
        if not self._initialized:
            return None

        return self._entity_cache.get(name.lower())

    def find_similar_entities(self, partial_name: str, entity_type: Optional[str] = None) -> List[Dict]:
        """
        Find entities with names similar to the partial name.

        Args:
            partial_name: Partial name to search for
            entity_type: Optional filter by 'surgeon' or 'distributor'

        Returns:
            List of entity info dicts
        """
        partial_lower = partial_name.lower()
        results = []

        for name_lower, info in self._entity_cache.items():
            if partial_lower in name_lower:
                if entity_type is None or info['type'] == entity_type:
                    results.append(info)

        return results

    def get_column_for_entity(self, name: str) -> Tuple[Optional[str], Optional[str]]:
        """
        Get the database column name for an entity.

        Args:
            name: Entity name

        Returns:
            Tuple of (column_name, entity_type) or (None, None)
        """
        entity_type = self.resolve_entity_type(name)

        if entity_type == 'surgeon':
            return ('surgeon', 'surgeon')
        elif entity_type == 'distributor':
            return ('distributor', 'distributor')

        return (None, None)


# Global singleton instance
_entity_resolver = None


def get_entity_resolver(postgres_config: Optional[Dict] = None) -> CSGEntityResolver:
    """Get or create the global entity resolver instance."""
    global _entity_resolver

    if _entity_resolver is None:
        _entity_resolver = CSGEntityResolver()

        if postgres_config:
            _entity_resolver.initialize(postgres_config)

    return _entity_resolver
