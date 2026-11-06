import { useState, useEffect } from "react";
import {
  ArrowLeftRight,
  Play,
  History,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Swords
} from "lucide-react";
import { TeamTrendIndicator } from "./TeamTrendIndicator.jsx";
import { TeamBadge } from "./TeamBadge.jsx";
import { LeagueBadge } from "./LeagueBadge.jsx";

export const MatchPredictionView = ({
  teamsByLeague,
  teamForms,
  recentPredictions,
  onPredict,
  isLoading
}) => {
  const leagues = Object.keys(teamsByLeague);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [formHint, setFormHint] = useState("");
  const [selectedEngine, setSelectedEngine] = useState("python");
  const [localTeamForms, setLocalTeamForms] = useState(teamForms || {});

  useEffect(() => {
    if (teamForms && Object.keys(teamForms).length > 0) {
      setLocalTeamForms(teamForms);
    } else {
      fetch("/api/team-form")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && typeof data === "object") {
            setLocalTeamForms(data);
          }
        })
        .catch((err) => console.warn("Failed to load team forms:", err));
    }
  }, [teamForms]);

  const getTeamForm = (teamName) => {
    return localTeamForms[teamName] || teamForms?.[teamName];
  };

  const [h2hMatches, setH2HMatches] = useState([]);
  const [h2hSummary, setH2HSummary] = useState(null);
  const [isH2HLoading, setIsH2HLoading] = useState(false);
  const [h2hError, setH2HError] = useState(null);

  const availableTeams = selectedLeague ? teamsByLeague[selectedLeague] || [] : [];

  const handleLeagueChange = (league) => {
    setSelectedLeague(league);
    setHomeTeam("");
    setAwayTeam("");
    setH2HMatches([]);
    setH2HSummary(null);
    setH2HError(null);
  };

  const handleSwap = () => {
    if (!homeTeam && !awayTeam) return;
    const temp = homeTeam;
    setHomeTeam(awayTeam);
    setAwayTeam(temp);
  };

  const fetchHeadToHead = async (home, away, signal) => {
    if (!home || !away || home === away) {
      setH2HMatches([]);
      setH2HSummary(null);
      setH2HError(null);
      return;
    }
    setIsH2HLoading(true);
    setH2HError(null);
    try {
      const res = await fetch("/api/livescore/sync-h2h", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          home_team: home,
          away_team: away,
          limit: 5
        }),
        signal
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch head-to-head records (${res.status})`);
      }
      const data = await res.json();
      const matches = Array.isArray(data.head_to_head) ? data.head_to_head : [];
      setH2HMatches(matches.slice(0, 5));
      setH2HSummary(data.summary || null);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      console.error("Failed to fetch head-to-head match history:", err);
      setH2HError(err instanceof Error ? err.message : "Failed to load head-to-head records.");
    } finally {
      setIsH2HLoading(false);
    }
  };

  useEffect(() => {
    if (homeTeam && awayTeam && homeTeam !== awayTeam) {
      const controller = new AbortController();
      fetchHeadToHead(homeTeam, awayTeam, controller.signal);
      return () => controller.abort();
    } else {
      setH2HMatches([]);
      setH2HSummary(null);
      setH2HError(null);
    }
  }, [homeTeam, awayTeam]);

  useEffect(() => {
    if (!selectedLeague) {
      setFormHint("");
      return;
    }
    if (!homeTeam || !awayTeam) {
      setFormHint("Select two different teams to generate a prediction.");
    } else if (homeTeam === awayTeam) {
      setFormHint("Please select two different teams.");
    } else {
      setFormHint("Ready to generate prediction.");
    }
  }, [selectedLeague, homeTeam, awayTeam]);

  const canPredict = selectedLeague && homeTeam && awayTeam && homeTeam !== awayTeam && !isLoading;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canPredict) {
      onPredict(homeTeam, awayTeam, selectedEngine);
    }
  };

  const statCardStyle = {
    background: "var(--pitch-850)",
    border: "1px solid var(--pitch-700)",
    borderRadius: "6px",
    padding: "10px 14px"
  };

  const statLabelStyle = {
    fontSize: "11px",
    fontWeight: 600,
    color: "var(--chalk-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.4px"
  };

  const statValueStyle = {
    fontSize: "16px",
    fontWeight: 700,
    color: "var(--chalk)",
    marginTop: "3px"
  };

  const formCardStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid var(--pitch-700)",
    borderRadius: "5px",
    padding: "8px 12px",
    gap: "8px",
    flexWrap: "wrap"
  };

  const renderTeamOptions = () =>
    availableTeams.map((team) => {
      const tf = getTeamForm(team);
      const arrow = tf?.trend === "up" ? "\u2191" : tf?.trend === "down" ? "\u2193" : "\u2192";
      return (
        <option key={team} value={team}>
          {team} {tf ? `(${arrow} ${tf.record})` : ""}
        </option>
      );
    });

  return (
    <div id="match-prediction-container">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: "28px" }}>
        <h1 className="page-title">Match Outcome Prediction</h1>
        <p className="page-sub">
          Choose a league, then select a home and away team to generate win probability estimates.
        </p>
      </div>

      {/* Prediction Form Card */}
      <div className="card" id="prediction-form-card">
        <form onSubmit={handleSubmit}>
          {/* Engine Selector Toggle */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "6px" }}>Computation Engine</label>
            <div
              style={{
                display: "inline-flex",
                background: "var(--pitch-850)",
                padding: "3px",
                borderRadius: "6px",
                border: "1px solid var(--pitch-700)",
                gap: "4px"
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedEngine("python")}
                id="engine-python-btn"
                style={{
                  padding: "5px 12px",
                  fontSize: "12px",
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: selectedEngine === "python" ? "rgba(74, 222, 128, 0.15)" : "transparent",
                  color: selectedEngine === "python" ? "var(--bright-green)" : "var(--chalk-dim)",
                  fontWeight: selectedEngine === "python" ? 600 : 400,
                  outline: selectedEngine === "python" ? "1px solid rgba(74, 222, 128, 0.3)" : "none"
                }}
              >
                <span>🐍</span> Python 3.10 Engine
              </button>
              <button
                type="button"
                onClick={() => setSelectedEngine("java")}
                id="engine-java-btn"
                style={{
                  padding: "5px 12px",
                  fontSize: "12px",
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: selectedEngine === "java" ? "rgba(234, 179, 8, 0.15)" : "transparent",
                  color: selectedEngine === "java" ? "#facc15" : "var(--chalk-dim)",
                  fontWeight: selectedEngine === "java" ? 600 : 400,
                  outline: selectedEngine === "java" ? "1px solid rgba(234, 179, 8, 0.4)" : "none"
                }}
              >
                <span>☕</span> Java Engine
              </button>
            </div>
          </div>

          {/* League Dropdown */}
          <div className="field" style={{ maxWidth: "340px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <label htmlFor="league" style={{ margin: 0 }}>League</label>
              {selectedLeague && <LeagueBadge leagueName={selectedLeague} size={20} />}
            </div>
            <select
              id="league"
              name="league"
              value={selectedLeague}
              onChange={(e) => handleLeagueChange(e.target.value)}
              required
            >
              <option value="">Select a league</option>
              {leagues.map((lg) => (
                <option key={lg} value={lg}>
                  {lg}
                </option>
              ))}
            </select>
          </div>

          {/* Teams Row */}
          <div className="form-row" id="teams-selector-row">
            {/* Home Team */}
            <div className="field">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "6px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <label htmlFor="home_team" style={{ margin: 0 }}>
                    Home Team
                  </label>
                  {homeTeam && <TeamBadge teamName={homeTeam} size={18} />}
                  {homeTeam && <TeamTrendIndicator form={getTeamForm(homeTeam)} size="xs" />}
                </div>
                {homeTeam && getTeamForm(homeTeam) && (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontSize: "11px", color: "var(--chalk-dim)" }}>Form:</span>
                    <TeamTrendIndicator form={getTeamForm(homeTeam)} showRecord={true} size="xs" />
                  </div>
                )}
              </div>

              <select
                name="home_team"
                id="home_team"
                value={homeTeam}
                onChange={(e) => setHomeTeam(e.target.value)}
                disabled={!selectedLeague}
                required
              >
                <option value="">Select home team</option>
                {renderTeamOptions()}
              </select>
            </div>

            {/* Swap Button */}
            <button
              type="button"
              id="swap-btn"
              className="icon-btn"
              title="Swap teams"
              onClick={handleSwap}
              disabled={!selectedLeague || (!homeTeam && !awayTeam)}
              style={{ marginTop: "24px" }}
            >
              <ArrowLeftRight size={18} />
            </button>

            {/* Away Team */}
            <div className="field">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "6px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <label htmlFor="away_team" style={{ margin: 0 }}>
                    Away Team
                  </label>
                  {awayTeam && <TeamBadge teamName={awayTeam} size={18} />}
                  {awayTeam && <TeamTrendIndicator form={getTeamForm(awayTeam)} size="xs" />}
                </div>
                {awayTeam && getTeamForm(awayTeam) && (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontSize: "11px", color: "var(--chalk-dim)" }}>Form:</span>
                    <TeamTrendIndicator form={getTeamForm(awayTeam)} showRecord={true} size="xs" />
                  </div>
                )}
              </div>

              <select
                name="away_team"
                id="away_team"
                value={awayTeam}
                onChange={(e) => setAwayTeam(e.target.value)}
                disabled={!selectedLeague}
                required
              >
                <option value="">Select away team</option>
                {renderTeamOptions()}
              </select>
            </div>
          </div>

          {/* Form comparison preview card when teams selected */}
          {(homeTeam || awayTeam) && (
            <div
              id="team-form-preview-card"
              style={{
                marginTop: "16px",
                padding: "12px 14px",
                background: "var(--pitch-850)",
                border: "1px solid var(--pitch-700)",
                borderRadius: "6px",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--chalk-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                  flexWrap: "wrap",
                  gap: "6px"
                }}
              >
                <span>Team Form Over Last 5 Games</span>
                <span style={{ fontSize: "11px", textTransform: "none", color: "var(--chalk-dim)" }}>
                  ↑ Upward (≥9 pts) • → Flat / Stable (6–8 pts) • ↓ Downward (≤5 pts)
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    homeTeam && awayTeam ? "repeat(auto-fit, minmax(240px, 1fr))" : "1fr",
                  gap: "10px"
                }}
              >
                {homeTeam && (
                  <div style={formCardStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <TeamBadge teamName={homeTeam} size={20} />
                      <span style={{ fontWeight: 600, fontSize: "13px", color: "var(--chalk)" }}>
                        {homeTeam}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--chalk-muted)" }}>(Home)</span>
                      <TeamTrendIndicator form={getTeamForm(homeTeam)} size="xs" />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <TeamTrendIndicator
                        form={getTeamForm(homeTeam)}
                        showRecord={true}
                        showBadges={true}
                        size="xs"
                      />
                    </div>
                  </div>
                )}

                {awayTeam && (
                  <div style={formCardStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <TeamBadge teamName={awayTeam} size={20} />
                      <span style={{ fontWeight: 600, fontSize: "13px", color: "var(--chalk)" }}>
                        {awayTeam}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--chalk-muted)" }}>(Away)</span>
                      <TeamTrendIndicator form={getTeamForm(awayTeam)} size="xs" />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <TeamTrendIndicator
                        form={getTeamForm(awayTeam)}
                        showRecord={true}
                        showBadges={true}
                        size="xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Predict Button */}
          <div style={{ marginTop: "24px" }}>
            <button type="submit" className="btn" id="predict-btn" disabled={!canPredict}>
              {isLoading ? (
                <>
                  <span className="spinner" /> Computing Probabilities...
                </>
              ) : (
                <>
                  <Play size={16} fill="currentColor" /> Predict Outcome
                </>
              )}
            </button>
          </div>

          <p id="form-hint" className="form-hint">
            {formHint}
          </p>
        </form>
      </div>

      {/* Head-to-Head Section: Last 5 Encounters */}
      <section id="h2h-history-section" style={{ marginTop: "24px", marginBottom: "32px" }}>
        <div className="card" style={{ padding: "20px 22px" }}>
          {/* Section Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
              paddingBottom: "16px",
              borderBottom: "1px solid var(--pitch-700)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "6px",
                  background: "var(--pitch-850)",
                  border: "1px solid var(--pitch-700)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--bright-green)"
                }}
              >
                <History size={16} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h2
                    style={{
                      fontSize: "15px",
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      margin: 0,
                      color: "var(--chalk)",
                      letterSpacing: "-0.01em"
                    }}
                  >
                    Head-to-Head Record
                  </h2>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "2px 7px",
                      borderRadius: "4px",
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "var(--chalk-dim)",
                      border: "1px solid var(--pitch-700)",
                      letterSpacing: "0.2px"
                    }}
                  >
                    Last 5 Encounters
                  </span>
                </div>
                <p style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "var(--chalk-dim)" }}>
                  {homeTeam && awayTeam && homeTeam !== awayTeam ? (
                    <span
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}
                    >
                      <span>Historical clash results between</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <TeamBadge teamName={homeTeam} size={18} />
                        <strong style={{ color: "var(--chalk)" }}>{homeTeam}</strong>
                        <TeamTrendIndicator form={getTeamForm(homeTeam)} size="xs" />
                      </span>
                      <span>and</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <TeamBadge teamName={awayTeam} size={18} />
                        <strong style={{ color: "var(--chalk)" }}>{awayTeam}</strong>
                        <TeamTrendIndicator form={getTeamForm(awayTeam)} size="xs" />
                      </span>
                    </span>
                  ) : (
                    "Select two clubs in the form above to inspect their head-to-head match history"
                  )}
                </p>
              </div>
            </div>

            {homeTeam && awayTeam && homeTeam !== awayTeam && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => fetchHeadToHead(homeTeam, awayTeam)}
                  disabled={isH2HLoading}
                  title="Refresh H2H data"
                  style={{ width: "32px", height: "32px" }}
                >
                  <RefreshCw size={14} className={isH2HLoading ? "animate-spin" : ""} />
                </button>
              </div>
            )}
          </div>

          {/* Section Body */}
          {!homeTeam || !awayTeam || homeTeam === awayTeam ? (
            <div style={{ padding: "36px 16px", textAlign: "center", color: "var(--chalk-muted)" }}>
              <Swords size={28} style={{ margin: "0 auto 10px auto", opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: "13px", color: "var(--chalk-dim)" }}>
                Pick a Home Team and Away Team in the selector above to display their last 5 head-to-head encounters.
              </p>
            </div>
          ) : isH2HLoading ? (
            <div style={{ padding: "24px 0" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: "36px",
                      background: "rgba(255, 255, 255, 0.03)",
                      borderRadius: "4px",
                      opacity: 0.7
                    }}
                  />
                ))}
              </div>
            </div>
          ) : h2hError ? (
            <div
              style={{
                padding: "20px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                background: "rgba(239, 68, 68, 0.06)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: "6px",
                marginTop: "16px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <AlertCircle size={16} style={{ color: "var(--red)" }} />
                <span style={{ fontSize: "13px", color: "var(--chalk)" }}>{h2hError}</span>
              </div>
              <button
                type="button"
                className="btn secondary"
                onClick={() => fetchHeadToHead(homeTeam, awayTeam)}
                style={{ padding: "5px 12px", fontSize: "12px" }}
              >
                Retry
              </button>
            </div>
          ) : h2hMatches.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--chalk-dim)" }}>
              <p style={{ margin: 0, fontSize: "13px" }}>
                No prior head-to-head match records registered between {homeTeam} and {awayTeam}.
              </p>
            </div>
          ) : (
            <div style={{ marginTop: "16px" }}>
              {/* Summary Stats Row */}
              {h2hSummary && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                    gap: "10px",
                    marginBottom: "16px"
                  }}
                >
                  <div style={statCardStyle}>
                    <div
                      style={{ ...statLabelStyle, display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      <span>Record ({homeTeam})</span>
                      <TeamTrendIndicator form={getTeamForm(homeTeam)} size="xs" />
                    </div>
                    <div className="mono" style={statValueStyle}>
                      <span style={{ color: "var(--bright-green)" }}>{h2hSummary.home_wins}W</span>
                      {" - "}
                      <span style={{ color: "var(--amber)" }}>{h2hSummary.draws}D</span>
                      {" - "}
                      <span style={{ color: "var(--red)" }}>{h2hSummary.away_wins}L</span>
                    </div>
                  </div>

                  <div style={statCardStyle}>
                    <div style={statLabelStyle}>Avg Goals / Match</div>
                    <div className="mono" style={statValueStyle}>
                      {h2hSummary.avg_goals.toFixed(2)}
                    </div>
                  </div>

                  <div style={statCardStyle}>
                    <div style={statLabelStyle}>Both Teams Scored</div>
                    <div className="mono" style={statValueStyle}>
                      {h2hSummary.btts_rate_pct}%
                    </div>
                  </div>

                  <div style={statCardStyle}>
                    <div style={statLabelStyle}>Latest Encounter</div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--chalk)",
                        marginTop: "5px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {h2hSummary.latest_winner || "Draw"}
                    </div>
                  </div>
                </div>
              )}

              {/* Table of Last 5 Matches */}
              <div
                className="table-container"
                style={{ border: "1px solid var(--pitch-700)", borderRadius: "6px", overflow: "hidden" }}
              >
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: "110px" }}>Date</th>
                      <th>Fixture</th>
                      <th style={{ textAlign: "center", width: "90px" }}>Score</th>
                      <th style={{ width: "140px" }}>Winner</th>
                      <th style={{ textAlign: "center", width: "90px" }}>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {h2hMatches.map((m, idx) => {
                      const isSelectedHomeHost = m.HomeTeam === homeTeam;
                      const winnerName =
                        m.FTR === "D" ? "Draw" : m.FTR === "H" ? m.HomeTeam : m.AwayTeam;
                      const isSelectedHomeWinner =
                        (isSelectedHomeHost && m.FTR === "H") ||
                        (!isSelectedHomeHost && m.FTR === "A");
                      const outcomeLetter = m.FTR === "D" ? "D" : isSelectedHomeWinner ? "W" : "L";
                      const badgeBg =
                        outcomeLetter === "W"
                          ? "rgba(16, 185, 129, 0.12)"
                          : outcomeLetter === "D"
                          ? "rgba(245, 158, 11, 0.12)"
                          : "rgba(239, 68, 68, 0.12)";
                      const badgeColor =
                        outcomeLetter === "W"
                          ? "var(--bright-green)"
                          : outcomeLetter === "D"
                          ? "var(--amber)"
                          : "var(--red)";
                      const badgeBorder =
                        outcomeLetter === "W"
                          ? "rgba(16, 185, 129, 0.3)"
                          : outcomeLetter === "D"
                          ? "rgba(245, 158, 11, 0.3)"
                          : "rgba(239, 68, 68, 0.3)";

                      return (
                        <tr key={`${m.match_date}-${m.HomeTeam}-${m.AwayTeam}-${idx}`}>
                          <td className="mono" style={{ fontSize: "12px", color: "var(--chalk-dim)" }}>
                            {m.match_date}
                          </td>
                          <td>
                            <div
                              style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}
                            >
                              <TeamBadge teamName={m.HomeTeam} size={16} />
                              <span
                                style={{
                                  fontWeight: m.HomeTeam === homeTeam ? 600 : 400,
                                  color: m.HomeTeam === homeTeam ? "var(--chalk)" : "var(--chalk-dim)"
                                }}
                              >
                                {m.HomeTeam}
                              </span>
                              <TeamTrendIndicator form={getTeamForm(m.HomeTeam)} size="xs" />
                              <span style={{ fontSize: "11px", color: "var(--chalk-muted)" }}>vs</span>
                              <TeamBadge teamName={m.AwayTeam} size={16} />
                              <span
                                style={{
                                  fontWeight: m.AwayTeam === awayTeam ? 600 : 400,
                                  color: m.AwayTeam === awayTeam ? "var(--chalk)" : "var(--chalk-dim)"
                                }}
                              >
                                {m.AwayTeam}
                              </span>
                              <TeamTrendIndicator form={getTeamForm(m.AwayTeam)} size="xs" />
                            </div>
                          </td>
                          <td
                            className="mono"
                            style={{
                              textAlign: "center",
                              fontWeight: 700,
                              fontSize: "14px",
                              letterSpacing: "1px"
                            }}
                          >
                            {m.FTHG} - {m.FTAG}
                          </td>
                          <td style={{ fontSize: "12.5px", color: "var(--chalk)" }}>{winnerName}</td>
                          <td style={{ textAlign: "center" }}>
                            <span
                              style={{
                                display: "inline-block",
                                minWidth: "24px",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: 700,
                                fontFamily: "var(--font-mono)",
                                background: badgeBg,
                                color: badgeColor,
                                border: `1px solid ${badgeBorder}`
                              }}
                              title={
                                outcomeLetter === "W"
                                  ? `${homeTeam} Won`
                                  : outcomeLetter === "D"
                                  ? "Draw"
                                  : `${awayTeam} Won`
                              }
                            >
                              {outcomeLetter}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {h2hSummary?.recent_trend && (
                <div
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "12px",
                    color: "var(--chalk-dim)"
                  }}
                >
                  <TrendingUp size={14} style={{ color: "var(--bright-green)", flexShrink: 0 }} />
                  <span>{h2hSummary.recent_trend}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Available Leagues Grid */}
      <section style={{ marginTop: "40px" }} id="available-leagues-section">
        <h2
          style={{
            fontSize: "19px",
            fontFamily: "var(--font-display)",
            margin: "0 0 16px 0",
            color: "var(--chalk)"
          }}
        >
          Available Leagues
        </h2>
        <div className="league-grid">
          {leagues.map((league) => (
            <div
              key={league}
              className={`league-card ${selectedLeague === league ? "selected" : ""}`}
              data-league={league}
              onClick={() => handleLeagueChange(league)}
              id={`league-card-${league.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="league-icon-circle">
                <LeagueBadge leagueName={league} size={28} />
              </div>
              <span>{league}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Predictions */}
      {recentPredictions && recentPredictions.length > 0 && (
        <section style={{ marginTop: "44px" }} id="recent-predictions-section">
          <h2
            style={{
              fontSize: "19px",
              fontFamily: "var(--font-display)",
              margin: "0 0 16px 0",
              color: "var(--chalk)"
            }}
          >
            Recent Predictions
          </h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Fixture</th>
                  <th>League</th>
                  <th>Model</th>
                  <th>Home Win</th>
                  <th>Draw</th>
                  <th>Away Win</th>
                  <th>Predicted</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPredictions.map((pred) => {
                  const outcomeLabel =
                    pred.predictedOutcome === "H"
                      ? "Home Win"
                      : pred.predictedOutcome === "A"
                      ? "Away Win"
                      : "Draw";
                  return (
                    <tr key={pred.predictionId}>
                      <td style={{ fontWeight: 600 }}>
                        <div
                          style={{ display: "inline-flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}
                        >
                          <TeamBadge teamName={pred.homeTeam} size={16} />
                          <span>{pred.homeTeam}</span>
                          <TeamTrendIndicator form={getTeamForm(pred.homeTeam)} size="xs" />
                          <span style={{ color: "var(--chalk-dim)", fontWeight: 400, fontSize: "11px" }}>
                            vs
                          </span>
                          <TeamBadge teamName={pred.awayTeam} size={16} />
                          <span>{pred.awayTeam}</span>
                          <TeamTrendIndicator form={getTeamForm(pred.awayTeam)} size="xs" />
                        </div>
                      </td>
                      <td>
                        <LeagueBadge leagueName={pred.league} size={16} showName={true} />
                      </td>
                      <td>{pred.modelName}</td>
                      <td className="mono">{(pred.homeWinProb * 100).toFixed(1)}%</td>
                      <td className="mono">{(pred.drawProb * 100).toFixed(1)}%</td>
                      <td className="mono">{(pred.awayWinProb * 100).toFixed(1)}%</td>
                      <td>
                        <span
                          className={`badge ${pred.predictedOutcome === "H" ? "recommended" : ""}`}
                          style={{
                            background:
                              pred.predictedOutcome === "H"
                                ? "rgba(74,222,128,0.15)"
                                : pred.predictedOutcome === "A"
                                ? "rgba(232,163,61,0.15)"
                                : "rgba(159,184,170,0.15)",
                            color:
                              pred.predictedOutcome === "H"
                                ? "var(--bright-green)"
                                : pred.predictedOutcome === "A"
                                ? "var(--amber)"
                                : "var(--chalk-dim)",
                            border: "1px solid currentColor"
                          }}
                        >
                          {outcomeLabel}
                        </span>
                      </td>
                      <td className="mono" style={{ fontSize: "12px", opacity: 0.7 }}>
                        {pred.predictionDate.split(" ")[0]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};