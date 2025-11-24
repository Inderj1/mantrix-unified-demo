#!/usr/bin/env python3
"""
Build RDF Knowledge Graph from all mantrix_nexxt PostgreSQL tables
Creates semantic relationships between entities for enhanced querying
"""

import psycopg2
from rdflib import Graph, Namespace, Literal, URIRef
from rdflib.namespace import RDF, RDFS, XSD
from datetime import datetime
import structlog
from urllib.parse import quote

logger = structlog.get_logger()

# Define namespaces
MANTRIX = Namespace("http://mantrix.ai/ontology#")
DATA = Namespace("http://mantrix.ai/data/")

# Database config
DB_CONFIG = {
    'host': 'localhost',
    'port': 5433,
    'database': 'mantrix_nexxt',
    'user': 'mantrix',
    'password': 'mantrix123'
}

class KnowledgeGraphBuilder:
    def __init__(self):
        self.graph = Graph()
        self.graph.bind('mantrix', MANTRIX)
        self.graph.bind('data', DATA)
        self.conn = psycopg2.connect(**DB_CONFIG)

        # Track entities to avoid duplicates
        self.entities = {
            'surgeons': set(),
            'distributors': set(),
            'facilities': set(),
            'systems': set(),
            'items': set(),
            'regions': set()
        }

    def safe_uri(self, prefix, value):
        """Create safe URI from value"""
        if value is None:
            return None
        safe_value = quote(str(value).replace(' ', '_'))
        return DATA[f"{prefix}/{safe_value}"]

    def add_entity(self, entity_type, value, properties=None):
        """Add entity to graph if not exists"""
        if value is None or value == '':
            return None

        uri = self.safe_uri(entity_type, value)

        if value not in self.entities.get(entity_type, set()):
            # Add entity
            self.graph.add((uri, RDF.type, MANTRIX[entity_type.capitalize()]))
            self.graph.add((uri, RDFS.label, Literal(value)))

            # Add additional properties
            if properties:
                for prop, val in properties.items():
                    if val is not None:
                        self.graph.add((uri, MANTRIX[prop], Literal(val)))

            self.entities[entity_type].add(value)

        return uri

    def load_csg_data(self):
        """Load CSG transaction data"""
        logger.info("Loading csg_data into knowledge graph...")

        query = "SELECT * FROM csg_data LIMIT 10000"  # Limit for performance

        with self.conn.cursor() as cur:
            cur.execute(query)
            columns = [desc[0] for desc in cur.description]

            count = 0
            for row in cur:
                data = dict(zip(columns, row))

                # Create transaction URI
                txn_uri = DATA[f"transaction/{data['id']}"]
                self.graph.add((txn_uri, RDF.type, MANTRIX.Transaction))

                # Add entities
                surgeon_uri = self.add_entity('surgeons', data.get('surgeon'))
                distributor_uri = self.add_entity('distributors', data.get('distributor'))
                facility_uri = self.add_entity('facilities', data.get('facility'))
                system_uri = self.add_entity('systems', data.get('system'))
                region_uri = self.add_entity('regions', data.get('region'))

                # Link transaction to entities
                if surgeon_uri:
                    self.graph.add((txn_uri, MANTRIX.performedBy, surgeon_uri))
                if distributor_uri:
                    self.graph.add((txn_uri, MANTRIX.distributedBy, distributor_uri))
                if facility_uri:
                    self.graph.add((txn_uri, MANTRIX.atFacility, facility_uri))
                if system_uri:
                    self.graph.add((txn_uri, MANTRIX.usesSystem, system_uri))
                if region_uri:
                    self.graph.add((txn_uri, MANTRIX.inRegion, region_uri))

                # Add transaction properties
                if data.get('surgery_date'):
                    self.graph.add((txn_uri, MANTRIX.surgeryDate, Literal(data['surgery_date'], datatype=XSD.date)))
                if data.get('total_sales'):
                    self.graph.add((txn_uri, MANTRIX.revenue, Literal(float(data['total_sales']), datatype=XSD.decimal)))
                if data.get('total_gm'):
                    self.graph.add((txn_uri, MANTRIX.grossMargin, Literal(float(data['total_gm']), datatype=XSD.decimal)))
                if data.get('quantity'):
                    self.graph.add((txn_uri, MANTRIX.quantity, Literal(data['quantity'], datatype=XSD.integer)))

                count += 1
                if count % 1000 == 0:
                    logger.info(f"Processed {count} transactions...")

        logger.info(f"✅ Loaded {count} transactions from csg_data")

    def load_invoices(self):
        """Load invoice data"""
        logger.info("Loading fact_invoices into knowledge graph...")

        query = "SELECT * FROM fact_invoices LIMIT 10000"

        with self.conn.cursor() as cur:
            cur.execute(query)
            columns = [desc[0] for desc in cur.description]

            count = 0
            for row in cur:
                data = dict(zip(columns, row))

                # Create invoice URI
                inv_uri = DATA[f"invoice/{data['invoice_id']}"]
                self.graph.add((inv_uri, RDF.type, MANTRIX.Invoice))

                # Link to entities
                surgeon_uri = self.add_entity('surgeons', data.get('surgeon'))
                facility_uri = self.add_entity('facilities', data.get('facility'))
                system_uri = self.add_entity('systems', data.get('system'))

                if surgeon_uri:
                    self.graph.add((inv_uri, MANTRIX.billedTo, surgeon_uri))
                if facility_uri:
                    self.graph.add((inv_uri, MANTRIX.atFacility, facility_uri))
                if system_uri:
                    self.graph.add((inv_uri, MANTRIX.forSystem, system_uri))

                # Add invoice properties
                if data.get('surgery_date'):
                    self.graph.add((inv_uri, MANTRIX.invoiceDate, Literal(data['surgery_date'], datatype=XSD.date)))
                if data.get('amount'):
                    self.graph.add((inv_uri, MANTRIX.amount, Literal(float(data['amount']), datatype=XSD.decimal)))
                if data.get('inv_number'):
                    self.graph.add((inv_uri, MANTRIX.invoiceNumber, Literal(str(data['inv_number']))))

                count += 1

        logger.info(f"✅ Loaded {count} invoices from fact_invoices")

    def load_commission_data(self):
        """Load commission tables"""
        logger.info("Loading commission data...")

        tables = [
            'cibolo_spine_turgon_2025_commission_2_sheet1',
            'leap_llc_knickerbocker_2025_commission_2_sheet1'
        ]

        for table in tables:
            try:
                query = f"SELECT * FROM {table}"
                with self.conn.cursor() as cur:
                    cur.execute(query)
                    columns = [desc[0] for desc in cur.description]

                    for row in cur:
                        data = dict(zip(columns, row))

                        # Create commission record
                        comm_uri = DATA[f"commission/{table}/{data.get('id', 0)}"]
                        self.graph.add((comm_uri, RDF.type, MANTRIX.Commission))

                        # Link to distributor if present
                        dist_col = next((k for k in data.keys() if 'distributor' in k.lower()), None)
                        if dist_col and data.get(dist_col):
                            dist_uri = self.add_entity('distributors', data[dist_col])
                            self.graph.add((comm_uri, MANTRIX.paidTo, dist_uri))

                logger.info(f"✅ Loaded commission data from {table}")
            except Exception as e:
                logger.warning(f"Could not load {table}: {e}")

    def build(self):
        """Build complete knowledge graph"""
        logger.info("="*80)
        logger.info("BUILDING KNOWLEDGE GRAPH")
        logger.info("="*80)

        self.load_csg_data()
        self.load_invoices()
        self.load_commission_data()

        # Save to file
        output_file = "mantrix_knowledge_graph.ttl"
        self.graph.serialize(destination=output_file, format='turtle')

        logger.info(f"\n✅ Knowledge Graph Built Successfully!")
        logger.info(f"   Total triples: {len(self.graph):,}")
        logger.info(f"   Surgeons: {len(self.entities['surgeons'])}")
        logger.info(f"   Distributors: {len(self.entities['distributors'])}")
        logger.info(f"   Facilities: {len(self.entities['facilities'])}")
        logger.info(f"   Systems: {len(self.entities['systems'])}")
        logger.info(f"   Regions: {len(self.entities['regions'])}")
        logger.info(f"\n   Saved to: {output_file}")

        self.conn.close()
        return output_file

if __name__ == "__main__":
    builder = KnowledgeGraphBuilder()
    builder.build()
