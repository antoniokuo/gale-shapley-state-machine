# 5. Zero-Dependency ES6 Data Hydration

Date: 2026-08-04

## Status

Accepted

## Context

The application must ingest and bridge pre-computed JSON datasets (Zipfian asymmetric matrices) into the Pinia execution engine. Using third-party utility libraries (e.g., Lodash, Radash) for data parsing and object iteration introduces unnecessary dependency bloat, security auditing overhead, and marginal performance degradation.

## Decision

All data hydration, object key extraction, and dictionary mapping is executed strictly utilising native ES6+ V8 engine methods (e.g., `Object.keys()`, `Set`, explicit typecasting).

## Consequences

- **Positive:** Zero impact on the JavaScript bundle size, aligning with strict enterprise payload constraints.
- **Positive:** Direct V8 engine optimisation ensures parsing overhead during the critical rendering path is imperceptible.
- **Negative:** Requires rigorous TypeScript interface definitions to satisfy compiler strict null-checks during dynamic object key iteration.
