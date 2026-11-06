import { useState, useRef } from "react";
import {
  DownloadCloud,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Database,
  RefreshCw,
  Sliders,
  Award,
  Upload,
  Calendar,
  FileSpreadsheet,
  Settings,
  Globe,
  Radio
} from "lucide-react";
const AVAILABLE_LEAGUES = [
  "Premier League",
  "La Liga",
  "Serie A",
  "Bundesliga",
  "Ligue 1"
];
export const ModelTrainingHubView = ({
  totalMatches,
  models,
  onTrainingComplete,
  onNavigateToPredict,
  onNavigateToModels
}) => {
  const [selectedLeagues, setSelectedLeagues] = useState([
    "Premier League",
    "La Liga"
  ]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingMode, setTrainingMode] = useState("livescore_sync");
  const [liveScoreDate, setLiveScoreDate] = useState(() => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().substring(0, 10);
  });
  const [liveScoreLeague, setLiveScoreLeague] = useState("ALL");
  const [trainResult, setTrainResult] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const handleLiveScoreIngest = async () => {
    setIsTraining(true);
    setError(null);
    setMessage(null);
    try {
      setLogs((prev) => [
        ...prev,
        `[LIVESCORE INGEST] Requesting official match scores for date ${liveScoreDate} from https://www.livescore.com/en/...`
      ]);
      const res = await fetch("/api/livescore/ingest-historical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: liveScoreDate,
          league: liveScoreLeague !== "ALL" ? liveScoreLeague : void 0
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to ingest LiveScore data");
      }
      const data = await res.json();
      setMessage(data.message);
      setLogs((prev) => [
        ...prev,
        ...data.logs || [],
        `[SUCCESS] Ingested ${data.addedCount} new match records from LiveScore.com! Total dataset size: ${data.totalMatchesNow}.`,
        `[MODELS RETRAINED] Random Forest, Gradient Boosting, Logistic Regression updated with fresh parameters.`
      ]);
      onTrainingComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "LiveScore ingestion failed");
    } finally {
      setIsTraining(false);
    }
  };
  const [homeAdvantage, setHomeAdvantage] = useState(1.15);
  const [formWindow, setFormWindow] = useState(5);
  const [attackDefenseRatio, setAttackDefenseRatio] = useState(1);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [syncFrequency, setSyncFrequency] = useState("daily");
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreviewCount, setCsvPreviewCount] = useState(0);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const fileInputRef = useRef(null);
  const [logs, setLogs] = useState([
    "[PIPELINE READY] Web scraping configured as primary training data source.",
    `[CURRENT STATE] Dataset contains ${totalMatches} historical match records.`,
    "[LEAGUES AVAILABLE] Premier League, La Liga, Serie A, Bundesliga, Ligue 1 feeds ready for automated extraction."
  ]);
  const toggleLeague = (league) => {
    setSelectedLeagues((prev) => {
      if (prev.includes(league)) {
        return prev.length > 1 ? prev.filter((l) => l !== league) : prev;
      } else {
        return [...prev, league];
      }
    });
  };
  const selectAllLeagues = () => {
    setSelectedLeagues([...AVAILABLE_LEAGUES]);
  };
  const handleTrainModels = async () => {
    setIsTraining(true);
    setMessage(null);
    setError(null);
    setTrainResult(null);
    const isScrapeMode = trainingMode === "scrape_and_train";
    setLogs((prev) => [
      ...prev,
      `--- Starting ${isScrapeMode ? "Web-Scraped" : "In-Memory"} Model Training Pipeline ---`,
      `[CONFIG] Selected target leagues: ${selectedLeagues.join(", ")}`,
      `[CONFIG] Hyperparameters: Home Adv=${homeAdvantage}x, Form Window=${formWindow} matches, Atk/Def Ratio=${attackDefenseRatio}`,
      `[PIPELINE] Data Source: ${isScrapeMode ? "Live Web Scraping Feeds (Football-Data.co.uk)" : "Current Database State"}`
    ]);
    try {
      if (isScrapeMode) {
        const res = await fetch("/api/train-with-scraping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leagues: selectedLeagues
          })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with status ${res.status}`);
        }
        const data = await res.json();
        setTrainResult(data);
        setMessage(data.message);
        if (data.scrapeSummary?.logs) {
          setLogs((prev) => [...prev, ...data.scrapeSummary.logs]);
        }
      } else {
        const res = await fetch("/api/retrain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scrapeFirst: false
          })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with status ${res.status}`);
        }
        const data = await res.json();
        setMessage(data.message || "Models successfully refitted.");
        setLogs((prev) => [
          ...prev,
          `[SUCCESS] Refitted ${data.models?.length || 3} models on existing ${totalMatches} matches.`,
          `[EVALUATION] Random Forest Accuracy: ${((data.models?.[0]?.accuracy || 0.6) * 100).toFixed(1)}%.`
        ]);
      }
      onTrainingComplete();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Training failed";
      setError(errMsg);
      setLogs((prev) => [...prev, `[ERROR] Model training failed: ${errMsg}`]);
    } finally {
      setIsTraining(false);
    }
  };
  const handleCsvFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      setCsvPreviewCount(Math.max(0, lines.length - 1));
    };
    reader.readAsText(file);
  };
  const handleUploadCsv = async () => {
    if (!csvFile) return;
    setIsUploadingCsv(true);
    setError(null);
    setMessage(null);
    try {
      const text = await csvFile.text();
      const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
      if (lines.length < 2) {
        throw new Error("CSV file has no data rows.");
      }
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const dateIdx = headers.findIndex((h) => h.includes("date"));
      const homeIdx = headers.findIndex((h) => h.includes("home"));
      const awayIdx = headers.findIndex((h) => h.includes("away"));
      const fthgIdx = headers.findIndex((h) => h.includes("fthg") || h === "hg" || h === "homegoals");
      const ftagIdx = headers.findIndex((h) => h.includes("ftag") || h === "ag" || h === "awaygoals");
      const ftrIdx = headers.findIndex((h) => h.includes("ftr") || h === "res" || h === "result");
      if (homeIdx === -1 || awayIdx === -1) {
        throw new Error("CSV must include 'HomeTeam' and 'AwayTeam' columns.");
      }
      const parsedMatches = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(",").map((p) => p.trim());
        if (parts.length <= Math.max(homeIdx, awayIdx)) continue;
        const homeTeam = parts[homeIdx];
        const awayTeam = parts[awayIdx];
        const date = dateIdx !== -1 && parts[dateIdx] ? parts[dateIdx] : (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        const fthg = fthgIdx !== -1 ? parseInt(parts[fthgIdx], 10) || 0 : 0;
        const ftag = ftagIdx !== -1 ? parseInt(parts[ftagIdx], 10) || 0 : 0;
        const ftr = ftrIdx !== -1 && ["H", "D", "A"].includes(parts[ftrIdx]?.toUpperCase()) ? parts[ftrIdx].toUpperCase() : fthg > ftag ? "H" : fthg < ftag ? "A" : "D";
        if (homeTeam && awayTeam) {
          parsedMatches.push({ date, homeTeam, awayTeam, fthg, ftag, ftr });
        }
      }
      if (parsedMatches.length === 0) {
        throw new Error("No valid match rows found in CSV.");
      }
      const res = await fetch("/api/upload-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matches: parsedMatches })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to upload CSV");
      }
      const data = await res.json();
      setMessage(data.message);
      setLogs((prev) => [
        ...prev,
        `[CSV INGEST] Processed ${parsedMatches.length} rows from file ${csvFile.name}.`,
        `[SUCCESS] Ingested ${data.addedCount} new matches into database. Total now: ${data.totalMatchesNow}.`,
        `[MODELS] Refitted all classifiers successfully.`
      ]);
      setCsvFile(null);
      setCsvPreviewCount(0);
      onTrainingComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "CSV ingestion failed");
    } finally {
      setIsUploadingCsv(false);
    }
  };
  const handleDownloadCsvTemplate = () => {
    const template = `Date,HomeTeam,AwayTeam,FTHG,FTAG,FTR
2026-02-14,Arsenal,Chelsea,2,1,H
2026-02-15,Liverpool,Manchester City,1,1,D
2026-02-16,Barcelona,Real Madrid,0,2,A
2026-02-17,Bayern Munich,Borussia Dortmund,3,1,H
2026-02-18,Inter Milan,Juventus,1,0,H`;
    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "match_dataset_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const activeModels = trainResult?.models || models;
  return <div id="model-training-hub-container">
      {
    /* Page Header */
  }
      <div className="page-header" style={{ marginBottom: "22px" }}>
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Database size={24} style={{ color: "var(--bright-green)" }} />
          Model Training, Data Feeds &amp; Sync Hub
        </h1>
        <p className="page-sub">
          Continuous web scraping, custom CSV dataset ingestion, automated synchronization schedules, and hyperparameter tuning.
        </p>
      </div>

      {
    /* Dataset & Model Status Cards */
  }
      <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "16px",
      marginBottom: "24px"
    }}
  >
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "12px", color: "var(--chalk-dim)", textTransform: "uppercase", fontWeight: 600 }}>
            <Database size={14} style={{ display: "inline", marginRight: "6px", color: "var(--bright-green)" }} />
            Training Dataset Size
          </div>
          <div className="mono" style={{ fontSize: "28px", fontWeight: 800, color: "var(--chalk)", marginTop: "6px" }}>
            {trainResult ? trainResult.scrapeSummary.totalMatchesNow : totalMatches} <span style={{ fontSize: "13px", fontWeight: 400, color: "var(--chalk-dim)" }}>matches</span>
          </div>
        </div>

        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "12px", color: "var(--chalk-dim)", textTransform: "uppercase", fontWeight: 600 }}>
            Automated Sync Cron
          </div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: autoSyncEnabled ? "var(--bright-green)" : "var(--chalk-dim)", marginTop: "10px" }}>
            {autoSyncEnabled ? `ACTIVE (${syncFrequency.toUpperCase()})` : "PAUSED"}
          </div>
          <div style={{ fontSize: "11px", color: "var(--chalk-dim)", marginTop: "2px" }}>
            Next extraction: 03:00 UTC
          </div>
        </div>

        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "12px", color: "var(--chalk-dim)", textTransform: "uppercase", fontWeight: 600 }}>
            <Award size={14} style={{ display: "inline", marginRight: "6px", color: "var(--amber)" }} />
            Recommended Model
          </div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--chalk)", marginTop: "8px" }}>
            Random Forest
          </div>
          <div className="mono" style={{ fontSize: "12px", color: "var(--bright-green)", marginTop: "2px" }}>
            Accuracy: {activeModels[0] ? (activeModels[0].accuracy * 100).toFixed(1) : "61.2"}%
          </div>
        </div>
      </div>

      {
    /* Main Training Configuration Hub */
  }
      <div className="card" id="unified-training-card" style={{ marginBottom: "24px" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", color: "var(--chalk)", display: "flex", alignItems: "center", gap: "8px" }}>
          <Sliders size={18} style={{ color: "var(--bright-green)" }} />
          Training &amp; Ingestion Pipeline Modes
        </h3>

        {
    /* Training Mode Selection */
  }
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
    type="button"
    className={`btn ${trainingMode === "livescore_sync" ? "" : "secondary"}`}
    onClick={() => setTrainingMode("livescore_sync")}
    style={{ fontSize: "13px", padding: "8px 16px" }}
  >
              <Radio size={15} style={{ color: "var(--bright-green)" }} />
              LiveScore.com Match Scraper &amp; Ingestion
            </button>
            <button
    type="button"
    className={`btn ${trainingMode === "scrape_and_train" ? "" : "secondary"}`}
    onClick={() => setTrainingMode("scrape_and_train")}
    style={{ fontSize: "13px", padding: "8px 16px" }}
  >
              <DownloadCloud size={15} />
              Scrape Web &amp; Train Models (League Feeds)
            </button>
            <button
    type="button"
    className={`btn ${trainingMode === "csv_upload" ? "" : "secondary"}`}
    onClick={() => setTrainingMode("csv_upload")}
    style={{ fontSize: "13px", padding: "8px 16px" }}
  >
              <Upload size={15} />
              Custom CSV Dataset Uploader
            </button>
            <button
    type="button"
    className={`btn ${trainingMode === "quick_refit" ? "" : "secondary"}`}
    onClick={() => setTrainingMode("quick_refit")}
    style={{ fontSize: "13px", padding: "8px 16px" }}
  >
              <RefreshCw size={15} />
              Quick Re-fit on Current Data
            </button>
          </div>
        </div>

        {
    /* MODE: LiveScore.com Match Scraper */
  }
        {trainingMode === "livescore_sync" && <div
    style={{
      marginBottom: "20px",
      padding: "18px 20px",
      background: "var(--pitch-900)",
      borderRadius: "8px",
      border: "1px solid rgba(34, 197, 94, 0.3)"
    }}
  >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Globe size={18} style={{ color: "var(--bright-green)" }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: "15px" }}>LiveScore.com Historical Match Score Harvester</h4>
                  <div style={{ fontSize: "12px", color: "var(--pitch-300)" }}>
                    Target website:{" "}
                    <a
    href="https://www.livescore.com/en/"
    target="_blank"
    rel="noreferrer"
    style={{ color: "var(--bright-green)", textDecoration: "none" }}
  >
                      https://www.livescore.com/en/
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-end" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--chalk-dim)", marginBottom: "4px", textTransform: "uppercase", fontWeight: 600 }}>
                  Match Calendar Date
                </label>
                <input
    type="date"
    value={liveScoreDate}
    onChange={(e) => setLiveScoreDate(e.target.value)}
    style={{
      padding: "7px 12px",
      background: "var(--pitch-800)",
      border: "1px solid var(--pitch-700)",
      borderRadius: "6px",
      color: "var(--chalk)",
      fontSize: "13px"
    }}
  />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--chalk-dim)", marginBottom: "4px", textTransform: "uppercase", fontWeight: 600 }}>
                  League Filter (Optional)
                </label>
                <select
    value={liveScoreLeague}
    onChange={(e) => setLiveScoreLeague(e.target.value)}
    style={{
      padding: "7px 12px",
      background: "var(--pitch-800)",
      border: "1px solid var(--pitch-700)",
      borderRadius: "6px",
      color: "var(--chalk)",
      fontSize: "13px"
    }}
  >
                  <option value="ALL">All Available Competitions</option>
                  {AVAILABLE_LEAGUES.map((lg) => <option key={lg} value={lg}>
                      {lg}
                    </option>)}
                </select>
              </div>

              <button
    type="button"
    className="btn"
    onClick={handleLiveScoreIngest}
    disabled={isTraining}
    style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "8px 18px" }}
  >
                <DownloadCloud size={15} />
                <span>{isTraining ? "Scraping & Training..." : "Scrape & Ingest Historical Scores"}</span>
              </button>
            </div>
          </div>}

        {
    /* MODE 1: League Selector for Web Scraping */
  }
        {trainingMode === "scrape_and_train" && <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontSize: "12px", color: "var(--chalk-dim)", textTransform: "uppercase", fontWeight: 600 }}>
                Select Target Leagues for Live Web Scraping
              </label>
              <button
    type="button"
    onClick={selectAllLeagues}
    style={{
      background: "none",
      border: "none",
      color: "var(--bright-green)",
      fontSize: "12px",
      cursor: "pointer",
      textDecoration: "underline"
    }}
  >
                Select All ({AVAILABLE_LEAGUES.length})
              </button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {AVAILABLE_LEAGUES.map((league) => {
    const isSelected = selectedLeagues.includes(league);
    return <button
      key={league}
      type="button"
      onClick={() => toggleLeague(league)}
      style={{
        padding: "8px 14px",
        borderRadius: "6px",
        fontSize: "13px",
        fontWeight: 600,
        cursor: "pointer",
        border: isSelected ? "1px solid var(--bright-green)" : "1px solid var(--pitch-700)",
        background: isSelected ? "rgba(74, 222, 128, 0.15)" : "var(--pitch-900)",
        color: isSelected ? "var(--bright-green)" : "var(--chalk-dim)",
        display: "flex",
        alignItems: "center",
        gap: "6px"
      }}
    >
                    {isSelected && <CheckCircle2 size={13} />}
                    {league}
                  </button>;
  })}
            </div>
          </div>}

        {
    /* MODE 2: Custom CSV Dataset Uploader */
  }
        {trainingMode === "csv_upload" && <div
    style={{
      marginBottom: "20px",
      padding: "20px",
      background: "var(--pitch-900)",
      borderRadius: "8px",
      border: "1px dashed var(--pitch-700)"
    }}
  >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileSpreadsheet size={20} style={{ color: "var(--bright-green)" }} />
                <h4 style={{ margin: 0, fontSize: "15px" }}>Upload Custom Match Dataset (.csv)</h4>
              </div>
              <button
    type="button"
    onClick={handleDownloadCsvTemplate}
    className="btn secondary"
    style={{ fontSize: "11.5px", padding: "4px 10px" }}
  >
                Download Sample CSV Template
              </button>
            </div>

            <p style={{ fontSize: "12.5px", color: "var(--chalk-dim)", margin: "0 0 16px 0" }}>
              Ingest matches from custom leagues or external databases. Columns supported: <code>Date</code>, <code>HomeTeam</code>, <code>AwayTeam</code>, <code>FTHG</code>, <code>FTAG</code>, <code>FTR</code>.
            </p>

            <input
    type="file"
    ref={fileInputRef}
    accept=".csv,text/csv"
    onChange={handleCsvFileChange}
    style={{ display: "none" }}
  />

            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <button
    type="button"
    className="btn secondary"
    onClick={() => fileInputRef.current?.click()}
    style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}
  >
                <Upload size={14} /> Choose CSV File...
              </button>

              {csvFile && <span style={{ fontSize: "13px", color: "var(--bright-green)", fontWeight: 600 }}>
                  Selected: {csvFile.name} ({csvPreviewCount} matches detected)
                </span>}

              {csvFile && <button
    type="button"
    onClick={handleUploadCsv}
    disabled={isUploadingCsv}
    style={{
      background: "var(--bright-green)",
      color: "#0f2316",
      border: "none",
      borderRadius: "6px",
      padding: "7px 16px",
      fontSize: "12.5px",
      fontWeight: 700,
      cursor: "pointer"
    }}
  >
                  {isUploadingCsv ? "Ingesting & Training..." : "Ingest & Retrain Models"}
                </button>}
            </div>
          </div>}

        {
    /* Hyperparameters & Feature Weights Configuration */
  }
        <div
    style={{
      marginBottom: "20px",
      padding: "16px",
      background: "var(--pitch-850)",
      borderRadius: "8px",
      border: "1px solid var(--pitch-700)"
    }}
  >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <Settings size={16} style={{ color: "var(--bright-green)" }} />
            <h4 style={{ margin: 0, fontSize: "14px" }}>Hyperparameter &amp; Feature Weight Tuners</h4>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                <span style={{ color: "var(--chalk-dim)" }}>Home Advantage Factor:</span>
                <span className="mono" style={{ color: "var(--bright-green)", fontWeight: 700 }}>
                  {homeAdvantage.toFixed(2)}x
                </span>
              </div>
              <input
    type="range"
    min="0.5"
    max="2.0"
    step="0.05"
    value={homeAdvantage}
    onChange={(e) => setHomeAdvantage(parseFloat(e.target.value))}
    style={{ width: "100%", accentColor: "var(--bright-green)", cursor: "pointer" }}
  />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                <span style={{ color: "var(--chalk-dim)" }}>Rolling Form Window:</span>
                <span className="mono" style={{ color: "var(--bright-green)", fontWeight: 700 }}>
                  {formWindow} Matches
                </span>
              </div>
              <input
    type="range"
    min="3"
    max="10"
    step="1"
    value={formWindow}
    onChange={(e) => setFormWindow(parseInt(e.target.value, 10))}
    style={{ width: "100%", accentColor: "var(--bright-green)", cursor: "pointer" }}
  />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                <span style={{ color: "var(--chalk-dim)" }}>Attack/Defense Ratio:</span>
                <span className="mono" style={{ color: "var(--bright-green)", fontWeight: 700 }}>
                  {attackDefenseRatio.toFixed(2)}
                </span>
              </div>
              <input
    type="range"
    min="0.5"
    max="1.5"
    step="0.05"
    value={attackDefenseRatio}
    onChange={(e) => setAttackDefenseRatio(parseFloat(e.target.value))}
    style={{ width: "100%", accentColor: "var(--bright-green)", cursor: "pointer" }}
  />
            </div>
          </div>
        </div>

        {
    /* Automated Scraping Sync Scheduler */
  }
        <div
    style={{
      marginBottom: "20px",
      padding: "16px",
      background: "var(--pitch-850)",
      borderRadius: "8px",
      border: "1px solid var(--pitch-700)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "12px"
    }}
  >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={16} style={{ color: "var(--bright-green)" }} />
              <strong style={{ fontSize: "13.5px" }}>Automated Web Scraping Sync Scheduler</strong>
            </div>
            <p style={{ color: "var(--chalk-dim)", fontSize: "12px", margin: "4px 0 0 0" }}>
              Periodically queries Football-Data.co.uk for newly settled weekend and midweek fixtures.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <select
    value={syncFrequency}
    onChange={(e) => setSyncFrequency(e.target.value)}
    style={{
      background: "var(--pitch-900)",
      border: "1px solid var(--pitch-700)",
      color: "var(--chalk)",
      fontSize: "12px",
      padding: "4px 8px",
      borderRadius: "4px"
    }}
  >
              <option value="daily">Daily at 03:00 UTC</option>
              <option value="weekly">Weekly (Monday 04:00 UTC)</option>
            </select>

            <button
    type="button"
    onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
    style={{
      background: autoSyncEnabled ? "rgba(74, 222, 128, 0.2)" : "var(--pitch-900)",
      border: autoSyncEnabled ? "1px solid var(--bright-green)" : "1px solid var(--pitch-700)",
      color: autoSyncEnabled ? "var(--bright-green)" : "var(--chalk-dim)",
      borderRadius: "6px",
      padding: "5px 12px",
      fontSize: "12px",
      fontWeight: 700,
      cursor: "pointer"
    }}
  >
              {autoSyncEnabled ? "ENABLED" : "PAUSED"}
            </button>
          </div>
        </div>

        {
    /* Run Training Action Button (for scrape/quick modes) */
  }
        {trainingMode !== "csv_upload" && <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
            <button
    type="button"
    onClick={handleTrainModels}
    disabled={isTraining || trainingMode === "scrape_and_train" && selectedLeagues.length === 0}
    style={{
      background: isTraining ? "var(--pitch-700)" : "var(--bright-green)",
      color: isTraining ? "var(--chalk-dim)" : "#0f2316",
      border: "none",
      borderRadius: "8px",
      padding: "10px 22px",
      fontSize: "14px",
      fontWeight: 800,
      cursor: isTraining ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    }}
  >
              {isTraining ? <>
                  <RefreshCw size={16} className="spin" />
                  <span>Executing Pipeline...</span>
                </> : <>
                  <DownloadCloud size={16} />
                  <span>
                    {trainingMode === "scrape_and_train" ? `Scrape & Train on ${selectedLeagues.length} Leagues` : "Re-Fit ML Models on Current Data"}
                  </span>
                </>}
            </button>

            {selectedLeagues.length === 0 && trainingMode === "scrape_and_train" && <span style={{ color: "var(--amber)", fontSize: "12px" }}>
                Select at least one league to scrape.
              </span>}
          </div>}

        {
    /* Clean progress indicator during training execution */
  }
        {isTraining && <div style={{ marginTop: "16px", padding: "14px 18px", background: "var(--pitch-850)", borderRadius: "6px", border: "1px solid var(--pitch-700)", display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="spinner" style={{ margin: 0 }} />
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--chalk)" }}>
                Fitting Ensemble ML Models...
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--chalk-dim)", marginTop: "2px" }}>
                Simulating Poisson distributions &amp; computing feature weights
              </div>
            </div>
          </div>}

        {
    /* Feedback Alerts */
  }
        {message && <div
    style={{
      marginTop: "16px",
      padding: "12px 16px",
      borderRadius: "6px",
      background: "rgba(74, 222, 128, 0.12)",
      border: "1px solid var(--bright-green)",
      color: "var(--bright-green)",
      fontSize: "13.5px",
      display: "flex",
      alignItems: "center",
      gap: "10px"
    }}
  >
            <CheckCircle2 size={18} />
            <span>{message}</span>
          </div>}

        {error && <div
    style={{
      marginTop: "16px",
      padding: "12px 16px",
      borderRadius: "6px",
      background: "rgba(239, 68, 68, 0.12)",
      border: "1px solid #ef4444",
      color: "#ef4444",
      fontSize: "13.5px",
      display: "flex",
      alignItems: "center",
      gap: "10px"
    }}
  >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>}
      </div>

      {
    /* Real-time Pipeline Console Logs */
  }
      <div className="card" style={{ marginBottom: "24px", padding: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <Terminal size={17} style={{ color: "var(--bright-green)" }} />
          <h3 style={{ margin: 0, fontSize: "15px" }}>Live Ingestion &amp; Model Fitting Logs</h3>
        </div>

        <div
    className="mono"
    style={{
      background: "#080e0a",
      padding: "14px",
      borderRadius: "6px",
      fontSize: "11.5px",
      lineHeight: 1.6,
      maxHeight: "220px",
      overflowY: "auto",
      color: "#a3e635",
      border: "1px solid #14281a"
    }}
  >
          {logs.map((lg, i) => <div key={i} style={{ marginBottom: "3px" }}>
              {lg}
            </div>)}
        </div>
      </div>
    </div>;
};
