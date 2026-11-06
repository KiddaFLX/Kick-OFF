import {
  Globe,
  Zap,
  Radio,
  DownloadCloud,
  BarChart2,
  Cpu
} from "lucide-react";

import logo from "../images/logo.png";

export const ModernHeader = ({
  currentTab,
  liveMatchCount,
  onSelectTab
}) => {
  return (
    <header
      className="modern-topbar"
      id="app-modern-topbar"
    >
      {/* Zone 1: Brand Logo & Status */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px"
        }}
      >
        <button
          type="button"
          onClick={() => onSelectTab("livescore")}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textAlign: "left"
          }}
        >
          <img
            src={logo}
            alt="SportsEdge Predict"
            style={{
              height: "70px",
              width: "auto",
              objectFit: "contain",
              display: "block"
            }}
          />
        </button>


      </div>

      {/* Zone 2: Navigation Links */}
      <nav
        className="modern-nav-pills"
        id="main-segmented-nav"
      >
        <button
          type="button"
          className={`modern-nav-pill ${
            currentTab === "livescore" ? "active" : ""
          }`}
          onClick={() => onSelectTab("livescore")}
        >
          <Globe size={13} />
          <span>Live Scores</span>
        </button>

        <button
          type="button"
          className={`modern-nav-pill ${
            currentTab === "predict" || currentTab === "result"
              ? "active"
              : ""
          }`}
          onClick={() => onSelectTab("predict")}
        >
          <Zap size={13} />
          <span>Predictor</span>
        </button>

        <button
          type="button"
          className={`modern-nav-pill ${
            currentTab === "live" ? "active" : ""
          }`}
          onClick={() => onSelectTab("live")}
        >
          <Radio size={13} />
          <span>In-Play Live</span>
        </button>

        <button
          type="button"
          className={`modern-nav-pill ${
            currentTab === "train" ? "active" : ""
          }`}
          onClick={() => onSelectTab("train")}
        >
          <DownloadCloud size={13} />
          <span>Training Hub</span>
        </button>

        <button
          type="button"
          className={`modern-nav-pill ${
            currentTab === "models" ? "active" : ""
          }`}
          onClick={() => onSelectTab("models")}
        >
          <BarChart2 size={13} />
          <span>Models</span>
        </button>

        <button
          type="button"
          className={`modern-nav-pill ${
            currentTab === "features" ? "active" : ""
          }`}
          onClick={() => onSelectTab("features")}
        >
          <Cpu size={13} />
          <span>Features</span>
        </button>
      </nav>

      {/* Zone 3: Primary Action */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}
      >
        <button
          type="button"
          className="btn"
          onClick={() => onSelectTab("predict")}
          style={{
            padding: "5px 12px",
            fontSize: "12px",
            fontWeight: 600,
            borderRadius: "5px"
          }}
        >
          <Zap size={12} />
          <span>New Prediction</span>
        </button>
      </div>
    </header>
  );
};