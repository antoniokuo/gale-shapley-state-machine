import warnings
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from scipy import stats
from statsmodels.stats.multitest import multipletests

# Suppress SciPy tie-approximation warnings
warnings.filterwarnings('ignore', category=UserWarning)

def load_and_merge(clean_dir: Path) -> pd.DataFrame:
    df_telemetry = pd.read_csv(clean_dir / 'telemetry_clean.csv')
    df_psycho = pd.read_csv(clean_dir / 'psychometrics_clean.csv')

    # Normalize condition casing
    df_telemetry['condition_type'] = df_telemetry['condition_type'].str.upper().str.strip()
    df_psycho['condition_type'] = df_psycho['condition_type'].str.upper().str.strip()

    # Aggregate telemetry per participant per condition
    if 'is_correct' in df_telemetry.columns:
        error_agg = ('is_correct', lambda x: 1.0 - x.mean())
    else:
        error_agg = ('prediction_error', 'mean')

    df_tel_agg = df_telemetry.groupby(['session_uuid', 'condition_type']).agg(
        mean_latency=('latency_ms', 'mean'),
        error_rate=error_agg
    ).reset_index()

    # Safe composite merge on UUID + Condition
    df_merged = pd.merge(df_psycho, df_tel_agg, on=['session_uuid', 'condition_type'], how='inner')

    # Derive Sequence Group (AB vs BA) from Phase 1 allocation
    if 'phase_context' in df_merged.columns:
        phase_1 = df_merged[df_merged['phase_context'].str.upper() == 'SURVEY_1']
        sequence_map = phase_1.set_index('session_uuid')['condition_type'].to_dict()
        df_merged['sequence_group'] = df_merged['session_uuid'].map(
            lambda x: 'AB' if sequence_map.get(x) == 'STATIC' else 'BA'
        )
    else:
        df_merged['sequence_group'] = 'UNKNOWN'

    return df_merged

def test_carry_over(df: pd.DataFrame) -> None:
    if 'sequence_group' not in df.columns or df['sequence_group'].nunique() < 2:
        print("Diagnostics | Sequence group data insufficient for carry-over test.")
        return

    # Sum scores across both periods to isolate sequence-dependent carry-over
    sums = df.groupby(['session_uuid', 'sequence_group'])['nasa_primary_endpoint'].sum().reset_index()
    group_ab = sums[sums['sequence_group'] == 'AB']['nasa_primary_endpoint']
    group_ba = sums[sums['sequence_group'] == 'BA']['nasa_primary_endpoint']

    stat, p_val = stats.mannwhitneyu(group_ab, group_ba, alternative='two-sided')
    print(f"Diagnostics | Carry-Over Effect (Mann-Whitney U): W = {stat:.2f}, p = {p_val:.4f}")
    if p_val < 0.05:
        print("WARNING: Significant carry-over detected (p < 0.05). Crossover model compromised.")
    else:
        print("Carry-Over Check: Passed (No significant sequence bias detected).")

def format_median_iqr(series: pd.Series) -> str:
    q1, median, q3 = series.quantile([0.25, 0.5, 0.75])
    return f"{median:.2f} [{q1:.2f}--{q3:.2f}]"

def execute_statistical_pipeline(df: pd.DataFrame, output_dir: Path) -> None:
    endpoints = [
        ('nasa_primary_endpoint', 'NASA-TLX Mental Demand (Primary)'),
        ('mean_latency', 'Task Completion Latency (ms)'),
        ('error_rate', 'Prediction Error Rate'),
        ('sus_final_score', 'System Usability Scale (SUS)'),
        ('nasa_secondary_composite', 'NASA-TLX Secondary Composite')
    ]

    conditions = df['condition_type'].unique()
    cond_a = 'STATIC'
    cond_b = [c for c in conditions if c != 'STATIC'][0]

    results = []
    p_values_secondary = []

    for metric_key, metric_label in endpoints:
        df_wide = df.pivot(index='session_uuid', columns='condition_type', values=metric_key).dropna()
        static_arr = df_wide[cond_a]
        interactive_arr = df_wide[cond_b]

        # Wilcoxon signed-rank test using normal approximation for Z-score
        res = stats.wilcoxon(static_arr, interactive_arr, alternative='two-sided', method='approx')
        z_stat = res.zstatistic
        n_obs = len(static_arr) * 2
        r_effect = abs(z_stat) / np.sqrt(n_obs)

        static_desc = format_median_iqr(static_arr)
        interactive_desc = format_median_iqr(interactive_arr)

        is_primary = metric_key == 'nasa_primary_endpoint'
        if not is_primary:
            p_values_secondary.append(res.pvalue)

        results.append({
            'Metric': metric_label,
            'Static': static_desc,
            'Interactive': interactive_desc,
            'Z': f"{z_stat:.2f}",
            'r': f"{r_effect:.2f}",
            'p_raw': res.pvalue,
            'Is_Primary': is_primary
        })

    # Apply Holm-Bonferroni step-down correction to secondary endpoints
    _, p_adj, _, _ = multipletests(p_values_secondary, alpha=0.05, method='holm')

    adj_idx = 0
    latex_rows = []
    for r in results:
        if r['Is_Primary']:
            p_str = f"{r['p_raw']:.4f}*"
        else:
            p_str = f"{p_adj[adj_idx]:.4f}"
            adj_idx += 1

        row_str = f"{r['Metric']} & {r['Static']} & {r['Interactive']} & {r['Z']} & {r['r']} & {p_str} \\\\"
        latex_rows.append(row_str)

    # 1. Export Formatted LaTeX Table
    latex_table = (
        "\\begin{table}[htbp]\n"
        "\\centering\n"
        "\\small\n"
        "\\begin{tabular}{lccccc}\n"
        "\\hline\n"
        "Metric & Static (Median [IQR]) & Interactive (Median [IQR]) & $Z$ & $r$ & $p$-value \\\\\n"
        "\\hline\n"
        + "\n".join(latex_rows) + "\n"
        "\\hline\n"
        "\\end{tabular}\n"
        "\\caption{Wilcoxon signed-rank test results ($N=16$). *Denotes pre-registered primary endpoint (unadjusted). Secondary $p$-values are adjusted using Holm-Bonferroni step-down corrections.}\n"
        "\\label{tab:statistical_results}\n"
        "\\end{table}\n"
    )

    tex_path = output_dir / 'statistical_results.tex'
    with open(tex_path, 'w') as f:
        f.write(latex_table)
    print(f"LaTeX Table Exported: {tex_path}")

    # 2. Export Publication-Grade Vector PDF Plot
    plt.figure(figsize=(7, 5))
    sns.set_theme(style="ticks")
    ax = sns.boxplot(
        x='condition_type',
        y='nasa_primary_endpoint',
        data=df,
        palette=['#4A90E2', '#50E3C2'],
        width=0.4
    )
    plt.title('NASA-TLX Mental Demand by Visualization Condition', fontsize=12, fontweight='bold', pad=12)
    plt.ylabel('Mental Demand Score (0--20)', fontsize=10)
    plt.xlabel('Condition Mode', fontsize=10)
    sns.despine(top=True, right=True)

    pdf_path = output_dir / 'mental_demand_boxplot.pdf'
    plt.savefig(pdf_path, format='pdf', bbox_inches='tight')
    plt.close()
    print(f"Vector Graphic Exported: {pdf_path}")

if __name__ == '__main__':
    PROJECT_ROOT = Path(__file__).resolve().parents[2]
    CLEAN_DIR = PROJECT_ROOT / 'data' / 'clean'

    if not CLEAN_DIR.exists():
        raise FileNotFoundError(f"Clean data directory not found at: {CLEAN_DIR}")

    df_master = load_and_merge(CLEAN_DIR)
    test_carry_over(df_master)
    execute_statistical_pipeline(df_master, CLEAN_DIR)
