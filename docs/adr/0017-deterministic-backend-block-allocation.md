# 17. Deterministic Backend Block Allocation

Date: 2026-08-13

## Status

Accepted

## Context

The methodological Standard Operating Procedure (SOP) mandates a strictly counterbalanced crossover protocol (2x2) with a target sample size of $N=16$ (8 AB sequences, 8 BA sequences). The protocol further dictates that if a session is abandoned prior to completion, the incomplete token must be invalidated and the sequence assignment recycled into the active pool.

Relying on client-side randomisation (`Math.random()`) cannot guarantee a perfectly balanced split over small sample sizes. Furthermore, tracking "started" sessions introduces sequence drift when participants refresh their browsers or abandon the experiment mid-execution. This leads to uneven datasets, fundamentally compromising the statistical power of paired-sample testing.

## Decision

We will implement a stateful, deterministic block allocation algorithm directly within the PostgreSQL database layer via a Remote Procedure Call (RPC).

1. **State Evaluation:** The allocator will determine the active pool by counting only _fully completed_ crossover sessions, completely ignoring orphaned or incomplete UUIDs.
2. **Completion Heuristic:** A session is defined as mathematically complete the exact moment a `SURVEY_2` payload successfully lands in the `psychometric_surveys` table.
3. **Dynamic Routing:** If the count of completed AB sessions is less than or equal to BA sessions, the RPC returns 'AB'. Otherwise, it returns 'BA'.
4. **Security Delegation:** The RPC will execute as a `SECURITY DEFINER`, allowing the anonymous frontend role to execute the count logic without granting it global `SELECT` privileges over the raw data tables.

## Consequences

- **Positive:** Guarantees absolute compliance with the AB/BA crossover balancing mandate, completely immunising the quota against mid-task abandonment.
- **Positive:** Offloads state management to the most durable layer of the architecture (the relational database), preventing frontend volatility from polluting the allocation logic.
- **Negative:** Introduces a hard network dependency upon application boot (`PIS` to `CONSENT`). If the database is unreachable, the system must invoke a client-side randomisation fallback, risking temporary sequence imbalance.
