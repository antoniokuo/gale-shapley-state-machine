# 8. Dynamic Context Isolation (The Spotlight Paradigm)

Date: 2026-08-06

## Status

Accepted

## Context

Following the implementation of the 16:4 saturated market (ADR 0006), preliminary UI audits for the Interactive DAG View revealed a risk of Signal-to-Noise degradation. While 20 nodes is structurally compact, presenting all concurrent preference vectors simultaneously during an execution breakpoint forces the user to visually filter inactive data. To isolate algorithmic reasoning latency ($T_{cognitive}$) and prevent interface scanning fatigue (Hick-Hyman Law violation), the reactive view must aggressively manage visual attention.

## Decision

The Interactive DAG View implements Dynamic Context Isolation. The Pinia state manager explicitly tracks `activeProposerId` and `activeTargetReceiverId` during breakpoint yields. The UI autonomously mutes (grayscale/opacity reduction) all irrelevant DOM nodes and collapses the Preference Matrix to exclusively display the active Proposer’s trajectory and historical rejections.

## Consequences

- **Positive:** Mathematically isolates the independent variable. The measured latency in the experimental condition reflects pure mathematical evaluation rather than visual search time.
- **Positive:** Elevates the application to enterprise-grade observability standards, proving the capacity to build reactive, noise-filtering telemetry dashboards.
- **Negative:** Introduces state-synchronisation complexity; the UI mask will break if the generator engine fails to pass accurate identifiers to the store during a breakpoint yield.

## Amendments (2026-08-07)

### Context Update

System testing revealed two critical dependencies:

1. The Gale-Shapley protocol is two-sided. Isolating the Proposer is insufficient; the user must see the Receiver's internal priority ranking to deduce a `DISPLACE` or `REJECT` state without guessing.
2. The counterbalanced experimental crossover design requires a control condition. If the Spotlight Paradigm remains active during the Static Baseline task, the baseline is corrupted.

### Amended Decision

1. **Micro-Evaluation Queue:** The Spotlight Paradigm is extended to display a sorted priority list showing only the active applicant and the target receiver's current occupants. To prevent structural DOM shifting, this queue is rendered within a strictly pre-allocated, rigid spatial bounding box adjacent to the state graph. It is explicitly kept out of the standardised prediction modal.
2. **Strict Baseline Disablement:** The entire Dynamic Context Isolation protocol (node muting, array collapsing, and micro-evaluation queues) is strictly bound to `v-if="!isStatic"`. When evaluating the Static control task, the Spotlight is completely disabled, rendering the unmasked 16:4 Isomorphic Snapshot (ADR 0003).

### Amended Consequences

- **Positive:** Eradicates blind guessing in the interactive task by providing just-in-time contextual cross-reference data.
- **Positive:** Protects the experimental control group by ensuring the visual scanning load (the absence of the Spotlight) remains the defining delta between the two task conditions.
- **Negative:** Requires aggressive conditional template logic within Vue and strict CSS height/width bounding boxes to ensure the appearance/disappearance of the Micro-Evaluation Queue does not trigger DOM layout reflows that could shift the physical $(x, y)$ coordinates of the prediction modal, which would violate Fitts's Law.
