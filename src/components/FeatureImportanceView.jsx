import { Info, ShieldCheck } from "lucide-react";
export const FeatureImportanceView = ({
  importances,
  rfModel
}) => {
  const sortedImportances = [...importances].sort((a, b) => b.importance_score - a.importance_score);
  const maxScore = sortedImportances.length > 0 ? sortedImportances[0].importance_score : 1;
  return <div id="feature-importance-container">
      <div className="page-header">
        <h1 className="page-title">Feature Importance</h1>
        <p className="page-sub">
          Which statistics most influence the Random Forest model's predictions across 150 decision trees.
        </p>
      </div>

      <div className="card" id="ranked-scores-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
          <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: "normal", fontSize: "20px" }}>
            Ranked Importance Scores
          </h3>
          {rfModel && <span style={{ fontSize: "13px", color: "var(--chalk-dim)" }}>
              Model: <strong style={{ color: "var(--chalk)" }}>Random Forest</strong> (accuracy: {(rfModel.accuracy * 100).toFixed(1)}%)
            </span>}
        </div>

        <div id="feature-importance-rows">
          {sortedImportances.map((f, idx) => {
    const pct = maxScore > 0 ? f.importance_score / maxScore * 100 : 0;
    return <div key={f.feature_name} className="feature-row" id={`feature-row-${idx}`}>
                <div className="feature-name">
                  <span style={{ color: "var(--chalk)", fontWeight: 500 }}>
                    {f.feature_name.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="feature-bar-track">
                  <div
      className="feature-bar-fill"
      style={{ width: `${pct}%` }}
      title={`${(f.importance_score * 100).toFixed(1)}%`}
    />
                </div>
                <div className="feature-score">
                  {f.importance_score.toFixed(3)}
                </div>
              </div>;
  })}
        </div>
      </div>

      {
    /* Explanatory notes */
  }
      <div className="card" id="feature-definitions-card">
        <h3 style={{ margin: "0 0 14px 0", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Info size={17} style={{ color: "var(--bright-green)" }} />
          Feature Definitions
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", fontSize: "13px", color: "var(--chalk-dim)" }}>
          <div style={{ background: "var(--pitch-800)", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--pitch-700)" }}>
            <strong style={{ color: "var(--chalk)", display: "block", marginBottom: "4px" }}>home_form_last5 & away_form_last5</strong>
            Points accumulated over the last 5 matches (3 for win, 1 for draw, 0 for loss) reflecting recent momentum.
          </div>
          <div style={{ background: "var(--pitch-800)", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--pitch-700)" }}>
            <strong style={{ color: "var(--chalk)", display: "block", marginBottom: "4px" }}>home_goals_scored_avg & conceded_avg</strong>
            Average goals scored and conceded by the home team in their recent home fixtures.
          </div>
          <div style={{ background: "var(--pitch-800)", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--pitch-700)" }}>
            <strong style={{ color: "var(--chalk)", display: "block", marginBottom: "4px" }}>away_goals_scored_avg & conceded_avg</strong>
            Average attacking and defensive output for the visiting side in recent away matches.
          </div>
          <div style={{ background: "var(--pitch-800)", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--pitch-700)" }}>
            <strong style={{ color: "var(--chalk)", display: "block", marginBottom: "4px" }}>home_advantage</strong>
            Constant coefficient (1.0) encoding the empirical stadium crowd and familiarity bias in association football.
          </div>
        </div>
      </div>
    </div>;
};
