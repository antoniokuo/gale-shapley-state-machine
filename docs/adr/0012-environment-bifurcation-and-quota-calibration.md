# 12. Environment Bifurcation and Hard Quota Calibration

Date: 2026-08-11

## Status

Accepted

## Context

The application serves two divergent objectives:

1. An empirical academic user study requiring strict database persistence, data balancing, and zero-attention greyscale UIs to evaluate cognitive baseline metrics.
2. A public professional portfolio asset requiring real-time animation speed controls, interactive colour tokens, and offline simulation stability for deployment to unauthenticated environments.

Executing both use cases under a unified runtime profile introduced a critical risk of sample data contamination from uncontrolled public web traffic. Concurrently, hardcoding the legacy 30:10 node configuration violated the strict mathematical Zipfian limits approved by the institutional ethics board (Ethics ID: 17735).

## Decision

We will isolate the execution pipelines at compile time by implementing an Environment Gatekeeper driven by Vite build environment parameters (`VITE_APP_MODE`).

1. **Study Mode (`study`)**: Enforces strict database transaction logging, invokes Supabase RPC mechanisms for balanced crossover block tracking, restricts UI colour highlights in the control arm, and disables developer speed overrides.
2. **Portfolio Mode (`portfolio`)**: Severely decouples the database layer, mocks sequence assignments locally via balanced client-side coin flips, enables console-based telemetry logging showcases, and unlocks real-time tick-rate range sliders to demonstrate state mechanics to hiring managers.

Additionally, the system node configuration is permanently refactored from the legacy 30:10 layout down to a strict 16:4 asymmetric bipartite matching layer ($N=16, M=4, C=3$) to conform to the empirical sample design.

## Consequences

- **Positive:** Academic telemetry is fully firewalled against public portfolio testing noise, satisfying the empirical rigour demanded by the methodology.
- **Positive:** The Git repository remains a singular, open-source asset. It safely showcases production-grade Supabase hooks, DevOps environment routing, and UI state management without exposing backend infrastructure keys.
- **Positive:** Onboarding sequence states persist across accidental browser reloads via `sessionStorage` mapping, actively preventing shared-terminal cross-contamination.
- **Positive:** Node layout adheres strictly to the validated mathematical limits approved by the ethics board.
- **Negative:** The codebase must now maintain parallel operational logic for two distinct deployment targets, increasing the testing surface area.
- **Negative:** Failing to strictly define `VITE_APP_MODE=study` in the production host environment will default the system to portfolio mode, introducing the risk of silent data loss during a live user study.
- **Negative:** Future UI modifications must be manually verified against both environment variables to ensure portfolio-exclusive testing components (e.g., the telemetry speed slider) do not bleed into the cognitive baseline views.
