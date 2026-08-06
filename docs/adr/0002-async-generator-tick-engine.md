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

## Amendments (2026-08-06)

### Context Update

Empirical testing revealed that a 5-breakpoint threshold was insufficient to gather a statistically significant sample size for psychometric latency analysis. It also restricted telemetry capture to the uncongested initialisation phase of the market, omitting cascading displacement data.

### Amended Decision

The execution engine is updated to enforce **10 predefined HCI breakpoints** per experimental task phase. The underlying generator function remains unchanged, but the breakpoint generation array is scaled to intercept 10 execution loops across the lifecycle of the bipartite market.

### Amended Consequences

- **Positive:** Doubles the sample size resolution per participant, ensuring robust data points for variance and standard deviation processing.
- **Positive:** Intercepts execution during peak algorithmic congestion, capturing highly accurate cognitive load deltas between basic and advanced matching states.
- **Negative:** Extends the active phase duration slightly, though total interaction time remains well within the target experimental threshold.
