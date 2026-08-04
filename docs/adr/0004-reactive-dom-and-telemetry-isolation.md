# 4. Reactive DOM Binding and High-Resolution Telemetry Isolation

Date: 2026-08-04

## Status

Accepted

## Context

The application must render cascading state machine updates (Gale-Shapley proposals, rejections, displacements) while strictly maintaining a $<200\text{ms}$ layout reflow latency. Furthermore, the primary experimental endpoint ($T_{cognitive}$) requires measuring human prediction latency. If the timer is coupled to Vue's reactive lifecycle hooks or network request boundaries, JavaScript event-loop microtasks will contaminate the latency data, rendering the HCI study invalid.

## Decision

1. **DOM-Level State Styling:** Visual state transitions (e.g., Clashing, Held, Rejected) are mapped purely via Tailwind CSS utility classes reacting to the Pinia store, offloading layout calculations to the browser's CSSOM and bypassing heavy JavaScript UI frameworks.
2. **Hardware-Level Telemetry Isolation:** The `PredictionModal.vue` captures the initial render timestamp natively using `performance.now()` strictly inside the `onMounted` hook (post-DOM insertion). The submission timestamp is captured immediately at the click event boundary.

## Consequences

- **Positive:** Mathematical isolation of human cognitive processing time from Vue's virtual DOM patching overhead.
- **Positive:** Grid reflows are hardware-accelerated and guaranteed to clear the 200ms HCI threshold.
- **Negative:** Requires strict discipline to prevent any asynchronous network calls or heavy computations from blocking the main thread between the modal mounting and the user click event.
