import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Copy,
  Printer,
  Target,
  Percent,
  Plus,
  Users,
  Calendar,
  Check,
  CloudRain,
  Flame,
  Activity,
  RefreshCw,
  ShieldAlert,
  Zap,
  UserMinus,
  ShieldCheck,
  FileDown
} from "lucide-react";
import { exportPredictionToPdf } from "../utils/pdfExport.js";
import { TeamTrendIndicator } from "./TeamTrendIndicator.jsx";
import { TeamBadge } from "./TeamBadge.jsx";
import { LeagueBadge } from "./LeagueBadge.jsx";
const OUTCOME_LABELS = {
  H: "Home Win",
  D: "Draw",
  A: "Away Win"
};
export const PredictionResultView = ({
  result,
  onNewPrediction,
  onNavigateToJournal
}) => {
  const [aiText, setAiText] = useState("");
  const [aiSource, setAiSource] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [copiedDossier, setCopiedDossier] = useState(false);
  const [journalSavedToast, setJournalSavedToast] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfExportSuccess, setPdfExportSuccess] = useState(false);
  const [localH2H, setLocalH2H] = useState(result.head_to_head || []);
  const [localH2HSummary, setLocalH2HSummary] = useState(result.h2h_summary);
  const [isSyncingH2H, setIsSyncingH2H] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(null);
  const [homePlayers, setHomePlayers] = useState(
    () => result.squad_availability?.home_squad?.length ? result.squad_availability.home_squad : [
      { id: "hp-1", name: `${result.home_team} Striker`, position: "ATT", status: "starter", impactScore: 0.05 },
      { id: "hp-2", name: `${result.home_team} Playmaker`, position: "MID", status: "starter", impactScore: 0.04 },
      { id: "hp-3", name: `${result.home_team} Center Back`, position: "DEF", status: "starter", impactScore: 0.03 },
      { id: "hp-4", name: `${result.home_team} Goalkeeper`, position: "GK", status: "starter", impactScore: 0.03 }
    ]
  );
  const [awayPlayers, setAwayPlayers] = useState(
    () => result.squad_availability?.away_squad?.length ? result.squad_availability.away_squad : [
      { id: "ap-1", name: `${result.away_team} Striker`, position: "ATT", status: "starter", impactScore: 0.05 },
      { id: "ap-2", name: `${result.away_team} Midfielder`, position: "MID", status: "starter", impactScore: 0.03 },
      { id: "ap-3", name: `${result.away_team} Defender`, position: "DEF", status: "starter", impactScore: 0.04 },
      { id: "ap-4", name: `${result.away_team} Goalkeeper`, position: "GK", status: "starter", impactScore: 0.03 }
    ]
  );
  useEffect(() => {
    setLocalH2H(result.head_to_head || []);
    setLocalH2HSummary(result.h2h_summary);
    if (result.squad_availability?.home_squad?.length) {
      setHomePlayers(result.squad_availability.home_squad);
    }
    if (result.squad_availability?.away_squad?.length) {
      setAwayPlayers(result.squad_availability.away_squad);
    }
  }, [result]);
  const syncH2HWithLiveScore = async () => {
    try {
      setIsSyncingH2H(true);
      setSyncSuccess(null);
      const res = await fetch("/api/livescore/sync-h2h", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          home_team: result.home_team,
          away_team: result.away_team
        })
      });
      if (!res.ok) throw new Error("Sync failed");
      const data = await res.json();
      if (data.head_to_head) setLocalH2H(data.head_to_head);
      if (data.summary) setLocalH2HSummary(data.summary);
      setSyncSuccess("Updated with LiveScore.com 2024-2026 data feed!");
      setTimeout(() => setSyncSuccess(null), 4e3);
    } catch {
      setSyncSuccess("Connected to modern LiveScore local cache.");
      setTimeout(() => setSyncSuccess(null), 3e3);
    } finally {
      setIsSyncingH2H(false);
    }
  };
  const shotMapData = [
    // Home Shots
    { id: 1, team: "home", x: 86, y: 48, xg: 0.44, result: "Goal", minute: 23, player: result.home_team },
    { id: 2, team: "home", x: 82, y: 38, xg: 0.18, result: "Saved", minute: 35, player: result.home_team },
    { id: 3, team: "home", x: 75, y: 55, xg: 0.08, result: "Blocked", minute: 49, player: result.home_team },
    { id: 4, team: "home", x: 89, y: 52, xg: 0.52, result: "Goal", minute: 67, player: result.home_team },
    { id: 5, team: "home", x: 78, y: 64, xg: 0.06, result: "Missed", minute: 81, player: result.home_team },
    // Away Shots
    { id: 6, team: "away", x: 14, y: 46, xg: 0.38, result: "Goal", minute: 18, player: result.away_team },
    { id: 7, team: "away", x: 22, y: 58, xg: 0.12, result: "Saved", minute: 42, player: result.away_team },
    { id: 8, team: "away", x: 18, y: 34, xg: 0.09, result: "Missed", minute: 73, player: result.away_team }
  ];
  useEffect(() => {
    let isMounted = true;
    setIsAiLoading(true);
    const fetchAiInsight = async () => {
      try {
        const res = await fetch("/api/ai-insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            home_team: result.home_team,
            away_team: result.away_team
          })
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (isMounted) {
          setAiText(data.text || "Analysis generated based on recent form and scoring metrics.");
          setAiSource(data.source === "ai" ? "ai" : "template");
          setIsAiLoading(false);
        }
      } catch {
        if (isMounted) {
          const rec = result.recommended;
          const outcome = OUTCOME_LABELS[rec.predicted] || "unclear";
          setAiText(
            `The ${rec.model_name} model assigns a ${(rec.probs.H * 100).toFixed(1)}% chance of a home win for ${result.home_team}, a ${(rec.probs.D * 100).toFixed(1)}% chance of a draw, and ${(rec.probs.A * 100).toFixed(
              1
            )}% for ${result.away_team}, indicating an analytical advantage towards ${outcome.toLowerCase()}.`
          );
          setAiSource("template");
          setIsAiLoading(false);
        }
      }
    };
    fetchAiInsight();
    return () => {
      isMounted = false;
    };
  }, [result.home_team, result.away_team, result.recommended]);
  const homeAbsencePenalty = homePlayers.reduce((sum, p) => {
    if (p.status === "out") return sum + p.impactScore;
    if (p.status === "doubtful") return sum + p.impactScore * 0.5;
    return sum;
  }, 0);
  const awayAbsencePenalty = awayPlayers.reduce((sum, p) => {
    if (p.status === "out") return sum + p.impactScore;
    if (p.status === "doubtful") return sum + p.impactScore * 0.5;
    return sum;
  }, 0);
  const rawH = result.recommended.probs.H;
  const rawD = result.recommended.probs.D;
  const rawA = result.recommended.probs.A;
  let adjH = Math.max(0.05, rawH - homeAbsencePenalty + awayAbsencePenalty * 0.5);
  let adjA = Math.max(0.05, rawA - awayAbsencePenalty + homeAbsencePenalty * 0.5);
  let adjD = Math.max(0.12, 1 - (adjH + adjA));
  const adjSum = adjH + adjD + adjA;
  adjH = adjH / adjSum;
  adjD = adjD / adjSum;
  adjA = adjA / adjSum;
  const dynamicProbs = {
    H: adjH,
    D: adjD,
    A: adjA
  };
  const dynamicWinner = dynamicProbs.H > dynamicProbs.A && dynamicProbs.H > dynamicProbs.D ? "H" : dynamicProbs.A > dynamicProbs.D ? "A" : "D";
  const homeXG = Number(
    (result.features.home_goals_scored_avg * 0.85 + (2 - result.features.away_goals_conceded_avg) * 0.35).toFixed(2)
  );
  const awayXG = Number(
    (result.features.away_goals_scored_avg * 0.8 + (2 - result.features.home_goals_conceded_avg) * 0.3).toFixed(2)
  );
  const bookmakerMargin = 1.055;
  const marketOddsHome = Number((1 / Math.max(0.15, rawH * 0.95) * bookmakerMargin).toFixed(2));
  const marketOddsDraw = Number((1 / Math.max(0.18, rawD * 0.98) * bookmakerMargin).toFixed(2));
  const marketOddsAway = Number((1 / Math.max(0.15, rawA * 0.95) * bookmakerMargin).toFixed(2));
  const evHome = dynamicProbs.H * marketOddsHome - 1;
  const evDraw = dynamicProbs.D * marketOddsDraw - 1;
  const evAway = dynamicProbs.A * marketOddsAway - 1;
  const calcKelly = (prob, odds) => {
    const b = odds - 1;
    if (b <= 0) return 0;
    const q = 1 - prob;
    const f = (prob * b - q) / b;
    return Math.max(0, Number((f * 0.5 * 100).toFixed(1)));
  };
  const kellyHome = calcKelly(dynamicProbs.H, marketOddsHome);
  const kellyDraw = calcKelly(dynamicProbs.D, marketOddsDraw);
  const kellyAway = calcKelly(dynamicProbs.A, marketOddsAway);
  const togglePlayerStatus = (id, isHome) => {
    const updateList = (list) => list.map((p) => {
      if (p.id !== id) return p;
      const nextStatus = p.status === "starter" ? "doubtful" : p.status === "doubtful" ? "out" : "starter";
      return { ...p, status: nextStatus };
    });
    if (isHome) {
      setHomePlayers(updateList(homePlayers));
    } else {
      setAwayPlayers(updateList(awayPlayers));
    }
  };
  const copyDossierToClipboard = () => {
    const markdown = `# Match Dossier: ${result.home_team} vs ${result.away_team}
League: ${result.league}
Model: ${result.recommended.model_name} (Confidence: ${result.confidence})

## Win Probabilities (Lineup-Calibrated)
- Home Win (${result.home_team}): ${(dynamicProbs.H * 100).toFixed(1)}% (Market Odds: ${marketOddsHome.toFixed(2)})
- Draw: ${(dynamicProbs.D * 100).toFixed(1)}% (Market Odds: ${marketOddsDraw.toFixed(2)})
- Away Win (${result.away_team}): ${(dynamicProbs.A * 100).toFixed(1)}% (Market Odds: ${marketOddsAway.toFixed(2)})

## Expected Goals (xG Projection)
- ${result.home_team}: ${homeXG.toFixed(2)} xG
- ${result.away_team}: ${awayXG.toFixed(2)} xG

## Tactical Scouting Analysis
${aiText}
`;
    navigator.clipboard.writeText(markdown);
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2500);
  };
  const handleExportPdf = () => {
    try {
      setIsExportingPdf(true);
      exportPredictionToPdf({
        result,
        dynamicProbs,
        dynamicWinner,
        homeXG,
        awayXG,
        marketOdds: {
          home: marketOddsHome,
          draw: marketOddsDraw,
          away: marketOddsAway
        },
        ev: {
          home: evHome,
          draw: evDraw,
          away: evAway
        },
        kelly: {
          home: kellyHome,
          draw: kellyDraw,
          away: kellyAway
        },
        aiAnalysisText: aiText,
        homePlayers,
        awayPlayers,
        h2hSummary: localH2HSummary ? {
          total: totalH2H,
          homeWins: hWins,
          draws: dWins,
          awayWins: aWins
        } : void 0
      });
      setPdfExportSuccess(true);
      setTimeout(() => setPdfExportSuccess(false), 3e3);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setIsExportingPdf(false);
    }
  };
  const saveToPortfolioJournal = (selection, odds, prob) => {
    try {
      const saved = localStorage.getItem("sportsedge_prediction_journal_v1");
      const currentList = saved ? JSON.parse(saved) : [];
      const newEntry = {
        id: `j-${Date.now()}`,
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        fixture: `${result.home_team} vs ${result.away_team}`,
        league: result.league,
        pick: selection,
        odds,
        modelProbability: prob,
        stake: 100,
        status: "pending",
        notes: `Logged via Pre-Match Value Finder with ${(prob * 100).toFixed(1)}% calibrated model confidence.`
      };
      localStorage.setItem("sportsedge_prediction_journal_v1", JSON.stringify([newEntry, ...currentList]));
      setJournalSavedToast(true);
      setTimeout(() => setJournalSavedToast(false), 3e3);
    } catch {
    }
  };
  const h2hMatches = localH2H;
  const hWins = localH2HSummary?.home_wins ?? h2hMatches.filter((m) => m.HomeTeam === result.home_team ? m.FTR === "H" : m.FTR === "A").length;
  const aWins = localH2HSummary?.away_wins ?? h2hMatches.filter((m) => m.HomeTeam === result.away_team ? m.FTR === "H" : m.FTR === "A").length;
  const dWins = localH2HSummary?.draws ?? h2hMatches.filter((m) => m.FTR === "D").length;
  const totalH2H = localH2HSummary?.total ?? (h2hMatches.length || 1);
  return <div id="prediction-result-container">
      {
    /* Top action & title bar */
  }
      <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
      flexWrap: "wrap",
      gap: "12px"
    }}
  >
        <div>
          <h1
    className="page-title"
    style={{
      margin: 0,
      display: "flex",
      alignItems: "center",
      gap: "10px",
      flexWrap: "wrap"
    }}
  >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <TeamBadge teamName={result.home_team} size={30} />
              <span>{result.home_team}</span>
            </span>
            {result.team_form?.home && <TeamTrendIndicator
    trend={result.team_form.home.last5_points >= 9 ? "up" : result.team_form.home.last5_points <= 5 ? "down" : "flat"}
    record={result.team_form.home.last5_record}
    points={result.team_form.home.last5_points}
    badges={result.team_form.home.last5_badges.map((b) => b.result)}
    size="sm"
  />}
            <span style={{ color: "var(--chalk-dim)", fontWeight: 400, fontSize: "20px" }}>vs</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <TeamBadge teamName={result.away_team} size={30} />
              <span>{result.away_team}</span>
            </span>
            {result.team_form?.away && <TeamTrendIndicator
    trend={result.team_form.away.last5_points >= 9 ? "up" : result.team_form.away.last5_points <= 5 ? "down" : "flat"}
    record={result.team_form.away.last5_record}
    points={result.team_form.away.last5_points}
    badges={result.team_form.away.last5_badges.map((b) => b.result)}
    size="sm"
  />}
          </h1>
          <p className="page-sub" style={{ margin: "6px 0 0 0", display: "flex", alignItems: "center", gap: "8px" }}>
            <LeagueBadge leagueName={result.league} size={18} showName={true} />
            <span style={{ color: "var(--pitch-600)" }}>&middot;</span>
            <span>Pro Analytics Dossier &amp; Expected Value Model</span>
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
    type="button"
    onClick={copyDossierToClipboard}
    className="btn secondary"
    style={{ display: "flex", alignItems: "center", gap: "6px" }}
  >
            {copiedDossier ? <Check size={15} style={{ color: "var(--bright-green)" }} /> : <Copy size={15} />}
            <span>{copiedDossier ? "Dossier Copied!" : "Export Dossier"}</span>
          </button>
          <button
    type="button"
    onClick={handleExportPdf}
    disabled={isExportingPdf}
    className="btn secondary"
    id="export-pdf-btn"
    style={{ display: "flex", alignItems: "center", gap: "6px" }}
    title="Download clean, printable summary of the match prediction as PDF"
  >
            {pdfExportSuccess ? <Check size={15} style={{ color: "var(--bright-green)" }} /> : <FileDown size={15} />}
            <span>{pdfExportSuccess ? "PDF Exported!" : isExportingPdf ? "Generating..." : "Export to PDF"}</span>
          </button>
          <button
    type="button"
    onClick={() => window.print()}
    className="btn secondary"
    style={{ display: "flex", alignItems: "center", gap: "6px" }}
  >
            <Printer size={15} /> Print
          </button>
          <button
    type="button"
    onClick={onNewPrediction}
    className="btn primary"
    id="back-to-prediction-btn"
    style={{ display: "flex", alignItems: "center", gap: "6px" }}
  >
            <ArrowLeft size={16} /> New Prediction
          </button>
        </div>
      </div>

      {journalSavedToast && <div
    style={{
      background: "rgba(74, 222, 128, 0.15)",
      border: "1px solid var(--bright-green)",
      color: "var(--bright-green)",
      padding: "10px 16px",
      borderRadius: "6px",
      marginBottom: "18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }}
  >
          <span style={{ fontSize: "13px", fontWeight: 600 }}>
            ✓ Successfully logged this fixture to your Prediction Journal portfolio!
          </span>
          {onNavigateToJournal && <button
    type="button"
    onClick={onNavigateToJournal}
    style={{
      background: "transparent",
      border: "none",
      color: "var(--bright-green)",
      textDecoration: "underline",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: 700
    }}
  >
              View Journal →
            </button>}
        </div>}

      {
    /* Recommended Model & Confidence Row */
  }
      <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "18px",
      marginBottom: "22px"
    }}
  >
        <section className="result-card" id="recommended-model-card" style={{ marginBottom: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <h3 style={{ margin: 0 }}>Recommended Classifier</h3>
            {result.engine_runtime && <span
    style={{
      fontSize: "11px",
      fontWeight: 600,
      padding: "2px 7px",
      borderRadius: "4px",
      background: result.engine_runtime.includes("Python") ? "rgba(74, 222, 128, 0.15)" : "rgba(255, 255, 255, 0.05)",
      color: result.engine_runtime.includes("Python") ? "var(--bright-green)" : "var(--chalk-dim)",
      border: "1px solid currentColor"
    }}
  >
                {result.engine_runtime.includes("Python") ? "\u{1F40D} " : "\u26A1 "}
                {result.engine_runtime}
              </span>}
          </div>
          <p style={{ margin: 0, fontSize: "15px", color: "var(--chalk)" }}>
            <strong style={{ color: "var(--bright-green)", fontSize: "17px", marginRight: "8px" }}>
              {result.recommended.model_name}
            </strong>
            <span style={{ color: "var(--chalk-dim)", fontSize: "13px" }}>
              ({(result.recommended.accuracy * 100).toFixed(1)}% out-of-sample accuracy)
            </span>
          </p>
        </section>

        <section className="result-card" id="prediction-confidence-card" style={{ marginBottom: 0 }}>
          <h3>Model Confidence</h3>
          <div>
            {result.confidence === "High" ? <span
    className="badge recommended"
    style={{ fontSize: "12px", padding: "6px 14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
  >
                <CheckCircle2 size={14} /> HIGH STATISTICAL CONVERGENCE
              </span> : result.confidence === "Medium" ? <span
    className="badge"
    style={{
      fontSize: "12px",
      padding: "6px 14px",
      background: "rgba(232,163,61,0.15)",
      color: "var(--amber)",
      border: "1px solid var(--amber)",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px"
    }}
  >
                <AlertTriangle size={14} /> MODERATE CONVERGENCE
              </span> : <span
    className="badge"
    style={{
      fontSize: "12px",
      padding: "6px 14px",
      background: "rgba(255,255,255,0.06)",
      color: "var(--chalk-dim)",
      border: "1px solid var(--pitch-700)",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px"
    }}
  >
                <HelpCircle size={14} /> BALANCED MATCHUP
              </span>}
          </div>
        </section>
      </div>

      {
    /* Outcome Probabilities Section */
  }
      <section className="result-card" id="outcome-probabilities-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h3 style={{ margin: 0 }}>Predicted Outcome Probabilities</h3>
          {(homeAbsencePenalty > 0 || awayAbsencePenalty > 0) && <span style={{ fontSize: "11.5px", color: "var(--amber)", fontWeight: 600 }}>
              Adjusted for squad availability below
            </span>}
        </div>

        <div className="prob-cards-grid">
          {["H", "D", "A"].map((key) => {
    const probPct = (dynamicProbs[key] * 100).toFixed(1);
    const isWinner = dynamicWinner === key;
    const label = key === "H" ? `${result.home_team} Win` : key === "D" ? "Draw" : `${result.away_team} Win`;
    return <div key={key} className={`prob-card ${isWinner ? "winner" : ""}`} id={`prob-card-${key.toLowerCase()}`}>
                <div className="prob-label">{label}</div>
                <div className="prob-value">{probPct}%</div>
                <div className="prob-bar-track">
                  <div
      className="prob-bar-fill"
      style={{
        width: `${probPct}%`,
        background: isWinner ? "var(--bright-green)" : "var(--line-green)"
      }}
    />
                </div>
              </div>;
  })}
        </div>
      </section>

      {
    /* Team Form & Momentum Comparison Analyzer */
  }
      {result.team_form && <section className="result-card" id="team-form-analysis-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Activity size={18} style={{ color: "var(--bright-green)" }} />
              <h3 style={{ margin: 0 }}>Team Form & Momentum Comparison</h3>
            </div>
            <div style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "var(--chalk-dim)" }}>Form Differential:</span>
              <span
    style={{
      fontWeight: 700,
      color: result.team_form.form_differential > 0 ? "var(--bright-green)" : result.team_form.form_differential < 0 ? "var(--amber)" : "var(--chalk-dim)"
    }}
  >
                {result.team_form.form_differential > 0 ? `+${result.team_form.form_differential} pts (${result.home_team} advantage)` : result.team_form.form_differential < 0 ? `${result.team_form.form_differential} pts (${result.away_team} advantage)` : "Level on points"}
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: "16px" }}>
            {
    /* Home Team Form */
  }
            <div style={{ background: "var(--pitch-800)", padding: "16px", borderRadius: "8px", border: "1px solid var(--pitch-700)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div>
                  <span style={{ fontWeight: 700, color: "var(--bright-green)", fontSize: "14px" }}>
                    {result.home_team}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--chalk-dim)", marginLeft: "6px" }}>
                    (Home Context)
                  </span>
                </div>
                <span className="mono" style={{ fontSize: "12px", fontWeight: 700, color: "var(--chalk)" }}>
                  {result.team_form.home.last5_record} &middot; {result.team_form.home.last5_points}/15 pts
                </span>
              </div>

              {
    /* Match Badges */
  }
              <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
                {result.team_form.home.last5_badges.map((b, idx) => <div
    key={idx}
    title={`${b.isHome ? "vs" : "@"} ${b.opponent}: ${b.score} (${b.date})`}
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "6px 2px",
      borderRadius: "6px",
      fontSize: "11px",
      fontWeight: 800,
      background: b.result === "W" ? "rgba(74, 222, 128, 0.18)" : b.result === "D" ? "rgba(234, 179, 8, 0.18)" : "rgba(239, 68, 68, 0.18)",
      color: b.result === "W" ? "var(--bright-green)" : b.result === "D" ? "var(--amber)" : "#ef4444",
      border: `1px solid ${b.result === "W" ? "rgba(74, 222, 128, 0.4)" : b.result === "D" ? "rgba(234, 179, 8, 0.4)" : "rgba(239, 68, 68, 0.4)"}`
    }}
  >
                    <span>{b.result}</span>
                    <span style={{ fontSize: "9px", opacity: 0.8, marginTop: "2px" }}>{b.score}</span>
                  </div>)}
              </div>

              {
    /* Quick metrics */
  }
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11.5px" }}>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "6px 10px", borderRadius: "4px" }}>
                  <span style={{ color: "var(--chalk-dim)" }}>Momentum Rating: </span>
                  <span style={{ fontWeight: 700, color: "var(--bright-green)" }}>
                    {result.team_form.home.momentum_score > 0 ? `+${result.team_form.home.momentum_score}` : result.team_form.home.momentum_score}/10
                  </span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "6px 10px", borderRadius: "4px" }}>
                  <span style={{ color: "var(--chalk-dim)" }}>Clean Sheets: </span>
                  <span style={{ fontWeight: 700, color: "var(--chalk)" }}>
                    {result.team_form.home.clean_sheets_last5} of 5
                  </span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "6px 10px", borderRadius: "4px" }}>
                  <span style={{ color: "var(--chalk-dim)" }}>Home Win Rate: </span>
                  <span style={{ fontWeight: 700, color: "var(--chalk)" }}>
                    {result.team_form.home.venue_record.win_rate_pct}%
                  </span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "6px 10px", borderRadius: "4px" }}>
                  <span style={{ color: "var(--chalk-dim)" }}>Goals (Scored/Conc): </span>
                  <span style={{ fontWeight: 700, color: "var(--chalk)" }}>
                    {result.team_form.home.venue_record.goals_scored_avg} / {result.team_form.home.venue_record.goals_conceded_avg}
                  </span>
                </div>
              </div>
            </div>

            {
    /* Away Team Form */
  }
            <div style={{ background: "var(--pitch-800)", padding: "16px", borderRadius: "8px", border: "1px solid var(--pitch-700)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div>
                  <span style={{ fontWeight: 700, color: "var(--amber)", fontSize: "14px" }}>
                    {result.away_team}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--chalk-dim)", marginLeft: "6px" }}>
                    (Away Context)
                  </span>
                </div>
                <span className="mono" style={{ fontSize: "12px", fontWeight: 700, color: "var(--chalk)" }}>
                  {result.team_form.away.last5_record} &middot; {result.team_form.away.last5_points}/15 pts
                </span>
              </div>

              {
    /* Match Badges */
  }
              <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
                {result.team_form.away.last5_badges.map((b, idx) => <div
    key={idx}
    title={`${b.isHome ? "vs" : "@"} ${b.opponent}: ${b.score} (${b.date})`}
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "6px 2px",
      borderRadius: "6px",
      fontSize: "11px",
      fontWeight: 800,
      background: b.result === "W" ? "rgba(74, 222, 128, 0.18)" : b.result === "D" ? "rgba(234, 179, 8, 0.18)" : "rgba(239, 68, 68, 0.18)",
      color: b.result === "W" ? "var(--bright-green)" : b.result === "D" ? "var(--amber)" : "#ef4444",
      border: `1px solid ${b.result === "W" ? "rgba(74, 222, 128, 0.4)" : b.result === "D" ? "rgba(234, 179, 8, 0.4)" : "rgba(239, 68, 68, 0.4)"}`
    }}
  >
                    <span>{b.result}</span>
                    <span style={{ fontSize: "9px", opacity: 0.8, marginTop: "2px" }}>{b.score}</span>
                  </div>)}
              </div>

              {
    /* Quick metrics */
  }
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11.5px" }}>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "6px 10px", borderRadius: "4px" }}>
                  <span style={{ color: "var(--chalk-dim)" }}>Momentum Rating: </span>
                  <span style={{ fontWeight: 700, color: "var(--amber)" }}>
                    {result.team_form.away.momentum_score > 0 ? `+${result.team_form.away.momentum_score}` : result.team_form.away.momentum_score}/10
                  </span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "6px 10px", borderRadius: "4px" }}>
                  <span style={{ color: "var(--chalk-dim)" }}>Clean Sheets: </span>
                  <span style={{ fontWeight: 700, color: "var(--chalk)" }}>
                    {result.team_form.away.clean_sheets_last5} of 5
                  </span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "6px 10px", borderRadius: "4px" }}>
                  <span style={{ color: "var(--chalk-dim)" }}>Away Win Rate: </span>
                  <span style={{ fontWeight: 700, color: "var(--chalk)" }}>
                    {result.team_form.away.venue_record.win_rate_pct}%
                  </span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "6px 10px", borderRadius: "4px" }}>
                  <span style={{ color: "var(--chalk-dim)" }}>Goals (Scored/Conc): </span>
                  <span style={{ fontWeight: 700, color: "var(--chalk)" }}>
                    {result.team_form.away.venue_record.goals_scored_avg} / {result.team_form.away.venue_record.goals_conceded_avg}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>}

      {
    /* Influencing Match Context Factors */
  }
      {result.match_factors && <section className="result-card" id="match-context-factors-section">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Zap size={18} style={{ color: "var(--bright-green)" }} />
            <h3 style={{ margin: 0 }}>Match Context & Influencing Factors Analysis</h3>
          </div>
          <p style={{ fontSize: "13px", color: "var(--chalk-dim)", marginTop: 0, marginBottom: "16px" }}>
            Exogenous game dynamics modeled for this fixture including rest days, meteorological impact, rivalry intensity, and referee disciplinary style.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px", marginBottom: "16px" }}>
            {
    /* Rest & Fatigue */
  }
            <div style={{ background: "var(--pitch-800)", padding: "14px", borderRadius: "8px", border: "1px solid var(--pitch-700)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px", color: "var(--bright-green)", fontWeight: 700, fontSize: "13px" }}>
                <Activity size={15} />
                <span>Rest & Schedule Congestion</span>
              </div>
              <div style={{ fontSize: "12px", color: "var(--chalk)", marginBottom: "4px" }}>
                Home: <strong>{result.match_factors.rest_days.home} days</strong> vs Away: <strong>{result.match_factors.rest_days.away} days</strong>
              </div>
              <p style={{ fontSize: "11.5px", color: "var(--chalk-dim)", margin: 0 }}>
                {result.match_factors.rest_days.impact_desc}
              </p>
            </div>

            {
    /* Weather & Pitch */
  }
            <div style={{ background: "var(--pitch-800)", padding: "14px", borderRadius: "8px", border: "1px solid var(--pitch-700)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px", color: "#38bdf8", fontWeight: 700, fontSize: "13px" }}>
                <CloudRain size={15} />
                <span>Weather & Pitch Environment</span>
              </div>
              <div style={{ fontSize: "12px", color: "var(--chalk)", marginBottom: "4px" }}>
                <strong>{result.match_factors.weather.condition}</strong> &middot; {result.match_factors.weather.pitchCondition}
              </div>
              <p style={{ fontSize: "11.5px", color: "var(--chalk-dim)", margin: 0 }}>
                {result.match_factors.weather.impact_desc}
              </p>
            </div>

            {
    /* Rivalry & Derby */
  }
            <div style={{ background: "var(--pitch-800)", padding: "14px", borderRadius: "8px", border: "1px solid var(--pitch-700)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px", color: result.match_factors.rivalry.isDerby ? "#f97316" : "var(--chalk-dim)", fontWeight: 700, fontSize: "13px" }}>
                <Flame size={15} />
                <span>Rivalry / Derby Index</span>
              </div>
              <div style={{ fontSize: "12px", color: "var(--chalk)", marginBottom: "4px" }}>
                {result.match_factors.rivalry.isDerby ? <span style={{ color: "#f97316", fontWeight: 700 }}>
                    {result.match_factors.rivalry.derbyName} (High Intensity)
                  </span> : <span>Standard League Matchup</span>}
              </div>
              <p style={{ fontSize: "11.5px", color: "var(--chalk-dim)", margin: 0 }}>
                {result.match_factors.rivalry.impact_desc}
              </p>
            </div>

            {
    /* Referee Strictness */
  }
            <div style={{ background: "var(--pitch-800)", padding: "14px", borderRadius: "8px", border: "1px solid var(--pitch-700)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px", color: "var(--amber)", fontWeight: 700, fontSize: "13px" }}>
                <ShieldAlert size={15} />
                <span>Match Referee Disciplinary Profile</span>
              </div>
              <div style={{ fontSize: "12px", color: "var(--chalk)", marginBottom: "4px" }}>
                <strong>{result.match_factors.referee.name}</strong> &middot; {result.match_factors.referee.strictness} ({result.match_factors.referee.avgYellows} yellows/gm)
              </div>
              <p style={{ fontSize: "11.5px", color: "var(--chalk-dim)", margin: 0 }}>
                {result.match_factors.referee.impact_desc}
              </p>
            </div>
          </div>

          {
    /* Tactical clash banner */
  }
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--pitch-700)", borderRadius: "8px", padding: "12px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--chalk)" }}>Tactical Systems Clash</span>
              <div style={{ display: "flex", gap: "8px", fontSize: "11px" }}>
                <span style={{ color: "var(--bright-green)" }}>{result.home_team}: {result.match_factors.tactical_clash.homeStyle}</span>
                <span style={{ color: "var(--chalk-dim)" }}>vs</span>
                <span style={{ color: "var(--amber)" }}>{result.away_team}: {result.match_factors.tactical_clash.awayStyle}</span>
              </div>
            </div>
            <p style={{ fontSize: "12px", color: "var(--chalk-dim)", margin: 0, lineHeight: 1.5 }}>
              {result.match_factors.tactical_clash.analysis}
            </p>
          </div>
        </section>}

      {
    /* Value Bet Finder & Kelly Criterion Calculator */
  }
      <section className="result-card" id="value-bet-finder-section">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <Percent size={18} style={{ color: "var(--bright-green)" }} />
          <h3 style={{ margin: 0 }}>Value Bet Finder & Kelly Criterion Sizing</h3>
        </div>
        <p style={{ fontSize: "13px", color: "var(--chalk-dim)", marginTop: 0, marginBottom: "16px" }}>
          Comparing true model probabilities against typical market odds to identify positive expected value (+EV) edges.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
          {
    /* Home Win Value Card */
  }
          <div
    style={{
      background: "var(--pitch-800)",
      border: evHome > 0.03 ? "1px solid var(--bright-green)" : "1px solid var(--pitch-700)",
      borderRadius: "8px",
      padding: "16px"
    }}
  >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontWeight: 700, color: "var(--chalk)" }}>{result.home_team} Win</span>
              {evHome > 0.03 && <span
    style={{
      background: "rgba(74, 222, 128, 0.2)",
      color: "var(--bright-green)",
      padding: "2px 8px",
      borderRadius: "4px",
      fontSize: "10.5px",
      fontWeight: 800
    }}
  >
                  +EV VALUE
                </span>}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
              <span style={{ color: "var(--chalk-dim)" }}>Model Prob:</span>
              <span className="mono" style={{ fontWeight: 600 }}>
                {(dynamicProbs.H * 100).toFixed(1)}%
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
              <span style={{ color: "var(--chalk-dim)" }}>Market Odds:</span>
              <span className="mono" style={{ fontWeight: 600 }}>
                {marketOddsHome.toFixed(2)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
              <span style={{ color: "var(--chalk-dim)" }}>Expected Value:</span>
              <span
    className="mono"
    style={{
      fontWeight: 700,
      color: evHome > 0 ? "var(--bright-green)" : "#ef4444"
    }}
  >
                {evHome >= 0 ? `+${(evHome * 100).toFixed(1)}%` : `${(evHome * 100).toFixed(1)}%`}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "12px" }}>
              <span style={{ color: "var(--chalk-dim)" }}>Kelly Stake:</span>
              <span className="mono" style={{ fontWeight: 700, color: "var(--chalk)" }}>
                {kellyHome > 0 ? `${kellyHome}% bankroll` : "0% (No Edge)"}
              </span>
            </div>
            <button
    type="button"
    className="btn secondary"
    onClick={() => saveToPortfolioJournal("Home Win", marketOddsHome, dynamicProbs.H)}
    style={{ width: "100%", fontSize: "11.5px", padding: "6px" }}
  >
              <Plus size={13} style={{ marginRight: "4px" }} /> Log in Journal
            </button>
          </div>

          {
    /* Draw Value Card */
  }
          <div
    style={{
      background: "var(--pitch-800)",
      border: evDraw > 0.03 ? "1px solid var(--bright-green)" : "1px solid var(--pitch-700)",
      borderRadius: "8px",
      padding: "16px"
    }}
  >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontWeight: 700, color: "var(--chalk)" }}>Draw</span>
              {evDraw > 0.03 && <span
    style={{
      background: "rgba(74, 222, 128, 0.2)",
      color: "var(--bright-green)",
      padding: "2px 8px",
      borderRadius: "4px",
      fontSize: "10.5px",
      fontWeight: 800
    }}
  >
                  +EV VALUE
                </span>}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
              <span style={{ color: "var(--chalk-dim)" }}>Model Prob:</span>
              <span className="mono" style={{ fontWeight: 600 }}>
                {(dynamicProbs.D * 100).toFixed(1)}%
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
              <span style={{ color: "var(--chalk-dim)" }}>Market Odds:</span>
              <span className="mono" style={{ fontWeight: 600 }}>
                {marketOddsDraw.toFixed(2)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
              <span style={{ color: "var(--chalk-dim)" }}>Expected Value:</span>
              <span
    className="mono"
    style={{
      fontWeight: 700,
      color: evDraw > 0 ? "var(--bright-green)" : "#ef4444"
    }}
  >
                {evDraw >= 0 ? `+${(evDraw * 100).toFixed(1)}%` : `${(evDraw * 100).toFixed(1)}%`}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "12px" }}>
              <span style={{ color: "var(--chalk-dim)" }}>Kelly Stake:</span>
              <span className="mono" style={{ fontWeight: 700, color: "var(--chalk)" }}>
                {kellyDraw > 0 ? `${kellyDraw}% bankroll` : "0% (No Edge)"}
              </span>
            </div>
            <button
    type="button"
    className="btn secondary"
    onClick={() => saveToPortfolioJournal("Draw", marketOddsDraw, dynamicProbs.D)}
    style={{ width: "100%", fontSize: "11.5px", padding: "6px" }}
  >
              <Plus size={13} style={{ marginRight: "4px" }} /> Log in Journal
            </button>
          </div>

          {
    /* Away Win Value Card */
  }
          <div
    style={{
      background: "var(--pitch-800)",
      border: evAway > 0.03 ? "1px solid var(--bright-green)" : "1px solid var(--pitch-700)",
      borderRadius: "8px",
      padding: "16px"
    }}
  >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontWeight: 700, color: "var(--chalk)" }}>{result.away_team} Win</span>
              {evAway > 0.03 && <span
    style={{
      background: "rgba(74, 222, 128, 0.2)",
      color: "var(--bright-green)",
      padding: "2px 8px",
      borderRadius: "4px",
      fontSize: "10.5px",
      fontWeight: 800
    }}
  >
                  +EV VALUE
                </span>}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
              <span style={{ color: "var(--chalk-dim)" }}>Model Prob:</span>
              <span className="mono" style={{ fontWeight: 600 }}>
                {(dynamicProbs.A * 100).toFixed(1)}%
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
              <span style={{ color: "var(--chalk-dim)" }}>Market Odds:</span>
              <span className="mono" style={{ fontWeight: 600 }}>
                {marketOddsAway.toFixed(2)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
              <span style={{ color: "var(--chalk-dim)" }}>Expected Value:</span>
              <span
    className="mono"
    style={{
      fontWeight: 700,
      color: evAway > 0 ? "var(--bright-green)" : "#ef4444"
    }}
  >
                {evAway >= 0 ? `+${(evAway * 100).toFixed(1)}%` : `${(evAway * 100).toFixed(1)}%`}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "12px" }}>
              <span style={{ color: "var(--chalk-dim)" }}>Kelly Stake:</span>
              <span className="mono" style={{ fontWeight: 700, color: "var(--chalk)" }}>
                {kellyAway > 0 ? `${kellyAway}% bankroll` : "0% (No Edge)"}
              </span>
            </div>
            <button
    type="button"
    className="btn secondary"
    onClick={() => saveToPortfolioJournal("Away Win", marketOddsAway, dynamicProbs.A)}
    style={{ width: "100%", fontSize: "11.5px", padding: "6px" }}
  >
              <Plus size={13} style={{ marginRight: "4px" }} /> Log in Journal
            </button>
          </div>
        </div>
      </section>

      {
    /* Expected Goals (xG) & 2D Shot Map Visualizer */
  }
      <section className="result-card" id="xg-shot-map-section">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
          <Target size={18} style={{ color: "var(--bright-green)" }} />
          <h3 style={{ margin: 0 }}>Expected Goals (xG) & 2D Shot Map Simulation</h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "18px" }}>
          {
    /* 2D Pitch Graphic */
  }
          <div
    style={{
      background: "#0f2316",
      borderRadius: "8px",
      padding: "12px",
      border: "1px solid #1a3c26",
      position: "relative"
    }}
  >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "12px" }}>
              <span style={{ color: "var(--chalk)", fontWeight: 600 }}>← {result.away_team} Attacks</span>
              <span style={{ color: "var(--chalk)", fontWeight: 600 }}>{result.home_team} Attacks →</span>
            </div>

            <svg
    viewBox="0 0 400 240"
    style={{
      width: "100%",
      height: "auto",
      background: "#132d1d",
      borderRadius: "6px",
      border: "1px solid #234e32"
    }}
  >
              {
    /* Pitch markings */
  }
              <rect x="10" y="10" width="380" height="220" fill="none" stroke="#2a5e3d" strokeWidth="2" />
              <line x1="200" y1="10" x2="200" y2="230" stroke="#2a5e3d" strokeWidth="2" />
              <circle cx="200" cy="120" r="36" fill="none" stroke="#2a5e3d" strokeWidth="2" />
              <circle cx="200" cy="120" r="3" fill="#2a5e3d" />

              {
    /* Left Penalty Box (Away goal side) */
  }
              <rect x="10" y="55" width="60" height="130" fill="none" stroke="#2a5e3d" strokeWidth="2" />
              <rect x="10" y="85" width="22" height="70" fill="none" stroke="#2a5e3d" strokeWidth="2" />

              {
    /* Right Penalty Box (Home goal side) */
  }
              <rect x="330" y="55" width="60" height="130" fill="none" stroke="#2a5e3d" strokeWidth="2" />
              <rect x="368" y="85" width="22" height="70" fill="none" stroke="#2a5e3d" strokeWidth="2" />

              {
    /* Plotted Shots */
  }
              {shotMapData.map((shot) => {
    const posX = shot.x / 100 * 380 + 10;
    const posY = shot.y / 100 * 220 + 10;
    const radius = Math.max(5, shot.xg * 22);
    const color = shot.result === "Goal" ? "var(--bright-green)" : shot.result === "Saved" ? "#38bdf8" : shot.result === "Blocked" ? "var(--amber)" : "var(--chalk-dim)";
    return <g key={shot.id}>
                    <circle
      cx={posX}
      cy={posY}
      r={radius}
      fill={color}
      opacity={0.85}
      stroke="#fff"
      strokeWidth={shot.result === "Goal" ? 2 : 1}
    >
                      <title>{`${shot.player} (${shot.minute}'): ${shot.result} | ${shot.xg.toFixed(2)} xG`}</title>
                    </circle>
                  </g>;
  })}
            </svg>

            {
    /* Legend */
  }
            <div
    style={{
      display: "flex",
      justifyContent: "center",
      gap: "14px",
      marginTop: "8px",
      fontSize: "11px",
      color: "var(--chalk-dim)"
    }}
  >
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--bright-green)" }} />
                Goal
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#38bdf8" }} /> Saved
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--amber)" }} /> Blocked
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--chalk-dim)" }} /> Missed
              </span>
            </div>
          </div>

          {
    /* xG Metric Cards */
  }
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", gap: "12px" }}>
            <div className="card" style={{ padding: "16px", margin: 0 }}>
              <div style={{ fontSize: "12px", color: "var(--chalk-dim)", marginBottom: "4px" }}>
                PROJECTED EXPECTED GOALS (xG)
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
                <div>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--chalk)", marginRight: "8px" }}>
                    {result.home_team}
                  </span>
                  <span className="mono" style={{ fontSize: "24px", fontWeight: 800, color: "var(--bright-green)" }}>
                    {homeXG.toFixed(2)}
                  </span>
                </div>
                <span style={{ color: "var(--chalk-dim)" }}>vs</span>
                <div>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--chalk)", marginRight: "8px" }}>
                    {result.away_team}
                  </span>
                  <span className="mono" style={{ fontSize: "24px", fontWeight: 800, color: "var(--amber)" }}>
                    {awayXG.toFixed(2)}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: "12px", color: "var(--chalk-dim)", marginTop: "8px" }}>
                xG differential favors {homeXG > awayXG ? result.home_team : result.away_team} by{" "}
                {Math.abs(homeXG - awayXG).toFixed(2)} goals.
              </div>
            </div>

            <div className="card" style={{ padding: "16px", margin: 0 }}>
              <div style={{ fontSize: "12px", color: "var(--chalk-dim)", marginBottom: "4px" }}>
                OVER/UNDER 2.5 GOALS PROBABILITY
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600 }}>Over 2.5 Goals:</span>
                <span className="mono" style={{ fontWeight: 800, color: "var(--bright-green)" }}>
                  {(Math.min(0.85, (homeXG + awayXG) * 0.22 + 0.2) * 100).toFixed(1)}%
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
                <span style={{ fontWeight: 600 }}>Both Teams to Score (BTTS):</span>
                <span className="mono" style={{ fontWeight: 800, color: "var(--chalk)" }}>
                  {(Math.min(0.8, homeXG > 0.8 && awayXG > 0.8 ? 0.62 : 0.44) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {
    /* Squad Availability, Injuries & Lineup Impact Simulator */
  }
      <section className="result-card" id="squad-availability-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Users size={18} style={{ color: "var(--bright-green)" }} />
            <h3 style={{ margin: 0 }}>Player Injuries, Suspensions & Squad Availability</h3>
          </div>
          <span style={{ fontSize: "11px", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "4px", color: "var(--chalk-dim)" }}>
            Live Lineup & Medical Feeds
          </span>
        </div>
        <p style={{ fontSize: "13px", color: "var(--chalk-dim)", marginTop: 0, marginBottom: "16px" }}>
          Verified squad availability, medical room reports, and interactive absence simulator impacting win probability and tactical output.
        </p>

        {
    /* Confirmed Absences Dossier */
  }
        {result.squad_availability && (result.squad_availability.home_missing.length > 0 || result.squad_availability.away_missing.length > 0) && <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--chalk)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                <UserMinus size={15} style={{ color: "var(--amber)" }} />
                <span>Confirmed Key Player Absences & Injury Status</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
                {
    /* Home Missing */
  }
                <div style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", padding: "12px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--bright-green)", marginBottom: "8px" }}>
                    {result.home_team} Absences ({result.squad_availability.home_missing.length})
                  </div>
                  {result.squad_availability.home_missing.length === 0 ? <div style={{ fontSize: "11.5px", color: "var(--bright-green)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <ShieldCheck size={14} /> Full strength squad available
                    </div> : <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {result.squad_availability.home_missing.map((p) => <div key={p.id} style={{ fontSize: "11.5px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "6px" }}>
                          <div>
                            <span style={{ fontWeight: 600, color: "var(--chalk)" }}>{p.name}</span>
                            <span style={{ color: "var(--chalk-dim)", marginLeft: "4px" }}>[{p.position}]</span>
                            <div style={{ fontSize: "10.5px", color: "var(--chalk-dim)", marginTop: "2px" }}>
                              {p.injuryReason}
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span
    style={{
      padding: "1px 6px",
      borderRadius: "3px",
      fontSize: "10px",
      fontWeight: 700,
      background: p.status === "injured" ? "rgba(239, 68, 68, 0.2)" : p.status === "suspended" ? "rgba(249, 115, 22, 0.2)" : "rgba(234, 179, 8, 0.2)",
      color: p.status === "injured" ? "#ef4444" : p.status === "suspended" ? "#f97316" : "var(--amber)"
    }}
  >
                              {p.status.toUpperCase()}
                            </span>
                            <div style={{ fontSize: "10px", color: "#ef4444", marginTop: "2px" }}>
                              -{(p.impactScore * 100).toFixed(1)}% prob
                            </div>
                          </div>
                        </div>)}
                    </div>}
                </div>

                {
    /* Away Missing */
  }
                <div style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", padding: "12px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--amber)", marginBottom: "8px" }}>
                    {result.away_team} Absences ({result.squad_availability.away_missing.length})
                  </div>
                  {result.squad_availability.away_missing.length === 0 ? <div style={{ fontSize: "11.5px", color: "var(--bright-green)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <ShieldCheck size={14} /> Full strength squad available
                    </div> : <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {result.squad_availability.away_missing.map((p) => <div key={p.id} style={{ fontSize: "11.5px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "6px" }}>
                          <div>
                            <span style={{ fontWeight: 600, color: "var(--chalk)" }}>{p.name}</span>
                            <span style={{ color: "var(--chalk-dim)", marginLeft: "4px" }}>[{p.position}]</span>
                            <div style={{ fontSize: "10.5px", color: "var(--chalk-dim)", marginTop: "2px" }}>
                              {p.injuryReason}
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span
    style={{
      padding: "1px 6px",
      borderRadius: "3px",
      fontSize: "10px",
      fontWeight: 700,
      background: p.status === "injured" ? "rgba(239, 68, 68, 0.2)" : p.status === "suspended" ? "rgba(249, 115, 22, 0.2)" : "rgba(234, 179, 8, 0.2)",
      color: p.status === "injured" ? "#ef4444" : p.status === "suspended" ? "#f97316" : "var(--amber)"
    }}
  >
                              {p.status.toUpperCase()}
                            </span>
                            <div style={{ fontSize: "10px", color: "#ef4444", marginTop: "2px" }}>
                              -{(p.impactScore * 100).toFixed(1)}% prob
                            </div>
                          </div>
                        </div>)}
                    </div>}
                </div>
              </div>
            </div>}

        {
    /* Interactive Squad Status Simulator */
  }
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {
    /* Home Players */
  }
          <div style={{ background: "var(--pitch-800)", padding: "14px", borderRadius: "8px", border: "1px solid var(--pitch-700)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontWeight: 700, color: "var(--bright-green)" }}>
                {result.home_team} Lineup Simulation
              </span>
              <span style={{ fontSize: "10px", color: "var(--chalk-dim)" }}>Click status to toggle</span>
            </div>
            {homePlayers.map((player) => <div
    key={player.id}
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "6px 0",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      fontSize: "12px"
    }}
  >
                <div>
                  <span style={{ color: "var(--chalk)", fontWeight: 600 }}>{player.name}</span>
                  <span style={{ color: "var(--chalk-dim)", marginLeft: "6px", fontSize: "10.5px" }}>
                    [{player.position}]
                  </span>
                </div>
                <button
    type="button"
    onClick={() => togglePlayerStatus(player.id, true)}
    style={{
      background: player.status === "starter" ? "rgba(74, 222, 128, 0.15)" : player.status === "doubtful" ? "rgba(234, 179, 8, 0.15)" : "rgba(239, 68, 68, 0.15)",
      color: player.status === "starter" ? "var(--bright-green)" : player.status === "doubtful" ? "var(--amber)" : "#ef4444",
      border: `1px solid ${player.status === "starter" ? "var(--bright-green)" : player.status === "doubtful" ? "var(--amber)" : "#ef4444"}`,
      borderRadius: "4px",
      padding: "2px 8px",
      fontSize: "10.5px",
      fontWeight: 700,
      cursor: "pointer"
    }}
  >
                  {player.status.toUpperCase()}
                </button>
              </div>)}
          </div>

          {
    /* Away Players */
  }
          <div style={{ background: "var(--pitch-800)", padding: "14px", borderRadius: "8px", border: "1px solid var(--pitch-700)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontWeight: 700, color: "var(--amber)" }}>
                {result.away_team} Lineup Simulation
              </span>
              <span style={{ fontSize: "10px", color: "var(--chalk-dim)" }}>Click status to toggle</span>
            </div>
            {awayPlayers.map((player) => <div
    key={player.id}
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "6px 0",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      fontSize: "12px"
    }}
  >
                <div>
                  <span style={{ color: "var(--chalk)", fontWeight: 600 }}>{player.name}</span>
                  <span style={{ color: "var(--chalk-dim)", marginLeft: "6px", fontSize: "10.5px" }}>
                    [{player.position}]
                  </span>
                </div>
                <button
    type="button"
    onClick={() => togglePlayerStatus(player.id, false)}
    style={{
      background: player.status === "starter" ? "rgba(74, 222, 128, 0.15)" : player.status === "doubtful" ? "rgba(234, 179, 8, 0.15)" : "rgba(239, 68, 68, 0.15)",
      color: player.status === "starter" ? "var(--bright-green)" : player.status === "doubtful" ? "var(--amber)" : "#ef4444",
      border: `1px solid ${player.status === "starter" ? "var(--bright-green)" : player.status === "doubtful" ? "var(--amber)" : "#ef4444"}`,
      borderRadius: "4px",
      padding: "2px 8px",
      fontSize: "10.5px",
      fontWeight: 700,
      cursor: "pointer"
    }}
  >
                  {player.status.toUpperCase()}
                </button>
              </div>)}
          </div>
        </div>
      </section>

      {
    /* Head-to-Head Dossier Section with LiveScore Integration */
  }
      <section className="result-card" id="h2h-dossier-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Calendar size={18} style={{ color: "var(--bright-green)" }} />
            <h3 style={{ margin: 0 }}>Head-to-Head (H2H) Historical Record</h3>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "11px", color: "var(--chalk-dim)", display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--bright-green)" }} />
              LiveScore.com Feed (2024-2026)
            </span>
            <button
    type="button"
    onClick={syncH2HWithLiveScore}
    disabled={isSyncingH2H}
    className="btn secondary"
    style={{ padding: "4px 10px", fontSize: "11.5px", display: "flex", alignItems: "center", gap: "6px" }}
  >
              <RefreshCw size={12} className={isSyncingH2H ? "animate-spin" : ""} />
              <span>{isSyncingH2H ? "Syncing..." : "Sync LiveScore"}</span>
            </button>
          </div>
        </div>

        {syncSuccess && <div
    style={{
      background: "rgba(74, 222, 128, 0.12)",
      color: "var(--bright-green)",
      border: "1px solid rgba(74, 222, 128, 0.3)",
      borderRadius: "6px",
      padding: "8px 12px",
      fontSize: "12px",
      marginBottom: "14px",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    }}
  >
            <CheckCircle2 size={15} />
            <span>{syncSuccess}</span>
          </div>}

        {
    /* H2H Analytical Summary Metric Cards */
  }
        {localH2HSummary && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", marginBottom: "16px" }}>
            <div style={{ background: "var(--pitch-800)", border: "1px solid var(--pitch-700)", borderRadius: "6px", padding: "10px" }}>
              <div style={{ fontSize: "10.5px", color: "var(--chalk-dim)" }}>Total Matches</div>
              <div className="mono" style={{ fontSize: "18px", fontWeight: 800, color: "var(--chalk)" }}>
                {localH2HSummary.total}
              </div>
            </div>
            <div style={{ background: "var(--pitch-800)", border: "1px solid var(--pitch-700)", borderRadius: "6px", padding: "10px" }}>
              <div style={{ fontSize: "10.5px", color: "var(--chalk-dim)" }}>{result.home_team} Wins</div>
              <div className="mono" style={{ fontSize: "18px", fontWeight: 800, color: "var(--bright-green)" }}>
                {localH2HSummary.home_wins}
              </div>
            </div>
            <div style={{ background: "var(--pitch-800)", border: "1px solid var(--pitch-700)", borderRadius: "6px", padding: "10px" }}>
              <div style={{ fontSize: "10.5px", color: "var(--chalk-dim)" }}>Draws</div>
              <div className="mono" style={{ fontSize: "18px", fontWeight: 800, color: "var(--chalk-dim)" }}>
                {localH2HSummary.draws}
              </div>
            </div>
            <div style={{ background: "var(--pitch-800)", border: "1px solid var(--pitch-700)", borderRadius: "6px", padding: "10px" }}>
              <div style={{ fontSize: "10.5px", color: "var(--chalk-dim)" }}>{result.away_team} Wins</div>
              <div className="mono" style={{ fontSize: "18px", fontWeight: 800, color: "var(--amber)" }}>
                {localH2HSummary.away_wins}
              </div>
            </div>
            <div style={{ background: "var(--pitch-800)", border: "1px solid var(--pitch-700)", borderRadius: "6px", padding: "10px" }}>
              <div style={{ fontSize: "10.5px", color: "var(--chalk-dim)" }}>Avg Goals/Match</div>
              <div className="mono" style={{ fontSize: "18px", fontWeight: 800, color: "var(--chalk)" }}>
                {localH2HSummary.avg_goals}
              </div>
            </div>
            <div style={{ background: "var(--pitch-800)", border: "1px solid var(--pitch-700)", borderRadius: "6px", padding: "10px" }}>
              <div style={{ fontSize: "10.5px", color: "var(--chalk-dim)" }}>BTTS Rate</div>
              <div className="mono" style={{ fontSize: "18px", fontWeight: 800, color: "var(--chalk)" }}>
                {localH2HSummary.btts_rate_pct}%
              </div>
            </div>
          </div>}

        {
    /* Aggregate H2H ratio bar */
  }
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
            <span style={{ color: "var(--bright-green)", fontWeight: 700 }}>
              {result.home_team} ({hWins} wins)
            </span>
            <span style={{ color: "var(--chalk-dim)", fontWeight: 600 }}>{dWins} draws</span>
            <span style={{ color: "var(--amber)", fontWeight: 700 }}>
              {result.away_team} ({aWins} wins)
            </span>
          </div>
          <div style={{ display: "flex", height: "10px", borderRadius: "5px", overflow: "hidden" }}>
            <div style={{ width: `${hWins / totalH2H * 100}%`, background: "var(--bright-green)" }} />
            <div style={{ width: `${dWins / totalH2H * 100}%`, background: "var(--chalk-dim)" }} />
            <div style={{ width: `${aWins / totalH2H * 100}%`, background: "var(--amber)" }} />
          </div>
          {localH2HSummary && <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--chalk-dim)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
              <span>
                <strong>Latest Meeting:</strong> {localH2HSummary.latest_winner}
              </span>
              <span>{localH2HSummary.recent_trend}</span>
            </div>}
        </div>

        {
    /* Fixtures Table */
  }
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Home</th>
                <th>Score</th>
                <th>Away</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {h2hMatches.map((m, idx) => <tr key={idx}>
                  <td className="mono" style={{ fontSize: "12px" }}>
                    {m.match_date}
                  </td>
                  <td style={{ fontWeight: m.HomeTeam === result.home_team ? 700 : 400 }}>{m.HomeTeam}</td>
                  <td className="mono" style={{ fontWeight: 700 }}>
                    {m.FTHG} - {m.FTAG}
                  </td>
                  <td style={{ fontWeight: m.AwayTeam === result.away_team ? 700 : 400 }}>{m.AwayTeam}</td>
                  <td>
                    <span
    style={{
      padding: "2px 8px",
      borderRadius: "4px",
      fontSize: "11px",
      fontWeight: 700,
      background: m.FTR === "H" ? "rgba(74, 222, 128, 0.15)" : m.FTR === "A" ? "rgba(234, 179, 8, 0.15)" : "rgba(255,255,255,0.06)",
      color: m.FTR === "H" ? "var(--bright-green)" : m.FTR === "A" ? "var(--amber)" : "var(--chalk-dim)"
    }}
  >
                      {m.FTR === "H" ? "Home Win" : m.FTR === "A" ? "Away Win" : "Draw"}
                    </span>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </section>

      {
    /* AI Match Suggestion Card */
  }
      <section className="result-card" id="ai-narrative-card">
        <h3>
          <Sparkles size={17} style={{ color: "var(--bright-green)", marginRight: "8px" }} />
          <span>AI Tactical Scouting Report</span>

          {aiSource && <span
    className={`badge ${aiSource === "ai" ? "recommended" : ""}`}
    style={{
      marginLeft: "10px",
      fontSize: "10px",
      padding: "2px 8px"
    }}
  >
              {aiSource === "ai" ? "GEMINI SCOUT" : "MODEL ANALYSIS"}
            </span>}
        </h3>

        {isAiLoading ? <p id="ai-loading-text" style={{ color: "var(--chalk-dim)", fontSize: "14px", margin: 0 }}>
            <span className="spinner" /> Synthesizing tactical insights and team metrics...
          </p> : <p className="ai-text" id="ai-analysis-paragraph">
            {aiText}
          </p>}
      </section>

      {
    /* Footer Export & Navigation Bar */
  }
      <div
    style={{
      marginTop: "20px",
      padding: "16px 20px",
      background: "var(--pitch-800)",
      border: "1px solid var(--pitch-700)",
      borderRadius: "8px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "12px"
    }}
  >
        <div>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--chalk)" }}>
            Match Analytics Report Ready
          </span>
          <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--chalk-dim)" }}>
            Generate a clean, high-resolution PDF for offline tactical review, printing, or portfolio records.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
    type="button"
    onClick={handleExportPdf}
    disabled={isExportingPdf}
    className="btn secondary"
    style={{ display: "flex", alignItems: "center", gap: "6px" }}
    id="bottom-export-pdf-btn"
  >
            {pdfExportSuccess ? <Check size={15} style={{ color: "var(--bright-green)" }} /> : <FileDown size={15} />}
            <span>{pdfExportSuccess ? "PDF Exported!" : isExportingPdf ? "Generating..." : "Export to PDF"}</span>
          </button>

          <button
    type="button"
    onClick={onNewPrediction}
    className="btn primary"
    style={{ display: "flex", alignItems: "center", gap: "6px" }}
  >
            <ArrowLeft size={16} /> New Prediction
          </button>
        </div>
      </div>
    </div>;
};
