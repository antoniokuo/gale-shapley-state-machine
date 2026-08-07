# 1. UI State Machine Routing vs. URL Routing

Date: 2026-08-02

## Status

Accepted

## Context

The application requires a strict, linear progression of distinct views to execute the counterbalanced crossover HCI study protocol: Participant Information Sheet (PIS) -> Consent Gateway -> Pre-Task Training Orientation -> Task 1 (Static or Reactive) -> Survey 1 (NASA-TLX & SUS) -> Task 2 (Alternate Condition) -> Survey 2 (NASA-TLX & SUS) -> Unconstrained Sandbox -> Debrief. We must guarantee that participants cannot manipulate the client viewport or break the sequence execution mid-session.

## Decision

We reject standard URL-based routing (e.g., `vue-router`) in favour of a centralised Pinia state enum (`SessionPhase`) combined with strict Vue conditional component injection (`v-if` / `v-else-if`).

## Consequences

- **Positive:** Mathematically eliminates the risk of participants manually altering URL paths to bypass consent gateways, skip active simulation tasks, or corrupt latency metrics.
- **Positive:** Minimises JavaScript bundle overhead by stripping routing dependencies, optimising initial execution container speed.
- **Positive:** Enforces strict, deterministic linear sequence boundaries managed entirely by an unalterable global application store.
- **Negative:** Destroys standard browser "Back/Forward" history navigation hooks, which is desired operational behaviour to maintain a controlled, sandboxed testing environment.
