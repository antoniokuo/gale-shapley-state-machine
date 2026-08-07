# 2. Asynchronous Generator Queued Tick Engine

Date: 2026-08-03

## Status

Accepted

## Context

The Gale-Shapley matching algorithm executes as a cascading iterative process. We must pause execution at 5 predefined HCI breakpoints to present prediction modals to the user, and rate-limit automated steps to prevent microtask race conditions during UI transitions. Traditional `while` loops wrapped in global boolean flags (e.g., `isPaused`) create dirty polling loops, block the browser execution context, and introduce race conditions.

## Decision

We isolated the core algorithm into an Asynchronous Generator Function (`async function*`). The iterator yields discrete, typed state events (`PROPOSING`, `ACCEPTED`, `REJECTED`, `DISPLACEMENT`, `BREAKPOINT`) and surrenders execution context back to the caller using `yield`.

## Consequences

- **Positive:** Complete decoupling of the mathematical matching algorithm from the rendering and reactivity layer.
- **Positive:** The algorithm physically halts execution in memory at `BREAKPOINT` events without blocking the browser main thread or using setInterval polling.
- **Positive:** Simplifies unit testing by allowing headless, step-by-step evaluation of the iterator without mounting Vue components.
- **Negative:** Requires explicit lifecycle management inside the Pinia store to handle iterator instantiation and teardown.

## Amendments (2026-08-07)

### Context Update

Further system testing revealed that arbitrary breakpoint assignment (e.g., pausing exactly every $N$ steps) fails to guarantee interception during complex graph states. Increasing the volume of breakpoints to brute-force the capture of displacement events violates the approved 5-breakpoint Ethics SOP and introduces non-IID human fatigue variables.

### Amended Decision

The breakpoint interception array is strictly locked to **5 deterministic algorithmic milestones** rather than arbitrary loop counts. The generator engine will yield `BREAKPOINT` events explicitly at: (1) Initial uncontested proposal, (2) Target capacity reached, (3) First active displacement, (4) Deep cascading rejection, and (5) Final equilibrium convergence.

### Amended Consequences

- **Positive:** Ensures 100% compliance with institutional Ethics protocols regarding maximum task interruption thresholds.
- **Positive:** Mathematically guarantees telemetry is logged during peak algorithmic congestion, securing the high-variance cognitive load data required to validate the independent variable.
- **Negative:** Requires bespoke mapping logic within the simulation seed datasets to align spatial milestones with exact array indices.
