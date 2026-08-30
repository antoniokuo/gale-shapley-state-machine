from pathlib import Path

import pandas as pd


def process_telemetry(raw_path: Path, clean_path: Path) -> None:
    df = pd.read_csv(raw_path)

    # Enforce outlier truncation: Drop hardware double-click noise (< 150ms)
    df_clean = df[df['latency_ms'] >= 150].copy()

    # Strip database artifacts without inplace=True
    df_clean = df_clean.drop(columns=['id', 'created_at'], errors='ignore')

    df_clean.to_csv(clean_path, index=False)
    print(f"Telemetry: Sanitised {len(df)} -> {len(df_clean)} valid operational records.")

def process_psychometrics(raw_path: Path, clean_path: Path) -> None:
    df = pd.read_csv(raw_path)

    # 1. System Usability Scale (SUS) Scoring
    odd_cols = [f'sus_item_{i}' for i in [1, 3, 5, 7, 9]]
    even_cols = [f'sus_item_{i}' for i in [2, 4, 6, 8, 10]]

    # Direct vectorized subtraction (Item - 1 for odd; 5 - Item for even)
    sus_odd = (df[odd_cols] - 1).sum(axis=1)
    sus_even = (5 - df[even_cols]).sum(axis=1)
    df['sus_final_score'] = (sus_odd + sus_even) * 2.5

    # 2. NASA-TLX Endpoints (Raw TLX / RTLX average)
    df['nasa_primary_endpoint'] = df['mental_demand']
    df['nasa_secondary_composite'] = df[['temporal_demand', 'performance', 'effort', 'frustration']].mean(axis=1)

    # 3. Strip intermediate raw components
    cols_to_drop = ['id', 'created_at', 'physical_demand'] + odd_cols + even_cols
    df_clean = df.drop(columns=cols_to_drop, errors='ignore')

    df_clean.to_csv(clean_path, index=False)
    print(f"Psychometrics: Scored and exported {len(df_clean)} records.")

def process_qualitative(raw_path: Path, clean_path: Path) -> None:
    df = pd.read_csv(raw_path)
    df_clean = df[['session_uuid', 'feedback_text']].dropna()
    df_clean.to_csv(clean_path, index=False)
    print(f"Qualitative: Extracted {len(df_clean)} records for manual PII audit.")

if __name__ == '__main__':
    # Resolve project root relative to scripts/etl/pipeline.py (two levels up)
    PROJECT_ROOT = Path(__file__).resolve().parents[2]

    RAW_DIR = PROJECT_ROOT / 'data' / 'raw'
    CLEAN_DIR = PROJECT_ROOT / 'data' / 'clean'

    CLEAN_DIR.mkdir(parents=True, exist_ok=True)

    process_telemetry(
        RAW_DIR / 'session_telemetry_rows.csv',
        CLEAN_DIR / 'telemetry_clean.csv'
    )
    process_psychometrics(
        RAW_DIR / 'psychometric_surveys_rows.csv',
        CLEAN_DIR / 'psychometrics_clean.csv'
    )
    process_qualitative(
        RAW_DIR / 'qualitative_feedback_rows.csv',
        CLEAN_DIR / 'qualitative_clean.csv'
    )
