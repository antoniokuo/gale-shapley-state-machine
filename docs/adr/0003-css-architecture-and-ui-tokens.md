# 3. Utility-First CSS Framework and Neo-Brutalist UI Design Tokens

Date: 2026-08-03

## Status

Accepted

## Context

The application requires an aesthetic presentation suitable for an elite software portfolio, while strictly protecting the experimental integrity of the HCI study. The UI must render state transitions under a strict <200ms threshold. Traditional UI component libraries introduce runtime JavaScript footprints, deeply nested DOM nodes, and forced layout reflows that contaminate millisecond latency telemetry. Excessive visual decoration introduces cognitive search noise, confounding the NASA-TLX endpoints.

## Decision

We will utilise Tailwind CSS as a utility-first compilation framework. The visual layout will adhere to a Neo-Brutalist enterprise aesthetic: a monochromatic baseline grid utilising high-contrast, functional-only colour tokens mapped strictly to state machine transitions (e.g., specific indicators for clash states, rejections, and active holds).

## Consequences

- **Positive:** Tailwind operates at the build step, contributing zero runtime JavaScript overhead to the browser event loop.
- **Positive:** Elimination of decorative gradients and drop shadows mitigates ocular search noise, ensuring latency telemetry isolates pure cognitive processing time.
- **Positive:** The stark, tokenised structure signals professional design-system competency to engineering recruiters.
- **Negative:** Requires manual composition of UI elements from atomic utility classes rather than using pre-built library widgets.

## Amendments (2026-08-07)

### Context Update

The 2x2 counterbalanced experimental protocol requires a static control baseline that tests cognitive processing without introducing confounding spatial variables. Altering the physical layout geometric mapping would violate Fitts's Law and Hick-Hyman Law controls established in the SOP. However, completely stripping historical state tokens creates an "Amnesia Trap" that forces an impossible working-memory load, corrupting the baseline error metrics.

### Amended Decision

The control condition will utilise a **Spatial-Invariant Isomorphic Snapshot Baseline**. The structural grid components will intercept an `isStatic` property prop to preserve absolute (x, y) spatial DOM placement while disabling all reactive cognitive-offloading helper utilities:

1. **Zero Attention Guidance:** The active Spotlight isolation layer is disabled; all 20 nodes remain at 100% opacity.
2. **Zero Predictive Feedback:** Monochrome high-contrast node states replace the active Neo-Brutalist color tokens (emerald/red/blue).
3. **Zero Automated History:** Dynamic preference strikethroughs are stripped from the priority tables.The user must manually scan the list and deduce who has already been rejected based on the current state.
4. **Current State Anchor:** The interface will render current tentative node holds as raw text to provide an authentic, textbook-style snapshot baseline for logical evaluation.

### Amended Consequences

- **Positive:** Mathematically isolates the interface reactivity as the single independent variable, protecting the internal validity of the dissertation data.
- **Positive:** Guarantees absolute compliance with the SOP's motor-execution friction controls.
- **Positive:** Prevents control-group working-memory collapse, ensuring baseline telemetry reflects algorithmic deduction rather than random guessing.
- **Negative:** Requires conditional class compilation tags layered throughout the atomic Tailwind templates.
