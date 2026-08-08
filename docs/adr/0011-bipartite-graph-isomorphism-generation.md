# 11. Bipartite Graph Isomorphism for Crossover Dataset Generation

Date: 2026-08-08

## Status

Accepted

## Context

The $2\times2$ counterbalanced experimental protocol exposes each participant to two sequential matching tasks (Static and Interactive). If the two tasks utilise the identical dataset, cognitive carryover (the practice effect) corrupts the second task's latency telemetry. Conversely, if the tasks utilise two independently randomised Zipfian matrices, variances in algorithmic complexity (e.g., differing displacement chain depths) will confound the independent variable, rendering the $T_{cognitive}$ deltas statistically meaningless.

Following the methodology amendment of the project's Standard Operating Procedure (SOP Section 1.3) to the institutional Ethics Committee, the system is mandated to utilise a dataset that is perceptually novel but mathematically isomorphic to completely control for sub-graph topological complexity.

## Decision

The pre-computed JSON seed datasets (`taskA.json` and `taskB.json`) will be generated under strict **Bipartite Graph Isomorphism**.

1. **Base Generation:** A single, procedurally generated base matrix is validated to ensure it hits all 5 deterministic milestones (ADR 0002) and meets the 16:4 capacity quota (ADR 0006). This becomes Dataset A.
2. **Permutation Mapping:** Dataset B is generated strictly by applying a random, bijective permutation mapping to the node identifiers of Dataset A without altering the underlying graph topology.
3. **Visual Layout Randomisation:** The Vue/Pinia hydration logic is explicitly programmed to randomise the spatial rendering order on the Y-axis. This prevents the rendering engine from automatically sorting the permuted nodes into a geometry that mirrors Dataset A, which would reveal the isomorphism.
4. **Label Uniformity:** Permuted node identifiers must maintain identical character length and phonetic complexity to Dataset A (e.g., swapping `P1` for `K9`). This structural uniformity ensures pixel-width remains static across datasets, strictly controlling for visual search time (Hick-Hyman Law) and cursor travel distance (Fitts's Law).

## Consequences

- **Positive:** Mathematical guarantee of equal difficulty. Both datasets resolve in the exact same number of ticks, generate identical displacement cascades, and trigger the 5 deterministic breakpoints at the precise same sequential indices.
- **Positive:** Eliminates cognitive carryover. The permuted node IDs, scrambled preference lists, and randomised spatial sorting present a visually and logically novel puzzle to the participant.
- **Positive:** Guarantees compliance with the amended SOP Section 1.3 mandate, defending the internal validity of the $T_{cognitive}$ endpoints against peer review scrutiny.
- **Negative:** Requires advanced matrix manipulation in the Python data-generation pipeline and strict layout randomisation logic within the frontend state manager.
