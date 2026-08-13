# 14. Immutable Psychometric Instrument Architecture

Date: 2026-08-12

## Status

Accepted

## Context

The application is required to administer two scientifically validated psychometric scales: the NASA Task Load Index (NASA-TLX; Hart & Staveland, 1988) and the System Usability Scale (SUS; Brooke, 1996) immediately following both execution tasks.

During UI stress-testing, standard modern engineering heuristics conflicted with empirical constraints. Specifically, the NASA-TLX 'Performance' scale utilises an inverted layout ($0 = \text{Perfect}, 20 = \text{Failure}$), and the 'Frustration' prompt relies on verbose, seemingly ambiguous 1980s phrasing. Furthermore, a state-machine routing flaw temporarily bypassed the second survey, threatening the internal validity of the within-subject crossover design.

## Decision

We will explicitly reject standard frontend "best practices" (e.g., dynamic CMS data ingestion, UX copy modernisation) in favour of absolute empirical fidelity.

1. **Immutable Hardcoding:** All psychometric text strings, scale inversions, and numerical bounds are hardcoded directly into `src/components/SurveyInstrument.vue`. We strictly forbid any UI/UX "clarifications" or modernisations of the text.
2. **Crossover Routing Enforcement:** The global state machine (`App.vue`) is locked to enforce a rigid sequential progression: `TASK_1` &rarr; `SURVEY_1` &rarr; `TASK_2` &rarr; `SURVEY_2`. The system cannot progress to the Sandbox until Survey 2 state data is committed.
3. **Typographic Hierarchy over Copy Editing:** Rather than rewriting the canonical stems for legibility, we applied brutalist CSS typographic scaling (heavy font weights, uppercase tracking, and structural borders) to ensure the 1980s text is optimally readable on modern displays.

## Consequences

- **Positive:** Guarantees absolute construct validity and statistical reliability. The collected data remains mathematically comparable to decades of established HCI literature.
- **Positive:** Satisfies the strict adherence to the methodology approved by the institutional ethics board (Ethics ID: 17735).
- **Positive:** The enforced state routing completely secures the AB/BA crossover dataset against participant skipping or sequence contamination.
- **Negative:** Creates a rigid, non-reusable frontend component. Any future iterations of this platform requiring different psychometric instruments will require a manual structural rewrite of the component rather than a simple JSON payload update.
