# Gale-Shapley State Machine

![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=flat-square&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript)
![Pinia](https://img.shields.io/badge/Pinia-4.0-FFE066?style=flat-square&logo=vue.js)
![Vitest](https://img.shields.io/badge/Vitest-4.1-729B1B?style=flat-square&logo=vitest)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python)
![Pandas](https://img.shields.io/badge/Pandas-2.2-150458?style=flat-square&logo=pandas)
[![CI Pipeline](https://github.com/antoniokuo/gale-shapley-state-machine/actions/workflows/ci.yml/badge.svg)](https://github.com/antoniokuo/gale-shapley-state-machine/actions/workflows/ci.yml)

**[Live Production Deployment](https://gale-shapley-state-machine.vercel.app)**

A deterministic, DAG-reactive state machine engineered to visualise and execute bipartite market matching (Hospital-Residents / Gale-Shapley algorithm). Built to enforce O(1) memory lookups, strict state isolation, and offline-first fault tolerance for empirical telemetry collection.

[View System Architecture Demo](https://github.com/user-attachments/assets/48e039ca-5208-4907-ab99-fb940ab65d2b)

## Operational Context & Institutional Compliance

Developed as an MSc Computer Science dissertation project at the University of Bath, this architecture was engineered under strict institutional research constraints to serve as the primary telemetry engine for a live Human-Computer Interaction (HCI) study.

- **Data Governance (UK GDPR):** Enforces strict participant anonymity via randomised UUID generation and Supabase Row Level Security (RLS) policies to comply with university ethics protocols.
- **Cryptographic Consent Routing:** The Vue application implements a strict initialisation gateway. Access to the core state machine is physically blocked by router guards until explicit user consent is registered via the Participant Information Sheet (PIS).
- **Empirical Telemetry Isolation:** Utilises high-resolution web APIs to isolate human cognitive processing latency from frontend reactive rendering cycles, capturing sub-second execution metrics across a 2x2 counterbalanced crossover protocol.

## System Architecture

The architecture decouples the pure algorithmic logic from the reactive presentation layer, guaranteeing mathematical determinism and robust UI state management.

- **Asynchronous Generator Engine:** The core algorithm operates as a standalone generator (`createGaleShapleyEngine`). It yields discrete transition events (`PROPOSE`, `ACCEPT`, `DISPLACE`, `BREAKPOINT`) chronologically, completely isolated from the DOM.
- **Deterministic State Ledger:** The Pinia store (`matchingStore.ts`) acts as the state orchestrator. It hydrates the data payload, precomputes the generator's full trajectory, and commits each matrix state into an immutable array (`MarketStateSnapshot[]`).
- **O(1) Data Structures:** Leverages inverted index matrices (`receiverInvertedRanks`) for constant-time complexity during micro-evaluations of receiver preferences, preventing O(N) iteration blocks during cascading rejections.
- **Recursive Tick Pipeline:** The UI is driven by an asynchronous playback loop utilising recursive `setTimeout` frames, guaranteeing thread-safe visual transitions (e.g., 800ms) without blocking the JavaScript main thread.
- **Deterministic ETL & Statistical Engine:** A standalone Python data pipeline (`pandas`, `scipy`) programmatically ingests raw Supabase telemetry. It executes strict `<150ms` hardware noise truncation, enforces $2 \times 2$ crossover sequence diagnostics (Mann-Whitney U), and automates non-parametric Holm-Bonferroni adjusted reporting assets, completely decoupling raw human data from the public git tree.

## Production Fault-Tolerance (ADRs)

Engineered for highly volatile networking environments and unpredictable human-computer interaction (HCI) during live telemetry collection.

- **Concurrency & Idempotency Locks:** Implemented array-level evaluation barriers (`telemetryBuffer.some()`) and `isTransitioning` UI locks. This intercepts phantom DOM double-clicks, strictly preventing duplicate payload collisions before they reach the network queue.
- **Dead-Letter Queues (DLQ):** Fallback offline-first ingestion wrapping Supabase POST requests. Network failures trigger a silent serialisation to a `localStorage` DLQ, preventing data degradation during transient connection drops.
- **Database Schema Scaling:** Migrated PostgreSQL telemetry schemas to `int4` to accommodate unbounded cognitive deliberation latencies, eliminating transaction rollbacks triggered by `int2` (smallint) buffer overflows.
- **Frontend Payload Sanitisation:** Enforces strict lower-bound floor constraints `(Math.max(1, Math.round(delta)))` prior to network dispatch, protecting the PostgreSQL database from zero-value bounds or floating-point anomalies.

## Automated Reporting Assets

The Python ETL pipeline automatically aggregates the sanitised telemetry and outputs publication-grade reporting assets, demonstrating full-cycle data engineering from frontend ingestion to backend statistical evaluation.

- **[Statistical Results Matrix (.tex)](docs/results/statistical_results.tex):** Automated generation of non-parametric $p$-values, $Z$-statistics, and Holm-Bonferroni alpha adjustments formatted for direct manuscript compilation.
- **[Primary Endpoint Visualisation (.pdf)](docs/results/mental_demand_boxplot.pdf):** Vector-based distribution graphics evaluating cognitive load shifts across the counterbalanced crossover protocol.

## Algorithmic Integration Validation

To guarantee the mathematical truth of the matching allocations, the system utilises **Vitest** for integration testing of the generator pipeline. Tests strictly mock the `DatasetPayload` interface and validate chronological `yield` sequences, ensuring capacity limits and cascading displacement edge cases process deterministically.

## Local Development

The repository operates a polyglot environment. The fronend is built strictly with modern tooling, utilising **Vite 8** for rapid Hot Module Replacement (HMR) and **Tailwind 3.4** for styling. The data pipeline relies on **Python 3.12**.

**Frontend Client (Vue 3 / TypeScript)**

```bash
# Install Node dependencies
npm install

# Spin up the Vite dev server
npm run dev

# Run algorithmic test suites
npm run test:unit
```

**ETL Pipeline & Statistical Engine (Python)**

```bash
# Install scientific computing and linting dependencies
pip install pandas scipy statsmodels seaborn matplotlib ruff

# Execute the nonparametric statistical pipeline
python scripts/etl/analysis.py

# Enforce Python hygiene (mirrors CI/CD gating)
ruff check scripts/etl/
```

## Tech Stack

- **Core:** `Vue 3.5` · `TypeScript 6` · `Pinia 4`
- **Tooling:** `Vite 8` · `Vitest 4` · `ESLint 10` · `Oxlint` · `Prettier`
- **Styling:** `Tailwind CSS 3.4` · `PostCSS`
- **Backend & Infrastructure:** Supabase 2 · Vercel Edge Network · GitHub Actions (CI/CD)
- **Data Engineering:** `Python 3` · `Pandas` · `SciPy` · `Statsmodels` · `Seaborn`
