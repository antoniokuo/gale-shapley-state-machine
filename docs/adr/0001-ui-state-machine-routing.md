# 1. UI State Machine Routing vs. URL Routing

Date: 2026-08-02

## Status

Accepted

## Context

The application requires a linear progression of screens for the HCI study: Participant Information Sheet -> Consent Gateway -> Task A -> Task B -> Debrief. We need to determine how to manage navigation between these views.

## Decision

We will reject standard URL-based routing (e.g., `vue-router`) in favour of a centralised Pinia state enum combined with Vue conditional rendering (`v-if`).

## Consequences

- **Positive:** Eliminates the risk of participants manually altering URLs to bypass consent or skip tasks.
- **Positive:** Reduces JavaScript bundle size, improving initial load time.
- **Positive:** Enforces strict, deterministic linear flow control managed entirely by the global state.
- **Negative:** The application will not support standard browser "Back/Forward" button navigation (which is desired behaviour for a controlled HCI study).
