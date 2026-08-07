# 6. Asymmetric Bipartite Market Saturation Model

Date: 2026-08-05

## Status

Accepted

## Context

The primary empirical objective is to measure human cognitive processing latency ($T_{cognitive}$) during cascading algorithmic state transitions. A standard symmetric 1:1 matching matrix resolves with high efficiency and minimal displacement chaining, failing to generate the cognitive friction required for valid NASA-TLX psychometric evaluation. Conversely, excessive node scaling (e.g., 30 Proposers to 10 Receivers) introduces severe visual search noise, contaminating telemetry logs with eye-tracking latency and violating Fitts's Law and Hick-Hyman Law controls established in the SOP.

## Decision

The state machine implements a highly optimised, asymmetric Many-to-One market structure consisting of exactly **16 Proposers and 4 Receivers**. A static capacity quota of $C = 3$ is enforced across all 4 Receivers, establishing a maximum market capacity of 12 available slots ($4 \times 3 = 12$). This introduces a strict **4-proposer surplus** ($16 > 12$) to serve as systemic chaos agents. To prevent heuristic bypassing, the preference matrices are generated using a moderate Zipfian skew ($s \approx 0.8$), ensuring initial proposal traffic is distributed enough to sustain multi-tier displacement chains.

## Consequences

- **Positive:** Mathematical guarantee of sustained market congestion. The 4 surplus agents are forced to traverse their entire preference lists, driving deep late-stage cascading displacements to generate the variance required for cognitive testing.
- **Positive:** Mitigates the Redundancy Trap. The moderate Zipfian skew prevents users from adopting simple elimination heuristics, guaranteeing that the recorded $T_{cognitive}$ accurately reflects complex algorithmic state tracking rather than pattern-matching shortcuts.
- **Positive:** Maintains absolute human-factors safety. The compact canvas (20 total nodes) fits cleanly inside a standard viewport without requiring scrolling, completely neutralizing visual search clutter.
- **Positive:** Ensures 100% compliance with the existing institutional SOP parameters for "pre-computed Many-to-One Zipfian datasets" without requiring an administrative ethics amendment.
- **Negative:** Compels highly tight grid spacing rules inside the atomic rendering CSS components to track the dense multi-agent lists.
