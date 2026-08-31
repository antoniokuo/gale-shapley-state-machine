# 19. Local ETL Pipeline and GDPR Isolation

Date: 2026-08-31

## Status

Accepted

## Context

The system requires extracting raw telemetry and psychometric scores from the Supabase operational database, transforming them into non-parametric statistical assets (Wilcoxon signed-rank, Mann-Whitney U), and generating automated reporting matrices.

Standard modern data engineering practices often favour cloud-based ELT warehouses (e.g., Snowflake, BigQuery) or dynamic in-browser JavaScript transformations. However, these paradigms conflict directly with the strict data governance and UK GDPR constraints mandated by the approved ethics Standard Operating Procedure (SOP). Raw participant data, which may contain unscrubbed Personally Identifiable Information (PII) in qualitative fields, cannot legally touch unencrypted local partitions or public tracking trees.

## Decision

We will explicitly reject cloud-based ELT and JavaScript-based data manipulation in favour of a physically isolated, local analytical architecture.

1. **Standalone Python Architecture:** We engineered a dedicated Python/Pandas ETL pipeline (`scripts/etl/`) executed strictly outside the web application's TypeScript runtime.
2. **Encrypted Hardware Execution:** The pipeline is hardcoded to target absolute paths pointing exclusively to an encrypted, MFA-protected institutional storage enclave.
3. **Repository Exclusion Barrier:** A strict `.gitignore` configuration was deployed to permanently block all raw and sanitised `.csv` artifacts from the Git tracking tree, preventing accidental telemetry leakage into the public repository.

## Consequences

- **Positive:** Guarantees absolute compliance with UK GDPR and institutional ethics protocols by physically isolating human data to secure infrastructure.
- **Positive:** Preserves repository integrity by ensuring the public GitHub codebase remains mathematically sealed and devoid of participant data.
- **Positive:** Unlocks enterprise-grade scientific computing libraries (`scipy`, `statsmodels`) for rigorous statistical alpha-adjustments (Holm-Bonferroni) that are structurally inferior within the Node ecosystem.
- **Negative:** Introduces a polyglot stack (Python alongside Vue/TypeScript), increasing the local environment configuration burden and fragmenting the codebase across two distinct language ecosystems.
