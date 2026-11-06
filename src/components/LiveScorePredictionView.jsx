import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Sparkles,
  Zap,
  TrendingUp,
  RotateCcw,
  Play,
  Pause,
  Activity
} from "lucide-react";
import { TeamBadge } from "./TeamBadge.jsx";
import { LeagueBadge } from "./LeagueBadge.jsx";
export const LiveScorePredictionView = ({
  teamsByLeague,
  initialFixture
}) => {
  const leagues = Object.keys(teamsByLeague);
  const [selectedLeague, setSelectedLeague] = useState(leagues[0] || "Premier League");
  const availableTeams = teamsByLeague[selectedLeague] || [];
  const [homeTeam, setHomeTeam] = useState(initialFixture?.home || availableTeams[0] || "Arsenal");
  const [awayTeam, setAwayTeam] = useState(initialFixture?.away || availableTeams[1] || "Chelsea");
  const [minute, setMinute] = useState(initialFixture?.minute ?? 55);
  const [homeScore, setHomeScore] = useState(initialFixture?.homeScore ?? 1);
  const [awayScore, setAwayScore] = useState(initialFixture?.awayScore ?? 0);
  const [homeRedCards, setHomeRedCards] = useState(0);
  const [awayRedCards, setAwayRedCards] = useState(0);
  const [homeShots, setHomeShots] = useState(5);
  const [awayShots, setAwayShots] = useState(3);
  const [homePossession, setHomePossession] = useState(58);
  const [liveResult, setLiveResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiNote, setAiNote] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1);
  const [events, setEvents] = useState([
    {
      id: "ev-0",
      minute: 0,
      type: "whistle",
      team: "system",
      title: "Kickoff",
      description: "Match commences under optimal pitch conditions."
    },
    {
      id: "ev-1",
      minute: 24,
      type: "shot",
      team: "home",
      title: "Shot on Target",
      description: "Low drive parried away by the goalkeeper."
    },
    {
      id: "ev-2",
      minute: 38,
      type: "goal",
      team: "home",
      title: "GOAL!",
      description: "First-time finish into the top right corner.",
      scoreChange: { home: 1, away: 0 }
    }
  ]);
  const [momentumHistory, setMomentumHistory] = useState([
    { minute: 0, homeProb: 0.52, drawProb: 0.26, awayProb: 0.22 },
    { minute: 15, homeProb: 0.54, drawProb: 0.26, awayProb: 0.2 },
    { minute: 30, homeProb: 0.53, drawProb: 0.27, awayProb: 0.2 },
    { minute: 40, homeProb: 0.68, drawProb: 0.2, awayProb: 0.12 },
    { minute: 55, homeProb: 0.71, drawProb: 0.19, awayProb: 0.1 }
  ]);
  useEffect(() => {
    if (initialFixture) {
      setHomeTeam(initialFixture.home);
      setAwayTeam(initialFixture.away);
      if (initialFixture.minute !== void 0) setMinute(initialFixture.minute);
      if (initialFixture.homeScore !== void 0) setHomeScore(initialFixture.homeScore);
      if (initialFixture.awayScore !== void 0) setAwayScore(initialFixture.awayScore);
    }
  }, [initialFixture]);
  const fetchLivePrediction = useCallback(async () => {
    if (!homeTeam || !awayTeam || homeTeam === awayTeam) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/live-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          home_team: homeTeam,
          away_team: awayTeam,
          minute,
          home_score: homeScore,
          away_score: awayScore,
          home_red_cards: homeRedCards,
          away_red_cards: awayRedCards,
          home_shots_on_target: homeShots,
          away_shots_on_target: awayShots,
          home_possession: homePossession
        })
      });
      if (res.ok) {
        const data = await res.json();
        setLiveResult(data);
        setMomentumHistory((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.minute === minute) {
            return prev.map(
              (p, idx) => idx === prev.length - 1 ? {
                minute,
                homeProb: data.live_probs.H,
                drawProb: data.live_probs.D,
                awayProb: data.live_probs.A
              } : p
            );
          }
          return [
            ...prev,
            {
              minute,
              homeProb: data.live_probs.H,
              drawProb: data.live_probs.D,
              awayProb: data.live_probs.A
            }
          ];
        });
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, [
    homeTeam,
    awayTeam,
    minute,
    homeScore,
    awayScore,
    homeRedCards,
    awayRedCards,
    homeShots,
    awayShots,
    homePossession
  ]);
  useEffect(() => {
    fetchLivePrediction();
  }, [fetchLivePrediction]);
  const fetchLiveAiNote = async () => {
    if (!liveResult) return;
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/live-ai-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          home_team: homeTeam,
          away_team: awayTeam,
          minute,
          home_score: homeScore,
          away_score: awayScore,
          home_red_cards: homeRedCards,
          away_red_cards: awayRedCards,
          home_shots_on_target: homeShots,
          away_shots_on_target: awayShots,
          home_possession: homePossession
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiNote(data.text || "");
      }
    } catch {
    } finally {
      setIsAiLoading(false);
    }
  };
  useEffect(() => {
    if (!isSimulating) return;
    const intervalMs = Math.max(250, 1500 / simSpeed);
    const timer = setInterval(() => {
      setMinute((currentMin) => {
        if (currentMin >= 90) {
          setIsSimulating(false);
          setEvents((prev) => [
            {
              id: `ev-${Date.now()}`,
              minute: 90,
              type: "whistle",
              team: "system",
              title: "Full Time Whistle",
              description: "Match concluded."
            },
            ...prev
          ]);
          return 90;
        }
        const nextMin = currentMin + 1;
        const roll = Math.random();
        if (roll < 0.04) {
          setHomeScore((s) => s + 1);
          setHomeShots((sh) => sh + 1);
          setEvents((prev) => [
            {
              id: `ev-${Date.now()}`,
              minute: nextMin,
              type: "goal",
              team: "home",
              title: `GOAL! ${homeTeam}`,
              description: "Clinical strike breaks through defensive lines."
            },
            ...prev
          ]);
        } else if (roll < 0.07) {
          setAwayScore((s) => s + 1);
          setAwayShots((sh) => sh + 1);
          setEvents((prev) => [
            {
              id: `ev-${Date.now()}`,
              minute: nextMin,
              type: "goal",
              team: "away",
              title: `GOAL! ${awayTeam}`,
              description: "Swift counter-attack converts into a goal."
            },
            ...prev
          ]);
        } else if (roll < 0.13) {
          const isHomeShot = Math.random() > 0.45;
          if (isHomeShot) setHomeShots((s) => s + 1);
          else setAwayShots((s) => s + 1);
          setEvents((prev) => [
            {
              id: `ev-${Date.now()}`,
              minute: nextMin,
              type: "shot",
              team: isHomeShot ? "home" : "away",
              title: `Shot on Target - ${isHomeShot ? homeTeam : awayTeam}`,
              description: "Goalkeeper required to make an active stop."
            },
            ...prev
          ]);
        } else if (roll < 0.16) {
          setEvents((prev) => [
            {
              id: `ev-${Date.now()}`,
              minute: nextMin,
              type: "yellow_card",
              team: Math.random() > 0.5 ? "home" : "away",
              title: "Yellow Card Caution",
              description: "Tactical foul breaking up progressive transition."
            },
            ...prev
          ]);
        }
        return nextMin;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isSimulating, simSpeed, homeTeam, awayTeam]);
  const handleResetSimulator = () => {
    setIsSimulating(false);
    setMinute(0);
    setHomeScore(0);
    setAwayScore(0);
    setHomeRedCards(0);
    setAwayRedCards(0);
    setHomeShots(0);
    setAwayShots(0);
    setHomePossession(50);
    setEvents([
      {
        id: "ev-start",
        minute: 0,
        type: "whistle",
        team: "system",
        title: "Match Reset",
        description: "Simulation reset to Minute 0'."
      }
    ]);
    setMomentumHistory([{ minute: 0, homeProb: 0.45, drawProb: 0.3, awayProb: 0.25 }]);
  };
  const applyPreset = (min, hG, aG, hRed, aRed, hSh, aSh, poss) => {
    setIsSimulating(false);
    setMinute(min);
    setHomeScore(hG);
    setAwayScore(aG);
    setHomeRedCards(hRed);
    setAwayRedCards(aRed);
    setHomeShots(hSh);
    setAwayShots(aSh);
    setHomePossession(poss);
  };
  return <div id="live-score-prediction-container">
      {
    /* Header */
  }
      <div style={{ marginBottom: "22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Zap size={22} style={{ color: "var(--bright-green)" }} />
          <h1 className="page-title" style={{ margin: 0 }}>
            Live In-Play Match Simulator & Poisson Engine
          </h1>
        </div>
        <p className="page-sub" style={{ margin: "4px 0 0 0" }}>
          Automated in-running simulation, live probability momentum line charts, and dynamic scoreline modeling.
        </p>
      </div>

      {
    /* Match Fixture Selectors & Auto-Simulator Controls */
  }
      <div className="card" style={{ padding: "18px", marginBottom: "22px" }}>
        <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "14px",
      marginBottom: "18px"
    }}
  >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <label style={{ fontSize: "12px", color: "var(--chalk-dim)", margin: 0 }}>
                League
              </label>
              <LeagueBadge leagueName={selectedLeague} size={15} />
            </div>
            <select
    value={selectedLeague}
    onChange={(e) => {
      setSelectedLeague(e.target.value);
      const teams = teamsByLeague[e.target.value] || [];
      if (teams.length >= 2) {
        setHomeTeam(teams[0]);
        setAwayTeam(teams[1]);
      }
    }}
    style={{
      width: "100%",
      background: "var(--pitch-900)",
      border: "1px solid var(--pitch-700)",
      padding: "8px 12px",
      color: "var(--chalk)",
      borderRadius: "6px"
    }}
  >
              {leagues.map((lg) => <option key={lg} value={lg}>
                  {lg}
                </option>)}
            </select>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <label style={{ fontSize: "12px", color: "var(--chalk-dim)", margin: 0 }}>
                Home Team
              </label>
              <TeamBadge teamName={homeTeam} size={15} />
            </div>
            <select
    value={homeTeam}
    onChange={(e) => setHomeTeam(e.target.value)}
    style={{
      width: "100%",
      background: "var(--pitch-900)",
      border: "1px solid var(--pitch-700)",
      padding: "8px 12px",
      color: "var(--chalk)",
      borderRadius: "6px"
    }}
  >
              {availableTeams.map((t) => <option key={t} value={t} disabled={t === awayTeam}>
                  {t}
                </option>)}
            </select>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <label style={{ fontSize: "12px", color: "var(--chalk-dim)", margin: 0 }}>
                Away Team
              </label>
              <TeamBadge teamName={awayTeam} size={15} />
            </div>
            <select
    value={awayTeam}
    onChange={(e) => setAwayTeam(e.target.value)}
    style={{
      width: "100%",
      background: "var(--pitch-900)",
      border: "1px solid var(--pitch-700)",
      padding: "8px 12px",
      color: "var(--chalk)",
      borderRadius: "6px"
    }}
  >
              {availableTeams.map((t) => <option key={t} value={t} disabled={t === homeTeam}>
                  {t}
                </option>)}
            </select>
          </div>
        </div>

        {
    /* Simulator Control Toolbar */
  }
        <div
    style={{
      background: "var(--pitch-900)",
      padding: "12px 16px",
      borderRadius: "8px",
      border: "1px solid var(--pitch-700)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "12px"
    }}
  >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
    type="button"
    onClick={() => setIsSimulating(!isSimulating)}
    style={{
      background: isSimulating ? "#ef4444" : "var(--bright-green)",
      color: isSimulating ? "#fff" : "#0f2316",
      border: "none",
      borderRadius: "6px",
      padding: "8px 14px",
      fontWeight: 800,
      fontSize: "12.5px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    }}
  >
              {isSimulating ? <Pause size={15} /> : <Play size={15} />}
              <span>{isSimulating ? "PAUSE SIM" : "AUTO-PLAY SIM"}</span>
            </button>

            <button
    type="button"
    onClick={handleResetSimulator}
    className="btn secondary"
    style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", fontSize: "12px" }}
  >
              <RotateCcw size={13} /> Reset 0&apos;
            </button>
          </div>

          {
    /* Speed Controls */
  }
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11.5px", color: "var(--chalk-dim)", marginRight: "4px" }}>Speed:</span>
            {[1, 2, 5, 10].map((spd) => <button
    key={spd}
    type="button"
    onClick={() => setSimSpeed(spd)}
    style={{
      background: simSpeed === spd ? "rgba(74, 222, 128, 0.2)" : "transparent",
      border: simSpeed === spd ? "1px solid var(--bright-green)" : "1px solid var(--pitch-700)",
      color: simSpeed === spd ? "var(--bright-green)" : "var(--chalk-dim)",
      borderRadius: "4px",
      padding: "3px 8px",
      fontSize: "11px",
      fontWeight: 700,
      cursor: "pointer"
    }}
  >
                {spd}x
              </button>)}
          </div>

          {
    /* Quick Scenario Presets */
  }
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", color: "var(--chalk-dim)" }}>Presets:</span>
            <button
    type="button"
    onClick={() => applyPreset(15, 0, 0, 0, 0, 2, 1, 52)}
    className="btn secondary"
    style={{ fontSize: "10.5px", padding: "3px 8px" }}
  >
              0-0 (15&apos;)
            </button>
            <button
    type="button"
    onClick={() => applyPreset(65, 1, 0, 0, 0, 7, 3, 62)}
    className="btn secondary"
    style={{ fontSize: "10.5px", padding: "3px 8px" }}
  >
              1-0 (65&apos;)
            </button>
            <button
    type="button"
    onClick={() => applyPreset(78, 1, 1, 1, 0, 4, 8, 41)}
    className="btn secondary"
    style={{ fontSize: "10.5px", padding: "3px 8px" }}
  >
              Red Card (78&apos;)
            </button>
          </div>
        </div>
      </div>

      {
    /* Main Scoreboard Card */
  }
      <div
    className="card"
    style={{
      padding: "24px",
      marginBottom: "22px",
      background: "linear-gradient(180deg, var(--pitch-800) 0%, var(--pitch-850) 100%)",
      border: "1px solid var(--pitch-700)"
    }}
  >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <LeagueBadge leagueName={selectedLeague} size={20} />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--bright-green)", textTransform: "uppercase" }}>
              {selectedLeague} &middot; Match Clock
            </span>
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(74, 222, 128, 0.15)",
              color: "var(--bright-green)",
              border: "1px solid var(--bright-green)",
              padding: "4px 10px",
              borderRadius: "14px",
              fontSize: "12px",
              fontWeight: 800
            }}
          >
            <Clock size={13} /> {minute}&apos; IN-PLAY
          </span>
        </div>

        {/* Interactive Score Stepper Display */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            gap: "20px",
            textAlign: "center",
            marginBottom: "20px"
          }}
        >
          {/* Home Team & Score */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
              <TeamBadge teamName={homeTeam} size={32} />
              <h2 style={{ margin: 0, fontSize: "20px", color: "var(--chalk)" }}>{homeTeam}</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "6px",
                  background: "var(--pitch-900)",
                  border: "1px solid var(--pitch-700)",
                  color: "var(--chalk)",
                  cursor: "pointer"
                }}
              >
                -
              </button>
              <span className="mono" style={{ fontSize: "38px", fontWeight: 800, color: "var(--bright-green)" }}>
                {homeScore}
              </span>
              <button
                type="button"
                onClick={() => setHomeScore(homeScore + 1)}
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "6px",
                  background: "var(--pitch-900)",
                  border: "1px solid var(--pitch-700)",
                  color: "var(--chalk)",
                  cursor: "pointer"
                }}
              >
                +
              </button>
            </div>
            {homeRedCards > 0 && (
              <span
                style={{
                  display: "inline-block",
                  marginTop: "6px",
                  background: "rgba(239, 68, 68, 0.2)",
                  color: "#ef4444",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  fontWeight: 700
                }}
              >
                {homeRedCards} RED CARD
              </span>
            )}
          </div>

          <div className="mono" style={{ fontSize: "32px", fontWeight: 700, color: "var(--pitch-600)" }}>
            :
          </div>

          {/* Away Team & Score */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
              <TeamBadge teamName={awayTeam} size={32} />
              <h2 style={{ margin: 0, fontSize: "20px", color: "var(--chalk)" }}>{awayTeam}</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <button
    type="button"
    onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
    style={{
      width: "30px",
      height: "30px",
      borderRadius: "6px",
      background: "var(--pitch-900)",
      border: "1px solid var(--pitch-700)",
      color: "var(--chalk)",
      cursor: "pointer"
    }}
  >
                -
              </button>
              <span className="mono" style={{ fontSize: "38px", fontWeight: 800, color: "var(--amber)" }}>
                {awayScore}
              </span>
              <button
    type="button"
    onClick={() => setAwayScore(awayScore + 1)}
    style={{
      width: "30px",
      height: "30px",
      borderRadius: "6px",
      background: "var(--pitch-900)",
      border: "1px solid var(--pitch-700)",
      color: "var(--chalk)",
      cursor: "pointer"
    }}
  >
                +
              </button>
            </div>
            {awayRedCards > 0 && <span
    style={{
      display: "inline-block",
      marginTop: "6px",
      background: "rgba(239, 68, 68, 0.2)",
      color: "#ef4444",
      padding: "2px 8px",
      borderRadius: "4px",
      fontSize: "11px",
      fontWeight: 700
    }}
  >
                {awayRedCards} RED CARD
              </span>}
          </div>
        </div>

        {
    /* Minute Slider */
  }
        <div style={{ marginBottom: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--chalk-dim)", marginBottom: "4px" }}>
            <span>Minute: {minute}&apos;</span>
            <span>90&apos; (Full Time)</span>
          </div>
          <input
    type="range"
    min={0}
    max={90}
    value={minute}
    onChange={(e) => setMinute(parseInt(e.target.value))}
    style={{ width: "100%", accentColor: "var(--bright-green)", cursor: "pointer" }}
  />
        </div>
      </div>

      {
    /* Probability Momentum Line Chart & Territory Pitch */
  }
      <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
      gap: "20px",
      marginBottom: "22px"
    }}
  >
        {
    /* Real-time Probability Momentum SVG Line Chart */
  }
        <div className="card" style={{ padding: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <TrendingUp size={16} style={{ color: "var(--bright-green)" }} />
              <h3 style={{ margin: 0, fontSize: "15px" }}>Live In-Play Win Probability Timeline</h3>
            </div>
            <div style={{ fontSize: "11px", color: "var(--chalk-dim)" }}>0&apos; to {minute}&apos;</div>
          </div>

          <svg viewBox="0 0 360 160" style={{ width: "100%", height: "auto", overflow: "visible" }}>
            {
    /* Grid lines */
  }
            <line x1="30" y1="20" x2="350" y2="20" stroke="rgba(255,255,255,0.06)" />
            <line x1="30" y1="70" x2="350" y2="70" stroke="rgba(255,255,255,0.06)" />
            <line x1="30" y1="120" x2="350" y2="120" stroke="rgba(255,255,255,0.06)" />
            <text x="5" y="24" fill="var(--chalk-dim)" fontSize="9">
              100%
            </text>
            <text x="5" y="74" fill="var(--chalk-dim)" fontSize="9">
              50%
            </text>
            <text x="12" y="124" fill="var(--chalk-dim)" fontSize="9">
              0%
            </text>

            {
    /* Render lines for Home, Draw, Away */
  }
            {(() => {
    if (momentumHistory.length < 2) return null;
    const pointsH = momentumHistory.map((p) => {
      const x = 30 + p.minute / 90 * 320;
      const y = 120 - p.homeProb * 100;
      return `${x},${y}`;
    }).join(" ");
    const pointsD = momentumHistory.map((p) => {
      const x = 30 + p.minute / 90 * 320;
      const y = 120 - p.drawProb * 100;
      return `${x},${y}`;
    }).join(" ");
    const pointsA = momentumHistory.map((p) => {
      const x = 30 + p.minute / 90 * 320;
      const y = 120 - p.awayProb * 100;
      return `${x},${y}`;
    }).join(" ");
    return <>
                  <polyline fill="none" stroke="var(--bright-green)" strokeWidth="2.5" points={pointsH} />
                  <polyline fill="none" stroke="var(--chalk-dim)" strokeWidth="1.5" strokeDasharray="3,3" points={pointsD} />
                  <polyline fill="none" stroke="var(--amber)" strokeWidth="2.5" points={pointsA} />
                </>;
  })()}
          </svg>

          {
    /* Chart Legend */
  }
          <div
    style={{
      display: "flex",
      justifyContent: "center",
      gap: "18px",
      marginTop: "10px",
      fontSize: "11px",
      color: "var(--chalk-dim)"
    }}
  >
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "12px", height: "3px", background: "var(--bright-green)" }} /> {homeTeam}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "12px", height: "3px", background: "var(--chalk-dim)" }} /> Draw
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "12px", height: "3px", background: "var(--amber)" }} /> {awayTeam}
            </span>
          </div>
        </div>

        {
    /* 2D Pitch Field Tilt & Commentary Event Feed */
  }
        <div className="card" style={{ padding: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Activity size={16} style={{ color: "var(--bright-green)" }} />
              <h3 style={{ margin: 0, fontSize: "15px" }}>Field Tilt & Commentary Stream</h3>
            </div>
            <span style={{ fontSize: "11px", color: "var(--bright-green)", fontWeight: 700 }}>
              {homePossession}% Territory
            </span>
          </div>

          {
    /* Field Tilt Bar */
  }
          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
              <span style={{ color: "var(--chalk)" }}>{homeTeam} Attacks</span>
              <span style={{ color: "var(--chalk)" }}>{awayTeam} Attacks</span>
            </div>
            <div style={{ display: "flex", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ width: `${homePossession}%`, background: "var(--bright-green)" }} />
              <div style={{ width: `${100 - homePossession}%`, background: "var(--amber)" }} />
            </div>
          </div>

          {
    /* Scrolling Commentary Feed */
  }
          <div
    style={{
      maxHeight: "135px",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      fontSize: "12px"
    }}
  >
            {events.map((ev) => <div
    key={ev.id}
    style={{
      background: "var(--pitch-900)",
      padding: "6px 10px",
      borderRadius: "5px",
      borderLeft: `3px solid ${ev.type === "goal" ? "var(--bright-green)" : ev.type === "yellow_card" || ev.type === "red_card" ? "var(--amber)" : "var(--pitch-700)"}`
    }}
  >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                  <span style={{ fontWeight: 700, color: "var(--chalk)" }}>{ev.title}</span>
                  <span className="mono" style={{ color: "var(--bright-green)", fontSize: "10.5px" }}>
                    {ev.minute}&apos;
                  </span>
                </div>
                <div style={{ color: "var(--chalk-dim)", fontSize: "11px" }}>{ev.description}</div>
              </div>)}
          </div>
        </div>
      </div>

      {
    /* Live Win Probabilities Grid */
  }
      {liveResult && <section className="result-card" style={{ marginBottom: "22px" }}>
          <h3 style={{ margin: "0 0 14px 0" }}>In-Play Win Probabilities</h3>
          <div className="prob-cards-grid">
            {["H", "D", "A"].map((key) => {
    const probPct = (liveResult.live_probs[key] * 100).toFixed(1);
    const isWinner = key === "H" && liveResult.live_probs.H >= liveResult.live_probs.A && liveResult.live_probs.H >= liveResult.live_probs.D || key === "D" && liveResult.live_probs.D >= liveResult.live_probs.H && liveResult.live_probs.D >= liveResult.live_probs.A || key === "A" && liveResult.live_probs.A >= liveResult.live_probs.H && liveResult.live_probs.A >= liveResult.live_probs.D;
    const label = key === "H" ? `${liveResult.home_team} Win` : key === "D" ? "Draw" : `${liveResult.away_team} Win`;
    return <div key={key} className={`prob-card ${isWinner ? "winner" : ""}`}>
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
        </section>}

      {
    /* Most Likely Final Scores & In-Play Markets */
  }
      {liveResult && <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "18px",
      marginBottom: "22px"
    }}
  >
          {
    /* Likely Final Scorelines */
  }
          <div className="card" style={{ padding: "18px" }}>
            <h3 style={{ marginTop: 0, marginBottom: "12px", fontSize: "15px" }}>Projected Final Scorelines</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {liveResult.likely_final_scores.slice(0, 4).map((sc, idx) => <div
    key={idx}
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "6px 10px",
      background: idx === 0 ? "rgba(74, 222, 128, 0.12)" : "var(--pitch-900)",
      border: idx === 0 ? "1px solid var(--bright-green)" : "1px solid var(--pitch-700)",
      borderRadius: "6px"
    }}
  >
                  <span className="mono" style={{ fontWeight: 700, fontSize: "14px", color: "var(--chalk)" }}>
                    {sc.homeGoals} - {sc.awayGoals}
                  </span>
                  <span className="mono" style={{ fontWeight: 800, color: "var(--bright-green)" }}>
                    {(sc.probability * 100).toFixed(1)}%
                  </span>
                </div>)}
            </div>
          </div>

          {
    /* Next Goal & Over/Under In-Play Markets */
  }
          <div className="card" style={{ padding: "18px" }}>
            <h3 style={{ marginTop: 0, marginBottom: "12px", fontSize: "15px" }}>In-Play Derivative Markets</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--chalk-dim)" }}>Next Goal ({liveResult.home_team}):</span>
                <span className="mono" style={{ fontWeight: 700, color: "var(--bright-green)" }}>
                  {(liveResult.next_goal_probs.home_next * 100).toFixed(1)}%
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--chalk-dim)" }}>Next Goal ({liveResult.away_team}):</span>
                <span className="mono" style={{ fontWeight: 700, color: "var(--amber)" }}>
                  {(liveResult.next_goal_probs.away_next * 100).toFixed(1)}%
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--chalk-dim)" }}>No More Goals in Match:</span>
                <span className="mono" style={{ fontWeight: 700 }}>
                  {(liveResult.next_goal_probs.no_more_goals * 100).toFixed(1)}%
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "6px", borderTop: "1px solid var(--pitch-700)" }}>
                <span style={{ color: "var(--chalk-dim)" }}>Over 2.5 Total Goals:</span>
                <span className="mono" style={{ fontWeight: 700, color: "var(--bright-green)" }}>
                  {(liveResult.over_under_probs.over_2_5 * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>}

      {
    /* AI Live In-Play Scouting Note */
  }
      <section className="result-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={17} style={{ color: "var(--bright-green)" }} />
            <h3 style={{ margin: 0 }}>Live In-Play Scouting Brief</h3>
          </div>
          <button
    type="button"
    onClick={fetchLiveAiNote}
    disabled={isAiLoading}
    className="btn secondary"
    style={{ fontSize: "11.5px", padding: "4px 10px" }}
  >
            {isAiLoading ? "Analyzing..." : "Generate In-Play Report"}
          </button>
        </div>

        {aiNote ? <p className="ai-text" style={{ margin: 0 }}>
            {aiNote}
          </p> : <p style={{ color: "var(--chalk-dim)", fontSize: "13px", margin: 0 }}>
            {liveResult?.tactical_summary || "Click 'Generate In-Play Report' to request an AI scouting synthesis based on live score and minute."}
          </p>}
      </section>
    </div>;
};
