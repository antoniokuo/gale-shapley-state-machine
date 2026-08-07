# 10. Deterministic State History Ledger for Bidirectional Time-Travel

Date: 2026-08-07

## Status

Accepted

## Context

The SOP (Section 1.4) mandates that participants must have access to bidirectional time-travel controls (Step-Forward, Step-Backward) during the Sandbox Phase. However, the core Gale-Shapley matching algorithm executes via a unidirectional JavaScript Asynchronous Generator (ADR 0002). Generators cannot execute in reverse. If the UI binds directly to the live generator output, retroactive state traversal is mathematically impossible without entirely resetting and re-running the engine from tick zero.

## Decision

The application will implement a **Deterministic State History Ledger** within the Pinia store.

1. **Pre-computation & Caching:** Upon session initialisation, the generator fully executes the algorithm in the background. The Pinia store intercepts every yielded event and pushes a deep-cloned, immutable snapshot of the market state into a flat array (`stateLedger`).
2. **Pointer-Based Rendering:** The UI components are completely decoupled from the generator. They render strictly based on a reactive `tickIndex` pointer that queries the `stateLedger` array in $O(1)$ time.
3. **Time-Travel Mechanics:** Moving forward or backward in time is executed purely by incrementing or decrementing the `tickIndex` integer, swapping out the global UI state instantly.

## Consequences

- **Positive:** Mathematically guarantees absolute bidirectional time-travel capability with zero execution latency, perfectly satisfying the Sandbox Phase requirements.
- **Positive:** Mirrors enterprise Redux-style time-travel debugging architectures, demonstrating senior-level state management competency.
- **Positive:** Deep cloning ensures that retroactive array mutations cannot accidentally corrupt the historical states of the algorithm.
- **Negative:** Increases client-side RAM consumption. For a 16:4 grid yielding ~35 micro-steps, the memory footprint remains negligible, but this architecture would not scale infinitely without a garbage-collection strategy.
