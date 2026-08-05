# 7. High-Contrast WCAG Colour Tokens for Telemetry Standardisation

Date: 2026-08-05

## Status

Accepted

## Context

Initial layout verification revealed that low-contrast text colour choices (muted greys and faint opacities) introduced unnecessary visual fatigue and legibility hurdles. In an HCI context, reading difficulty creates an unintended cognitive bottleneck, contaminating the NASA-TLX endpoints.

## Decision

All system text, instructional strings, and active identification state descriptors are elevated to high-contrast deep black values (`text-neutral-950`, `font-black`). This satisfies strict WCAG AA accessibility requirements and prevents text readability from acting as an uncontrolled variable.

## Consequences

- **Positive:** Absolute legibility eliminates text processing friction across all target demographics.
- **Positive:** Sharp visual grounding reinforces the premium, polished aesthetic expected of enterprise system software.
- **Negative:** Reduces the availability of soft palette variations for non-essential labels.
