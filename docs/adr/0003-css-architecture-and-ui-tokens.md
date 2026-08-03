# 3. Utility-First CSS Framework and Neo-Brutalist UI Design Tokens

Date: 2026-08-03

## Status

Accepted

## Context

The application requires an aesthetic presentation suitable for an elite software portfolio, while strictly protecting the experimental integrity of the HCI study. The UI must render state transitions under a strict $<200\text{ms}$ threshold. Traditional UI component libraries introduce runtime JavaScript footprints, deeply nested DOM nodes, and forced layout reflows that contaminate millisecond latency telemetry. Excessive visual decoration introduces cognitive search noise, confounding the NASA-TLX endpoints.

## Decision

We will utilise Tailwind CSS as a utility-first compilation framework. The visual layout will adhere to a Neo-Brutalist enterprise aesthetic: a monochromatic baseline grid utilising high-contrast, functional-only colour tokens mapped strictly to state machine transitions (e.g., specific indicators for clash states, rejections, and active holds).

## Consequences

- **Positive:** Tailwind operates at the build step, contributing zero runtime JavaScript overhead to the browser event loop.
- **Positive:** Elimination of decorative gradients and drop shadows mitigates ocular search noise, ensuring latency telemetry isolates pure cognitive processing time.
- **Positive:** The stark, tokenised structure signals professional design-system competency to engineering recruiters.
- **Negative:** Requires manual composition of UI elements from atomic utility classes rather than using pre-built library widgets.
