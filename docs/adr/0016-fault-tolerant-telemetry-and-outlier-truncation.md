# 16. Fault-Tolerant Telemetry Ingestion and Outlier Truncation Pipeline

Date: 2026-08-13

## Status

Accepted

## Context

SOP Section 5 explicitly mandates that telemetry outlier truncation must occur prior to database dispatch. This requires a strict lower-bound floor constraint (`Math.max(1, Math.round(delta))`) and the programmatic rejection of any latency falling below human motor-response thresholds (100-250ms), flagging them as accidental hardware noise (e.g., double-clicks).

Concurrently, executing a live user study introduces the risk of network volatility (e.g., dropped University Wi-Fi connections). If a Supabase `fetch` payload fails silently at the end of a 20-minute session, the sample data is lost, directly threatening the strict $N=16$ sample size constraint.

## Decision

We will architect a fault-tolerant Supabase schema protected by a client-side Dead-Letter Queue (DLQ) and mathematical sanitisation hooks.

1. **Mathematical Sanitisation Protocol:** The frontend telemetry dispatcher will algorithmically filter latency spikes. Inputs registering under 150ms will be classified as hardware misfires and actively dropped from the payload queue before transmission, preserving statistical model integrity.
2. **Supabase Relational Schema:** The backend will utilise a two-table relational structure (`session_telemetry` and `psychometric_surveys`) linked exclusively via the randomised UUID. Row Level Security (RLS) policies will be enforced to guarantee absolute data anonymity under UK GDPR.
3. **Dead-Letter Queue (DLQ) Fallback:** The Supabase dispatch actions will be wrapped in a fault-tolerant retry wrapper. If network transmission fails, the JSON payload will be serialised to `localStorage`. The system will silently attempt to flush this queue upon connection restoration.

## Consequences

- **Positive:** Guarantees 100% compliance with SOP Section 5 data handling and outlier truncation protocols.
- **Positive:** The DLQ architecture prevents catastrophic sample degradation during transient network drops, safeguarding the statistical power of the within-subject crossover design.
- **Positive:** Exposing offline-first fault tolerance and DLQ implementation serves as an elite-tier technical showcase for systems engineering roles.
- **Negative:** Requires complex asynchronous retry logic within the Pinia store, increasing the debugging surface area for state persistence.
