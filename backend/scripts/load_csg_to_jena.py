"""
Load CSG surgical device data into Apache Jena Fuseki as RDF triples.
This script transforms PostgreSQL data into RDF graph format for semantic queries.
"""
import os
import sys
import requests
from datetime import datetime
from urllib.parse import quote
from rdflib import Graph, Namespace, Literal, URIRef
from rdflib.namespace import RDF, RDFS, XSD
import psycopg2
from psycopg2.extras import RealDictCursor

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.config import settings

# Define namespaces
CSG = Namespace("http://mantrix.ai/ontology/csg#")
DATA = Namespace("http://mantrix.ai/data/csg/")

class CSGJenaLoader:
    def __init__(self):
        self.fuseki_url = os.getenv('FUSEKI_URL', 'http://localhost:3030')
        self.dataset = os.getenv('FUSEKI_DATASET', 'mantrix_csg')
        self.fuseki_user = os.getenv('FUSEKI_USER', 'admin')
        self.fuseki_password = os.getenv('FUSEKI_PASSWORD', 'mantrix123')

        self.graph = Graph()
        self.graph.bind('csg', CSG)
        self.graph.bind('data', DATA)

        # Track created entities to avoid duplicates
        self.surgeons = set()
        self.distributors = set()
        self.facilities = set()
        self.regions = set()
        self.item_codes = set()

    def create_dataset(self):
        """Create the Fuseki dataset if it doesn't exist."""
        print(f"Creating dataset '{self.dataset}' in Fuseki...")

        dataset_config = {
            "dbName": self.dataset,
            "dbType": "tdb2"
        }

        try:
            response = requests.post(
                f"{self.fuseki_url}/$/datasets",
                auth=(self.fuseki_user, self.fuseki_password),
                json=dataset_config,
                headers={'Content-Type': 'application/json'}
            )

            if response.status_code == 200:
                print(f"✅ Dataset '{self.dataset}' created successfully")
            elif response.status_code == 409:
                print(f"ℹ️  Dataset '{self.dataset}' already exists")
            else:
                print(f"❌ Failed to create dataset: {response.status_code} - {response.text}")
                return False

        except Exception as e:
            print(f"❌ Error creating dataset: {e}")
            return False

        return True

    def load_ontology(self):
        """Load the CSG ontology into the graph."""
        print("Loading CSG ontology...")
        ontology_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            'src', 'ontology', 'csg_ontology.ttl'
        )

        try:
            self.graph.parse(ontology_path, format='turtle')
            print(f"✅ Ontology loaded: {len(self.graph)} triples")
            return True
        except Exception as e:
            print(f"❌ Error loading ontology: {e}")
            return False

    def fetch_csg_data(self):
        """Fetch CSG data from PostgreSQL."""
        print("Fetching CSG data from PostgreSQL...")

        try:
            conn = psycopg2.connect(
                host=settings.postgres_host,
                port=settings.postgres_port,
                user=settings.postgres_user,
                password=settings.postgres_password,
                database=settings.postgres_database
            )

            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute("""
                SELECT
                    surgeon, distributor, region, facility,
                    surgery_date, item_code,
                    total_sales, total_gm
                FROM csg_data
                WHERE surgeon IS NOT NULL
                  AND distributor IS NOT NULL
                ORDER BY surgery_date DESC
            """)

            rows = cursor.fetchall()
            cursor.close()
            conn.close()

            print(f"✅ Fetched {len(rows)} transactions from PostgreSQL")
            return rows

        except Exception as e:
            print(f"❌ Error fetching data: {e}")
            return []

    def create_uri(self, entity_type, name):
        """Create a URI for an entity with proper encoding."""
        # Clean and encode the name
        clean_name = name.strip().replace(' ', '_').replace('/', '_')
        encoded = quote(clean_name)
        return DATA[f"{entity_type}/{encoded}"]

    def add_surgeon(self, name):
        """Add a surgeon to the graph."""
        if name in self.surgeons:
            return

        surgeon_uri = self.create_uri('surgeon', name)
        self.graph.add((surgeon_uri, RDF.type, CSG.Surgeon))
        self.graph.add((surgeon_uri, CSG.personName, Literal(name, datatype=XSD.string)))
        self.surgeons.add(name)

    def add_distributor(self, name):
        """Add a distributor to the graph."""
        if name in self.distributors:
            return

        dist_uri = self.create_uri('distributor', name)
        self.graph.add((dist_uri, RDF.type, CSG.Distributor))
        self.graph.add((dist_uri, CSG.personName, Literal(name, datatype=XSD.string)))
        self.distributors.add(name)

    def add_facility(self, name, region):
        """Add a facility to the graph."""
        if name in self.facilities:
            return

        facility_uri = self.create_uri('facility', name)
        region_uri = self.create_uri('region', region)

        self.graph.add((facility_uri, RDF.type, CSG.Facility))
        self.graph.add((facility_uri, CSG.facilityName, Literal(name, datatype=XSD.string)))
        self.graph.add((facility_uri, CSG.locatedInRegion, region_uri))

        self.facilities.add(name)

    def add_region(self, name):
        """Add a region to the graph."""
        if name in self.regions:
            return

        region_uri = self.create_uri('region', name)
        self.graph.add((region_uri, RDF.type, CSG.Region))
        self.graph.add((region_uri, CSG.regionName, Literal(name, datatype=XSD.string)))
        self.regions.add(name)

    def add_item_code(self, code):
        """Add an item code to the graph."""
        if not code or code in self.item_codes:
            return

        item_uri = self.create_uri('item', code)
        self.graph.add((item_uri, RDF.type, CSG.ItemCode))
        self.graph.add((item_uri, CSG.itemCodeValue, Literal(code, datatype=XSD.string)))
        self.item_codes.add(code)

    def add_transaction(self, row, index):
        """Add a transaction and its relationships to the graph."""
        # Create URIs
        trans_uri = DATA[f"transaction/{index}"]
        surgeon_uri = self.create_uri('surgeon', row['surgeon'])
        dist_uri = self.create_uri('distributor', row['distributor'])
        facility_uri = self.create_uri('facility', row['facility'])
        region_uri = self.create_uri('region', row['region'])

        # Transaction basic info
        self.graph.add((trans_uri, RDF.type, CSG.Transaction))

        # Relationships
        self.graph.add((trans_uri, CSG.involvesSurgeon, surgeon_uri))
        self.graph.add((trans_uri, CSG.involvesDistributor, dist_uri))
        self.graph.add((trans_uri, CSG.atFacility, facility_uri))
        self.graph.add((trans_uri, CSG.inRegion, region_uri))

        # Item code if available
        if row.get('item_code'):
            item_uri = self.create_uri('item', row['item_code'])
            self.graph.add((trans_uri, CSG.hasItemCode, item_uri))

        # Financial data
        if row.get('total_sales') is not None:
            self.graph.add((trans_uri, CSG.totalSales,
                          Literal(float(row['total_sales']), datatype=XSD.decimal)))

        if row.get('total_gm') is not None:
            self.graph.add((trans_uri, CSG.totalGrossMargin,
                          Literal(float(row['total_gm']), datatype=XSD.decimal)))

        # Date
        if row.get('surgery_date'):
            self.graph.add((trans_uri, CSG.surgeryDate,
                          Literal(row['surgery_date'], datatype=XSD.date)))

        # Add entity relationships
        self.graph.add((surgeon_uri, CSG.worksWithDistributor, dist_uri))
        self.graph.add((surgeon_uri, CSG.performsSurgeryAt, facility_uri))
        self.graph.add((dist_uri, CSG.servesRegion, region_uri))
        self.graph.add((dist_uri, CSG.distributesFacility, facility_uri))

    def transform_to_rdf(self, rows):
        """Transform PostgreSQL rows to RDF triples."""
        print(f"Transforming {len(rows)} transactions to RDF...")

        for idx, row in enumerate(rows):
            # Add entities (only once each)
            self.add_surgeon(row['surgeon'])
            self.add_distributor(row['distributor'])
            self.add_region(row['region'])
            self.add_facility(row['facility'], row['region'])
            if row.get('item_code'):
                self.add_item_code(row['item_code'])

            # Add transaction
            self.add_transaction(row, idx)

            if (idx + 1) % 1000 == 0:
                print(f"  Processed {idx + 1} transactions...")

        print(f"✅ Transformation complete: {len(self.graph)} triples")
        print(f"   - {len(self.surgeons)} surgeons")
        print(f"   - {len(self.distributors)} distributors")
        print(f"   - {len(self.facilities)} facilities")
        print(f"   - {len(self.regions)} regions")
        print(f"   - {len(self.item_codes)} item codes")

    def upload_to_fuseki(self):
        """Upload RDF graph to Fuseki."""
        print(f"Uploading RDF data to Fuseki dataset '{self.dataset}'...")

        # Serialize graph to N-Triples format for upload
        data = self.graph.serialize(format='nt')

        try:
            # Upload to Fuseki
            response = requests.post(
                f"{self.fuseki_url}/{self.dataset}/data",
                auth=(self.fuseki_user, self.fuseki_password),
                data=data,
                headers={'Content-Type': 'application/n-triples'}
            )

            if response.status_code in [200, 201, 204]:
                print(f"✅ Successfully uploaded {len(self.graph)} triples to Fuseki")
                return True
            else:
                print(f"❌ Upload failed: {response.status_code} - {response.text}")
                return False

        except Exception as e:
            print(f"❌ Error uploading to Fuseki: {e}")
            return False

    def verify_upload(self):
        """Verify data was uploaded correctly."""
        print("Verifying upload...")

        try:
            # Query to count triples
            sparql_query = "SELECT (COUNT(*) as ?count) WHERE { ?s ?p ?o }"

            response = requests.post(
                f"{self.fuseki_url}/{self.dataset}/query",
                auth=(self.fuseki_user, self.fuseki_password),
                data={'query': sparql_query},
                headers={'Accept': 'application/sparql-results+json'}
            )

            if response.status_code == 200:
                result = response.json()
                count = result['results']['bindings'][0]['count']['value']
                print(f"✅ Verification successful: {count} triples in Fuseki")
                return True
            else:
                print(f"❌ Verification failed: {response.status_code}")
                return False

        except Exception as e:
            print(f"❌ Error verifying upload: {e}")
            return False

    def run(self):
        """Execute the complete loading process."""
        print("=" * 70)
        print("CSG Data to Apache Jena Loader")
        print("=" * 70)

        # Step 1: Create dataset
        if not self.create_dataset():
            return False

        # Step 2: Load ontology
        if not self.load_ontology():
            return False

        # Step 3: Fetch data from PostgreSQL
        rows = self.fetch_csg_data()
        if not rows:
            print("❌ No data to load")
            return False

        # Step 4: Transform to RDF
        self.transform_to_rdf(rows)

        # Step 5: Upload to Fuseki
        if not self.upload_to_fuseki():
            return False

        # Step 6: Verify
        if not self.verify_upload():
            return False

        print("=" * 70)
        print("✅ CSG data successfully loaded to Apache Jena Fuseki!")
        print(f"   Access at: {self.fuseki_url}/#{self.dataset}")
        print("=" * 70)
        return True


if __name__ == '__main__':
    loader = CSGJenaLoader()
    success = loader.run()
    sys.exit(0 if success else 1)
