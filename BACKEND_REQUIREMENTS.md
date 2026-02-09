# MANTRIX Platform — Complete Backend Requirements

## Table of Contents
- [Context](#context)
- [Infrastructure Stack](#infrastructure-stack)
- [Current Backend State](#current-backend-state)
- [Gap Analysis](#gap-analysis)
- [Module Requirements](#module-requirements)
  - [1. MARGEN.AI](#1-margenai--margin--profitability-analytics)
  - [2. STOX.AI](#2-stoxai--inventory-optimization)
  - [3. ORDLY.AI](#3-ordlyai--order-intelligence)
  - [4. O2C.AI](#4-o2cai--order-to-cash)
  - [5. PROCESS.AI](#5-processai--process-mining)
  - [6. TRAXX.AI](#6-traxxai--iot-kit-tracking)
  - [7. MASTER.AI](#7-masterai--master-data-glai--bpai)
  - [8. AP.AI](#8-apai--accounts-payable)
- [Sidebar Features](#sidebar-features)
  - [9. Enterprise Pulse](#9-enterprise-pulse)
  - [10. AXIS.AI](#10-axisai--decision-intelligence)
  - [11. MARKETS.AI](#11-marketsai--market-intelligence)
  - [12. Document Hub](#12-document-hub)
  - [13. Email Intel](#13-email-intel)
  - [14. Vision Studio](#14-vision-studio)
  - [15. Control Center](#15-control-center)
- [Shared Services](#shared-services)
- [Database Schema](#database-schema)
- [Implementation Phases](#implementation-phases)

---

## Context

The MANTRIX Unified Demo frontend is fully built with React 18 / MUI v5, using mock data throughout. The goal is to build a **production backend from scratch** to power all 9 CORE.AI modules plus sidebar features. This document maps every frontend feature to the backend services, APIs, data models, AI/ML capabilities, and infrastructure required.

**Frontend location**: `frontend/src/components/`
**Backend location**: `backend/src/`
**Config**: `backend/src/config.py` (Pydantic Settings)

---

## Infrastructure Stack

Defined in `docker-compose.yml`:

| Service | Purpose | Port | Image |
|---------|---------|------|-------|
| **FastAPI + Uvicorn** | API server | 8000 | Python 3.11-slim (Dockerfile) |
| **PostgreSQL 16** | Primary relational DB | 5432 (host: 5433) | postgres:16 |
| **BigQuery** | Data warehouse (COPA, SAP extracts) | GCP | google-cloud-bigquery |
| **Weaviate** | Vector DB (semantic search, embeddings) | 8082 / 50051 (gRPC) | semitechnologies/weaviate:latest |
| **Redis 7** | Cache (query results, sessions, 512MB LRU) | 6379 | redis:7-alpine |
| **MongoDB 7** | Conversation history (AI chat) | 27017 | mongo:7 |
| **Neo4j 5** | Graph DB (entity relationships) | 7687 / 7474 | neo4j:5 |
| **Apache Jena Fuseki** | RDF triple store (SPARQL, ontology) | 3030 | stain/jena-fuseki |
| **Claude API** | LLM reasoning, explanations | Anthropic API | claude-sonnet-4-20250514 |
| **OpenAI API** | Embeddings (text-embedding-3-small) | OpenAI API | — |

### Database Credentials (from `config.py` / `.env`)
```
PostgreSQL:  localhost:5433  mantrix/mantrix123  DB: mantrix_nexxt
MongoDB:     localhost:27017  DB: mantrix_nexxt_conversations
Redis:       localhost:6379  DB: 0
Neo4j:       bolt://localhost:7687  neo4j/password123
Weaviate:    http://localhost:8082
Fuseki:      http://localhost:3030  dataset: mantrix_csg  admin/mantrix123
```

---

## Current Backend State

### Existing Route Files (`backend/src/api/`)

| File | Module | Prefix | Endpoints | Status |
|------|--------|--------|-----------|--------|
| `routes.py` (90KB) | Core/Health/Schema/Cache | `/api/v1` | ~40 | **Complete** |
| `margen_routes.py` (57KB) | MARGEN.AI Workbench | `/margen` | ~24 | **Complete** |
| `margen_csg_routes.py` (30KB) | MARGEN.AI CSG Analytics | `/api/v1/margen/csg` | ~25 | **Complete** |
| `ordlyai_routes.py` (39KB) | ORDLY.AI | `/api/ordlyai` | ~39 | **Complete** |
| `stox_routes.py` (15KB) | STOX.AI (partial) | `/api/v1/stox` | ~31 | **Partial** |
| `pulse_routes.py` (21KB) | Enterprise Pulse | `/api/v1/pulse` | ~19 | **Complete** |
| `command_tower_routes.py` (21KB) | Command Tower | `/api/v1/command-tower` | ~6 | **Complete** |
| `markets_routes.py` (10KB) | MARKETS.AI | `/api/v1` | ~10 | **Complete** |
| `control_center_routes.py` (17KB) | Control Center | `/api/v1` | ~6 | **Complete** |
| `process_mining_routes.py` (18KB) | PROCESS.AI | `/api/v1/process-mining` | ~5 | **Complete** |
| `vision_routes.py` (18KB) | Vision Studio | `/api/v1/vision` | ~5 | **Complete** |
| `document_routes.py` (21KB) | Document Hub | `/api/v1/documents` | ~5 | **Complete** |
| `conversation_routes.py` (7KB) | Chat/Conversations | `/api/v1` | ~5 | **Complete** |
| `bigquery_routes.py` (14KB) | AXIS.AI/BigQuery | `/api/v1` | ~5 | **Partial** |
| `comms_routes.py` (8KB) | Email Intel | `/api/v1` | ~5 | **Complete** |
| `comms_config_routes.py` (13KB) | COMMS Config | `/api/v1` | ~5 | **Complete** |
| `user_profile_routes.py` (3KB) | User Profiles | `/api/v1` | ~3 | **Complete** |
| `analytics_routes.py` (38KB) | Core Analytics | — | ~15 | **Complete** |
| `executive_routes.py` (35KB) | Executive Dashboard | — | ~10 | **Complete** |

### Existing Service Files (`backend/src/core/`)

| File | Purpose | Size |
|------|---------|------|
| `ordlyai_service.py` | ORDLY.AI business logic | 73KB |
| `ordlyai_static_data.py` | ORDLY.AI demo/seed data | 31KB |
| `stox_service.py` | STOX.AI business logic | 39KB |
| `margen_analytics_service.py` | MARGEN analytics | 32KB |
| `margen_chat_service.py` | MARGEN chat interface | 17KB |
| `llm_client.py` | Claude/LLM integration | 73KB |
| `bigquery_sql_generator.py` | BigQuery query gen | 102KB |
| `sql_generator.py` | PostgreSQL query gen | 79KB |
| `pulse_monitor_service.py` | Pulse monitoring | 28KB |
| `pulse_proactive_service.py` | Proactive actions | 9KB |
| `pulse_scheduler.py` | Background scheduler | 6KB |
| `market_signal_service.py` | Markets.AI signals | 8KB |
| `gl_account_mapping.py` | GL.AI mapping logic | 14KB |
| `gl_accounting_advisor.py` | GL.AI advisory | 20KB |
| `lead_time_estimator.py` | Lead time prediction | 12KB |
| `margin_predictor.py` | Margin prediction | 11KB |
| `sku_recommendation_service.py` | SKU recommendations | 21KB |
| `similar_order_matcher.py` | Order similarity | 3KB |
| `process_mining/` | Process mining engine | 6 files |

### Existing Database Clients (`backend/src/db/`)

| File | Client | Status |
|------|--------|--------|
| `postgresql_client.py` (27KB) | PostgreSQL | **Complete** |
| `bigquery.py` (7KB) | BigQuery | **Complete** |
| `mongodb_client.py` (9KB) | MongoDB | **Complete** |
| `weaviate_client.py` (8KB) | Weaviate | **Complete** |
| `market_signals_db.py` (11KB) | Markets.AI DB | **Complete** |
| `database_client.py` (2KB) | Generic wrapper | **Complete** |

### Existing Migrations (`db/migrations/`)

| File | Tables |
|------|--------|
| `001_create_master_tables.sql` | SKU, plant, supplier, customer masters |
| `002_create_demand_flow_tables.sql` | Demand forecasts, demand signals |
| `003_create_demand_forecasting_tables.sql` | Forecast models, accuracy tracking |
| `004_create_replenishment_tables.sql` | Reorder points, lot sizes, safety stock |
| `005_create_remaining_modules.sql` | DC inventory, working capital, BOM, procurement, analytics |
| `backend/sql/command_tower_schema.sql` | Command Tower tickets |
| `backend/sql/consignment_kit_schema.sql` | Consignment/kit tracking |
| `backend/sql/loaner_process_schema.sql` | Loaner process tracking |
| `backend/sql/margen_schema.sql` | MARGEN analytics tables |

---

## Gap Analysis

### Missing Route Files (need to create)

| Module | File Needed | Priority | Endpoints | Complexity |
|--------|------------|----------|-----------|------------|
| **AP.AI** | `ap_routes.py` | **P1** | ~22 | High — 6-strategy matching engine, 9 guardrails |
| **O2C.AI** | `o2c_routes.py` | **P2** | ~15 | Medium — aggregation & process analytics |
| **TRAXX.AI** | `traxx_routes.py` | **P2** | ~17 | Medium — kit tracking, IoT, logistics |
| **MASTER.AI** | `masterdata_routes.py` | **P2** | ~20 | Medium — GL.AI + BP.AI combined |
| **Supply Chain Map** | `supply_chain_routes.py` | **P2** | ~13 | Low — CRUD + seed data |
| **AXIS.AI** | `axis_routes.py` | **P3** | ~6 | Low — forecast & scenario sim |
| **Search** | `search_routes.py` | **P3** | ~1 | Medium — Weaviate cross-module |
| **Auth** | `auth_routes.py` | **P1** | ~3 | Low — Clerk integration |
| **Chat** | `chat_service_routes.py` | **P3** | ~3 | Medium — Claude + MongoDB |

### Missing Service Files (need to create)

| Module | File Needed | Priority | Description |
|--------|------------|----------|-------------|
| **AP.AI** | `ap_service.py` | **P1** | Invoice matching, queue, batch, exceptions |
| **O2C.AI** | `o2c_service.py` | **P2** | O2C analytics, document flow, DSO |
| **TRAXX.AI** | `traxx_service.py` | **P2** | Kit tracking, logistics, surgery readiness |
| **MASTER.AI** | `masterdata_service.py` | **P2** | GL mapping, BP entity resolution |
| **Supply Chain** | `supply_chain_service.py` | **P2** | Trucks, stores, alerts, agents |
| **STOX Extended** | `stox_extended_service.py` | **P2** | Lam Research, distribution, what-if |
| **AXIS.AI** | `axis_service.py` | **P3** | Forecasting, scenario simulation |

### Missing Endpoints in Existing Routes

**STOX.AI** (`stox_routes.py`) — needs ~50 additional endpoints:
- Inventory: dashboard, heatmap, plant-level
- Demand: workbench, intelligence, forecasting engine, variability
- Supply: lead-time, risk-monitor, signal-analyzer
- MRP: optimizer, tuner, parameter-advisor, writeback
- Store: health, optimization, replenishment, deployment
- DC: demand-aggregation, health, BOM, lot-size, supplier-execution
- Capital: baseline, cash-release, supplier-terms
- Cost: policy-engine, configuration
- What-If: simulator (distribution and Lam)
- Lam Research: 7 tile endpoints
- SAP: data-hub, writeback
- Tickets: CRUD

### Missing Database Tables

| Table | Module | Priority |
|-------|--------|----------|
| `ap_invoices` | AP.AI | P1 |
| `ap_invoice_lines` | AP.AI | P1 |
| `ap_po_headers` | AP.AI | P1 |
| `ap_po_lines` | AP.AI | P1 |
| `ap_match_results` | AP.AI | P1 |
| `ap_exceptions` | AP.AI | P1 |
| `ap_batch_postings` | AP.AI | P1 |
| `ap_vendor_reliability` | AP.AI | P1 |
| `ap_override_log` | AP.AI | P1 |
| `o2c_sales_orders` | O2C.AI | P2 |
| `o2c_deliveries` | O2C.AI | P2 |
| `o2c_billing_docs` | O2C.AI | P2 |
| `o2c_payments` | O2C.AI | P2 |
| `o2c_process_variants` | O2C.AI | P2 |
| `traxx_kits` | TRAXX.AI | P2 |
| `traxx_kit_components` | TRAXX.AI | P2 |
| `traxx_kit_telemetry` | TRAXX.AI | P2 |
| `traxx_orders` | TRAXX.AI | P2 |
| `traxx_shipments` | TRAXX.AI | P2 |
| `traxx_surgeries` | TRAXX.AI | P2 |
| `traxx_actions` | TRAXX.AI | P2 |
| `md_gl_mappings` | MASTER.AI | P2 |
| `md_gl_field_recommendations` | MASTER.AI | P2 |
| `md_bp_clusters` | MASTER.AI | P2 |
| `md_bp_field_recommendations` | MASTER.AI | P2 |
| `md_data_quality_issues` | MASTER.AI | P2 |
| `sc_trucks` | Supply Chain | P2 |
| `sc_stores` | Supply Chain | P2 |
| `sc_alerts` | Supply Chain | P2 |
| `sc_agents` | Supply Chain | P2 |

---

## Module Requirements

---

### 1. MARGEN.AI — Margin & Profitability Analytics

**Frontend**: `margenai/` (15+ components), `margen/` (5 tabs), workbench with 12 analysis tools
**Backend**: `margen_routes.py` (57KB), `margen_csg_routes.py` (30KB) — **COMPLETE**
**Status**: **Fully implemented**

#### Existing Endpoints (prefix: `/margen` and `/api/v1/margen/csg`)

**COPA Analytics**:
```
GET  /api/v1/margen/csg/cogs/summary
GET  /api/v1/margen/csg/cogs/by-system
GET  /api/v1/margen/csg/cogs/by-distributor
GET  /api/v1/margen/csg/cogs/by-item
GET  /api/v1/margen/csg/cogs/trends/monthly
GET  /api/v1/margen/csg/revenue/summary
GET  /api/v1/margen/csg/revenue/by-system
GET  /api/v1/margen/csg/revenue/by-distributor
GET  /api/v1/margen/csg/revenue/by-region
GET  /api/v1/margen/csg/revenue/by-facility
GET  /api/v1/margen/csg/revenue/by-surgeon
GET  /api/v1/margen/csg/revenue/trends/monthly
GET  /api/v1/margen/csg/margin/by-system
GET  /api/v1/margen/csg/margin/by-distributor
GET  /api/v1/margen/csg/margin/by-surgeon
GET  /api/v1/margen/csg/margin/top-performers
GET  /api/v1/margen/csg/pl/summary
GET  /api/v1/margen/csg/pl/by-month
GET  /api/v1/margen/csg/pl/by-category
GET  /api/v1/margen/csg/filters/{type}
GET  /api/v1/margen/csg/transactions/by-surgeon/{name}
GET  /api/v1/margen/csg/transactions/by-distributor/{name}
```

**Workbench Analytics**:
```
GET  /margen/analytics/rfm-segmentation
GET  /margen/analytics/abc-analysis
GET  /margen/analytics/cohort-retention
GET  /margen/analytics/customer-lifecycle
GET  /margen/analytics/margin-analysis
GET  /margen/analytics/regional-clusters
GET  /margen/analytics/concentration-risk
GET  /margen/analytics/price-volume-elasticity
GET  /margen/analytics/customer-profitability
GET  /margen/analytics/product-profitability
POST /margen/chat
```

#### AI/ML Capabilities (implemented in `margen_analytics_service.py`, `margen_chat_service.py`)
- RFM segmentation (Recency/Frequency/Monetary)
- ABC Pareto analysis
- Customer lifecycle & cohort retention
- Margin waterfall decomposition
- Concentration risk assessment
- Price-volume elasticity analysis
- NLP chat (topic-restricted: revenue, margin, COGS, forecast)

#### Data Sources
- PostgreSQL: CSG transaction data (mantrix_nexxt)
- BigQuery: COPA tables (CE11000)

---

### 2. STOX.AI — Inventory Optimization

**Frontend**: `stox/` (50+ tiles), `stox/distribution/`, `stox/lamresearch/`, `stox/supplyChainMap/`
**Backend**: `stox_routes.py` (15KB), `stox_service.py` (39KB) — **PARTIAL**
**Status**: **~31 endpoints exist, ~50 more needed**

#### Existing Endpoints (prefix: `/api/v1/stox`)
```
GET  /shortage-detector/alerts
GET  /shortage-detector/predictions
GET  /shortage-detector/material-risk
GET  /inventory/distribution
GET  /inventory/location-metrics
GET  /plant-performance
GET  /reallocation/opportunities
GET  /reallocation/transfer-recommendations
GET  /lot-size/optimization
GET  /inbound-risk/vendor-metrics
GET  /inbound-risk/supplier-performance
GET  /inbound-risk/alerts
GET  /aging/inventory
GET  /aging/obsolescence-risk
GET  /aging/clearance-recommendations
GET  /enterprise-summary
GET  /consignment-kit-process
GET  /health
GET  /working-capital
GET  /inventory-health
GET  /mrp-parameters
GET  /lead-times
GET  /recommendations
GET  /demand-patterns
GET  /cash-release
GET  /forecasts
GET  /exceptions
GET  /performance/kpis
GET  /margin-analysis
GET  /cfo-rollup
GET  /sell-through
```

#### Missing Endpoints (need to create in `stox_extended_routes.py`)

**Inventory Intelligence**:
```
GET  /api/v1/stox/inventory/dashboard         # KPI overview
GET  /api/v1/stox/inventory/heatmap           # Distribution visualization
GET  /api/v1/stox/inventory/aging             # Age profile
GET  /api/v1/stox/inventory/plant/{plantId}   # Plant-level detail
```

**Demand & Forecasting**:
```
GET  /api/v1/stox/demand/workbench            # Demand planning workbench
GET  /api/v1/stox/demand/intelligence         # Demand pattern analytics
GET  /api/v1/stox/demand/forecasting-engine   # ML forecasting engine
GET  /api/v1/stox/demand/variability          # CV analysis (query: ?type=distribution)
GET  /api/v1/stox/forecast/store/{storeId}    # Store-level forecast
GET  /api/v1/stox/forecast/simulation         # Forecast simulation
```

**Supply Planning**:
```
GET  /api/v1/stox/supply/lead-time            # Lead time analytics
GET  /api/v1/stox/supply/risk-monitor         # Supply risk dashboard
GET  /api/v1/stox/supply/signal-analyzer      # Signal analysis (?type=distribution)
GET  /api/v1/stox/supply/shortage-detector    # Proactive shortage detection
```

**MRP Optimization**:
```
GET  /api/v1/stox/mrp/optimizer               # MRP optimization dashboard
GET  /api/v1/stox/mrp/tuner                   # Parameter tuning interface
GET  /api/v1/stox/mrp/parameter-advisor       # AI recommendations (?type=distribution)
POST /api/v1/stox/mrp/writeback               # SAP writeback queue
```

**Store & DC Operations**:
```
GET  /api/v1/stox/store/health-monitor
GET  /api/v1/stox/store/optimization
GET  /api/v1/stox/store/replenishment
GET  /api/v1/stox/store/financial-impact
GET  /api/v1/stox/store/deployment
GET  /api/v1/stox/dc/demand-aggregation
GET  /api/v1/stox/dc/health-monitor
GET  /api/v1/stox/dc/optimization
GET  /api/v1/stox/dc/bom
GET  /api/v1/stox/dc/lot-size
GET  /api/v1/stox/dc/supplier-execution
GET  /api/v1/stox/dc/financial-impact
```

**Working Capital Extended**:
```
GET  /api/v1/stox/capital/baseline
GET  /api/v1/stox/capital/cfo-rollup
GET  /api/v1/stox/capital/cash-release
GET  /api/v1/stox/capital/supplier-terms
```

**Cost & Policy**:
```
GET  /api/v1/stox/cost/policy-engine
GET  /api/v1/stox/cost/configuration
```

**Scenario Planning**:
```
POST /api/v1/stox/scenario/simulate
GET  /api/v1/stox/whatif/simulator             # (?type=distribution)
```

**Lam Research Specific**:
```
GET  /api/v1/stox/lam/economic-ground-truth    # 15 semiconductor SKUs
GET  /api/v1/stox/lam/capital-health           # Working capital decomposition
GET  /api/v1/stox/lam/demand-supply-command    # Demand/supply balancing
GET  /api/v1/stox/lam/supply-risk              # Supplier reliability
GET  /api/v1/stox/lam/safety-stock-economics   # Service level optimization
GET  /api/v1/stox/lam/mrp-signal-quality       # MRP parameter validation
POST /api/v1/stox/lam/capital-impact/simulate  # Capital impact scenarios
```

**SAP Integration & Tickets**:
```
GET  /api/v1/stox/sap/data-hub
POST /api/v1/stox/sap/writeback
GET  /api/v1/stox/command-center
GET  /api/v1/stox/performance-monitor
GET  /api/v1/stox/sell-in/forecast
GET  /api/v1/stox/tickets
POST /api/v1/stox/tickets
PUT  /api/v1/stox/tickets/{id}
```

#### Supply Chain Map (separate router, matches frontend `supplyChainMap/api.js`)
```
GET  /api/v1/trucks
GET  /api/v1/trucks/{id}
PUT  /api/v1/trucks/{id}
GET  /api/v1/stores
GET  /api/v1/stores/{id}
PUT  /api/v1/stores/{id}
GET  /api/v1/alerts?status={status}
POST /api/v1/alerts/generate
PUT  /api/v1/alerts/{id}
GET  /api/v1/agents
GET  /api/v1/agents/{id}
POST /api/v1/agents/{id}/chat
POST /api/v1/seed
```

#### Data Model
- **Materials**: material #, description, plant, MRP type (PD/VV/VM/V1/V2/VB/ND), safety stock, reorder point, lot size, lead time, ABC class, XYZ class
- **Inventory**: plant, material, stock on hand, unrestricted, blocked, quality, in transit, valuated
- **Demand**: forecast qty, actual demand, CV, MAPE, bias, seasonal factors
- **Supply**: PO #, vendor, qty, delivery date, OTD %, lead time variability
- **BOM**: parent material, component, qty per, level, alt BOM
- **Trucks**: truck_id, status (en_route/loading/idle/delayed), location {lat, lng}, cargo, route, ETA
- **Stores**: store_id, name, type (plant/dc/vendor), location, stock_level, demand_forecast
- **Alerts**: severity, type, facility_affected, predicted_impact

#### AI/ML Capabilities
- Demand forecasting (ARIMA, Prophet, Monte Carlo)
- Safety stock optimization (z-score * sigma * sqrt(LT))
- MRP parameter tuning (reorder point, lot size)
- ABC/XYZ classification
- Supply risk scoring (vendor reliability, lead time variability)
- Working capital optimization
- What-if scenario simulation

#### Data Sources
- PostgreSQL: Master data (migrations 001-005)
- BigQuery: Historical transactions, SAP extracts
- SAP: MD04 (MRP), MARC (plant), MARD (storage), EKKO/EKPO (POs), MSEG (movements)

---

### 3. ORDLY.AI — Order Intelligence

**Frontend**: `ordlyai/` (11 components + drilldowns)
**Backend**: `ordlyai_routes.py` (39KB), `ordlyai_service.py` (73KB) — **COMPLETE**
**Status**: **Fully implemented** (39 endpoints)

#### Existing Endpoints (prefix: `/api/ordlyai`)
```
# Pipeline
GET  /pipeline
GET  /pipeline/stats
GET  /pipeline/export

# Intent Cockpit
GET  /intent/orders
GET  /intent/orders/{orderId}/similar
GET  /intent/orders/{orderId}/pdf
GET  /intent/export
POST /intent/orders/{poNumber}/chat

# SKU Optimizer
GET  /sku-optimizer/orders
GET  /sku-optimizer/orders/{orderId}/sku-options
GET  /sku-optimizer/orders/{orderId}/sku-options/margin-waterfall
POST /sku-optimizer/recommend
GET  /sku-optimizer/orders/{orderId}/realtime-options
GET  /sku-optimizer/orders/{orderId}/sku/{sku}/detail

# Lead Time
GET  /lead-time/orders/{orderId}/estimate
GET  /lead-time/orders/{orderId}/all-plants

# Margin Prediction
POST /margin/predict

# Approval / Control Tower
GET  /approval/orders
GET  /approval/orders/{orderId}/clv
GET  /approval/export

# SAP Commit
GET  /sap-commit/orders
GET  /sap-commit/orders/{orderId}/details

# Order Actions
POST /intent/process
POST /intent/analyze-materials
GET  /intent/recommendations/{intentId}
GET  /intent/customer-history
GET  /intent/material-plant-details
GET  /intent/material-comparison/{intentId}
POST /order/action
POST /order/{orderId}/promote
POST /order/{orderId}/approve
POST /order/{orderId}/hold
POST /order/{orderId}/escalate
POST /order/{orderId}/reset
POST /order/{orderId}/demote
POST /orders/reset-all

# Line-Level Actions
GET  /order/{orderId}/lines
GET  /order/{orderId}/line/{lineNumber}/sku-options
POST /order/{orderId}/line/{lineNumber}/action
POST /order/{orderId}/line/{lineNumber}/select-sku
POST /order/{orderId}/line/{lineNumber}/approve
POST /order/{orderId}/line/{lineNumber}/hold
POST /order/{orderId}/approve-all-lines

# Learning Loop
GET  /learning-loop/orders
```

#### AI/ML Capabilities (implemented)
- Customer intent parsing (PO PDFs/emails)
- Order similarity matching
- SKU decisioning (substitute recommendations)
- Lead time prediction (per plant)
- Margin prediction
- Customer CLV estimation
- Order value anomaly detection

---

### 4. O2C.AI — Order-to-Cash

**Frontend**: `o2cai/` (5 tiles + SourceIndicator)
**Backend**: **NONE** — needs `o2c_routes.py` + `o2c_service.py`
**Status**: **Not started**

#### Required Endpoints (prefix: `/api/v1/o2c`)
```
GET  /api/v1/o2c/dashboard/executive       # KPIs: 18,429 SOs, 17,842 deliveries, 17,156 invoices, 14,892 payments
GET  /api/v1/o2c/dashboard/kpis            # Happy path 87.4%, median cycle 4.2d
GET  /api/v1/o2c/sales/performance         # Revenue $147.2M, DSO 38.2
GET  /api/v1/o2c/sales/dso-heatmap         # DSO by segment and region
GET  /api/v1/o2c/sales/channel-trends      # Channel performance over time
GET  /api/v1/o2c/customers                 # List with CLV, segment, churn probability
GET  /api/v1/o2c/customers/{id}            # Customer detail + AR aging + payment history
GET  /api/v1/o2c/customers/segmentation    # Invest/Maintain/Harvest distribution
GET  /api/v1/o2c/customers/ar-aging        # Current, 1-30, 31-60, 61-90, 90+ buckets
GET  /api/v1/o2c/customers/payment-behavior  # Payment pattern analytics
GET  /api/v1/o2c/document-flow/variants    # Process variants with conformance %
GET  /api/v1/o2c/document-flow/bottlenecks # Bottleneck alerts (Payment collection +9.2d)
GET  /api/v1/o2c/document-flow/visualization  # Sankey/flow diagram data
GET  /api/v1/o2c/transactions/{docNum}     # Full document chain for a transaction
GET  /api/v1/o2c/transactions/search       # Search by doc#, customer, material
```

#### Data Model
```
SalesOrder:    order_num, customer_id, date, value, status, sales_org
Delivery:      delivery_num, order_num, ship_date, qty, status
BillingDoc:    doc_num, delivery_num, invoice_date, amount, due_date
Payment:       payment_num, billing_num, pay_date, amount, method
Customer:      id, name, segment (Invest/Maintain/Harvest), credit_class, clv, churn_prob, dso
ProcessVariant: path, conformance_pct, avg_cycle_days, count
```

#### Key Process Variants (from mock data)
| Path | Conformance | Cycle |
|------|-------------|-------|
| SO -> DL -> BL -> PY | 87.4% | 3.8d |
| SO -> DL1 -> DL2 -> BL -> PY | 8.2% | 6.2d |
| SO -> DL -> BL -> CR -> PY | 3.2% | 12.4d |
| SO -> DL -> RT -> BL -> PY | 0.9% | 18.1d |
| SO -> (Blocked) | 1.2% | N/A |

#### AI/ML Capabilities
- DSO prediction by segment
- Customer segmentation (CLV-based)
- Payment probability scoring
- Process bottleneck detection
- Cycle time prediction

#### Data Sources
- SAP: VBAK/VBAP (sales orders), LIKP/LIPS (deliveries), VBRK/VBRP (billing), BKPF/BSEG (payments), KNA1/KNB1 (customers)

---

### 5. PROCESS.AI — Process Mining

**Frontend**: `ProcessMiningPage.jsx`, `process/` (9 components)
**Backend**: `process_mining_routes.py` (18KB), `process_mining/` (6 core files) — **COMPLETE**
**Status**: **Fully implemented**

#### Existing Endpoints (prefix: `/api/v1/process-mining`)
```
GET  /api/v1/process-mining/processes       # List available processes
POST /api/v1/process-mining/discover        # Discover process from event data
POST /api/v1/process-mining/analyze         # Analyze process metrics
POST /api/v1/process-mining/conformance-check  # Validate vs reference model
POST /api/v1/process-mining/simulate        # Run simulation
```

#### Core Engine Files
- `event_extractor.py` — Extracts event logs from BigQuery (O2C, Q2C, Consignment, Loaner)
- `process_discovery.py` — Directly-Follows Graph (DFG) algorithm
- `performance_analyzer.py` — Throughput, cycle time, bottleneck detection
- `simulator.py` — Activity duration & transition modifications
- `conformance_checker.py` — Deviation analysis
- `insights_engine.py` — Pattern & anomaly discovery

---

### 6. TRAXX.AI — IoT Kit Tracking

**Frontend**: `traxxai/` (5 tiles + loaner/ + consignment/ + smadeTrackerMap/)
**Backend**: **NONE** — needs `traxx_routes.py` + `traxx_service.py`
**Status**: **Not started** (some kit data in `consignment_kit_schema.sql` and `loaner_process_schema.sql`)

#### Required Endpoints (prefix: `/api/v1/traxx`)
```
# Kit Management
GET  /api/v1/traxx/kits                          # 248 kits: id, name, type, status, hospital, distributor
GET  /api/v1/traxx/kits/{kitId}                   # Kit detail
GET  /api/v1/traxx/kits/{kitId}/telemetry          # IoT: temp, humidity, location, battery
GET  /api/v1/traxx/kits/{kitId}/components         # Component list with usage counts
GET  /api/v1/traxx/kits/{kitId}/history            # Kit lifecycle events

# Orders
GET  /api/v1/traxx/orders?process_type=loaner|consignment
GET  /api/v1/traxx/orders/{orderId}

# Shipments
GET  /api/v1/traxx/shipments
GET  /api/v1/traxx/shipments/{id}/tracking

# Logistics Economics
GET  /api/v1/traxx/logistics/economics             # $8.4K avg freight, planned vs actual
GET  /api/v1/traxx/logistics/freight-variance       # Carrier variance analysis

# Actions
GET  /api/v1/traxx/actions/pending                 # 12 pending items
POST /api/v1/traxx/actions/{id}/assign
POST /api/v1/traxx/actions/{id}/complete

# Margin
GET  /api/v1/traxx/margin/by-case                  # Case-level: 62.4% avg
GET  /api/v1/traxx/margin/waterfall                # Revenue -> COGS -> Freight -> Net

# Surgery Readiness
GET  /api/v1/traxx/surgeries/upcoming
GET  /api/v1/traxx/surgeries/{id}/readiness        # Kit integrity, component availability, confidence
```

#### Data Model
```
Kit:           kit_id, kit_name, kit_type, status (In Transit/In Use/Awaiting Return/QC/Restocked)
               hospital_id, distributor_id, current_location, components[]
KitComponent:  kit_id, component_id, name, quantity, status, usage_count, sterilization_date
KitTelemetry:  kit_id, timestamp, temperature, humidity, lat, lng, battery_pct
Order:         order_id, kit_id, hospital, distributor, process_type (loaner/consignment)
               request_date, status, priority, estimated_value, timeline[]
Shipment:      shipment_id, order_id, carrier, tracking_num, origin, destination, status, eta
Surgery:       surgery_id, hospital, surgeon, date, kit_id, readiness_score, risk_factors[]
Action:        action_id, type, kit_id, assigned_to, due_date, status, priority
```

#### AI/ML Capabilities
- Kit availability prediction
- Surgery readiness scoring (component availability, logistics confidence)
- Freight optimization (planned vs actual variance)
- Margin prediction per case
- Proactive action generation

#### Data Sources
- IoT telemetry (sensor data)
- SAP WM/SD (warehouse, shipping)
- Carrier APIs (FedEx, UPS tracking)
- NexxtSpine ERP data (`data/nexxtspineData.js`)

---

### 7. MASTER.AI — Master Data (GL.AI + BP.AI)

**Frontend**: `masterdata/` (GLAIModule ~2,764 lines, BPAIModule ~1,981 lines)
**Backend**: `gl_account_mapping.py` (14KB), `gl_accounting_advisor.py` (20KB) — **Partial (core logic exists, no routes)**
**Status**: **Core logic exists, needs dedicated routes**

#### Required Endpoints — GL.AI (prefix: `/api/v1/masterdata/glai`)
```
GET  /dashboard/metrics          # 2,891 healthy, 287 moderate, 69 critical, 89% map rate, 94% confidence
POST /upload/source-coa          # Upload source Chart of Accounts (CSV/XLSX)
POST /upload/target-ycoa         # Upload target YCOA structure
POST /upload/gl-balances         # Upload GL balances
GET  /accounts/mappings          # All account mappings with confidence scores
GET  /accounts/{id}/field-recommendations  # 5 SAP fields per account (SKA1/SKB1)
POST /accounts/{id}/approve      # Approve mapping
POST /accounts/{id}/reject       # Reject mapping
GET  /issues                     # Data quality issues (manual postings, misclassification, etc.)
POST /export?format=csv|xlsx|lsmw  # Export mappings
```

#### GL.AI Data Model
```
GLAccount:     source_account, source_desc, target_account, target_desc
               mapping_confidence (87-98%), mapping_method, status (approved/review/proposed)
               fields_overridden, fields_total
GLFieldRec:    account_id, table (SKA1/SKB1), field (XBILK/XOPVW/MITKZ/etc.)
               field_name, ycoa_default, ai_recommendation, confidence, rationale, evidence[]
GLIssue:       type (manual_posting/misclassification/missing_flag/dormant/duplicate/sort_key)
               severity (critical/high/medium), account, description
```

#### GL.AI Issue Types
1. Manual postings to recon accounts (critical)
2. BS/P&L misclassification (critical)
3. Missing open item flags (critical)
4. Dormant accounts - 12+ months no activity (high)
5. Duplicate account clusters (high)
6. Sort key misalignment (medium)

#### Required Endpoints — BP.AI (prefix: `/api/v1/masterdata/bpai`)
```
GET  /dashboard/metrics          # 47 BPs, 23 auto-created, 12 quality issues
POST /upload/customers           # KNA1/KNB1/KNVV upload
POST /upload/vendors             # LFA1/LFB1/LFM1 upload
POST /upload/transactions        # BSEG/BSID/BSIK/REGUH upload
GET  /clusters                   # 6 BP clusters with confidence
GET  /clusters/{id}/field-recommendations  # BUT000, KNVV, KNA1, LFA1 fields
POST /clusters/{id}/approve      # Approve cluster
GET  /duplicates                 # Duplicate detection results
GET  /data-quality/issues        # Data quality problems
POST /create-business-partners   # Activate & migrate approved BPs
```

#### BP.AI Data Model
```
BPCluster:     id, name, search_term, cust_count, vend_count, location, tax_id
               confidence (65-98%), status (auto/review/must-review), docs, value
BPFieldRec:    cluster_id, table (BUT000/KNVV/KNA1/LFA1), field (BU_GROUP/BPKIND/etc.)
               source_value, ai_recommendation, confidence, rationale, evidence[]
```

#### Sample BP Clusters
| ID | Name | Custs | Vends | Value | Confidence | Status |
|----|------|-------|-------|-------|------------|--------|
| BP-0001 | Acme Industries Inc | 2 | 1 | $1.2M | 98% | auto |
| BP-0002 | Global Manufacturing Corp | 3 | 0 | $456K | 78% | review |
| BP-0003 | Premier Supplies LLC | 0 | 1 | $892K | 95% | auto |
| BP-0004 | TechCorp Solutions | 1 | 2 | $2.1M | 92% | review |
| BP-0005 | Regional Distributors Inc | 4 | 0 | $123K | 65% | must-review |
| BP-0006 | United Services Group | 2 | 1 | $1.5M | 88% | review |

#### AI/ML Capabilities
- **GL.AI**: Semantic account matching, cluster analysis, field validation, anomaly detection, duplicate detection
- **BP.AI**: Entity resolution, duplicate detection, field harmonization, dual-role detection, risk scoring

#### Data Sources
- SAP: SKA1/SKB1/SKAT (GL), KNA1/KNB1/KNVV (customers), LFA1/LFB1/LFM1 (vendors), BUT000 (BP)

---

### 8. AP.AI — Accounts Payable

**Frontend**: `mantrixap/` (5 tiles + LineItemMatchEngine, `apMockData.js` ~495 lines)
**Backend**: **NONE** — needs `ap_routes.py` + `ap_service.py`
**Status**: **Not started — highest priority gap**

#### Required Endpoints (prefix: `/api/v1/ap`)

**Invoice Intake & Matching**:
```
POST /invoices/scan                # Accept PDF/image, return OCR-extracted fields
POST /invoices/check-duplicate     # Multi-dimensional duplicate detection
GET  /invoices                     # List invoices (?status=matched|exception|review|parked)
GET  /invoices/{id}                # Single invoice detail
GET  /invoices/{id}/lines          # Invoice line items (3-5 per invoice)
GET  /invoices/{id}/status         # Status tracker with event timeline
GET  /pos/search                   # PO candidate search (?vendor=&amount=&date=)
POST /matching/line-items          # 6-strategy line-item matching engine
```

**AI Analysis**:
```
POST /gl/suggest                   # GL auto-coding for Non-PO invoices
POST /variance/explain             # Variance root cause explanation
POST /exceptions/analyze           # Exception taxonomy + evidence + precedent
GET  /exceptions/{id}/lines        # Line-level exception details
```

**Queue & Batch**:
```
GET  /queue/items                  # Work queue (?status=ready|review|exception|parked)
GET  /queue/stats                  # Summary: 47 total, 31 ready, 12 review, 4 exceptions
GET  /queue/prioritize             # Re-ranked by 4-factor algorithm
POST /batch/prepare                # Prepare posting batch (31 invoices, $842K)
POST /batch/confirm                # Confirm & post (MIRO: 27, FB60: 4)
```

**Vendor & Personal**:
```
GET  /vendor/{vendorId}/reliability  # Score: 97.1, 89 invoices, approval rate
GET  /dashboard/summary              # Daily: 94 posted, 7 parked, 4 routed, 2 rejected
GET  /dashboard/personal-stats       # 47s avg, 91% first-pass, 14 overrides
GET  /config/match-strategies        # 6 strategies with weights
GET  /config/guardrails              # 9 guardrail definitions
```

#### Invoice Data (8 invoices from `apMockData.js`)
| ID | Invoice# | Vendor | Amount | Type | Match | AI Score | Status |
|----|----------|--------|--------|------|-------|----------|--------|
| 1 | INV-2026-045231 | Thales Defense | $45,200 | PO-Backed | 3-Way Match | 97.4 | matched |
| 2 | INV-2026-045232 | Northrop Grumman | $234,000 | PO-Backed | 3-Way Match | 95.8 | matched |
| 3 | INV-2026-045233 | Lockheed Martin | $312,500 | PO-Backed | Price Variance | 42.0 | exception |
| 4 | INV-GR-44120 | Grainger Inc | $1,840 | Non-PO | GL Coded | 96.1 | matched |
| 5 | INV-FS-9920 | Fastenal Company | $8,750 | Service Entry | Partial GR | 72.0 | review |
| 6 | INV-ABC-2241 | ABC Industrial | $8,420 | PO-Backed | Freight Issue | 68.0 | review |
| 7 | INV-OD-22104 | Office Depot | $342 | Non-PO | GL Coded | 98.2 | matched |
| 8 | INV-2026-045234 | BAE Systems | $156,000 | PO-Backed | Missing SES | null | parked |

#### Line-Item Matching Engine (6 strategies)
| Strategy | Weight | Description |
|----------|--------|-------------|
| Key-Based | 30% | PO line #, material #, item category — exact field match |
| Vendor-Material Dict | 25% | Learned vendor->material mapping from historical invoices |
| Semantic | 15% | NLP comparison of invoice description vs PO description |
| Qty/Price Heuristic | 15% | Quantity x unit-price cross-match with tolerance bands |
| GR Cross-Ref | 10% | Goods receipt line -> PO line back-reference via MATDOC |
| Elimination | 5% | Remaining unmatched lines paired by exclusion |

#### Guardrails (9 rules)
| ID | Name | Type | Rule |
|----|------|------|------|
| gs-price | Price Ceiling | Hard | Line price > PO price + tolerance -> block |
| gs-qty | Over-Delivery | Hard | Invoice qty > GR qty -> block |
| gs-dup | Duplicate Line | Hard | Same PO line billed twice -> block |
| gs-po-closed | PO Line Closed | Hard | EKPO delivery-complete flag -> block |
| gs-price-drift | Price Drift | Soft | Price >1% but <=3% above PO -> warn |
| gs-partial-gr | Partial GR | Soft | GR qty < invoice qty but remaining expected -> warn |
| gs-uom | UOM Mismatch | Soft | Invoice UOM != PO UOM (convertible) -> warn |
| gs-first-vendor | First Invoice | Audit | First invoice from this vendor-material combo -> log |
| gs-amount-outlier | Amount Outlier | Audit | Line amount >2sigma from vendor avg -> log |

#### Queue Prioritization (4-factor algorithm)
| Factor | Weight | Logic |
|--------|--------|-------|
| Financial Impact | 35% | Higher dollar amounts rank higher |
| Payment Urgency | 25% | Approaching deadlines, early-pay discounts |
| Processing Complexity | 20% | Exceptions surface above clean matches |
| Aging & SLA | 20% | Stuck items get boosted |

#### Exception Taxonomy (7 root causes)
1. **Price — Contract Escalation**: KONV ZPR0 clause allows escalation
2. **Price — PO Error**: PO price doesn't match contract
3. **Qty — GR Pending**: EKET delivery date passed, no 101 in MATDOC
4. **Qty — Partial GR**: EKBE shows partial, remaining outstanding
5. **Master Data**: LFA1/LFB1 change detected
6. **Duplicate**: Multi-dimensional match against RBKP/RSEG
7. **Policy Violation**: SOX/delegation/segregation rule

#### SAP Tables Read
```
EKKO, EKPO  — Purchase Orders (header + line items)
EKET        — PO Schedule Lines (delivery dates, quantities)
MATDOC, MSEG — Goods Receipts (101 movements, qty received)
EKBE        — PO History (prior invoices, GR history)
RBKP, RSEG  — Invoice Documents (for duplicate check)
LFA1, LFB1  — Vendor Master (payment terms, bank)
KONV        — Pricing Conditions (contract escalation clauses)
WRX         — GR/IR Accruals
T169, OMR6  — Tolerance Groups and Limits
```

---

## Sidebar Features

---

### 9. Enterprise Pulse

**Backend**: `pulse_routes.py` (21KB), `pulse_monitor_service.py` (28KB) — **COMPLETE**
**Status**: **Fully implemented** (19 endpoints)

```
POST /api/v1/pulse/monitors/create
POST /api/v1/pulse/monitors/save
GET  /api/v1/pulse/monitors
GET  /api/v1/pulse/monitors/{id}
POST /api/v1/pulse/monitors/{id}/refine
POST /api/v1/pulse/monitors/{id}/test
PUT  /api/v1/pulse/monitors/{id}
PUT  /api/v1/pulse/monitors/{id}/toggle
DELETE /api/v1/pulse/monitors/{id}
GET  /api/v1/pulse/alerts
POST /api/v1/pulse/alerts/{id}/feedback
PUT  /api/v1/pulse/alerts/{id}/acknowledge
GET  /api/v1/pulse/templates
GET  /api/v1/pulse/stats
GET  /api/v1/pulse/patterns
GET  /api/v1/pulse/patterns/{id}
POST /api/v1/pulse/patterns/{id}/run
POST /api/v1/pulse/actions/{id}/approve
POST /api/v1/pulse/actions/{id}/reject
```

---

### 10. AXIS.AI — Decision Intelligence

**Frontend**: `AxisAIDashboard.jsx`, `ScenarioAIDashboard.jsx`
**Backend**: `bigquery_routes.py` (14KB) — **Partial**
**Status**: **Needs dedicated `axis_routes.py`**

#### Required Endpoints (prefix: `/api/v1/axis`)
```
GET  /api/v1/axis/dashboard                  # 5 tiles: FORECAST, BUDGET, DRIVER, SCENARIO, INSIGHTS
GET  /api/v1/axis/forecast/generate          # Time-series forecast with confidence intervals
POST /api/v1/axis/scenario/simulate          # Monte Carlo: base/optimistic/pessimistic
GET  /api/v1/axis/budget/variance            # Actual vs budget by category
GET  /api/v1/axis/driver/analysis            # Key value drivers: volume, price, mix, cost
GET  /api/v1/axis/insights/recommendations   # AI-generated recommendations
```

---

### 11. MARKETS.AI — Market Intelligence

**Backend**: `markets_routes.py` (10KB), `market_signal_service.py` (8KB) — **COMPLETE**
**Status**: **Fully implemented** (10 endpoints)

```
GET  /api/v1/signals
GET  /api/v1/signals/{id}
GET  /api/v1/categories/{category}
GET  /api/v1/summary
GET  /api/v1/config
POST /api/v1/config
PATCH /api/v1/signals/{id}
POST /api/v1/signals
POST /api/v1/refresh
GET  /api/v1/scheduler/status
```

---

### 12. Document Hub

**Backend**: `document_routes.py` (21KB) — **COMPLETE**
**Status**: **Fully implemented**

```
POST /api/v1/documents/upload
POST /api/v1/documents/extract
GET  /api/v1/documents/{id}
GET  /api/v1/documents/search
POST /api/v1/documents/classify
```

---

### 13. Email Intel

**Backend**: `comms_routes.py` (8KB), `comms_config_routes.py` (13KB) — **COMPLETE**
**Status**: **Fully implemented**

---

### 14. Vision Studio

**Backend**: `vision_routes.py` (18KB) — **COMPLETE**
**Status**: **Fully implemented**

```
POST /api/v1/vision/detect
POST /api/v1/vision/ocr
POST /api/v1/vision/label
POST /api/v1/vision/train
POST /api/v1/vision/export
```

---

### 15. Control Center

**Backend**: `control_center_routes.py` (17KB) — **COMPLETE**
**Status**: **Fully implemented**

```
GET  /api/v1/system-health
GET  /api/v1/metrics-history
GET  /api/v1/services
GET  /api/v1/cache/types
DELETE /api/v1/cache/{type}
GET  /api/v1/data-sources
```

---

## Shared Services

### AI Chat Service
**Existing**: `conversation_routes.py` (7KB), `chat_routes.py` (5KB)
**Needs**: Unified `/api/v1/chat` router combining module-specific context

```
POST /api/v1/chat/query         # Message + module context -> Claude response
GET  /api/v1/chat/history/{id}  # Conversation by ID (MongoDB)
GET  /api/v1/chat/history       # List conversations (?module=)
```

**Used by**: MARGEN.AI (ASK.MARGEN), ORDLY.AI (intent chat), Supply Chain Map (agent chat)
**Storage**: MongoDB (`mantrix_nexxt_conversations`)

### Global Search
**Needs**: New `/api/v1/search` endpoint using Weaviate

```
GET  /api/v1/search?q={}&module={}&entity_type={}&limit=20
```

Cross-module search across: orders, invoices, customers, materials, kits, GL accounts, BP clusters.
**Powered by**: Weaviate vector DB with OpenAI embeddings

### Authentication
**Needs**: New `/api/v1/auth` router for Clerk integration

```
POST /api/v1/auth/login    # Validate Clerk session token
GET  /api/v1/auth/user     # Get current user profile
POST /api/v1/auth/logout   # Invalidate session
```

**Integration**: Clerk SDK (key in `CLERK_SECRET_KEY` env var)

### Health (existing)
```
GET  /api/v1/health    # Already implemented in routes.py
```

---

## Database Schema

### Existing Tables (from migrations 001-005)
- `sku_master`, `plant_master`, `supplier_master`, `customer_master`
- `demand_forecast`, `demand_signals`, `demand_forecast_models`
- `reorder_points`, `lot_sizes`, `safety_stock`
- `dc_inventory`, `working_capital_metrics`, `bom_structure`
- `command_tower_tickets` (separate SQL)
- `consignment_kit_*`, `loaner_*` (separate SQL)
- `margen_*` (separate SQL)

### New Tables Needed

#### Migration 006: AP.AI Tables
```sql
-- AP Invoices
CREATE TABLE ap_invoices (
    id SERIAL PRIMARY KEY,
    invoice_num VARCHAR(50) NOT NULL UNIQUE,
    vendor VARCHAR(200) NOT NULL,
    vendor_id VARCHAR(50),
    date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    po_ref VARCHAR(50),
    type VARCHAR(30) NOT NULL,        -- PO-Backed, Non-PO, Service Entry
    match_type VARCHAR(50),           -- 3-Way Match, Price Variance, etc.
    ai_score DECIMAL(5,2),
    score_level VARCHAR(10),          -- high, mid, low, parked
    status VARCHAR(20) NOT NULL,      -- matched, exception, review, parked
    ai_hint TEXT,
    gl_account VARCHAR(20),
    cost_center VARCHAR(20),
    posted_by VARCHAR(100),
    posted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AP Invoice Lines
CREATE TABLE ap_invoice_lines (
    id SERIAL PRIMARY KEY,
    invoice_id INT REFERENCES ap_invoices(id),
    line_num INT NOT NULL,
    description TEXT,
    qty DECIMAL(12,3),
    unit VARCHAR(10),
    unit_price DECIMAL(15,4),
    amount DECIMAL(15,2),
    po_line INT,
    match_status VARCHAR(20),         -- matched, partial, exception, unplanned
    match_strategy VARCHAR(30),       -- key-based, vendor-material, semantic, etc.
    confidence DECIMAL(5,2),
    gr_ref VARCHAR(50),
    UNIQUE(invoice_id, line_num)
);

-- AP PO Headers (cached from SAP EKKO)
CREATE TABLE ap_po_headers (
    po_num VARCHAR(50) PRIMARY KEY,
    vendor VARCHAR(200),
    vendor_id VARCHAR(50),
    total_value DECIMAL(15,2),
    currency VARCHAR(5) DEFAULT 'USD',
    status VARCHAR(20),
    created_date DATE
);

-- AP PO Lines (cached from SAP EKPO)
CREATE TABLE ap_po_lines (
    id SERIAL PRIMARY KEY,
    po_num VARCHAR(50) REFERENCES ap_po_headers(po_num),
    line_num INT NOT NULL,
    material VARCHAR(50),
    description TEXT,
    qty DECIMAL(12,3),
    unit VARCHAR(10),
    unit_price DECIMAL(15,4),
    amount DECIMAL(15,2),
    gr_qty DECIMAL(12,3),
    gr_date DATE,
    delivery_complete BOOLEAN DEFAULT FALSE,
    UNIQUE(po_num, line_num)
);

-- AP Match Results
CREATE TABLE ap_match_results (
    id SERIAL PRIMARY KEY,
    invoice_id INT REFERENCES ap_invoices(id),
    invoice_line INT NOT NULL,
    po_line INT,
    strategy VARCHAR(30),
    confidence DECIMAL(5,2),
    variance_type VARCHAR(20),        -- price, qty, unplanned, null
    variance_pct DECIMAL(8,4),
    guardrail_flags JSONB DEFAULT '[]',
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AP Exceptions
CREATE TABLE ap_exceptions (
    id SERIAL PRIMARY KEY,
    invoice_id INT REFERENCES ap_invoices(id),
    exception_type VARCHAR(50),       -- Price-Contract, Price-POError, Qty-GRPending, etc.
    root_cause TEXT,
    explanation TEXT,
    evidence JSONB,
    precedent JSONB,                  -- {count, allApproved, reversals}
    resolution VARCHAR(50),           -- approved, rejected, parked, routed
    resolved_by VARCHAR(100),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AP Batch Postings
CREATE TABLE ap_batch_postings (
    id SERIAL PRIMARY KEY,
    batch_id UUID NOT NULL UNIQUE,
    invoice_ids JSONB NOT NULL,
    total_value DECIMAL(15,2),
    miro_count INT DEFAULT 0,
    fb60_count INT DEFAULT 0,
    avg_confidence DECIMAL(5,2),
    status VARCHAR(20),               -- prepared, confirmed, posted, failed
    audit_trail JSONB,
    confirmed_by VARCHAR(100),
    confirmed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AP Vendor Reliability
CREATE TABLE ap_vendor_reliability (
    vendor_id VARCHAR(50) PRIMARY KEY,
    vendor_name VARCHAR(200),
    reliability_score DECIMAL(5,2),
    invoice_count INT DEFAULT 0,
    historical_accuracy DECIMAL(5,2),
    prior_exceptions INT DEFAULT 0,
    approval_rate DECIMAL(5,2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AP Override Log (for model retraining)
CREATE TABLE ap_override_log (
    id SERIAL PRIMARY KEY,
    invoice_id INT REFERENCES ap_invoices(id),
    ai_recommendation TEXT,
    ai_confidence DECIMAL(5,2),
    clerk_decision TEXT,
    outcome VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Migration 007: O2C.AI Tables
```sql
CREATE TABLE o2c_sales_orders (
    order_num VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50),
    customer_name VARCHAR(200),
    order_date DATE,
    total_value DECIMAL(15,2),
    status VARCHAR(30),
    sales_org VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE o2c_deliveries (
    delivery_num VARCHAR(50) PRIMARY KEY,
    order_num VARCHAR(50) REFERENCES o2c_sales_orders(order_num),
    ship_date DATE,
    qty_delivered INT,
    status VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE o2c_billing_docs (
    doc_num VARCHAR(50) PRIMARY KEY,
    delivery_num VARCHAR(50) REFERENCES o2c_deliveries(delivery_num),
    invoice_date DATE,
    amount DECIMAL(15,2),
    due_date DATE,
    status VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE o2c_payments (
    payment_num VARCHAR(50) PRIMARY KEY,
    billing_num VARCHAR(50) REFERENCES o2c_billing_docs(doc_num),
    pay_date DATE,
    amount DECIMAL(15,2),
    method VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE o2c_customers (
    customer_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200),
    segment VARCHAR(20),              -- Invest, Maintain, Harvest
    credit_class VARCHAR(10),
    clv DECIMAL(15,2),
    churn_probability DECIMAL(5,4),
    dso DECIMAL(8,2),
    payment_terms VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Migration 008: TRAXX.AI Tables
```sql
CREATE TABLE traxx_kits (
    kit_id VARCHAR(50) PRIMARY KEY,
    kit_name VARCHAR(200),
    kit_type VARCHAR(50),
    status VARCHAR(30),               -- In Transit, In Use, Awaiting Return, QC, Restocked
    hospital_id VARCHAR(50),
    hospital_name VARCHAR(200),
    distributor_id VARCHAR(50),
    distributor_name VARCHAR(200),
    current_lat DECIMAL(10,7),
    current_lng DECIMAL(10,7),
    component_count INT DEFAULT 0,
    estimated_value DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE traxx_kit_components (
    id SERIAL PRIMARY KEY,
    kit_id VARCHAR(50) REFERENCES traxx_kits(kit_id),
    component_id VARCHAR(50),
    component_name VARCHAR(200),
    quantity INT DEFAULT 1,
    status VARCHAR(30),
    usage_count INT DEFAULT 0,
    sterilization_date DATE,
    expiry_date DATE
);

CREATE TABLE traxx_kit_telemetry (
    id SERIAL PRIMARY KEY,
    kit_id VARCHAR(50) REFERENCES traxx_kits(kit_id),
    timestamp TIMESTAMP NOT NULL,
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    lat DECIMAL(10,7),
    lng DECIMAL(10,7),
    battery_pct DECIMAL(5,2),
    alert_flag BOOLEAN DEFAULT FALSE
);

CREATE TABLE traxx_orders (
    order_id VARCHAR(50) PRIMARY KEY,
    kit_id VARCHAR(50) REFERENCES traxx_kits(kit_id),
    hospital VARCHAR(200),
    distributor VARCHAR(200),
    process_type VARCHAR(20),         -- loaner, consignment
    request_date DATE,
    status VARCHAR(30),
    priority VARCHAR(10),
    estimated_value DECIMAL(15,2),
    timeline JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE traxx_shipments (
    shipment_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES traxx_orders(order_id),
    carrier VARCHAR(100),
    tracking_num VARCHAR(100),
    origin VARCHAR(200),
    destination VARCHAR(200),
    status VARCHAR(30),
    eta TIMESTAMP,
    actual_arrival TIMESTAMP,
    freight_cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE traxx_surgeries (
    surgery_id VARCHAR(50) PRIMARY KEY,
    hospital VARCHAR(200),
    surgeon VARCHAR(200),
    surgery_date DATE,
    kit_id VARCHAR(50) REFERENCES traxx_kits(kit_id),
    readiness_score DECIMAL(5,2),
    risk_factors JSONB DEFAULT '[]',
    status VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE traxx_actions (
    action_id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(50),
    kit_id VARCHAR(50) REFERENCES traxx_kits(kit_id),
    assigned_to VARCHAR(200),
    due_date DATE,
    status VARCHAR(20),               -- pending, assigned, completed
    priority VARCHAR(10),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);
```

#### Migration 009: MASTER.AI Tables
```sql
CREATE TABLE md_gl_mappings (
    id SERIAL PRIMARY KEY,
    source_account VARCHAR(20) NOT NULL,
    source_desc VARCHAR(200),
    target_account VARCHAR(20),
    target_desc VARCHAR(200),
    mapping_confidence DECIMAL(5,4),
    mapping_method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'proposed',  -- approved, review, proposed, rejected
    fields_overridden INT DEFAULT 0,
    fields_total INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE md_gl_field_recommendations (
    id SERIAL PRIMARY KEY,
    mapping_id INT REFERENCES md_gl_mappings(id),
    sap_table VARCHAR(10),            -- SKA1, SKB1
    field_name VARCHAR(50),           -- XBILK, XOPVW, MITKZ, etc.
    field_label VARCHAR(100),
    ycoa_default VARCHAR(50),
    ai_recommendation VARCHAR(50),
    confidence DECIMAL(5,4),
    rationale TEXT,
    evidence JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'proposed'
);

CREATE TABLE md_bp_clusters (
    id SERIAL PRIMARY KEY,
    cluster_id VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(200),
    search_term VARCHAR(100),
    cust_count INT DEFAULT 0,
    vend_count INT DEFAULT 0,
    location VARCHAR(200),
    tax_id VARCHAR(50),
    confidence DECIMAL(5,4),
    status VARCHAR(20) DEFAULT 'review',  -- auto, review, must-review
    docs INT DEFAULT 0,
    total_value DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE md_bp_field_recommendations (
    id SERIAL PRIMARY KEY,
    cluster_id INT REFERENCES md_bp_clusters(id),
    sap_table VARCHAR(10),            -- BUT000, KNVV, KNA1, LFA1
    field_name VARCHAR(50),
    source_value VARCHAR(200),
    ai_recommendation VARCHAR(200),
    confidence DECIMAL(5,4),
    rationale TEXT,
    evidence JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'proposed'
);

CREATE TABLE md_data_quality_issues (
    id SERIAL PRIMARY KEY,
    module VARCHAR(10),               -- glai, bpai
    entity_id VARCHAR(50),
    issue_type VARCHAR(50),
    severity VARCHAR(10),             -- critical, high, medium, low
    description TEXT,
    recommendation TEXT,
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Migration 010: Supply Chain Map Tables
```sql
CREATE TABLE sc_trucks (
    truck_id VARCHAR(50) PRIMARY KEY,
    status VARCHAR(20),               -- en_route, loading, idle, delayed
    lat DECIMAL(10,7),
    lng DECIMAL(10,7),
    cargo TEXT,
    route TEXT,
    eta TIMESTAMP,
    driver VARCHAR(200),
    capacity INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sc_stores (
    store_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200),
    type VARCHAR(20),                 -- plant, dc, vendor
    lat DECIMAL(10,7),
    lng DECIMAL(10,7),
    stock_level INT,
    demand_forecast INT,
    capacity INT,
    inventory_value DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sc_alerts (
    alert_id SERIAL PRIMARY KEY,
    severity VARCHAR(10),             -- critical, high, medium, low
    type VARCHAR(50),
    facility_affected VARCHAR(200),
    predicted_impact TEXT,
    status VARCHAR(20) DEFAULT 'active',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE TABLE sc_agents (
    agent_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200),
    type VARCHAR(50),
    status VARCHAR(20),
    last_action TEXT,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Implementation Phases

### Phase 1 — Foundation & Critical Gaps (Week 1-2)
**Priority**: P1

- [ ] **AP.AI**: Create `ap_routes.py` + `ap_service.py` (22 endpoints)
- [ ] **Auth**: Create `auth_routes.py` (Clerk integration, 3 endpoints)
- [ ] **Database**: Run migrations 006 (AP.AI tables)
- [ ] **main.py**: Register new routers
- [ ] **Verify**: `npx vite build` passes, AP.AI frontend connects

### Phase 2 — MASTER.AI + O2C.AI (Week 3-4)
**Priority**: P2

- [ ] **O2C.AI**: Create `o2c_routes.py` + `o2c_service.py` (15 endpoints)
- [ ] **MASTER.AI**: Create `masterdata_routes.py` + `masterdata_service.py` (20 endpoints)
- [ ] **Database**: Run migrations 007, 009
- [ ] **Verify**: Toggle `USE_MOCK = false` for O2C and MASTER.AI

### Phase 3 — TRAXX.AI + Supply Chain Map (Week 5-6)
**Priority**: P2

- [ ] **TRAXX.AI**: Create `traxx_routes.py` + `traxx_service.py` (17 endpoints)
- [ ] **Supply Chain**: Create `supply_chain_routes.py` + `supply_chain_service.py` (13 endpoints)
- [ ] **Database**: Run migrations 008, 010
- [ ] **Verify**: Toggle mock mode off for TRAXX and Supply Chain Map

### Phase 4 — STOX.AI Extensions (Week 7-8)
**Priority**: P2

- [ ] **STOX Extended**: Create `stox_extended_routes.py` + `stox_extended_service.py` (~50 endpoints)
- [ ] **Lam Research**: All 7 tile endpoints
- [ ] **Distribution**: Demand variability, supply signals, MRP advisor, what-if
- [ ] **Verify**: Full STOX.AI functionality with real APIs

### Phase 5 — Sidebar & Shared Services (Week 9-10)
**Priority**: P3

- [ ] **AXIS.AI**: Create `axis_routes.py` + `axis_service.py` (6 endpoints)
- [ ] **Chat**: Create unified `chat_service_routes.py` (3 endpoints)
- [ ] **Search**: Create `search_routes.py` (1 endpoint, Weaviate integration)
- [ ] **Verify**: All sidebar features connected

### Phase 6 — Integration & Load Testing (Week 11-12)
**Priority**: P3

- [ ] Integration tests: API responses match mock data structures
- [ ] Load test: 50+ concurrent users across all modules
- [ ] Toggle `USE_MOCK = false` globally
- [ ] End-to-end smoke tests for all 9 CORE.AI modules

---

## Estimated Scope Summary

| Category | Count |
|----------|-------|
| **API Endpoints — Existing** | ~195 |
| **API Endpoints — New** | ~160 |
| **API Endpoints — Total** | ~355 |
| **Route Files — Existing** | 19 |
| **Route Files — New** | 9 |
| **Service Files — Existing** | 30+ |
| **Service Files — New** | 7 |
| **Database Tables — Existing** | ~20 |
| **Database Tables — New** | ~25 |
| **Database Tables — Total** | ~45 |
| **AI/ML Services** | ~15 (most existing) |
| **External Integrations** | 8 (all configured) |
| **Background Jobs** | 2 running (Pulse, Markets schedulers) |

---

## Verification Checklist

For each phase:
1. `cd frontend && npx vite build` — build passes
2. `cd backend && python -m uvicorn src.main:app` — server starts
3. Frontend connects to real APIs (toggle `USE_MOCK = false` per module)
4. API responses match mock data structures in frontend components
5. No console errors in browser
6. `GET /api/v1/health` returns healthy status for all services
