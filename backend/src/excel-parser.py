#!/usr/bin/env python3
"""
Specialized FedEx Invoice Parser

Handles consolidated FedEx invoices with multiple shipments.
Extracts invoice-level data + array of all shipments.
"""

import pymupdf
import requests
import json
import csv
from pathlib import Path
from datetime import datetime


class FedExInvoiceParser:
    """Parse FedEx consolidated invoices with multiple shipments."""

    def __init__(self, ollama_url="http://localhost:11434", model="qwen2.5:7b", summary_mode=False):
        self.ollama_url = ollama_url
        self.model = model
        self.output_dir = Path("extracted_data_v3")
        self.output_dir.mkdir(exist_ok=True)
        self.summary_mode = summary_mode  # Fast mode: just totals, no individual shipments

    def extract_full_text(self, pdf_path):
        """Extract all text from PDF."""
        try:
            doc = pymupdf.open(pdf_path)
            full_text = ""

            print(f"  Extracting text from {len(doc)} pages...")

            for page_num in range(len(doc)):
                page = doc[page_num]
                page_text = page.get_text()
                full_text += f"\n--- Page {page_num + 1} ---\n{page_text}"

                # Progress indicator for large files
                if (page_num + 1) % 10 == 0:
                    print(f"    Progress: {page_num + 1}/{len(doc)} pages...")

            doc.close()
            return full_text
        except Exception as e:
            print(f"  ✗ Error extracting text: {str(e)}")
            return None

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
                print(f"  Sending to LLM (this may take 1-2 minutes for large invoices)...")
                response = requests.post(url, json=payload, timeout=600)  # 10 min timeout
                response.raise_for_status()
                result = response.json()
                return result.get("response", "")
            except requests.exceptions.RequestException as e:
                if attempt < max_retries - 1:
                    print(f"  Retry {attempt + 1}/{max_retries}...")
                else:
                    print(f"  ✗ Error querying Ollama: {str(e)}")
                    return None

    def extract_text_in_chunks(self, pdf_path, chunk_size=10):
        """Extract text in chunks for better processing."""
        try:
            doc = pymupdf.open(pdf_path)
            total_pages = len(doc)

            # First 2 pages = invoice header
            header_text = ""
            for page_num in range(min(2, total_pages)):
                header_text += doc[page_num].get_text()

            # Rest of pages in chunks
            chunks = []
            for start_page in range(2, total_pages, chunk_size):
                end_page = min(start_page + chunk_size, total_pages)
                chunk_text = ""
                for page_num in range(start_page, end_page):
                    chunk_text += f"\n--- Page {page_num + 1} ---\n"
                    chunk_text += doc[page_num].get_text()
                chunks.append({
                    'start_page': start_page + 1,
                    'end_page': end_page,
                    'text': chunk_text
                })

            doc.close()
            return header_text, chunks
        except Exception as e:
            print(f"  ✗ Error extracting text: {str(e)}")
            return None, None

    def parse_fedex_invoice(self, pdf_path):
        """Parse FedEx invoice with LLM."""
        if self.summary_mode:
            return self.parse_fedex_summary(pdf_path)
        else:
            return self.parse_fedex_detailed(pdf_path)

    def parse_fedex_summary(self, pdf_path):
        """Fast extraction: invoice-level data matching template."""
        print(f"  Using invoice-level extraction...")

        # Extract first 10 and last 5 pages
        text = self.extract_summary_pages(pdf_path, first_pages=10)
        if not text:
            return None

        prompt = f"""Extract FedEx consolidated invoice data. Return ONLY JSON.

REQUIRED fields:
- invoice_number: Invoice number (e.g., 8-963-19567)
- invoice_date: Invoice date
- account_number: FedEx account number
- total_fedex_express: Total FedEx Express charges amount
- total_other_charges: Total other charges amount

OPTIONAL fields (extract if visible):
- billing_address: Billing address
- total_pages: Total pages
- merchandise_sales_subtotal: Merchandise sales subtotal
- electronic_export_information_subtotal: EEI subtotal
- customer_level_fees_subtotal: Customer fees
- fuel_surcharge_percentage: Fuel surcharge %
- date_range_start: First ship date in invoice
- date_range_end: Last ship date in invoice

Use null for missing fields.

{text}

JSON:"""

        print(f"  Querying LLM for invoice-level data...")
        response = self.query_ollama(prompt)
        if response:
            return self.parse_llm_response(response)
        return None

    def extract_summary_pages(self, pdf_path, first_pages=10):
        """Extract just first and last few pages."""
        try:
            doc = pymupdf.open(pdf_path)
            text = ""

            # First N pages
            for i in range(min(first_pages, len(doc))):
                text += doc[i].get_text()

            # Last 5 pages (if not already included)
            if len(doc) > first_pages + 5:
                text += "\n--- LAST PAGES ---\n"
                for i in range(max(len(doc)-5, first_pages), len(doc)):
                    text += doc[i].get_text()

            doc.close()
            return text
        except Exception as e:
            print(f"  ✗ Error: {e}")
            return None

    def parse_fedex_detailed(self, pdf_path):
        """Detailed extraction: chunked processing for all shipments."""
        print(f"  Using DETAILED chunked processing...")

        # Extract header and chunks
        header_text, chunks = self.extract_text_in_chunks(pdf_path)
        if not header_text or not chunks:
            return None

        # Step 1: Extract invoice metadata from header
        print(f"  Step 1: Extracting invoice metadata...")
        invoice_metadata = self.extract_invoice_metadata(header_text)

        # Step 2: Extract shipments from each chunk
        print(f"  Step 2: Processing {len(chunks)} chunks...")
        all_shipments = []

        for idx, chunk in enumerate(chunks, 1):
            print(f"    Chunk {idx}/{len(chunks)} (pages {chunk['start_page']}-{chunk['end_page']})...")
            shipments = self.extract_shipments_from_chunk(chunk['text'])
            if shipments:
                all_shipments.extend(shipments)
                print(f"      → {len(shipments)} shipments")

        # Combine results
        result = {
            **invoice_metadata,
            'shipments': all_shipments,
            'total_shipments': len(all_shipments)
        }

        return result

    def extract_invoice_metadata(self, header_text):
        """Extract invoice-level metadata from header pages."""
        prompt = f"""Extract invoice metadata from this FedEx invoice header.

EXTRACT ONLY THESE FIELDS:
- invoice_number: FedEx invoice number
- account_number: FedEx account number
- invoice_date: Invoice date
- billing_address: Complete billing address
- total_pages: Total number of pages (if shown)
- grand_total: Final total amount (if shown)

Return ONLY valid JSON with these fields.

HEADER TEXT:
{header_text}

JSON OUTPUT:"""

        response = self.query_ollama(prompt)
        if response:
            return self.parse_llm_response(response)
        return {}

    def extract_shipments_from_chunk(self, chunk_text):
        """Extract shipments from a chunk of pages."""
        prompt = f"""Extract ALL shipments from this FedEx invoice section.

Return ONLY valid JSON in this format:
{{
  "shipments": [
    {{
      "tracking_number": "tracking ID (e.g., 883598616007)",
      "ship_date": "ship date",
      "service_type": "FedEx service (e.g., FedEx Priority Overnight)",
      "sender_name": "sender name",
      "sender_address": "sender address",
      "recipient_name": "recipient name",
      "recipient_address": "recipient address",
      "weight": "weight (e.g., 20.0 lbs, 9.1 kgs)",
      "transportation_charge": transportation charge as number,
      "total_charge": total charge as number
    }}
  ]
}}

IMPORTANT:
- Extract EVERY shipment you see, one object per tracking number
- Use null for missing values
- Return valid JSON only

{chunk_text[:8000]}

JSON:"""

        response = self.query_ollama(prompt)
        if response:
            data = self.parse_llm_response(response)
            return data.get('shipments', []) if isinstance(data, dict) else []
        return []

    def parse_fedex_invoice_old(self, pdf_path):
        """OLD METHOD - Parse FedEx invoice with LLM."""
        # Extract all text
        text = self.extract_full_text(pdf_path)
        if not text:
            return None

        # Create extraction prompt
        prompt = f"""You are a FedEx invoice data extraction assistant. Extract structured data from this consolidated FedEx invoice.

This is a multi-page consolidated invoice containing multiple shipments. Extract ALL information.

REQUIRED FIELDS:

**Invoice Level:**
- invoice_number: FedEx invoice number
- account_number: FedEx account number
- invoice_date: Invoice date
- billing_address: Complete billing address
- total_pages: Total number of pages
- grand_total: Total invoice amount (if present)
- total_fedex_express: Total FedEx Express charges
- total_other_charges: Total other charges
- subtotals: Any subtotals (merchandise, multiweight, etc.)

**Shipments Array:**
For EACH shipment found in the document, extract:
- tracking_id: FedEx tracking number (e.g., 883598616007)
- ship_date: Date shipment was sent
- payor: Who paid (Shipper/Recipient/Third Party)
- service_type: FedEx service (e.g., FedEx Priority Overnight, FedEx Ground)
- sender_name: Sender name
- sender_address: Sender address
- recipient_name: Recipient name
- recipient_address: Recipient address (including city, state, zip)
- reference: Customer reference number
- package_count: Number of packages
- weight: Package weight
- transportation_charge: Base transportation charge
- fuel_surcharge: Fuel surcharge amount
- total_charge: Total shipment charge
- delivery_status: Delivered/In Transit with date if available
- delivery_date: Actual delivery date and time

**Other Charges:**
Extract any additional charges or transactions (merchandise sales, etc.)

IMPORTANT EXTRACTION RULES:
1. Return ONLY valid JSON
2. Extract ALL shipments - don't skip any
3. Use null for missing fields
4. For the shipments array, create one object per shipment
5. Preserve dates as found in document
6. Include all tracking IDs found

DOCUMENT TEXT:
{text}

JSON OUTPUT (must include invoice metadata and shipments array):"""

        print(f"  Querying LLM for FedEx invoice extraction...")
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
                return {"error": "No JSON in response"}
        except json.JSONDecodeError as e:
            print(f"  ⚠ JSON parsing error: {str(e)}")
            # Try to save partial response
            return {"error": str(e), "raw_response": response[:1000]}

    def save_to_json(self, data, pdf_name):
        """Save extracted data to JSON file (better for nested data)."""
        if not data:
            return None

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        json_filename = self.output_dir / f"{Path(pdf_name).stem}_{timestamp}.json"

        try:
            with open(json_filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)

            print(f"  ✓ Saved to: {json_filename}")
            return json_filename
        except Exception as e:
            print(f"  ✗ Error saving JSON: {str(e)}")
            return None

    def save_to_csv(self, data, pdf_name):
        """Save extracted data to CSV (one row per shipment)."""
        if not data or 'shipments' not in data:
            print("  ⚠ No shipments found, skipping CSV")
            return None

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        csv_filename = self.output_dir / f"{Path(pdf_name).stem}_{timestamp}.csv"

        try:
            shipments = data.get('shipments', [])
            if not shipments:
                print("  ⚠ Shipments array is empty")
                return None

            # Invoice-level fields to include in each row
            invoice_fields = {
                'invoice_number': data.get('invoice_number'),
                'account_number': data.get('account_number'),
                'invoice_date': data.get('invoice_date'),
                'grand_total': data.get('grand_total'),
                'total_fedex_express': data.get('total_fedex_express')
            }

            # Combine invoice fields with shipment data
            rows = []
            for shipment in shipments:
                row = {**invoice_fields, **shipment}
                rows.append(row)

            # Write CSV with all unique fields
            if rows:
                # Collect all unique fieldnames from all rows
                all_fields = set()
                for row in rows:
                    all_fields.update(row.keys())
                fieldnames = list(all_fields)

                with open(csv_filename, 'w', newline='', encoding='utf-8') as csvfile:
                    writer = csv.DictWriter(csvfile, fieldnames=fieldnames, extrasaction='ignore')
                    writer.writeheader()
                    writer.writerows(rows)

                print(f"  ✓ Saved {len(rows)} shipments to: {csv_filename}")
                return csv_filename
            else:
                print("  ⚠ No rows to write")
                return None

        except Exception as e:
            print(f"  ✗ Error saving CSV: {str(e)}")
            return None

    def process_fedex_invoice(self, pdf_path):
        """Process a single FedEx invoice."""
        print(f"\n{'='*60}")
        print(f"Processing: {pdf_path.name}")
        print(f"{'='*60}")

        # Extract and parse
        data = self.parse_fedex_invoice(pdf_path)

        if not data or 'error' in data:
            print(f"  ✗ Extraction failed")
            return None

        # Print summary
        if 'shipments' in data and data['shipments']:
            print(f"\n  Summary:")
            print(f"    Invoice: {data.get('invoice_number', 'N/A')}")
            print(f"    Shipments found: {len(data['shipments'])}")
            print(f"    Grand Total: ${data.get('grand_total', 'N/A')}")

        # Save both formats
        json_file = self.save_to_json(data, pdf_path.name)
        csv_file = self.save_to_csv(data, pdf_path.name)

        return {
            'json_file': json_file,
            'csv_file': csv_file,
            'shipment_count': len(data.get('shipments', []))
        }

    def process_all_fedex(self):
        """Process all FedEx invoices."""
        print("="*60)
        print("FedEx Invoice Parser")
        print("="*60)

        # Find all FedEx PDFs
        fedex_files = [
            "FedEx 896319567.pdf",
            "FedEx 898045964.pdf",
            "Fed Ex 897296846.pdf"
        ]

        results = []

        for pdf_name in fedex_files:
            pdf_path = Path(pdf_name)
            if not pdf_path.exists():
                print(f"\n✗ File not found: {pdf_name}")
                continue

            result = self.process_fedex_invoice(pdf_path)
            results.append({
                'pdf': pdf_name,
                'success': result is not None,
                'details': result
            })

        # Print summary
        print("\n" + "="*60)
        print("PROCESSING COMPLETE")
        print("="*60)

        successful = sum(1 for r in results if r['success'])
        total_shipments = sum(r['details']['shipment_count'] for r in results if r['success'] and r['details'])

        print(f"\nProcessed: {successful}/{len(results)} invoices")
        print(f"Total shipments extracted: {total_shipments}")
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

    # Check for summary mode
    summary_mode = '--summary' in sys.argv
    parser = FedExInvoiceParser(summary_mode=summary_mode)

    if summary_mode:
        print("💨 FAST MODE: Summary extraction only (invoice totals, no individual shipments)\n")
    else:
        print("🐌 DETAILED MODE: Full extraction with all shipments (slower)\n")

    if '--test' in sys.argv:
        # Find test file
        test_file = None
        for arg in sys.argv:
            if arg.endswith('.pdf'):
                test_file = arg
                break

        if test_file:
            pdf_path = Path(test_file)
            if pdf_path.exists():
                parser.process_fedex_invoice(pdf_path)
            else:
                print(f"File not found: {pdf_path}")
        else:
            print("Usage: python fedex_invoice_parser.py --test file.pdf [--summary]")
    else:
        # Process all FedEx invoices
        parser.process_all_fedex()


if __name__ == "__main__":
    main()
