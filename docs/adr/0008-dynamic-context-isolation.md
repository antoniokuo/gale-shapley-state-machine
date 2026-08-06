# 8. Dynamic Context Isolation (The Spotlight Paradigm)

Date: 2026-08-06

## Status

Accepted

## Context

Following the implementation of the 30:10 saturated market (ADR 0006), preliminary UI audits revealed a critical HCI failure: Signal-to-Noise degradation. Presenting 30 concurrent preference vectors during an execution breakpoint forced the user into an ocular search loop. This artifact threatened the validity of the NASA-TLX endpoints by conflating algorithmic reasoning latency ($T_{cognitive}$) with interface scanning fatigue (Hick-Hyman Law violation).

## Decision

The view layer will implement Dynamic Context Isolation. The Pinia state manager will explicitly track `activeProposerId` and `activeTargetReceiverId` during breakpoint yields. When `isSpotlightActive` evaluates to true, the UI autonomously mutes (grayscale/opacity reduction) all irrelevant DOM nodes and collapses the Preference Matrix to exclusively display the active Proposer’s trajectory and historical rejections.

## Consequences

- **Positive:** Isolates the independent variable. The measured latency now reflects pure mathematical evaluation rather than visual search time.
- **Positive:** Elevates the application to enterprise-grade observability standards, proving the capacity to build reactive, noise-filtering telemetry dashboards.
- **Negative:** Introduces state-synchronisation complexity; the UI mask will break if the generator engine fails to pass accurate identifiers to the store during a breakpoint yield.

## Amendments (2026-08-06)

### Context Update

Further system testing revealed that isolating the Proposer's vector was insufficient for bipartite matching markets. Because the Gale-Shapley protocol relies on two-sided preferences, evaluating a `DISPLACE` or `REJECT` state forced users to guess the Receiver's hidden internal ranking, which threatened to corrupt latency logs with artificial evaluation friction.

### Amended Decision

The Spotlight Paradigm is extended to inject a **Micro-Evaluation Queue** directly into the prediction module. The system reads `receiverInvertedRanks` from the global store and dynamically renders a just-in-time, sorted priority list displaying _only_ the active applicant and the target receiver's current occupants.

### Amended Consequences

- **Positive:** Eradicates blind guessing from the experimental task, ensuring recorded latency ($T_{cognitive}$) reflects clean deductive reasoning.
- **Positive:** Avoids cognitive collapse by refusing to render a secondary 10x30 global matrix panel.
