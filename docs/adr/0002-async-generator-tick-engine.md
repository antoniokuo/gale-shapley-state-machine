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
