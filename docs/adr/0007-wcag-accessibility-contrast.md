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

## Amendments (2026-08-07)

### Context Update

Following the adoption of the Spatial-Invariant Isomorphic Snapshot (ADR 0003), the Static View control condition operates entirely without reactive colour tokens. Consequently, spatial borders, structural grid lines, and raw text matrices become the sole visual anchors for the participant. If these monochrome elements lack maximum contrast, the baseline's failure mode shifts from algorithmic complexity to ocular occlusion, invalidating the independent variable.

### Amended Decision

The WCAG high-contrast mandate is expanded beyond typography to encompass all structural DOM boundaries within the rendering pipeline. The application enforces `border-neutral-900` and high-contrast fill (`bg-neutral-50` / `bg-white`) across all node states and priority list matrices. When the `isStatic` flag evaluates to true, the UI relies strictly on absolute black-and-white visual polarity to delineate the spatial structure and grid topology, ensuring no artificial contrast is used to highlight the active algorithmic state.

### Amended Consequences

- **Positive:** Protects the integrity of the Isomorphic Snapshot. The control baseline's difficulty is mathematically guaranteed to stem from algorithmic tracking load rather than visual fatigue.
- **Positive:** Standardises the visual search boundary (Hick-Hyman Law) across both task conditions, satisfying the exact motor-execution friction controls defined in the SOP.
- **Negative:** The aggressive use of heavy borders and black topography demands meticulous margin/padding management in Tailwind to prevent the 16:4 grid from feeling claustrophobic.
