# 15. Unconstrained Sandbox Architecture and Event Listener Isolation

Date: 2026-08-12

## Status

Accepted

## Context

The Standard Operating Procedure (SOP) mandates an unconstrained exploratory sandbox phase following the completion of the measured tasks and psychometric surveys. To elevate the application to an industry-grade portfolio asset, high-value UX features were required, specifically a bidirectional scrubbable time-travel ledger and native keyboard arrow traversal.

However, enabling keyboard traversal globally would introduce a fatal confounding variable during the measured prediction tasks (Tasks 1 and 2). Allowing mixed input modalities (mouse clicks vs. rapid keyboard strokes) would destroy the standardisation of physical interaction latency ($T_{motor}$) and pollute the high-resolution telemetry clock. Furthermore, dropping participants immediately from Survey 2 into the Sandbox induced task fatigue and context shock.

## Decision

We will implement a hyper-isolated Sandbox architecture with explicit state gating and lifecycle-bound event listeners.

1. **Interstitial Gateway Modal:** The Sandbox view will mount in a locked state, displaying a high-contrast modal explicitly terminating the measurement phase. The user must manually acknowledge this to unlock the graph, eliminating context shock.
2. **Lifecycle Event Isolation:** Native keyboard listeners (`keydown`) are bound strictly inside the Sandbox's `onMounted` hook and explicitly destroyed in the `onUnmounted` hook. Furthermore, the listener callback is gated behind the `isSandboxUnlocked` boolean, mathematically guaranteeing zero keyboard telemetry leakage into the experimental task arms.
3. **Dynamic Affordance for Feedback:** Survey Instrument 3 (qualitative feedback) is integrated with a dynamic affordance button that shifts from "Skip" to "Submit" based on character input, honouring the SOP's explicit mandate that this feedback is optional while preventing accidental session exits.

## Consequences

- **Positive:** Protects the internal validity of the experiment by strictly enforcing Fitts's Law standardisation (mouse-only input) during the measured prediction tasks.
- **Positive:** Demonstrates advanced Vue state-machine transitions, DOM lifecycle management, and accessible event-driven architecture to industry recruiters.
- **Positive:** Resolves user context shock and ergonomically reduces friction during unconstrained graph exploration.
- **Negative:** Increases component lifecycle complexity; any future routing changes must rigorously test the teardown of global `window` listeners to prevent silent memory leaks.
