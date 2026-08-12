# 13. Deterministic Cognitive Ramp-Up Calibration

Date: 2026-08-12

## Status

Accepted

## Context

During pre-deployment stress testing of the Gale-Shapley matching engine, two distinct methodological vulnerabilities were exposed in the execution timeline:

1. **Trajectory Divergence:** The asynchronous generator engine originally initialised its internal execution state queue using JavaScript's native `Object.keys()` mapping on the preference data. Because Dataset B is a permuted isomorphism of Dataset A (e.g., Node P01 in Task A maps to Node P07 in Task B), Task B mistakenly initiated its execution cascade at P01 rather than P07. This caused the two conditions to diverge immediately down completely different algorithmic paths, destroying the absolute mathematical identity required for a clean within-subject A/B crossover trial.
2. **Cognitive Load Imbalance:** The 5 milestone breakpoints in the seed files were distributed arbitrarily, causing the automated engine to pause frequently on trivial `ACCEPT` states. This failed to isolate or test the intrinsic cognitive processing boundaries of the algorithm (the `REJECT` and `DISPLACE` logic blocks) whilst introducing an unnecessary risk of participant fatigue.

## Decision

We will isolate and enforce a uniform execution trajectory across both datasets by decoupling the initial processing queue from native object iteration and hardcoding a strategic difficulty curve.

1. **Injection of `executionQueue`:** Both `taskA.json` and `taskB.json` have been appended with a strict `executionQueue` string array. The engine orchestrator in `src/engine/galeShapleyEngine.ts` is refactored to pull its initial state from this explicit array rather than relying on automated alphanumeric key collection.
2. **Bijective Permutation Alignment:** Task B's `executionQueue` is mathematically translated to act as a flawless, 1-to-1 isomorphic mirror of Task A's queue. This forces the underlying graph execution loops to match step-for-step across both tasks.
3. **5-Step Cognitive Ramp-Up:** The milestone breakpoints are surgically calibrated to guide participants through a precise logical sequence: **Accept &rarr; Displace &rarr; Accept &rarr; Reject &rarr; Displace**.

## Consequences

- **Positive:** Task A and Task B follow an identical execution trajectory, ensuring that any observed variance in NASA-TLX workload indices or $T_{cognitive}$ latency is driven solely by the independent variable (Static Matrix vs. Interactive MicroQueue) and not differing algorithmic workloads.
- **Positive:** The 5-breakpoint constraint is preserved, satisfying the sample design limit ($N=16$, yielding 160 controlled latency data points) without triggering participant exhaustion or survey fatigue.
- **Positive:** Incorporating an intermediate `Accept` step introduces a calculated cognitive reset, preventing frustration accumulation from skewing the psychometric subscales.
- **Positive:** The engine forces participants to evaluate all three possible states of the Gale-Shapley pipeline, validating the academic rigor of the study.
- **Negative:** The dataset payload schema inside `src/types/index.ts` must now maintain an optional `executionQueue` string array definition, slightly expanding the ingestion interface surface area.
- **Negative:** Future test parameters or custom datasets cannot be generated dynamically or randomly; they must be manually traced to pre-compute an identical execution queue and matching milestone trajectory.
