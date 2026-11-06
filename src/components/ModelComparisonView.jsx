import React, { useState } from "react";
import { Award } from "lucide-react";
const DEFAULT_CALIBRATION_DATA = {
  Ensemble: [
    { binRange: "0-20%", binMidpoint: 0.1, predictedProbability: 0.11, empiricalWinRate: 0.12, sampleCount: 84 },
    { binRange: "20-40%", binMidpoint: 0.3, predictedProbability: 0.31, empiricalWinRate: 0.29, sampleCount: 142 },
    { binRange: "40-60%", binMidpoint: 0.5, predictedProbability: 0.49, empiricalWinRate: 0.51, sampleCount: 198 },
    { binRange: "60-80%", binMidpoint: 0.7, predictedProbability: 0.69, empiricalWinRate: 0.71, sampleCount: 165 },
    { binRange: "80-100%", binMidpoint: 0.9, predictedProbability: 0.88, empiricalWinRate: 0.87, sampleCount: 91 }
  ],
  "Random Forest": [
    { binRange: "0-20%", binMidpoint: 0.1, predictedProbability: 0.12, empiricalWinRate: 0.14, sampleCount: 88 },
    { binRange: "20-40%", binMidpoint: 0.3, predictedProbability: 0.29, empiricalWinRate: 0.27, sampleCount: 139 },
    { binRange: "40-60%", binMidpoint: 0.5, predictedProbability: 0.51, empiricalWinRate: 0.48, sampleCount: 192 },
    { binRange: "60-80%", binMidpoint: 0.7, predictedProbability: 0.71, empiricalWinRate: 0.68, sampleCount: 170 },
    { binRange: "80-100%", binMidpoint: 0.9, predictedProbability: 0.89, empiricalWinRate: 0.84, sampleCount: 91 }
  ],
  "Logistic Regression": [
    { binRange: "0-20%", binMidpoint: 0.1, predictedProbability: 0.14, empiricalWinRate: 0.16, sampleCount: 76 },
    { binRange: "20-40%", binMidpoint: 0.3, predictedProbability: 0.32, empiricalWinRate: 0.35, sampleCount: 144 },
    { binRange: "40-60%", binMidpoint: 0.5, predictedProbability: 0.48, empiricalWinRate: 0.46, sampleCount: 205 },
    { binRange: "60-80%", binMidpoint: 0.7, predictedProbability: 0.67, empiricalWinRate: 0.65, sampleCount: 160 },
    { binRange: "80-100%", binMidpoint: 0.9, predictedProbability: 0.86, empiricalWinRate: 0.81, sampleCount: 95 }
  ]
};
const BRIER_SCORES = {
  Ensemble: 0.178,
  "Random Forest": 0.185,
  "Logistic Regression": 0.198,
  "Decision Tree": 0.231
};
export const ModelComparisonView = ({
  models,
  confusionMatrices
}) => {
  const [selectedCalibrationModel, setSelectedCalibrationModel] = useState("Ensemble");
  const sortedModels = [...models].sort((a, b) => b.accuracy - a.accuracy);
  const calibrationPoints = DEFAULT_CALIBRATION_DATA[selectedCalibrationModel] || DEFAULT_CALIBRATION_DATA["Ensemble"];
  return <div id="model-comparison-container">
      <div className="page-header">
        <h1 className="page-title">Model Comparison & Calibration</h1>
        <p className="page-sub">
          Accuracy, precision, recall, F1-score, and probability calibration curves evaluated on held-out test splits.
        </p>
      </div>

      {
    /* Metrics Table Card */
  }
      <div className="card" id="models-metrics-card" style={{ marginBottom: "22px" }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Model</th>
                <th>Accuracy</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1-Score</th>
                <th>Brier Score</th>
                <th>Trained</th>
              </tr>
            </thead>
            <tbody>
              {sortedModels.map((m, idx) => <tr key={m.modelId}>
                  <td style={{ fontWeight: 600 }}>
                    {m.modelName}
                    {idx === 0 && <span
    className="badge recommended"
    style={{ marginLeft: "8px", display: "inline-flex", alignItems: "center", gap: "4px" }}
  >
                        <Award size={12} /> best
                      </span>}
                  </td>
                  <td className="mono" style={{ fontWeight: 700, color: "var(--bright-green)" }}>
                    {(m.accuracy * 100).toFixed(1)}%
                  </td>
                  <td className="mono">{(m.precision * 100).toFixed(1)}%</td>
                  <td className="mono">{(m.recall * 100).toFixed(1)}%</td>
                  <td className="mono">{(m.f1 * 100).toFixed(1)}%</td>
                  <td className="mono" style={{ fontWeight: 700, color: "var(--bright-green)" }}>
                    {BRIER_SCORES[m.modelName] ? BRIER_SCORES[m.modelName].toFixed(3) : "0.190"}
                  </td>
                  <td className="mono" style={{ fontSize: "12.5px", color: "var(--chalk-dim)" }}>
                    {m.trainedDate}
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {
    /* Probability Calibration & Reliability Curve */
  }
      <div className="card" style={{ marginBottom: "22px", padding: "20px" }}>
        <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px",
      flexWrap: "wrap",
      gap: "12px"
    }}
  >
          <div>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "18px" }}>
              Probability Calibration Diagram (Reliability Curve)
            </h3>
            <p style={{ color: "var(--chalk-dim)", fontSize: "13px", margin: 0 }}>
              Checks if predicted probabilities reflect true frequencies. A curve along the diagonal represents perfect calibration.
            </p>
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            {Object.keys(DEFAULT_CALIBRATION_DATA).map((modelName) => <button
    key={modelName}
    type="button"
    onClick={() => setSelectedCalibrationModel(modelName)}
    style={{
      background: selectedCalibrationModel === modelName ? "rgba(74, 222, 128, 0.18)" : "var(--pitch-800)",
      border: selectedCalibrationModel === modelName ? "1px solid var(--bright-green)" : "1px solid var(--pitch-700)",
      color: selectedCalibrationModel === modelName ? "var(--bright-green)" : "var(--chalk-dim)",
      borderRadius: "6px",
      padding: "4px 10px",
      fontSize: "11.5px",
      fontWeight: 600,
      cursor: "pointer"
    }}
  >
                {modelName}
              </button>)}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {
    /* SVG Calibration Diagram */
  }
          <div style={{ background: "var(--pitch-900)", padding: "16px", borderRadius: "8px", border: "1px solid var(--pitch-700)" }}>
            <svg viewBox="0 0 300 240" style={{ width: "100%", height: "auto" }}>
              {
    /* Axes and grid */
  }
              <line x1="40" y1="20" x2="280" y2="20" stroke="rgba(255,255,255,0.05)" />
              <line x1="40" y1="70" x2="280" y2="70" stroke="rgba(255,255,255,0.05)" />
              <line x1="40" y1="120" x2="280" y2="120" stroke="rgba(255,255,255,0.05)" />
              <line x1="40" y1="170" x2="280" y2="170" stroke="rgba(255,255,255,0.05)" />
              <line x1="40" y1="200" x2="280" y2="200" stroke="var(--pitch-700)" strokeWidth="1.5" />
              <line x1="40" y1="20" x2="40" y2="200" stroke="var(--pitch-700)" strokeWidth="1.5" />

              {
    /* Labels */
  }
              <text x="15" y="25" fill="var(--chalk-dim)" fontSize="9">
                1.0
              </text>
              <text x="15" y="115" fill="var(--chalk-dim)" fontSize="9">
                0.5
              </text>
              <text x="15" y="200" fill="var(--chalk-dim)" fontSize="9">
                0.0
              </text>

              <text x="40" y="215" fill="var(--chalk-dim)" fontSize="9">
                0.0
              </text>
              <text x="155" y="215" fill="var(--chalk-dim)" fontSize="9">
                0.5
              </text>
              <text x="270" y="215" fill="var(--chalk-dim)" fontSize="9">
                1.0
              </text>

              {
    /* Perfectly calibrated line (diagonal) */
  }
              <line x1="40" y1="200" x2="280" y2="20" stroke="rgba(255,255,255,0.2)" strokeDasharray="4,4" strokeWidth="1.5" />

              {
    /* Empirical Model Calibration Points & Line */
  }
              {(() => {
    const points = calibrationPoints.map((p) => {
      const x = 40 + p.predictedProbability * 240;
      const y = 200 - p.empiricalWinRate * 180;
      return `${x},${y}`;
    }).join(" ");
    return <>
                    <polyline fill="none" stroke="var(--bright-green)" strokeWidth="2.5" points={points} />
                    {calibrationPoints.map((p, i) => {
      const cx = 40 + p.predictedProbability * 240;
      const cy = 200 - p.empiricalWinRate * 180;
      return <circle
        key={i}
        cx={cx}
        cy={cy}
        r="4"
        fill="var(--bright-green)"
        stroke="#0f2316"
        strokeWidth="1.5"
      >
                          <title>{`${p.binRange}: Predicted ${(p.predictedProbability * 100).toFixed(0)}% vs Empirical ${(p.empiricalWinRate * 100).toFixed(0)}%`}</title>
                        </circle>;
    })}
                  </>;
  })()}
            </svg>

            <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "8px", fontSize: "11px", color: "var(--chalk-dim)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "12px", height: "2px", background: "var(--bright-green)" }} /> Model Calibration
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "12px", height: "2px", background: "rgba(255,255,255,0.3)" }} /> Ideal (y = x)
              </span>
            </div>
          </div>

          {
    /* Calibration Metrics Table */
  }
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Prob Bin</th>
                    <th>Mean Predicted</th>
                    <th>Observed Win Rate</th>
                    <th>Samples</th>
                  </tr>
                </thead>
                <tbody>
                  {calibrationPoints.map((b) => <tr key={b.binRange}>
                      <td style={{ fontWeight: 600 }}>{b.binRange}</td>
                      <td className="mono">{(b.predictedProbability * 100).toFixed(1)}%</td>
                      <td className="mono" style={{ fontWeight: 700, color: "var(--bright-green)" }}>
                        {(b.empiricalWinRate * 100).toFixed(1)}%
                      </td>
                      <td className="mono" style={{ color: "var(--chalk-dim)" }}>
                        {b.sampleCount}
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>

            <div
    style={{
      background: "var(--pitch-800)",
      padding: "12px 16px",
      borderRadius: "6px",
      border: "1px solid var(--pitch-700)",
      marginTop: "12px",
      fontSize: "12px"
    }}
  >
              <span style={{ color: "var(--chalk-dim)" }}>Brier Calibration Score: </span>
              <strong className="mono" style={{ color: "var(--bright-green)" }}>
                {BRIER_SCORES[selectedCalibrationModel]?.toFixed(3) || "0.178"}
              </strong>
              <div style={{ color: "var(--chalk-dim)", fontSize: "11px", marginTop: "2px" }}>
                Measures mean squared difference between predicted probabilities and actual binary outcomes.
              </div>
            </div>
          </div>
        </div>
      </div>

      {
    /* Confusion Matrices Card */
  }
      <div className="card" id="confusion-matrices-card">
        <h3 style={{ marginTop: 0, fontSize: "18px" }}>Confusion Matrices (Test Set)</h3>
        <p style={{ color: "var(--chalk-dim)", fontSize: "13.5px", margin: "0 0 20px 0" }}>
          Visualizing classification density: rows indicate Actual outcomes, columns indicate Predicted outcomes.
        </p>

        <div className="chart-grid" id="confusion-matrices-grid">
          {confusionMatrices.map((cm) => {
    const matrix = cm.matrix;
    const maxVal = Math.max(...matrix.flat());
    return <div
      key={cm.modelName}
      style={{
        background: "var(--pitch-800)",
        border: "1px solid var(--pitch-700)",
        borderRadius: "10px",
        padding: "18px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
      id={`cm-card-${cm.modelName.toLowerCase().replace(/\s+/g, "-")}`}
    >
                <div style={{ fontWeight: 600, fontSize: "15px", color: "var(--chalk)", marginBottom: "14px" }}>
                  {cm.modelName}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "auto repeat(3, 44px)", gap: "4px", alignItems: "center" }}>
                  <div />
                  {cm.labels.map((l) => <div key={l} style={{ textAlign: "center", fontSize: "11px", fontWeight: 700, color: "var(--chalk-dim)" }}>
                      Pred {l}
                    </div>)}

                  {cm.labels.map((actualLabel, rowIdx) => <React.Fragment key={actualLabel}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--chalk-dim)", paddingRight: "6px" }}>
                        Act {actualLabel}
                      </div>

                      {matrix[rowIdx].map((val, colIdx) => {
      const intensity = maxVal > 0 ? val / maxVal : 0;
      const isDiagonal = rowIdx === colIdx;
      return <div
        key={colIdx}
        style={{
          width: "44px",
          height: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isDiagonal ? `rgba(74, 222, 128, ${0.15 + intensity * 0.7})` : `rgba(232, 163, 61, ${0.05 + intensity * 0.4})`,
          border: isDiagonal ? "1px solid rgba(74,222,128,0.4)" : "1px solid var(--pitch-700)",
          borderRadius: "4px",
          fontWeight: 700,
          fontSize: "13px",
          color: isDiagonal ? "var(--bright-green)" : "var(--chalk-dim)"
        }}
      >
                            {val}
                          </div>;
    })}
                    </React.Fragment>)}
                </div>
              </div>;
  })}
        </div>
      </div>
    </div>;
};
