# 4. Reactive DOM Binding and High-Resolution Telemetry Isolation

Date: 2026-08-04

## Status

Accepted

## Context

The application must render cascading state machine updates (Gale-Shapley proposals, rejections, displacements) while strictly maintaining a <200ms layout reflow latency. Furthermore, the primary experimental endpoint ($T_{cognitive}$) requires measuring human prediction latency. If the timer is coupled to Vue's reactive lifecycle hooks or network request boundaries, JavaScript event-loop microtasks will contaminate the latency data, rendering the HCI study invalid.

## Decision

1. **DOM-Level State Styling:** Visual state transitions (e.g., Clashing, Held, Rejected) are mapped purely via Tailwind CSS utility classes reacting to the Pinia store, offloading layout calculations to the browser's CSSOM and bypassing heavy JavaScript UI frameworks.
2. **Hardware-Level Telemetry Isolation:** The `PredictionModal.vue` captures the initial render timestamp natively using `performance.now()` strictly inside the `onMounted` hook (post-DOM insertion). The submission timestamp is captured immediately at the click event boundary.

## Consequences

- **Positive:** Mathematical isolation of human cognitive processing time from Vue's virtual DOM patching overhead.
- **Positive:** Grid reflows are hardware-accelerated and guaranteed to clear the 200ms HCI threshold.
- **Negative:** Requires strict discipline to prevent any asynchronous network calls or heavy computations from blocking the main thread between the modal mounting and the user click event.

## Amendments (2026-08-07)

### Context Update

To protect downstream psychometric statistical modeling against database crashes (e.g., log-normal transformation division-by-zero errors) and accidental hardware motor noise (e.g., rapid click jitter or hotkey misfires), the client container must enforce defensive telemetry preprocessing gates prior to server dispatch.

### Amended Decision

Incorporate defensive telemetry constraints directly into the submission execution boundary pipeline:

1. **Mathematical Floor Constraint:** Apply an absolute lower-bound constraint via `Math.max(1, Math.round(clickTimestamp - renderTimestamp.value))` to normalise records.
2. **Outlier Filtering Flag:** Evaluate if the raw duration calculates to $T < 100\text{ms}$. If true, flag the entry as accidental motor trigger noise to ensure its systematic exclusion from final cognitive processing latency data pools.

### Amended Consequences

- **Positive:** Eliminates data contamination and protects statistical transformations against boundary errors.
- **Positive:** Guarantees absolute compliance with the data handling specifications set forth in the research methodology protocol.
- **Negative:** Shifts structural data filtering logic to the frontend application, increasing the density of the modal submission function block.
