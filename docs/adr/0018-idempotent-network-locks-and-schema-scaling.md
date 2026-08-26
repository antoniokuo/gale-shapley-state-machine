# 18. Idempotent Network Locks and Schema Scaling

Date: 2026-08-27

## Status

Accepted

## Context

During empirical data collection, two critical vulnerabilities emerged at the intersection of frontend reactivity and backend schema limits:

1. **The Reactivity Race Condition:** Human-computer interaction in the Vue DOM occasionally triggered phantom double-clicks that bypassed the 150ms motor-response floor. This resulted in duplicate `breakpointId` payloads entering the telemetry array, which subsequently violated PostgreSQL Unique Constraints and caused fatal transaction rollbacks.
2. **The SmallInt Ceiling:** The `latency_ms` column in Supabase was initially provisioned as an `int2` (smallint), which has a hard mathematical ceiling of `32,767`. When participants engaged in deep cognitive deliberation on complex matrix displacements (e.g., staring at the DAG for >33 seconds), their latency overflowed the `int2` limit. PostgreSQL ruthlessly rejected the entire batch array to protect the schema, resulting in silent data loss prior to the implementation of strict frontend alerts.

## Decision

We have enforced a strict defense-in-depth architecture across the state and database layers:

1. **State-Level Idempotency Lock:** Implemented an array-level validation check (`this.telemetryBuffer.some()`) in the Pinia store. This silently intercepts and drops duplicate `breakpointId` entries before they enter the buffer, preventing phantom UI clicks from polluting the network payload.
2. **Asynchronous UI Lock:** Injected `isTransitioning` boolean gates (`ref(false)`) across the Vue orchestrator. This physically locks the UI state during network dispatch, preventing users from spamming the submit button and triggering duplicate HTTP POST requests.
3. **Database Schema Scaling:** Migrated the `latency_ms` column in Supabase from `int2` to `int4` (integer). This expands the theoretical limit to ~24 days of milliseconds, easily accommodating extended cognitive deliberation times without triggering buffer overflows.

## Consequences

- **Positive:** Mathematically guarantees the elimination of `duplicate key value` database collisions.
- **Positive:** Protects valid, long-latency cognitive responses from being incinerated by backend integer limits.
- **Positive:** Demonstrates pragmatic, full-stack fault tolerance to hiring managers by bridging frontend state management with backend database administration.
- **Negative:** Slightly increases the verbosity of the Vue orchestrator component due to the implementation of explicit `try...finally` state locks.
