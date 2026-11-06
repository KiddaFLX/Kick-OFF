import { Activity, BarChart2, Cpu, Radio, DownloadCloud, Globe } from "lucide-react";
export const Sidebar = ({ currentTab, onSelectTab, liveMatchCount }) => {
  const isTrainActive = currentTab === "train";
  return <aside className="sidebar" id="app-sidebar">
      <div className="brand" id="brand-header">
        <div className="brand-mark" id="brand-logo-mark">
          SE
        </div>
        <div>
          <div className="brand-name">SportsEdge</div>
          <div className="brand-sub">Predict</div>
        </div>
      </div>

      <nav className="nav" id="main-navigation">
        <button
    type="button"
    id="nav-livescore-btn"
    className={`nav-link ${currentTab === "livescore" ? "active" : ""}`}
    onClick={() => onSelectTab("livescore")}
  >
          <Globe size={16} />
          <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            LiveScore Feed
            <span
    style={{
      fontSize: "9.5px",
      background: "rgba(16, 185, 129, 0.12)",
      color: "var(--bright-green)",
      border: "1px solid rgba(16, 185, 129, 0.25)",
      fontWeight: 600,
      padding: "1px 5px",
      borderRadius: "3px",
      marginLeft: "6px",
      letterSpacing: "0.4px"
    }}
  >
              {liveMatchCount !== void 0 && liveMatchCount > 0 ? `${liveMatchCount} LIVE` : "LIVE"}
            </span>
          </span>
        </button>

        <button
    type="button"
    id="nav-prediction-btn"
    className={`nav-link ${currentTab === "predict" || currentTab === "result" ? "active" : ""}`}
    onClick={() => onSelectTab("predict")}
  >
          <Activity size={16} />
          <span>Match Prediction</span>
        </button>

        <button
    type="button"
    id="nav-live-btn"
    className={`nav-link ${currentTab === "live" ? "active" : ""}`}
    onClick={() => onSelectTab("live")}
  >
          <Radio size={16} />
          <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            Live Predictor
            <span
    style={{
      fontSize: "9px",
      background: "rgba(16, 185, 129, 0.12)",
      color: "var(--bright-green)",
      border: "1px solid rgba(16, 185, 129, 0.25)",
      fontWeight: 600,
      padding: "1px 5px",
      borderRadius: "3px",
      marginLeft: "6px",
      letterSpacing: "0.4px"
    }}
  >
              SIM
            </span>
          </span>
        </button>

        <button
    type="button"
    id="nav-training-btn"
    className={`nav-link ${isTrainActive ? "active" : ""}`}
    onClick={() => onSelectTab("train")}
  >
          <DownloadCloud size={16} />
          <span>Scraper Training</span>
        </button>

        <button
    type="button"
    id="nav-models-btn"
    className={`nav-link ${currentTab === "models" ? "active" : ""}`}
    onClick={() => onSelectTab("models")}
  >
          <BarChart2 size={16} />
          <span>Model Comparison</span>
        </button>

        <button
    type="button"
    id="nav-features-btn"
    className={`nav-link ${currentTab === "features" ? "active" : ""}`}
    onClick={() => onSelectTab("features")}
  >
          <Cpu size={16} />
          <span>Feature Importance</span>
        </button>
      </nav>

      <div className="sidebar-foot" id="sidebar-footer">
        <span>SportsEdge &middot; ML</span>
        <span style={{ opacity: 0.6, fontSize: "10px" }}>v3.5 LiveScore Scraper</span>
      </div>
    </aside>;
};
