# 9. Stateful Sequence Block Allocation and Serverless Telemetry Pipeline

Date: 2026-08-07

## Status

Accepted

## Context

The system must aggregate high-resolution latency telemetry ($T_{cognitive}$) and psychometric survey data (NASA-TLX, SUS) over an encrypted network connection. Furthermore, the SOP (Section 1.3) mandates strict counterbalanced sample balancing ($n_1 \ge 8, n_2 \ge 8$). Client-side deterministic allocation (e.g., UUID parity checks) is stateless and cannot track global participant attrition. If an assigned sequence block is abandoned or flagged as non-compliant (>20% outlier threshold), that sequence token must be recycled into the global active pool.

## Decision

The application will integrate Supabase (PostgreSQL BaaS) to handle persistent data ingestion and atomic state management.

1. **Atomic Allocation:** Sequence group allocation (AB vs. BA) is stripped from the client. Upon generating a UUID, the Vue client invokes a server-side Postgres RPC (Remote Procedure Call) that checks the active completion pool and issues the optimal sequence token to maintain strict global balance.
2. **Payload Dispatch:** To protect the $<200\text{ms}$ execution latency threshold, individual breakpoint predictions are cached in the Pinia store. Telemetry payloads are only dispatched to the database over HTTPS during Phase transitions (e.g., `TASK_1` $\rightarrow$ `SURVEY_1`), ensuring network I/O does not block the browser's main thread during the active matching simulation.

## Consequences

- **Positive:** Mathematically guarantees a balanced dataset. The server-side RPC prevents asymmetric attrition from destroying the $2\times2$ statistical power.
- **Positive:** Batching network requests to Phase boundaries eliminates network transmission jitter from the active UI event loop.
- **Positive:** Offloads GDPR compliance and PII-stripping to Postgres Row Level Security (RLS) policies, ensuring the frontend client cannot access or mutate historical data.
- **Negative:** Introduces an asynchronous network dependency at the session initialisation phase; if the initial RPC call fails, the client container must halt execution.
