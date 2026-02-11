#!/usr/bin/env python3
"""
Load Ontology TTL Files into Weaviate Vector Database.

Parses all TTL files from backend/src/ontology/{ap,copa,shared}/ using rdflib,
extracts structured properties, generates embeddings via EmbeddingService,
and indexes into the OntologyKnowledge collection in Weaviate.

Usage:
    cd backend
    python scripts/load_ontology_to_weaviate.py
"""

import json
import os
import sys
from pathlib import Path
from collections import defaultdict

# Add project root to path
SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
sys.path.insert(0, str(BACKEND_DIR))

import weaviate
import weaviate.classes as wvc
from weaviate.classes.config import Property, DataType, Configure
from rdflib import Graph, Namespace, URIRef, Literal
from rdflib.namespace import RDF, RDFS, OWL, SKOS, XSD

from src.core.embeddings import EmbeddingService
from src.config import settings

# ── RDF Namespaces ──────────────────────────────────────────────────────────

MANTRIX = Namespace("http://mantrix.ai/ontology#")
AP = Namespace("http://mantrix.ai/ontology/ap#")
COPA = Namespace("http://mantrix.ai/ontology/copa#")
BQ = Namespace("http://mantrix.ai/ontology/bigquery#")

# ── Directory → module/knowledge_type mapping ──────────────────────────────

PATH_TYPE_MAP = {
    "ap/tables": ("ap", "table"),
    "ap/metrics": ("ap", "metric"),
    "ap/terms": ("ap", "term"),
    "ap/joins": ("ap", "join_path"),
    "ap/queries": ("ap", "query_pattern"),
    "ap/rules": ("ap", "business_rule"),
    "ap/entities": ("ap", "entity"),
    "copa/tables": ("copa", "table"),
    "copa/dimensions": ("copa", "dimension"),
    "copa/measures": ("copa", "measure"),
    "copa/metrics": ("copa", "metric"),
    "copa/terms": ("copa", "term"),
    "copa/relationships": ("copa", "relationship"),
}

ONTOLOGY_DIR = BACKEND_DIR / "src" / "ontology"
COLLECTION_NAME = "OntologyKnowledge"
BATCH_SIZE = 20  # Embedding batch size


def classify_file(filepath: Path) -> tuple:
    """Determine module and knowledge_type from file path."""
    rel = filepath.relative_to(ONTOLOGY_DIR)
    parts = rel.parts  # e.g. ('ap', 'tables', 'RBKP_InvoiceHeaders.ttl')

    if len(parts) >= 2:
        dir_key = f"{parts[0]}/{parts[1]}"
        if dir_key in PATH_TYPE_MAP:
            return PATH_TYPE_MAP[dir_key]

    # Fallback for root-level or shared files
    if "shared" in str(rel):
        return ("shared", "prefix")
    return ("unknown", "unknown")


def parse_ttl_file(filepath: Path) -> list:
    """Parse a single TTL file and extract structured knowledge entries.

    Returns a list of dicts, one per primary subject found in the file.
    Most files contain 1-3 primary subjects.
    """
    g = Graph()
    try:
        g.parse(str(filepath), format="turtle")
    except Exception as e:
        print(f"  ERROR parsing {filepath.name}: {e}")
        return []

    module, knowledge_type = classify_file(filepath)

    # Find primary subjects: resources that have rdf:type declarations
    # (owl:Class, mantrix:Metric, mantrix:SemanticTerm, etc.)
    primary_subjects = set()
    type_predicates = [
        OWL.Class, OWL.DatatypeProperty, OWL.ObjectProperty,
        MANTRIX.Metric, MANTRIX.SemanticTerm, MANTRIX.BusinessRule,
        MANTRIX.JoinPath, MANTRIX.QueryType, MANTRIX.Relationship,
    ]

    for s, p, o in g.triples((None, RDF.type, None)):
        if o in type_predicates:
            primary_subjects.add((s, o))

    # Also catch subjects using shorthand 'a' (which rdflib reads as rdf:type)
    # Already handled above since rdflib normalizes 'a' to rdf:type

    if not primary_subjects:
        # Fallback: get all subjects with rdfs:label
        for s, p, o in g.triples((None, RDFS.label, None)):
            primary_subjects.add((s, None))

    # Group: merge DatatypeProperty columns under their parent Class
    # Identify the main entity (Class, Metric, Term, Rule, Join, Query, Relationship)
    main_subjects = {}
    column_subjects = []

    for subj, rdf_type in primary_subjects:
        if rdf_type == OWL.DatatypeProperty:
            column_subjects.append(subj)
        elif rdf_type == OWL.ObjectProperty:
            pass  # Skip object properties, they're relationships
        else:
            main_subjects[subj] = rdf_type

    # If no main subjects found but we have columns, treat entire file as one entry
    if not main_subjects and column_subjects:
        # Use file name as fallback
        main_subjects[URIRef(f"file:{filepath.stem}")] = None

    entries = []

    for subj, rdf_type in main_subjects.items():
        entry = extract_subject_properties(g, subj, rdf_type, column_subjects,
                                           module, knowledge_type, filepath)
        if entry and entry.get("name"):
            entries.append(entry)

    # Also extract standalone join paths, example Q&A nodes
    # These are nodes with mantrix:joinPath type or mantrix:exampleQuestion
    for subj, rdf_type in primary_subjects:
        if rdf_type == MANTRIX.JoinPath and subj not in main_subjects:
            entry = extract_subject_properties(g, subj, rdf_type, [],
                                               module, "join_path", filepath)
            if entry and entry.get("name"):
                entries.append(entry)

    return entries


def extract_subject_properties(g, subj, rdf_type, column_subjects,
                                module, knowledge_type, filepath) -> dict:
    """Extract all relevant properties for a single RDF subject."""

    def get_one(pred):
        """Get single literal value for predicate."""
        for _, _, o in g.triples((subj, pred, None)):
            return str(o)
        return ""

    def get_all(pred):
        """Get all literal values for predicate."""
        return [str(o) for _, _, o in g.triples((subj, pred, None))]

    def get_all_from_graph(pred):
        """Get all values for predicate from ANY subject in graph."""
        return [str(o) for _, _, o in g.triples((None, pred, None))]

    name = get_one(RDFS.label)
    description = get_one(RDFS.comment)
    synonyms = get_all(SKOS.altLabel)

    # Mantrix-specific predicates
    example_questions = get_all_from_graph(MANTRIX.exampleQuestion)
    example_sqls = get_all_from_graph(MANTRIX.exampleSQL)
    sql_formula = get_one(MANTRIX.sqlFormula)
    edge_cases = get_all_from_graph(MANTRIX.edgeCases)
    business_rules = get_all(MANTRIX.businessRule)
    value_maps = get_all_from_graph(MANTRIX.valueMap)
    join_sql = get_one(MANTRIX.joinSQL)
    rule_definition = get_one(MANTRIX.ruleDefinition)
    disambiguation = get_one(MANTRIX.disambiguation)
    answers_questions = get_one(MANTRIX.answersQuestions)
    trigger_phrases = get_one(MANTRIX.triggerPhrases)
    sql_pattern = get_one(MANTRIX.sqlPattern)
    examples = get_one(MANTRIX.examples)
    canonical_entity = get_one(MANTRIX.canonicalEntity)
    canonical_filter = get_one(MANTRIX.canonicalFilter)
    related_terms = get_one(MANTRIX.relatedTerms)
    related_concepts = get_one(MANTRIX.relatedConcepts)

    # Metric-specific
    category = get_one(MANTRIX.category)
    unit = get_one(MANTRIX.unit)
    direction = get_one(MANTRIX.direction)
    source_tables = get_one(MANTRIX.sourceTables)
    dimensions = get_one(MANTRIX.dimensions)

    # BigQuery table info
    bq_table = get_one(BQ.table)
    primary_key = get_one(BQ.primaryKey)
    sap_table = get_one(MANTRIX.sapTable)
    sap_transaction = get_one(MANTRIX.sapTransaction)

    # Extract columns from DatatypeProperty subjects
    columns = []
    for col_subj in column_subjects:
        col_name = ""
        col_type = ""
        col_comment = ""
        col_fk = ""
        col_label = ""
        col_value_map = ""
        for _, p, o in g.triples((col_subj, None, None)):
            if p == BQ["column"]:
                col_name = str(o)
            elif p == BQ["type"]:
                col_type = str(o)
            elif p == RDFS.comment:
                col_comment = str(o)
            elif p == BQ["foreignKey"]:
                col_fk = str(o)
            elif p == RDFS.label:
                col_label = str(o)
            elif p == MANTRIX.valueMap:
                col_value_map = str(o)
        if col_name:
            col_info = {"name": col_name, "type": col_type, "label": col_label}
            if col_comment:
                col_info["comment"] = col_comment
            if col_fk:
                col_info["foreign_key"] = col_fk
            if col_value_map:
                col_info["value_map"] = col_value_map
            columns.append(col_info)

    # Extract foreign keys from graph
    foreign_keys = get_all_from_graph(BQ.foreignKey)

    # Extract join paths defined in the file
    join_paths = []
    for s, p, o in g.triples((None, RDF.type, MANTRIX.joinPath)):
        jp_label = ""
        jp_comment = ""
        for _, pp, oo in g.triples((s, None, None)):
            if pp == RDFS.label:
                jp_label = str(oo)
            elif pp == RDFS.comment:
                jp_comment = str(oo)
        if jp_label:
            join_paths.append({"label": jp_label, "join_condition": jp_comment})

    # ── Build content_json (full structured content for LLM retrieval) ──

    content = {"name": name, "description": description}

    if synonyms:
        content["synonyms"] = synonyms
    if bq_table:
        content["bq_table"] = bq_table
    if primary_key:
        content["primary_key"] = primary_key
    if sap_table:
        content["sap_table"] = sap_table
    if sap_transaction:
        content["sap_transaction"] = sap_transaction
    if columns:
        content["columns"] = columns
    if foreign_keys:
        content["foreign_keys"] = foreign_keys
    if join_paths:
        content["join_paths"] = join_paths
    if sql_formula:
        content["sql_formula"] = sql_formula
    if join_sql:
        content["join_sql"] = join_sql
    if rule_definition:
        content["rule_definition"] = rule_definition
    if disambiguation:
        content["disambiguation"] = disambiguation
    if canonical_entity:
        content["canonical_entity"] = canonical_entity
    if canonical_filter:
        content["canonical_filter"] = canonical_filter
    if related_terms:
        content["related_terms"] = related_terms
    if related_concepts:
        content["related_concepts"] = related_concepts
    if category:
        content["category"] = category
    if unit:
        content["unit"] = unit
    if direction:
        content["direction"] = direction
    if source_tables:
        content["source_tables"] = source_tables
    if dimensions:
        content["dimensions"] = dimensions
    if answers_questions:
        content["answers_questions"] = answers_questions
    if trigger_phrases:
        content["trigger_phrases"] = trigger_phrases
    if sql_pattern:
        content["sql_pattern"] = sql_pattern
    if examples:
        content["examples"] = examples

    # Pair example questions with their SQL
    if example_questions:
        eq_pairs = []
        for i, q in enumerate(example_questions):
            pair = {"question": q}
            if i < len(example_sqls):
                pair["sql"] = example_sqls[i]
            eq_pairs.append(pair)
        # Include any remaining SQLs without questions
        for i in range(len(example_questions), len(example_sqls)):
            eq_pairs.append({"sql": example_sqls[i]})
        content["example_queries"] = eq_pairs

    if edge_cases:
        content["edge_cases"] = edge_cases
    if value_maps:
        content["value_maps"] = value_maps
    if business_rules:
        content["business_rules"] = business_rules

    # ── Build combined_text for embedding ──

    text_parts = [name]
    if description:
        text_parts.append(description)
    if synonyms:
        text_parts.append(f"Synonyms: {', '.join(synonyms)}")
    if example_questions:
        text_parts.append(" ".join(example_questions[:5]))  # Limit for token budget
    if disambiguation:
        text_parts.append(disambiguation)
    if answers_questions:
        text_parts.append(answers_questions)
    if trigger_phrases:
        text_parts.append(trigger_phrases)
    if rule_definition:
        # Truncate long rule definitions for embedding text
        text_parts.append(rule_definition[:300])

    combined_text = ". ".join(text_parts)
    # Trim to ~500 tokens (~2000 chars) for optimal embedding quality
    if len(combined_text) > 2000:
        combined_text = combined_text[:2000]

    return {
        "name": name,
        "description": description,
        "module": module,
        "knowledge_type": knowledge_type,
        "synonyms": synonyms,
        "source_file": str(filepath.relative_to(ONTOLOGY_DIR)),
        "content_json": json.dumps(content, indent=None),
        "combined_text": combined_text,
    }


def collect_ttl_files() -> list:
    """Collect all TTL files from ontology subdirectories (ap/, copa/, shared/)."""
    ttl_files = []
    for subdir in ["ap", "copa"]:
        dir_path = ONTOLOGY_DIR / subdir
        if dir_path.exists():
            for ttl_file in sorted(dir_path.rglob("*.ttl")):
                ttl_files.append(ttl_file)
    return ttl_files


def create_collection(client: weaviate.WeaviateClient):
    """Create the OntologyKnowledge collection in Weaviate."""
    if client.collections.exists(COLLECTION_NAME):
        print(f"  Deleting existing {COLLECTION_NAME} collection...")
        client.collections.delete(COLLECTION_NAME)

    print(f"  Creating {COLLECTION_NAME} collection...")
    client.collections.create(
        name=COLLECTION_NAME,
        vectorizer_config=Configure.Vectorizer.none(),
        vector_index_config=Configure.VectorIndex.hnsw(
            distance_metric=wvc.config.VectorDistances.COSINE,
            quantizer=Configure.VectorIndex.Quantizer.bq(),
        ),
        properties=[
            Property(name="name", data_type=DataType.TEXT),
            Property(name="description", data_type=DataType.TEXT),
            Property(name="module", data_type=DataType.TEXT),
            Property(name="knowledge_type", data_type=DataType.TEXT),
            Property(name="synonyms", data_type=DataType.TEXT_ARRAY),
            Property(name="source_file", data_type=DataType.TEXT),
            Property(name="content_json", data_type=DataType.TEXT),
            Property(name="combined_text", data_type=DataType.TEXT),
        ],
    )
    print(f"  {COLLECTION_NAME} collection created.")


def index_entries(client: weaviate.WeaviateClient, entries: list,
                  embedding_service: EmbeddingService):
    """Generate embeddings and index all entries into Weaviate."""
    collection = client.collections.get(COLLECTION_NAME)

    # Generate embeddings in batches
    print(f"\n  Generating embeddings for {len(entries)} entries...")
    all_embeddings = []
    for i in range(0, len(entries), BATCH_SIZE):
        batch_texts = [e["combined_text"] for e in entries[i:i + BATCH_SIZE]]
        batch_embeddings = embedding_service.generate_embeddings(batch_texts)
        all_embeddings.extend(batch_embeddings)
        print(f"    Embedded {min(i + BATCH_SIZE, len(entries))}/{len(entries)}")

    # Insert into Weaviate
    print(f"\n  Indexing {len(entries)} entries into Weaviate...")
    with collection.batch.dynamic() as batch:
        for idx, entry in enumerate(entries):
            props = {
                "name": entry["name"],
                "description": entry["description"],
                "module": entry["module"],
                "knowledge_type": entry["knowledge_type"],
                "synonyms": entry["synonyms"],
                "source_file": entry["source_file"],
                "content_json": entry["content_json"],
                "combined_text": entry["combined_text"],
            }
            batch.add_object(properties=props, vector=all_embeddings[idx])

    # Verify count
    result = collection.aggregate.over_all(total_count=True)
    print(f"  Indexed {result.total_count} objects into {COLLECTION_NAME}.")
    return result.total_count


def main():
    print("=" * 70)
    print("  Load Ontology TTL Files → Weaviate OntologyKnowledge")
    print("=" * 70)

    # 1. Collect TTL files
    print("\n[1/4] Collecting TTL files...")
    ttl_files = collect_ttl_files()
    print(f"  Found {len(ttl_files)} TTL files")

    # 2. Parse all TTL files
    print("\n[2/4] Parsing TTL files...")
    all_entries = []
    stats = defaultdict(lambda: defaultdict(int))

    for filepath in ttl_files:
        entries = parse_ttl_file(filepath)
        for entry in entries:
            stats[entry["module"]][entry["knowledge_type"]] += 1
        all_entries.extend(entries)
        if entries:
            print(f"  {filepath.relative_to(ONTOLOGY_DIR)}: {len(entries)} entries")
        else:
            print(f"  {filepath.relative_to(ONTOLOGY_DIR)}: (skipped — no primary subjects)")

    print(f"\n  Total entries extracted: {len(all_entries)}")
    print("\n  Breakdown:")
    for module in sorted(stats):
        for ktype in sorted(stats[module]):
            print(f"    {module}/{ktype}: {stats[module][ktype]}")

    if not all_entries:
        print("\nERROR: No entries extracted. Check TTL files.")
        sys.exit(1)

    # 3. Connect to Weaviate and create collection
    print("\n[3/4] Connecting to Weaviate...")
    url = settings.weaviate_url.replace("http://", "").replace("https://", "")
    if ":" in url:
        host, port_str = url.split(":", 1)
        port = int(port_str)
    else:
        host = url
        port = 8080

    client = weaviate.connect_to_local(
        host=host, port=port, grpc_port=50051, skip_init_checks=True
    )
    print(f"  Connected to Weaviate at {host}:{port}")

    create_collection(client)

    # 4. Generate embeddings and index
    print("\n[4/4] Embedding & indexing...")
    embedding_service = EmbeddingService()
    print(f"  Embedding provider: {embedding_service.provider_type}")
    print(f"  Embedding dimension: {embedding_service.dimension}")

    total = index_entries(client, all_entries, embedding_service)

    # Summary
    print("\n" + "=" * 70)
    print(f"  DONE — {total} objects in {COLLECTION_NAME}")
    print("=" * 70)

    client.close()


if __name__ == "__main__":
    main()
