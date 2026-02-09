# MANTRIX Agentic Platform — Hybrid Architecture

> **Version**: 1.0
> **Date**: 2026-02-07
> **Status**: Phase 0 — Architecture & Planning

---

## Table of Contents

1. [Overview](#1-overview)
2. [Hybrid Cost Architecture — Three Tiers](#2-hybrid-cost-architecture--three-tiers)
3. [Four-Application Architecture](#3-four-application-architecture)
4. [Agent Memory System](#4-agent-memory-system)
5. [Agent Hierarchy](#5-agent-hierarchy)
6. [ELK Monitoring Stack](#6-elk-monitoring-stack)
7. [Data Flow: End-to-End Example](#7-data-flow-end-to-end-example)
8. [MANTRIX Backend Completion (Gap Analysis)](#8-mantrix-backend-completion-gap-analysis)
9. [Deployment Model](#9-deployment-model)
10. [Implementation Phases](#10-implementation-phases)
11. [Existing Code to Reuse](#11-existing-code-to-reuse)
12. [Verification Criteria](#12-verification-criteria)

---

## 1. Overview

The MANTRIX platform currently has **9 CORE.AI modules** + sidebar features with a React frontend and FastAPI backend. The goal is to transform this into a **fully agentic platform** where intelligent agents control all operations, coordinated through 4 applications:

| Application | Role | Status |
|-------------|------|--------|
| **MANTRIX** | Core platform (9 modules, existing) | Existing — enhance |
| **ERPBRIDGE** | SAP/ERP bidirectional connector | New |
| **PRISM AI** | Agent orchestration & monitoring engine | New |
| **AXIS AI** | Unified conversation interface | New (reimagined from dashboard) |
| **ELK Stack** | Centralized monitoring across all 4 apps | New |

**Cost constraint**: Hybrid architecture where simple features use code/APIs with self-hosted models, and only core intelligent features use LLMs.

---

## 2. Hybrid Cost Architecture — Three Tiers

### Tier 1 — Code & Rules (ZERO AI cost)

Traditional code, SQL, business rules, CRUD, scheduled jobs.

| Capability | Examples |
|-----------|----------|
| Data aggregation & filtering | Dashboard KPIs, AR aging buckets, DSO calculations |
| Business rule engines | AP guardrails (9 rules), tolerance checks, approval workflows |
| SQL queries & reports | Revenue by region, inventory distribution, process variants |
| Workflow state machines | Order pipeline stages, invoice status tracking, kit lifecycle |
| Scheduled jobs | Data sync, batch posting, monitor scheduling |
| CRUD operations | Customer/vendor/order/invoice management |
| Process flow tracking | O2C document chain, AP 3-way match logic |
| Deterministic matching | Key-based PO matching, exact field lookups |
| Calculations | RFM scores, ABC classification, safety stock formulas |

**Used by**: ~70% of all API endpoints across MANTRIX.

### Tier 2 — Self-Hosted Models (compute-only cost, no per-token fees)

Open-source ML models running on-premise or in containers.

| Model | Library | Use Case |
|-------|---------|----------|
| Time-series forecasting | Prophet / statsforecast | Demand forecasting, DSO prediction, revenue trends |
| Classification | scikit-learn / XGBoost | Invoice routing, exception classification, severity scoring |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) | Semantic search, entity matching, account similarity |
| Anomaly detection | Isolation Forest / Z-score | Price outliers, volume anomalies, fraud signals |
| Entity resolution | rapidfuzz / dedupe | BP duplicate detection, vendor matching, customer dedup |
| Clustering | K-means / DBSCAN | GL account clustering, customer segmentation, BP grouping |
| Ranking | LightGBM | Queue prioritization, recommendation ranking |
| NER | spaCy | Invoice field extraction, email entity extraction |
| Intent classification | fastText / small BERT | Query routing, email classification, chat intent |

**Used by**: ~20% of endpoints — forecasting, matching, classification, search.

### Tier 3 — LLM Intelligence (per-token cost, Claude API)

Reserved for tasks requiring reasoning, synthesis, or natural language generation.

| Capability | When to Use |
|-----------|-------------|
| Natural language understanding | Conversational queries via AXIS AI |
| Complex multi-step reasoning | Deep research, root cause analysis, multi-factor synthesis |
| Explanation generation | Variance explanations, exception narratives, recommendation rationale |
| Agent planning & decomposition | Breaking complex requests into sub-tasks |
| Document understanding | Invoice PDF interpretation, PO parsing beyond OCR |
| Code/query generation | NL-to-SQL for ad-hoc queries |
| Synthesis & summarization | Executive summaries, cross-module insights |

**Used by**: ~10% of interactions — chat, deep research, explanations, agent reasoning.

### Cost Decision Matrix

```
User asks "What is my AR aging?"
  -> Tier 1: SQL query against o2c_customers table -> $0

User asks "Which invoices might be duplicates?"
  -> Tier 2: rapidfuzz similarity + Isolation Forest -> $0 (compute only)

User asks "Why did margin drop 12% last quarter and what should we do?"
  -> Tier 3: Claude multi-step analysis with data retrieval -> ~$0.05-0.20

User approves a GL account mapping
  -> Tier 1: UPDATE md_gl_mappings SET status='approved' -> $0

Agent detects anomalous invoice pattern
  -> Tier 2: Isolation Forest flags it -> $0 (compute only)
  -> Tier 3: Claude explains the anomaly -> ~$0.02 (only if user requests explanation)
```

---

## 3. Four-Application Architecture

### System Diagram

```
+---------------------------------------------------------------+
|                        USER / BROWSER                         |
|                                                               |
|  +--------------+  +--------------+  +----------------------+ |
|  |  AXIS AI     |  |  MANTRIX     |  |  PRISM AI            | |
|  |  (Chat UI)   |  |  (Module UI) |  |  (Agent Dashboard)   | |
|  +------+-------+  +------+-------+  +--------+-------------+ |
+---------|-----------------|--------------------|---------------+
          |                 |                    |
    +-----v-----------------v--------------------v----------+
    |              API GATEWAY (Nginx / Kong)                |
    +-----+-----------------+--------------------+----------+
          |                 |                    |
  +-------v-------+ +------v------+  +-----------v---------+
  |   AXIS AI     | |  MANTRIX    |  |    PRISM AI         |
  |   Backend     | |  Backend    |  |    Backend          |
  |   (FastAPI)   | |  (FastAPI)  |  |    (FastAPI)        |
  |               | |             |  |                     |
  |  Conversation | |  9 Modules  |  |  Orchestrator       |
  |  Router       | |  + Sidebar  |  |  Agent Registry     |
  |  Context Mgr  | |  APIs       |  |  Memory Manager     |
  |  LLM Gateway  | |  Services   |  |  RL Feedback Loop   |
  +-------+-------+ +------+------+  |  Scheduler          |
          |                |          +---------+-----------+
          |                |                    |
          +----------------+--------------------+
                           |
                   +-------v-------+
                   |   ERPBRIDGE   |
                   |   (FastAPI)   |
                   |               |
                   |  SAP RFC/BAPI |
                   |  Data Mapper  |
                   |  Change Queue |
                   |  Writeback    |
                   +-------+-------+
                           |
                     +-----v-----+
                     |  SAP ERP  |
                     |  S/4HANA  |
                     +-----------+

  ALL FOUR APPS --> Logstash --> Elasticsearch --> Kibana
```

### 3A. MANTRIX Platform (existing, enhanced)

**Role**: Core business logic, module APIs, data processing
**Tier split**: 90% Tier 1 + Tier 2, 10% Tier 3 (only for chat/explanations)

Keeps all existing:
- 19 route files (~195 endpoints)
- 30+ service files
- All DB clients (PostgreSQL, BigQuery, MongoDB, Weaviate, Neo4j, Redis, Fuseki)
- Process mining engine, financial agents, deep research orchestrator

**Enhancement**: Each module gets a **Domain Agent Interface** — a thin wrapper that lets PRISM AI invoke module capabilities as agent tools.

### 3B. ERPBRIDGE (new)

**Role**: Bidirectional SAP connector — ALL SAP interactions go through ERPBRIDGE
**Tier**: 100% Tier 1 (pure integration, no AI needed)

#### SAP Table Map — 28 Core Tables

**Tier A — Top 20 Foundation Tables** (read frequently, cache in PostgreSQL)

| # | Table(s) | Purpose | Modules | Sync Strategy | Cache TTL |
|---|----------|---------|---------|---------------|-----------|
| 1 | **MARA** | Material master (basic data) | STOX, ORDLY, MASTER | Delta (CDHDR) | 24h |
| 2 | **EKKO/EKPO** | PO header + line items | AP.AI, STOX | Delta (CDHDR) | 1h |
| 3 | **VBAK/VBAP** | Sales order header + line items | O2C, ORDLY | Delta (CDHDR) | 1h |
| 4 | **BKPF/BSEG** | Accounting doc header + line items | O2C, MARGEN | Delta (CDHDR) | 4h |
| 5 | **KNA1** | Customer master (general) | O2C, ORDLY, MASTER | Delta (CDHDR) | 24h |
| 6 | **LFA1** | Vendor master (general) | AP.AI, MASTER | Delta (CDHDR) | 24h |
| 7 | **MAKT** | Material descriptions (text) | STOX, ORDLY | Full sync weekly | 7d |
| 8 | **MARC** | Plant-level material settings | STOX | Delta (CDHDR) | 4h |
| 9 | **VBFA** | Document flow (SO->DL->BL->PY) | O2C | Delta | 1h |
| 10 | **EKBE** | PO history (GR/IR postings) | AP.AI | Delta | 1h |
| 11 | **LIKP/LIPS** | Delivery header + items | O2C | Delta (CDHDR) | 2h |
| 12 | **VBRK/VBRP** | Billing doc header + items | O2C | Delta (CDHDR) | 2h |
| 13 | **MARD** | Stock by storage location | STOX | Real-time on demand | 15min |
| 14 | **KONV** | Pricing conditions on documents | AP.AI | Read on demand | No cache |
| 15 | **BSID/BSIK** | Open items — AR and AP aging | O2C, AP.AI | Delta | 4h |
| 16 | **CDHDR/CDPOS** | Change document history | PROCESS.AI, ERPBRIDGE | Continuous poll | N/A |
| 17 | **T001** | Company code master | All | Full sync weekly | 7d |
| 18 | **T001W** | Plant master | STOX, All | Full sync weekly | 7d |
| 19 | **MBEW** | Material valuation | STOX, MARGEN | Delta | 4h |
| 20 | **ACDOCA** | Universal Journal (S/4HANA) | MARGEN | BigQuery sync daily | 24h |

**Tier B — 8 Additional Tables Required by Module**

| # | Table(s) | Purpose | Modules | Sync Strategy | Cache TTL |
|---|----------|---------|---------|---------------|-----------|
| 21 | **EKET** | PO schedule lines | AP.AI | Delta with EKKO | 1h |
| 22 | **MSEG** (or MATDOC) | Material movements | AP.AI, STOX | Delta | 1h |
| 23 | **RBKP/RSEG** | Invoice doc header + items | AP.AI | Delta | 2h |
| 24 | **SKA1** | GL account master | MASTER.AI (GL.AI) | Full sync on upload | 7d |
| 25 | **SKAT** | GL account descriptions | MASTER.AI (GL.AI) | Full sync on upload | 7d |
| 26 | **KNB1** | Customer company code data | O2C | Delta (CDHDR) | 24h |
| 27 | **LFB1** | Vendor company code data | AP.AI | Delta (CDHDR) | 24h |
| 28 | **BUT000** | Business partner master | MASTER.AI (BP.AI) | Full sync on upload | 7d |

**Tier C — Nice-to-Have** (add as needed, not in Phase 0)

| Table(s) | Purpose | Module | When |
|----------|---------|--------|------|
| KNVV | Customer sales area data | MASTER.AI, O2C | Phase 4 |
| LFM1 | Vendor purchasing org data | MASTER.AI | Phase 4 |
| EBAN | Purchase requisitions | STOX | Phase 4 |
| T169/OMR6 | Tolerance groups & limits | AP.AI | Phase 4 |
| WRX | GR/IR clearing accruals | AP.AI | Phase 5 |
| REGUH | Payment run header | AP.AI | Phase 5 |
| EKET (ext) | Confirmation control | STOX | Phase 5 |
| CEPCT | Profit center text | MARGEN | Phase 5 |

#### SAP Table -> Module Dependency Matrix

```
                MARA EKKO KNA1 LFA1 MARC MARD VBAK LIKP VBRK BKPF VBFA EKBE KONV BSID MSEG EKET RBKP SKA1 KNB1 LFB1 BUT0 ACDOCA MAKT MBEW T001
                ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ------ ---- ---- ----
AP.AI            .   ##    .   ##    .    .    .    .    .    .    .   ##   ##   #.   ##   ##   ##    .    .   ##    .    .      .    .    .
O2C.AI           .    .   ##    .    .    .   ##   ##   ##   ##   ##    .    .   ##    .    .    .    .   ##    .    .    .      .    .    .
STOX.AI         ##   ##    .    .   ##   ##    .    .    .    .    .    .    .    .   ##    .    .    .    .    .    .    .     ##   ##    .
ORDLY.AI        ##    .   ##    .   ##    .   ##    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .     ##    .    .
MARGEN.AI        .    .    .    .    .    .    .    .    .   ##    .    .    .    .    .    .    .    .    .    .    .   ##      .   ##   ##
MASTER.AI(GL)    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .   ##    .    .    .    .      .    .   ##
MASTER.AI(BP)    .    .   ##   ##    .    .    .    .    .    .    .    .    .    .    .    .    .    .   ##   ##   ##    .      .    .    .
PROCESS.AI       .    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .    .      .    .    .
TRAXX.AI         .    .    .    .    .    .    .   ##    .    .    .    .    .    .    .    .    .    .    .    .    .    .      .    .    .

## = primary dependency    #. = secondary    . = not used
(PROCESS.AI uses CDHDR/CDPOS only - not shown in grid)
(TRAXX.AI uses LIKP for shipment/delivery tracking)
```

#### ERPBRIDGE Sync Strategies

| Strategy | Tables | Frequency | Mechanism |
|----------|--------|-----------|-----------|
| **Real-time on demand** | MARD, KONV | Per request | RFC call, no cache or 15min TTL |
| **Delta via change docs** | MARA, EKKO/EKPO, VBAK/VBAP, KNA1, LFA1, MARC, etc. | Every 1-4h | Poll CDHDR/CDPOS for changes since last sync, fetch changed records |
| **Full sync** | T001, T001W, MAKT, SKA1, SKAT, BUT000 | Weekly or on-upload | Full table extract, rarely changes |
| **BigQuery pipeline** | ACDOCA | Daily | Full/delta extract -> BigQuery staging -> MARGEN analytics |
| **Continuous poll** | CDHDR/CDPOS | Every 60s | ERPBRIDGE change poller, feeds PROCESS.AI event logs |

#### ERPBRIDGE Directory Structure

```
erpbridge/
+-- connectors/
|   +-- sap_rfc_client.py        # PyRFC for RFC/BAPI calls
|   +-- sap_idoc_handler.py      # IDoc inbound/outbound
|   +-- sap_odata_client.py      # OData for S/4HANA Cloud
+-- mappers/
|   +-- material_mapper.py       # SAP <-> MANTRIX field mapping
|   +-- order_mapper.py          # VBAK/VBAP <-> internal models
|   +-- invoice_mapper.py        # RBKP/RSEG <-> ap_invoices
|   +-- vendor_mapper.py         # LFA1/LFB1 <-> vendor model
|   +-- gl_mapper.py             # SKA1/SKB1 <-> gl_mappings
+-- queues/
|   +-- change_poller.py         # Poll SAP change docs (CDHDR/CDPOS)
|   +-- writeback_queue.py       # Async writeback to SAP (MIRO, VA01, etc.)
|   +-- sync_scheduler.py        # Periodic full/delta sync
+-- api/
|   +-- read_routes.py           # GET endpoints for SAP data reads
|   +-- write_routes.py          # POST endpoints for SAP postings
|   +-- sync_routes.py           # Trigger/status of sync jobs
+-- config/
    +-- sap_connections.py       # RFC destinations, credentials
```

#### ERPBRIDGE Key APIs

```
GET  /erpbridge/v1/read/{table}?filters={}     # Read SAP table
POST /erpbridge/v1/execute/{bapi}               # Execute BAPI
POST /erpbridge/v1/writeback                    # Queue writeback
GET  /erpbridge/v1/sync/status                  # Sync job status
POST /erpbridge/v1/sync/trigger/{entity}        # Trigger sync
GET  /erpbridge/v1/changes/poll                 # Poll change docs
```

### 3C. PRISM AI — Agent Orchestration Engine (new)

**Role**: The brain — orchestrates all agents, manages memory, tracks learning
**Tier split**: 60% Tier 1 (scheduling, routing, lifecycle), 25% Tier 2 (scoring, classification), 15% Tier 3 (planning, reasoning)

#### PRISM AI Directory Structure

```
prism-ai/
+-- orchestrator/
|   +-- meta_orchestrator.py     # Top-level request router
|   +-- task_decomposer.py       # Break complex tasks into sub-tasks (Tier 3)
|   +-- agent_router.py          # Route tasks to appropriate agents (Tier 1 rules + Tier 2 intent)
|   +-- execution_engine.py      # Execute agent DAGs, handle dependencies
+-- registry/
|   +-- agent_registry.py        # Register/discover/version agents
|   +-- tool_registry.py         # Centralized tool catalog
|   +-- capability_index.py      # What can each agent do? (vector-indexed)
|   +-- agent_templates.py       # 50+ pre-built agent templates
+-- memory/
|   +-- memory_manager.py        # Unified memory facade
|   +-- short_term_memory.py     # Redis: conversation context, working set (TTL: session)
|   +-- episodic_memory.py       # MongoDB: past interactions, decisions, outcomes
|   +-- semantic_memory.py       # Weaviate: domain knowledge, entity embeddings
|   +-- procedural_memory.py     # PostgreSQL: learned workflows, patterns, policies
|   +-- memory_consolidation.py  # Background: promote STM -> LTM based on importance
+-- learning/
|   +-- feedback_collector.py    # Capture user approvals/rejections/corrections
|   +-- outcome_tracker.py       # Track: was the agent's decision correct?
|   +-- reward_calculator.py     # Calculate reward signals from outcomes
|   +-- weight_adjuster.py       # Update strategy weights (e.g., AP matching weights)
|   +-- pattern_learner.py       # Extract recurring patterns from episodic memory (Tier 2)
|   +-- ab_tester.py             # A/B test agent approaches
+-- scheduler/
|   +-- agent_scheduler.py       # Cron-like scheduling (extends PulseScheduler)
|   +-- event_bus.py             # Event-driven agent triggers
|   +-- priority_queue.py        # Agent execution priority
+-- monitoring/
|   +-- agent_health.py          # Agent status, uptime, error rates
|   +-- cost_tracker.py          # LLM token usage per agent/user/module
|   +-- performance_metrics.py   # Latency, accuracy, throughput per agent
|   +-- elk_logger.py            # Structured logging -> Logstash
+-- api/
    +-- orchestrator_routes.py   # Submit tasks, check status
    +-- agent_routes.py          # CRUD agents, templates, versions
    +-- memory_routes.py         # Query/manage agent memories
    +-- learning_routes.py       # Feedback, metrics, A/B tests
    +-- monitoring_routes.py     # Health, costs, performance
```

#### PRISM AI Key APIs

```
# Orchestration
POST /prism/v1/tasks/submit                       # Submit task for agent processing
GET  /prism/v1/tasks/{id}/status                   # Task execution status
POST /prism/v1/tasks/{id}/cancel                   # Cancel running task

# Agent Registry
GET  /prism/v1/agents                              # List all agents
POST /prism/v1/agents                              # Register new agent
GET  /prism/v1/agents/{id}                         # Agent details + performance
PUT  /prism/v1/agents/{id}/toggle                  # Enable/disable
GET  /prism/v1/agents/capabilities?q={}            # Search by capability

# Memory
GET  /prism/v1/memory/{agent_id}/episodic          # Past decisions for agent
GET  /prism/v1/memory/{agent_id}/learned-patterns  # Extracted patterns
POST /prism/v1/memory/consolidate                  # Trigger STM->LTM promotion

# Learning
POST /prism/v1/feedback                            # Submit feedback on agent decision
GET  /prism/v1/learning/{agent_id}/metrics         # Accuracy, reward over time
GET  /prism/v1/learning/ab-tests                   # Active A/B tests

# Monitoring
GET  /prism/v1/monitoring/health                   # All agent health
GET  /prism/v1/monitoring/costs                    # LLM cost breakdown
GET  /prism/v1/monitoring/performance              # Agent performance dashboard
```

### 3D. AXIS AI — Unified Conversation Interface (reimagined)

**Role**: Single conversation entry point for the entire platform
**Tier split**: 30% Tier 1 (routing, caching, formatting), 20% Tier 2 (intent classification, cache lookup), 50% Tier 3 (LLM conversation)

#### AXIS AI Directory Structure

```
axis-ai/
+-- conversation/
|   +-- conversation_manager.py  # Session management, context window
|   +-- intent_router.py         # Classify intent -> module/agent (Tier 2: fastText)
|   +-- context_builder.py       # Build context from STM + relevant LTM
|   +-- response_formatter.py    # Format agent results for chat display
+-- cache/
|   +-- query_cache.py           # Cache frequent queries (Tier 1: Redis)
|   +-- embedding_cache.py       # Cache query embeddings for similarity match
|   +-- response_cache.py        # Cache LLM responses for identical intents
+-- gateway/
|   +-- llm_gateway.py           # Route to Claude with cost tracking
|   +-- tier_selector.py         # Decide: can this be answered without LLM?
|   +-- streaming_handler.py     # SSE streaming for real-time responses
+-- personas/
|   +-- core_ai.py               # "I'm your operational analyst"
|   +-- finance_ai.py            # "I'm your CFO advisor"
|   +-- supply_ai.py             # "I'm your supply chain expert"
|   +-- executive_ai.py          # "I'm your executive briefing assistant"
+-- api/
    +-- chat_routes.py           # POST /axis/v1/chat, GET /axis/v1/history
    +-- context_routes.py        # GET /axis/v1/context/{session}
    +-- persona_routes.py        # GET /axis/v1/personas
```

#### AXIS AI Cost-Saving Pattern

```
User: "What is my current DSO?"
  1. intent_router classifies -> "o2c.dso.current" (Tier 2: fastText, $0)
  2. tier_selector checks -> deterministic query, no LLM needed
  3. Routes to MANTRIX GET /api/v1/o2c/dashboard/kpis (Tier 1, $0)
  4. response_formatter wraps result in conversational template
  Total cost: $0

User: "Why did DSO increase and what should we do about it?"
  1. intent_router classifies -> "o2c.dso.analysis" (Tier 2, $0)
  2. tier_selector checks -> requires reasoning, LLM needed
  3. context_builder pulls DSO history, customer data from STM+LTM
  4. llm_gateway sends to Claude with context (Tier 3, ~$0.05)
  5. Response streamed back
  Total cost: ~$0.05
```

---

## 4. Agent Memory System

### 4A. Short-Term Memory (STM) — Redis

**TTL**: Session-scoped (expires after 30min inactivity)
**Cost**: Tier 1 (infrastructure only)

```
Key Structure:
  stm:{agent_id}:{session_id}:context     -> Current conversation context
  stm:{agent_id}:{session_id}:working_set -> Data retrieved this session
  stm:{agent_id}:{session_id}:plan        -> Current execution plan
  stm:{agent_id}:{session_id}:results     -> Intermediate results
  stm:{user_id}:preferences               -> User's recent preferences (TTL: 24h)
```

### 4B. Long-Term Memory — Episodic (MongoDB)

**Retention**: Permanent (with compaction)
**Cost**: Tier 1 (storage only)

```javascript
// Collection: agent_episodes
{
  agent_id: "ap-matching-agent",
  episode_type: "decision",          // decision | observation | interaction
  timestamp: ISODate("2026-02-07"),
  context: {
    invoice_id: "INV-2026-045233",
    vendor: "Lockheed Martin",
    amount: 312500,
    exception_type: "price_variance"
  },
  decision: "recommended_approve",
  reasoning: "Contract escalation clause KONV ZPR0 allows 3.2% increase",
  outcome: "user_approved",          // user_approved | user_rejected | user_modified
  reward: 1.0,                       // 1.0 = correct, 0.0 = wrong, 0.5 = partial
  learned_pattern: "lockheed_price_escalation_q1",
  tags: ["ap", "price_variance", "contract_escalation"]
}
```

### 4C. Long-Term Memory — Semantic (Weaviate)

**Purpose**: Vector-indexed domain knowledge for similarity search
**Cost**: Tier 2 (self-hosted embeddings via sentence-transformers)

```
Classes:

  AgentKnowledge:
    - content (text)           # The knowledge item
    - source (text)            # Where it came from
    - domain (text)            # Module: ap, o2c, stox, etc.
    - agent_id (text)          # Which agent learned this
    - confidence (number)      # How reliable
    - usage_count (int)        # How often retrieved
    - last_used (date)         # For decay/pruning

  EntityEmbedding:
    - entity_type (text)       # vendor, customer, material, account
    - entity_id (text)
    - description (text)       # Embedded description
    - attributes (text)        # JSON of key attributes
```

### 4D. Long-Term Memory — Procedural (PostgreSQL)

**Purpose**: Learned workflows, successful patterns, policies
**Cost**: Tier 1 (just SQL tables)

```sql
CREATE TABLE agent_procedures (
  id SERIAL PRIMARY KEY,
  agent_id VARCHAR(100),
  pattern_name VARCHAR(200),
  trigger_condition JSONB,      -- When to apply this pattern
  action_sequence JSONB,        -- Steps to execute
  success_rate DECIMAL(5,4),    -- Historical success rate
  times_used INT DEFAULT 0,
  last_used TIMESTAMP,
  learned_from TEXT,            -- Episode IDs that taught this
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE agent_strategy_weights (
  id SERIAL PRIMARY KEY,
  agent_id VARCHAR(100),
  strategy_name VARCHAR(100),   -- e.g., "key_based_matching"
  weight DECIMAL(5,4),          -- Current weight (adjusted by RL)
  baseline_weight DECIMAL(5,4), -- Original weight
  adjustment_count INT DEFAULT 0,
  last_adjusted TIMESTAMP,
  performance_history JSONB     -- [{date, accuracy, reward}]
);
```

### 4E. Reinforcement Learning Loop

```
+--------------+     +---------------+     +--------------+
|  Agent makes |---->|  User provides|---->|  Reward      |
|  decision    |     |  feedback     |     |  calculated  |
+--------------+     +---------------+     +------+-------+
                                                  |
+--------------+     +---------------+            |
|  Weights     |<----|  Pattern      |<-----------+
|  updated     |     |  extracted    |
+--------------+     +---------------+
```

**Feedback signals** (all Tier 1 — just database writes):

| Signal | Reward | Source |
|--------|--------|--------|
| User approves agent recommendation | +1.0 | Button click |
| User rejects agent recommendation | -1.0 | Button click |
| User modifies agent output | +0.3 | Edit tracked |
| Agent prediction matches actual outcome | +1.0 | Outcome comparison |
| Agent prediction misses | -0.5 | Outcome comparison |
| User asks follow-up (engaged) | +0.2 | Conversation flow |
| User abandons (disengaged) | -0.3 | Session timeout |

**Weight adjustment** (Tier 1 — simple exponential moving average):

```
new_weight = alpha * reward + (1 - alpha) * old_weight
where alpha = learning_rate (default 0.05)
```

**Pattern extraction** (Tier 2 — periodic batch job):
- Every 24h, scan episodic memory for recurring decision patterns
- Cluster similar decisions using self-hosted embeddings
- Extract rules from high-reward clusters
- Store as procedural memory entries

---

## 5. Agent Hierarchy

```
                    +---------------------+
                    |  META-ORCHESTRATOR   |  (PRISM AI)
                    |  Routes, decomposes, |
                    |  monitors all agents |
                    +----------+----------+
                               |
        +----------+-----------+-----------+----------+
        |          |           |           |          |
   +----v----+ +---v----+ +---v----+ +---v----+ +---v----+
   | STOX    | | MARGEN | | AP     | | O2C    | | ORDLY  |  ...
   | Domain  | | Domain | | Domain | | Domain | | Domain |
   | Orch.   | | Orch.  | | Orch.  | | Orch.  | | Orch.  |
   +----+----+ +---+----+ +---+----+ +---+----+ +---+----+
        |          |           |           |          |
   +----v----+     |      +---v----+      |          |
   |Forecast |     |      |Match   |      |          |
   |Agent    |     |      |Engine  |      |          |
   |(Tier 2) |     |      |Agent   |      |          |
   +---------+     |      |(T1+T2) |      |          |
   |Safety   |     |      +--------+      |          |
   |Stock    |     |      |Invoice |      |          |
   |Agent    |     |      |Scanner |      |          |
   |(Tier 2) |     |      |(T2+T3) |      |          |
   +---------+     |      +--------+      |          |
   |Reorder  |     |      |Queue   |      |          |
   |Agent    |     |      |Priorit.|      |          |
   |(Tier 1) |     |      |(Tier 1)|      |          |
   +---------+     |      +--------+      |          |
                   |                      |          |
              +----v-----+          +----v-----+    |
              |Margin    |          |DSO       |    |
              |Analyst   |          |Predictor |    |
              |(Tier 3)  |          |(Tier 2)  |    |
              +----------+          +----------+    |
              |RFM Agent |          |Payment   |    |
              |(Tier 2)  |          |Scorer    |    |
              +----------+          |(Tier 2)  |    |
                                    +----------+    |
                                               +----v-----+
                                               |Intent    |
                                               |Parser    |
                                               |(T2+T3)   |
                                               +----------+
                                               |SKU Agent |
                                               |(Tier 1)  |
                                               +----------+
```

### Agent Types by Tier

**Tier 1 Agents** (rule-based, zero AI cost):
- Reorder Point Agent — triggers when stock < ROP
- Queue Prioritization Agent — 4-factor weighted scoring
- Approval Workflow Agent — delegation rules, SOX compliance
- Status Tracker Agent — event-driven state machine
- Batch Posting Agent — collect, validate, post
- Data Sync Agent — poll ERPBRIDGE for changes

**Tier 2 Agents** (self-hosted ML, compute-only):
- Demand Forecast Agent — Prophet/statsforecast
- Safety Stock Optimizer — statistical optimization
- Anomaly Detection Agent — Isolation Forest
- Entity Resolution Agent — rapidfuzz + clustering
- DSO Predictor Agent — gradient boosting
- Intent Classifier Agent — fastText
- RFM Segmentation Agent — K-means clustering
- Duplicate Detection Agent — MinHash + LSH

**Tier 3 Agents** (LLM-powered, per-token cost):
- Conversation Agent (AXIS AI) — multi-turn dialog
- Deep Research Agent — multi-step analysis
- Explanation Agent — variance/exception narratives
- Planning Agent — task decomposition
- Margin Analyst Agent — complex financial reasoning
- Invoice Understanding Agent — document comprehension

---

## 6. ELK Monitoring Stack

### Infrastructure

```yaml
# docker-compose additions
elasticsearch:
  image: elasticsearch:8.12.0
  ports: ["9200:9200"]
  environment:
    - discovery.type=single-node
    - xpack.security.enabled=false
  volumes:
    - es_data:/usr/share/elasticsearch/data

logstash:
  image: logstash:8.12.0
  ports: ["5044:5044"]
  volumes:
    - ./elk/logstash.conf:/usr/share/logstash/pipeline/logstash.conf
  depends_on: [elasticsearch]

kibana:
  image: kibana:8.12.0
  ports: ["5601:5601"]
  depends_on: [elasticsearch]
```

### Log Schema (all 4 apps use same structure)

```json
{
  "timestamp": "2026-02-07T14:23:45.123Z",
  "app": "mantrix | prism | axis | erpbridge",
  "level": "INFO | WARN | ERROR | DEBUG",
  "module": "ap | stox | margen | ordly | ...",
  "agent_id": "ap-matching-agent-v2",
  "session_id": "sess-abc123",
  "user_id": "user-001",
  "event_type": "agent_execution | api_call | llm_call | sap_read | sap_write | feedback | error",
  "tier": "1 | 2 | 3",
  "duration_ms": 245,
  "tokens_used": 1500,
  "cost_usd": 0.0045,
  "details": { }
}
```

### Kibana Dashboards

1. **Platform Overview** — Request volume, error rates, latency across all 4 apps
2. **Agent Observatory** — Agent executions, success rates, decision outcomes
3. **Cost Dashboard** — LLM token usage by agent/module/user, daily/weekly trends
4. **SAP Bridge Monitor** — ERPBRIDGE read/write volumes, sync status, errors
5. **Conversation Analytics** — AXIS AI usage, query types, cache hit rates
6. **Memory Utilization** — STM size, LTM growth, consolidation metrics
7. **Learning Progress** — Agent accuracy trends, weight adjustments, A/B test results

---

## 7. Data Flow: End-to-End Example

### Example: User asks "Why is Lockheed Martin's invoice flagged?"

```
1. AXIS AI receives chat message
   -> intent_router (Tier 2: fastText) -> classifies as "ap.exception.explain"
   -> tier_selector -> requires reasoning -> Tier 3 needed

2. AXIS AI -> PRISM AI: submit task "explain AP exception for Lockheed invoice"
   -> meta_orchestrator decomposes:
     Sub-task 1: Retrieve invoice data (Tier 1)
     Sub-task 2: Retrieve PO/GR data (Tier 1)
     Sub-task 3: Check agent memory for similar cases (Tier 1)
     Sub-task 4: Generate explanation (Tier 3)

3. PRISM AI -> AP Domain Orchestrator
   -> Match Engine Agent retrieves invoice INV-2026-045233 from MANTRIX
   -> MANTRIX calls ERPBRIDGE to get latest EKPO/EKBE data from SAP
   -> ERPBRIDGE returns PO line + GR history

4. PRISM AI Memory Manager checks episodic memory
   -> Finds 3 prior Lockheed price variance episodes
   -> All 3 were approved (contract escalation)

5. PRISM AI -> Explanation Agent (Tier 3: Claude)
   -> Context: invoice data + PO data + 3 prior episodes + contract clause
   -> Claude generates: "This $312,500 invoice shows a 3.2% price variance
     from PO 4500012345. This matches the KONV ZPR0 escalation clause.
     3 similar Lockheed invoices were approved in the past 6 months.
     Recommendation: Approve."

6. AXIS AI streams response to user
   -> ELK logs: {app: "axis", tier: 3, tokens: 800, cost: $0.024}

7. User clicks "Approve"
   -> PRISM AI feedback_collector records: reward = 1.0
   -> Episodic memory stores new episode
   -> weight_adjuster: "contract_escalation" strategy weight +0.05
```

---

## 8. MANTRIX Backend Completion (Gap Analysis)

These files need to be created within the existing `backend/src/` to complete the MANTRIX platform before layering on the agentic architecture.

### Service Files to Create (`backend/src/core/`)

| File | Module | Tier | Endpoints Served | Key Responsibilities |
|------|--------|------|-----------------|---------------------|
| `ap_service.py` | AP.AI | T1+T2 | ~22 | Invoice matching (6 strategies), guardrails (9 rules), queue prioritization (4-factor), batch posting, vendor reliability scoring, exception taxonomy |
| `o2c_service.py` | O2C.AI | T1 | ~15 | Executive dashboard KPIs, DSO heatmap, AR aging buckets, document flow variants, customer segmentation, payment behavior, transaction search |
| `traxx_service.py` | TRAXX.AI | T1 | ~17 | Kit lifecycle management, IoT telemetry, surgery readiness, logistics economics, freight variance, action queue, margin waterfall |
| `masterdata_service.py` | MASTER.AI | T1+T2 | ~20 | GL.AI: account mapping + field recommendations + issues. BP.AI: cluster detection + entity resolution + duplicate detection + data quality |
| `supply_chain_service.py` | Supply Chain Map | T1 | ~13 | Trucks CRUD, stores CRUD, alerts CRUD, AI agent management, seed data |
| `stox_extended_service.py` | STOX.AI extensions | T1+T2 | ~50 | Distribution (demand variability, supply signals, MRP advisor), Lam Research (7 tiles), working capital (CFO rollup, cash release), what-if simulator |
| `axis_service.py` | AXIS.AI | T1+T2 | ~6 | Forecast generation (Prophet), scenario simulation (Monte Carlo), budget variance, driver analysis, AI recommendations |

### Route Files to Create (`backend/src/api/`)

| File | Prefix | Endpoints | Pattern |
|------|--------|-----------|---------|
| `ap_routes.py` | `/api/v1/ap` | 22 | `APIRouter(prefix="/api/v1/ap", tags=["ap-ai"])` |
| `o2c_routes.py` | `/api/v1/o2c` | 15 | `APIRouter(prefix="/api/v1/o2c", tags=["o2c-ai"])` |
| `traxx_routes.py` | `/api/v1/traxx` | 17 | `APIRouter(prefix="/api/v1/traxx", tags=["traxx-ai"])` |
| `masterdata_routes.py` | `/api/v1/masterdata` | 20 | `APIRouter(prefix="/api/v1/masterdata", tags=["master-ai"])` |
| `supply_chain_routes.py` | `/api/v1` | 13 | `APIRouter(prefix="/api/v1", tags=["supply-chain"])` |
| `stox_extended_routes.py` | `/api/v1/stox` | 50 | `APIRouter(prefix="/api/v1/stox", tags=["stox-extended"])` |
| `axis_routes.py` | `/api/v1/axis` | 6 | `APIRouter(prefix="/api/v1/axis", tags=["axis-ai"])` |
| `search_routes.py` | `/api/v1/search` | 1 | Weaviate cross-module semantic search |
| `auth_routes.py` | `/api/v1/auth` | 3 | Clerk JWT validation |
| `chat_service_routes.py` | `/api/v1/chat` | 3 | Unified chat (MongoDB + Claude) |

### Migration Files to Create (`db/migrations/`)

| File | Tables | Module |
|------|--------|--------|
| `006_create_ap_tables.sql` | `ap_invoices`, `ap_invoice_lines`, `ap_po_headers`, `ap_po_lines`, `ap_match_results`, `ap_exceptions`, `ap_batch_postings`, `ap_vendor_reliability`, `ap_override_log` | AP.AI |
| `007_create_o2c_tables.sql` | `o2c_sales_orders`, `o2c_deliveries`, `o2c_billing_docs`, `o2c_payments`, `o2c_customers` | O2C.AI |
| `008_create_traxx_tables.sql` | `traxx_kits`, `traxx_kit_components`, `traxx_kit_telemetry`, `traxx_orders`, `traxx_shipments`, `traxx_surgeries`, `traxx_actions` | TRAXX.AI |
| `009_create_masterdata_tables.sql` | `md_gl_mappings`, `md_gl_field_recommendations`, `md_bp_clusters`, `md_bp_field_recommendations`, `md_data_quality_issues` | MASTER.AI |
| `010_create_supply_chain_tables.sql` | `sc_trucks`, `sc_stores`, `sc_alerts`, `sc_agents` | Supply Chain |
| `011_create_agent_memory_tables.sql` | `agent_procedures`, `agent_strategy_weights`, `agent_feedback`, `agent_episodes_pg` | PRISM AI |

### main.py Registration

```python
# New router imports needed
from .api.ap_routes import router as ap_router
from .api.o2c_routes import router as o2c_router
from .api.traxx_routes import router as traxx_router
from .api.masterdata_routes import router as masterdata_router
from .api.supply_chain_routes import router as supply_chain_router
from .api.stox_extended_routes import router as stox_extended_router
from .api.axis_routes import router as axis_router
from .api.search_routes import router as search_router
from .api.auth_routes import router as auth_router
from .api.chat_service_routes import router as chat_service_router

# Register
app.include_router(ap_router)
app.include_router(o2c_router)
app.include_router(traxx_router)
app.include_router(masterdata_router)
app.include_router(supply_chain_router)
app.include_router(stox_extended_router)
app.include_router(axis_router)
app.include_router(search_router)
app.include_router(auth_router)
app.include_router(chat_service_router)
```

### Tier Classification per Endpoint Group

| Module | Tier 1 (rules/SQL) | Tier 2 (self-hosted ML) | Tier 3 (LLM) |
|--------|-------------------|------------------------|---------------|
| AP.AI | Queue CRUD, batch posting, guardrail checks, status tracking | Duplicate detection (MinHash), line matching (semantic), anomaly scoring | Variance explanation, exception narrative |
| O2C.AI | Dashboard KPIs, AR aging, document flow, transaction search | DSO prediction (gradient boosting), payment scoring | Customer churn reasoning |
| TRAXX.AI | Kit CRUD, telemetry read, action queue, shipment tracking | Surgery readiness scoring, freight optimization | — |
| MASTER.AI | Mapping CRUD, approval workflow, issue tracking, export | GL semantic matching (embeddings), BP entity resolution (rapidfuzz) | Field recommendation rationale |
| Supply Chain | Trucks/stores/alerts CRUD, seed data | — | Agent chat responses |
| STOX Extended | Capital metrics, MRP parameters, SAP data hub, ticket CRUD | Demand forecasting (Prophet), safety stock optimization, what-if simulation | — |
| AXIS.AI | Dashboard tiles, budget tables | Forecast generation (Prophet), scenario simulation | AI insight generation |

---

## 9. Deployment Model

**Separate repositories** — each app is independently deployable:

| Repo | Stack | Port | Databases |
|------|-------|------|-----------|
| `mantrix-unified-demo` | React + FastAPI | 3000 (FE) / 8000 (BE) | PostgreSQL, BigQuery, MongoDB, Weaviate, Neo4j, Redis, Fuseki |
| `erpbridge` | FastAPI | 8001 | PostgreSQL (sync state), Redis (queue) |
| `prism-ai` | FastAPI | 8002 | PostgreSQL (registry, procedures), MongoDB (episodes), Weaviate (knowledge), Redis (STM) |
| `axis-ai` | React + FastAPI | 3001 (FE) / 8003 (BE) | MongoDB (conversations), Redis (cache) |
| ELK stack | Elasticsearch + Logstash + Kibana | 9200 / 5044 / 5601 | Elasticsearch |

**Shared schemas** published as a Python package (`mantrix-schemas`) containing Pydantic models for inter-app communication.

---

## 10. Implementation Phases

### Phase 0 — Architecture Document + MANTRIX Backend Completion (Week 1-3)

**Deliverable**: `AGENTIC_ARCHITECTURE.md` + all remaining MANTRIX backend files

- [ ] Create `AGENTIC_ARCHITECTURE.md` in project root (this document)
- [ ] Create 7 service files + 10 route files + 6 migration files (Section 8)
- [ ] Register all new routers in `main.py`
- [ ] Verify: `uvicorn src.main:app` starts, all new endpoints respond
- [ ] Define shared message schemas (inter-app Pydantic models)

### Phase 1 — PRISM AI Core (Week 4-6)

**Deliverable**: Agent registry, memory system, basic orchestration

- [ ] Agent Registry (register, discover, version agents)
- [ ] Memory Manager (STM via Redis, Episodic via MongoDB, Semantic via Weaviate, Procedural via PostgreSQL)
- [ ] Meta-Orchestrator (task submission, routing, status tracking)
- [ ] Feedback Collector (capture approve/reject/modify signals)
- [ ] Migrate existing PulseMonitorService + PulseScheduler into PRISM
- [ ] Migrate existing ClaudeAgentSDK + financial agents into PRISM registry
- [ ] ELK logger integration (structlog -> Logstash)
- [ ] Cost tracker (token counting per agent)

### Phase 2 — ERPBRIDGE (Week 7-8)

**Deliverable**: SAP connector with read/write/sync capabilities

- [ ] SAP RFC client (PyRFC wrapper)
- [ ] Field mappers for key tables (EKKO, EKPO, VBAK, LFA1, SKA1, etc.)
- [ ] Change document poller (CDHDR/CDPOS)
- [ ] Writeback queue (async SAP postings)
- [ ] API routes (read, write, sync)
- [ ] ELK logging for all SAP interactions

### Phase 3 — AXIS AI (Week 9-11)

**Deliverable**: Unified conversation interface

- [ ] Intent Router (fastText-based, Tier 2)
- [ ] Tier Selector (decide: Tier 1 response vs Tier 3 LLM)
- [ ] Conversation Manager (session, context, history)
- [ ] Context Builder (STM + LTM retrieval)
- [ ] LLM Gateway (Claude with cost tracking)
- [ ] Query Cache (Redis, embedding-based similarity)
- [ ] Response Formatter (charts, tables, narrative)
- [ ] Streaming handler (SSE for real-time)
- [ ] Migrate existing chat interfaces (AskMargen, ORDLY intent, TRAXX chat) as AXIS personas

### Phase 4 — Domain Agents (Week 12-15)

**Deliverable**: All 9 modules wrapped as PRISM-managed agents

- [ ] AP.AI agents: Match Engine, Invoice Scanner, Queue Prioritizer, Batch Poster
- [ ] STOX.AI agents: Demand Forecaster, Safety Stock Optimizer, Reorder Agent, Shortage Detector
- [ ] MARGEN.AI agents: Margin Analyst, RFM Segmenter, Concentration Risk Monitor
- [ ] ORDLY.AI agents: Intent Parser, SKU Decisioner, Lead Time Predictor
- [ ] O2C.AI agents: DSO Predictor, Payment Scorer, Document Flow Tracker
- [ ] TRAXX.AI agents: Kit Tracker, Surgery Readiness Scorer, Freight Optimizer
- [ ] MASTER.AI agents: GL Matcher, BP Entity Resolver, Duplicate Detector
- [ ] PROCESS.AI agents: Process Discoverer, Conformance Checker
- [ ] Supply Chain agents: Route Optimizer, Demand Forecaster

### Phase 5 — Reinforcement Learning (Week 16-17)

**Deliverable**: Agents that learn and improve

- [ ] Outcome tracker (was the decision correct after the fact?)
- [ ] Reward calculator (feedback -> reward signal)
- [ ] Weight adjuster (EMA-based strategy weight tuning)
- [ ] Pattern learner (batch: episodic -> procedural memory promotion)
- [ ] A/B tester (compare agent versions)
- [ ] Memory consolidation (STM -> LTM background job)
- [ ] Kibana learning dashboards

### Phase 6 — Production Hardening (Week 18-20)

- [ ] Rate limiting & circuit breakers
- [ ] Agent fallbacks (if Tier 3 fails, degrade to Tier 2/1)
- [ ] Cost budgets per user/module (daily LLM spend caps)
- [ ] Load testing across all 4 apps
- [ ] Security audit (inter-app auth, SAP credentials)
- [ ] Kibana alert rules (error spikes, cost anomalies, agent failures)

---

## 11. Existing Code to Reuse

| Existing Asset | Location | Reuse In |
|---------------|----------|----------|
| ClaudeAgentSDK | `backend/src/agents/claude_agent_sdk.py` | PRISM AI agent framework base |
| DeepResearchOrchestrator | `backend/src/agents/orchestrator.py` | PRISM AI meta-orchestrator pattern |
| Financial Agents (5) | `backend/src/agents/financial_agents.py` | Register in PRISM as domain agents |
| PulseMonitorService | `backend/src/core/pulse_monitor_service.py` | PRISM AI scheduler foundation |
| PulseScheduler | `backend/src/core/pulse_scheduler.py` | PRISM AI scheduler |
| MargenChatService | `backend/src/core/margen_chat_service.py` | AXIS AI persona (finance) |
| LLMClient | `backend/src/core/llm_client.py` | AXIS AI LLM gateway |
| MongoDB Client | `backend/src/db/mongodb_client.py` | Episodic memory store |
| Weaviate Client | `backend/src/db/weaviate_client.py` | Semantic memory store |
| AgentCreationWizard | `frontend/.../pulse/AgentCreationWizard.jsx` | PRISM AI frontend |
| UnifiedChatInterface | `frontend/.../UnifiedChatInterface.jsx` | AXIS AI frontend base |
| 50+ agent templates | AgentCreationWizard categories | PRISM AI template library |

---

## 12. Verification Criteria

| Phase | Verification |
|-------|-------------|
| Each phase | All 4 apps start and respond to health checks |
| PRISM AI | Register agent -> execute task -> collect feedback -> verify memory stored |
| ERPBRIDGE | Read SAP table -> write back -> verify in SAP |
| AXIS AI | Submit query -> verify tier routing -> verify cost tracking |
| ELK | Verify logs from all 4 apps appear in Kibana |
| Memory | Verify STM->LTM consolidation after 24h |
| Learning | Verify agent weights adjust after 10+ feedback signals |
| Cost | Verify Tier 1/2 queries incur $0 LLM cost |
