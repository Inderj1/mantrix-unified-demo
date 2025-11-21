#!/usr/bin/env python3
"""
Template-Aware PDF Extraction

Uses template definitions to guide extraction and ensure all required fields are captured.
"""

import pymupdf
import requests
import json
import csv
from pathlib import Path
from datetime import datetime


class TemplateAwareExtractor:
    """Extract PDF data using template-specific schemas."""

    def __init__(self, ollama_url="http://localhost:11434", model="qwen2.5:7b"):
        self.ollama_url = ollama_url
        self.model = model
        # Use absolute path resolution to find templates directory
        self.templates_dir = Path(__file__).parent / "templates"
        self.output_dir = Path("extracted_data_v3")
        self.output_dir.mkdir(exist_ok=True)

        # Load templates and mapping
        self.mapping = self.load_mapping()
        self.templates = self.load_templates()

    def load_mapping(self):
        """Load PDF to template type mapping."""
        mapping_file = self.templates_dir / "pdf_template_mapping.json"
        if mapping_file.exists():
            with open(mapping_file, 'r') as f:
                return json.load(f)
        return {}

    def load_templates(self):
        """Load all template definitions."""
        templates = {}
        for template_file in self.templates_dir.glob("*.json"):
            if template_file.name == "pdf_template_mapping.json":
                continue
            with open(template_file, 'r') as f:
                template_type = template_file.stem
                templates[template_type] = json.load(f)
        return templates

    def extract_text_from_pdf(self, pdf_path):
        """Extract text from a PDF file."""
        try:
            doc = pymupdf.open(pdf_path)
            text = ""
            for page_num in range(len(doc)):
                page = doc[page_num]
                text += f"\n--- Page {page_num + 1} ---\n"
                text += page.get_text()
            doc.close()
            return text
        except Exception as e:
            print(f"  ✗ Error extracting text: {str(e)}")
            return None

    def auto_detect_template(self, text):
        """Automatically detect the best matching template for the document."""
        if not self.templates:
            return None

        # Extract first 2000 characters for classification
        sample_text = text[:2000]

        # Build template descriptions for LLM
        template_descriptions = []
        for template_type, template in self.templates.items():
            desc = f"- {template_type}: {template.get('name', template_type)}"
            if template.get('description'):
                desc += f" - {template['description']}"
            template_descriptions.append(desc)

        templates_str = "\n".join(template_descriptions)

        prompt = f"""You are a document classification assistant. Analyze this document excerpt and identify which template type it matches.

AVAILABLE TEMPLATES:
{templates_str}

DOCUMENT EXCERPT:
{sample_text}

INSTRUCTIONS:
1. Analyze the document content, structure, and field names
2. Return ONLY the template type name (e.g., "nexxt_restock_pack_list")
3. Choose the template that best matches the document's structure and content
4. If no template matches well, return "unknown"

TEMPLATE TYPE:"""

        response = self.query_ollama(prompt)
        if response:
            # Extract template type from response
            detected = response.strip().lower()
            # Remove any quotes or extra text
            detected = detected.replace('"', '').replace("'", "").split()[0]

            if detected in self.templates:
                print(f"  🎯 Auto-detected template: {detected}")
                return detected
            else:
                print(f"  ⚠ Could not auto-detect template (got: {detected})")
                return None

        return None

    def create_schema_prompt(self, template):
        """Create extraction schema from template definition."""
        schema_parts = []

        # Add required fields
        if template.get('required_fields'):
            schema_parts.append("REQUIRED FIELDS (must extract):")
            for field in template['required_fields']:
                schema_parts.append(f"  - {field}")

        # Add optional fields
        if template.get('optional_fields'):
            schema_parts.append("\nOPTIONAL FIELDS (extract if present):")
            for field in template['optional_fields']:
                schema_parts.append(f"  - {field}")

        # Add items schema if present
        if template.get('items_schema'):
            items_schema = template['items_schema']
            schema_parts.append("\nITEMS ARRAY STRUCTURE:")
            schema_parts.append("  Each item must include:")
            for field in items_schema.get('required', []):
                schema_parts.append(f"    - {field}")
            if items_schema.get('optional'):
                schema_parts.append("  Optional item fields:")
                for field in items_schema['optional']:
                    schema_parts.append(f"    - {field}")

        return "\n".join(schema_parts)

    def query_ollama(self, prompt, max_retries=3):
        """Send a query to Ollama API with retry logic."""
        url = f"{self.ollama_url}/api/generate"

        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "temperature": 0.1
        }

        for attempt in range(max_retries):
            try:
                response = requests.post(url, json=payload, timeout=300)
                response.raise_for_status()
                result = response.json()
                return result.get("response", "")
            except requests.exceptions.RequestException as e:
                if attempt < max_retries - 1:
                    print(f"  Retry {attempt + 1}/{max_retries}...")
                else:
                    print(f"  ✗ Error querying Ollama: {str(e)}")
                    return None

    def extract_with_template(self, pdf_path, text, template_type):
        """Extract data using template-specific schema."""
        template = self.templates.get(template_type)
        if not template:
            print(f"  ✗ Template not found: {template_type}")
            return None

        schema = self.create_schema_prompt(template)

        prompt = f"""You are a precise data extraction assistant. Extract information from this document using the schema below.

DOCUMENT TYPE: {template.get('name', template_type)}

{schema}

EXTRACTION RULES:
1. Return ONLY valid JSON format
2. Use null for missing fields (do not omit fields)
3. For items/lists, use JSON arrays with proper structure
4. Extract ALL required fields - they must be present in output
5. Use exact field names from schema above
6. For monetary values, use numbers without currency symbols
7. For dates, preserve the format found in document

DOCUMENT TEXT:
{text}

JSON OUTPUT (all required fields must be present):"""

        print(f"  Querying LLM with {template.get('name')} template...")
        response = self.query_ollama(prompt)

        if response:
            return self.parse_llm_response(response)
        return None

    def parse_llm_response(self, response):
        """Parse LLM response and extract JSON."""
        try:
            # Try to find JSON in the response
            start_idx = response.find('{')
            end_idx = response.rfind('}')

            if start_idx != -1 and end_idx != -1:
                json_str = response[start_idx:end_idx + 1]
                data = json.loads(json_str)
                return data
            else:
                print("  ⚠ No JSON found in response")
                return {"error": "No JSON in response", "raw_response": response}
        except json.JSONDecodeError as e:
            print(f"  ⚠ JSON parsing error: {str(e)}")
            return {"error": str(e), "raw_response": response}

    def flatten_dict(self, d, parent_key='', sep='_'):
        """Flatten nested dictionary for CSV output."""
        items = []
        for k, v in d.items():
            new_key = f"{parent_key}{sep}{k}" if parent_key else k

            if isinstance(v, dict):
                items.extend(self.flatten_dict(v, new_key, sep=sep).items())
            elif isinstance(v, list):
                # Convert list to JSON string for CSV
                items.append((new_key, json.dumps(v)))
            else:
                items.append((new_key, v))
        return dict(items)

    def save_to_csv(self, data, pdf_name):
        """Save extracted data to CSV file."""
        if not data:
            return None

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        csv_filename = self.output_dir / f"{Path(pdf_name).stem}_{timestamp}.csv"

        try:
            # Flatten nested structures for CSV
            flattened_data = self.flatten_dict(data)

            with open(csv_filename, 'w', newline='', encoding='utf-8') as csvfile:
                if flattened_data:
                    writer = csv.DictWriter(csvfile, fieldnames=flattened_data.keys())
                    writer.writeheader()
                    writer.writerow(flattened_data)

            print(f"  ✓ Saved to: {csv_filename}")
            return csv_filename
        except Exception as e:
            print(f"  ✗ Error saving CSV: {str(e)}")
            return None

    def process_pdf(self, pdf_path):
        """Process a single PDF with template-aware extraction."""
        pdf_name = pdf_path.name

        # Get template type
        template_type = self.mapping.get(pdf_name)
        if not template_type:
            print(f"  ✗ No template mapping found")
            return None

        print(f"  Template: {template_type}")

        # Extract text
        print(f"  Extracting text...")
        text = self.extract_text_from_pdf(pdf_path)
        if not text:
            return None

        # Extract with template
        data = self.extract_with_template(pdf_path, text, template_type)
        if not data:
            return None

        # Save to CSV
        csv_file = self.save_to_csv(data, pdf_name)
        return csv_file

    def process_test_sample(self):
        """Process one PDF from each template type for testing."""
        print("="*60)
        print("Template-Aware Extraction - TEST SAMPLE")
        print("="*60)

        # Get one sample from each template type
        template_samples = {}
        for pdf_name, template_type in self.mapping.items():
            if template_type not in template_samples:
                template_samples[template_type] = pdf_name

        print(f"\nTesting {len(template_samples)} template types...\n")

        results = []
        for template_type, pdf_name in sorted(template_samples.items()):
            print(f"\n[{template_type}] {pdf_name}")
            print("-" * 60)

            pdf_path = Path(pdf_name)
            if not pdf_path.exists():
                print(f"  ✗ File not found")
                continue

            csv_file = self.process_pdf(pdf_path)
            results.append({
                'template_type': template_type,
                'pdf_name': pdf_name,
                'success': csv_file is not None,
                'csv_file': str(csv_file) if csv_file else None
            })

        return results

    def process_all(self):
        """Process all PDFs with template-aware extraction."""
        print("="*60)
        print("Template-Aware Extraction - FULL RUN")
        print("="*60)

        print(f"\nProcessing {len(self.mapping)} PDFs...\n")

        results = []
        for idx, pdf_name in enumerate(sorted(self.mapping.keys()), 1):
            print(f"\n[{idx}/{len(self.mapping)}] {pdf_name}")
            print("-" * 60)

            pdf_path = Path(pdf_name)
            if not pdf_path.exists():
                print(f"  ✗ File not found")
                results.append({
                    'pdf_name': pdf_name,
                    'success': False,
                    'error': 'File not found'
                })
                continue

            csv_file = self.process_pdf(pdf_path)
            results.append({
                'pdf_name': pdf_name,
                'template_type': self.mapping.get(pdf_name),
                'success': csv_file is not None,
                'csv_file': str(csv_file) if csv_file else None
            })

        # Print summary
        print("\n" + "="*60)
        print("EXTRACTION COMPLETE")
        print("="*60)

        successful = sum(1 for r in results if r['success'])
        print(f"\nSuccessfully processed: {successful}/{len(results)}")
        print(f"Output directory: {self.output_dir}/")

        return results


def main():
    """Main function."""
    import sys

    # Check if Ollama is running
    ollama_url = "http://localhost:11434"
    try:
        response = requests.get(ollama_url, timeout=5)
        print("✓ Ollama is running\n")
    except:
        print("✗ Error: Ollama is not running!")
        print("Please start it with: brew services start ollama")
        return

    extractor = TemplateAwareExtractor()

    # Run test sample or full extraction
    if '--test' in sys.argv:
        results = extractor.process_test_sample()
    else:
        results = extractor.process_all()

    print("\n" + "="*60)
    print("Next: Run template_validator.py to check completeness")
    print("="*60)


if __name__ == "__main__":
    main()
