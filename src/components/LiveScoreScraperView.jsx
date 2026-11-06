import { useState, useEffect, useCallback } from "react";
import { SkeletonMatchCard } from "./SkeletonMatchCard.jsx";
import { TeamBadge } from "./TeamBadge.jsx";
import { LeagueBadge } from "./LeagueBadge.jsx";
import {
  Radio,
  Calendar,
  RefreshCw,
  Search,
  CheckCircle2,
  Terminal,
  ExternalLink,
  Zap,
  Clock,
  Trophy,
  Database,
  ChevronRight,
  AlertCircle
} from "lucide-react";
export const LiveScoreScraperView = ({
  onSelectMatchForLivePredict,
  onSelectMatchForPreMatchPredict,
  onNavigateToTrainingHub
}) => {
  const [activeSubTab, setActiveSubTab] = useState("live");
  const [liveData, setLiveData] = useState(null);
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [liveSearchQuery, setLiveSearchQuery] = useState("");
  const [liveLeagueFilter, setLiveLeagueFilter] = useState("ALL");
  const [liveStatusFilter, setLiveStatusFilter] = useState("ALL");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const getYesterdayDateStr = () => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().substring(0, 10);
  };
  const [selectedDate, setSelectedDate] = useState(getYesterdayDateStr());
  const [historicalData, setHistoricalData] = useState(null);
  const [isHistLoading, setIsHistLoading] = useState(false);
  const [histSearchQuery, setHistSearchQuery] = useState("");
  const [histLeagueFilter, setHistLeagueFilter] = useState("ALL");
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState(null);
  const [showLogs, setShowLogs] = useState(false);
  const fetchLiveScores = useCallback(async () => {
    setIsLiveLoading(true);
    try {
      const params = new URLSearchParams();
      if (liveLeagueFilter !== "ALL") params.append("league", liveLeagueFilter);
      if (liveSearchQuery) params.append("query", liveSearchQuery);
      if (liveStatusFilter !== "ALL") params.append("status", liveStatusFilter);
      const res = await fetch(`/api/livescore/live?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLiveData(data);
      }
    } catch (err) {
      console.error("Failed fetching live scores from LiveScore:", err);
    } finally {
      setIsLiveLoading(false);
    }
  }, [liveLeagueFilter, liveSearchQuery, liveStatusFilter]);
  const fetchHistoricalScores = useCallback(
    async (dateToFetch) => {
      setIsHistLoading(true);
      setIngestResult(null);
      try {
        const dateParam = dateToFetch || selectedDate;
        const params = new URLSearchParams({ date: dateParam });
        if (histLeagueFilter !== "ALL") params.append("league", histLeagueFilter);
        if (histSearchQuery) params.append("query", histSearchQuery);
        const res = await fetch(`/api/livescore/historical?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setHistoricalData(data);
        }
      } catch (err) {
        console.error("Failed fetching historical scores from LiveScore:", err);
      } finally {
        setIsHistLoading(false);
      }
    },
    [selectedDate, histLeagueFilter, histSearchQuery]
  );
  const handleIngestHistoricalScores = async () => {
    if (!historicalData || historicalData.matches.length === 0) return;
    setIsIngesting(true);
    try {
      const res = await fetch("/api/livescore/ingest-historical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: historicalData.date,
          league: histLeagueFilter !== "ALL" ? histLeagueFilter : void 0
        })
      });
      if (res.ok) {
        const result = await res.json();
        setIngestResult(result);
      }
    } catch (err) {
      console.error("Failed to ingest LiveScore historical data:", err);
    } finally {
      setIsIngesting(false);
    }
  };
  useEffect(() => {
    fetchLiveScores();
    fetchHistoricalScores();
  }, [fetchLiveScores, fetchHistoricalScores]);
  useEffect(() => {
    if (!autoRefresh || activeSubTab !== "live") return;
    const interval = setInterval(() => {
      fetchLiveScores();
    }, 15e3);
    return () => clearInterval(interval);
  }, [autoRefresh, activeSubTab, fetchLiveScores]);
  const activeLogs = activeSubTab === "live" ? liveData?.logs || [] : historicalData?.logs || [];
  return <div className="view-container" id="livescore-scraper-view">
      {
    /* Header Banner */
  }
      <div className="view-header" id="livescore-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
    style={{
      width: "36px",
      height: "36px",
      borderRadius: "8px",
      background: "rgba(34, 197, 94, 0.15)",
      border: "1px solid rgba(34, 197, 94, 0.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--bright-green)"
    }}
  >
                <Radio size={20} />
              </div>
              <div>
                <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>
                  LiveScore.com Web Scraper
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      fontSize: "11px",
      color: "var(--bright-green)",
      background: "rgba(34, 197, 94, 0.1)",
      padding: "2px 8px",
      borderRadius: "4px",
      fontWeight: 600
    }}
  >
                    <span
    style={{
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      background: "var(--bright-green)",
      boxShadow: "0 0 6px var(--bright-green)"
    }}
  />
                    LIVE SCRAPER ACTIVE
                  </span>
                  <a
    href="https://www.livescore.com/en/"
    target="_blank"
    rel="noreferrer"
    style={{
      fontSize: "12px",
      color: "var(--pitch-300)",
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      textDecoration: "none"
    }}
  >
                    Source: livescore.com/en/
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
    type="button"
    id="livescore-refresh-btn"
    className="btn btn-secondary"
    onClick={() => activeSubTab === "live" ? fetchLiveScores() : fetchHistoricalScores()}
    disabled={isLiveLoading || isHistLoading}
    style={{ display: "flex", alignItems: "center", gap: "6px" }}
  >
              <RefreshCw
    size={14}
    className={isLiveLoading || isHistLoading ? "spin" : ""}
  />
              <span>{isLiveLoading || isHistLoading ? "Scraping..." : "Scrape Now"}</span>
            </button>

            <button
    type="button"
    id="livescore-logs-toggle-btn"
    className="btn btn-secondary"
    onClick={() => setShowLogs(!showLogs)}
    style={{ display: "flex", alignItems: "center", gap: "6px" }}
  >
              <Terminal size={14} />
              <span>{showLogs ? "Hide Crawler Logs" : "Crawler Logs"}</span>
            </button>
          </div>
        </div>

        {
    /* Dual Tab Switcher */
  }
        <div
    style={{
      display: "flex",
      gap: "8px",
      marginTop: "20px",
      borderBottom: "1px solid var(--pitch-700)",
      paddingBottom: "12px"
    }}
  >
          <button
    type="button"
    id="tab-livescore-live"
    onClick={() => setActiveSubTab("live")}
    style={{
      padding: "8px 18px",
      borderRadius: "6px",
      fontSize: "13px",
      fontWeight: 600,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      border: "none",
      background: activeSubTab === "live" ? "var(--bright-green)" : "var(--pitch-800)",
      color: activeSubTab === "live" ? "#0A1410" : "var(--pitch-200)",
      transition: "all 0.15s ease"
    }}
  >
            <Radio size={15} />
            <span>Real-Time Live Scores</span>
            {liveData && <span
    style={{
      fontSize: "11px",
      background: activeSubTab === "live" ? "#0A1410" : "var(--pitch-700)",
      color: activeSubTab === "live" ? "var(--bright-green)" : "var(--pitch-200)",
      padding: "1px 6px",
      borderRadius: "10px",
      fontWeight: 700
    }}
  >
                {liveData.inPlayCount} In-Play
              </span>}
          </button>

          <button
    type="button"
    id="tab-livescore-historical"
    onClick={() => setActiveSubTab("historical")}
    style={{
      padding: "8px 18px",
      borderRadius: "6px",
      fontSize: "13px",
      fontWeight: 600,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      border: "none",
      background: activeSubTab === "historical" ? "var(--bright-green)" : "var(--pitch-800)",
      color: activeSubTab === "historical" ? "#0A1410" : "var(--pitch-200)",
      transition: "all 0.15s ease"
    }}
  >
            <Calendar size={15} />
            <span>Historical Match Scores</span>
            {historicalData && <span
    style={{
      fontSize: "11px",
      background: activeSubTab === "historical" ? "#0A1410" : "var(--pitch-700)",
      color: activeSubTab === "historical" ? "var(--bright-green)" : "var(--pitch-200)",
      padding: "1px 6px",
      borderRadius: "10px",
      fontWeight: 700
    }}
  >
                {historicalData.totalMatches} Results
              </span>}
          </button>
        </div>
      </div>

      {
    /* Scraper Terminal Drawer (Collapsible) */
  }
      {showLogs && <div
    id="livescore-terminal-drawer"
    style={{
      background: "#080E0B",
      border: "1px solid var(--pitch-700)",
      borderRadius: "8px",
      padding: "14px 18px",
      marginBottom: "20px",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: "12px",
      color: "#A7F3D0",
      maxHeight: "200px",
      overflowY: "auto"
    }}
  >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", color: "var(--pitch-300)" }}>
            <span>Live Web Scraper Pipeline Logs ({activeSubTab === "live" ? "Live Feed" : "Date Archive"})</span>
            <span style={{ fontSize: "11px" }}>HTTP 200 / Direct CDN</span>
          </div>
          {activeLogs.map((log, idx) => <div key={idx} style={{ lineHeight: "1.6", opacity: 0.9 }}>
              {log}
            </div>)}
        </div>}

      {
    /* ========================================================================= */
  }
      {
    /* 1. REAL-TIME LIVE SCORES TAB                                              */
  }
      {
    /* ========================================================================= */
  }
      {activeSubTab === "live" && <div id="livescore-live-content">
          {
    /* Summary Stat Cards */
  }
          <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
      gap: "14px",
      marginBottom: "20px"
    }}
  >
            <div className="card" style={{ padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div
    style={{
      width: "36px",
      height: "36px",
      borderRadius: "8px",
      background: "rgba(34, 197, 94, 0.15)",
      color: "var(--bright-green)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
                <Radio size={18} />
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "var(--pitch-400)", textTransform: "uppercase" }}>In-Play Now</div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--bright-green)" }}>
                  {liveData?.inPlayCount ?? 0}
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div
    style={{
      width: "36px",
      height: "36px",
      borderRadius: "8px",
      background: "rgba(59, 130, 246, 0.15)",
      color: "#60A5FA",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
                <Trophy size={18} />
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "var(--pitch-400)", textTransform: "uppercase" }}>Total Fixtures</div>
                <div style={{ fontSize: "20px", fontWeight: 800 }}>{liveData?.totalMatches ?? 0}</div>
              </div>
            </div>

            <div className="card" style={{ padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div
    style={{
      width: "36px",
      height: "36px",
      borderRadius: "8px",
      background: "rgba(245, 158, 11, 0.15)",
      color: "#FBBF24",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
                <Clock size={18} />
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "var(--pitch-400)", textTransform: "uppercase" }}>Upcoming</div>
                <div style={{ fontSize: "20px", fontWeight: 800 }}>{liveData?.upcomingCount ?? 0}</div>
              </div>
            </div>

            <div className="card" style={{ padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div
    style={{
      width: "36px",
      height: "36px",
      borderRadius: "8px",
      background: "rgba(148, 163, 184, 0.15)",
      color: "#94A3B8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "var(--pitch-400)", textTransform: "uppercase" }}>Full-Time</div>
                <div style={{ fontSize: "20px", fontWeight: 800 }}>{liveData?.finishedCount ?? 0}</div>
              </div>
            </div>
          </div>

          {
    /* Controls Bar: Search, League Filter, Status Filter */
  }
          <div
    className="card"
    style={{
      padding: "14px 18px",
      marginBottom: "20px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "14px"
    }}
  >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", flex: 1 }}>
              {
    /* Search Box */
  }
              <div
    style={{
      position: "relative",
      minWidth: "220px",
      flex: "1 1 220px"
    }}
  >
                <Search
    size={15}
    style={{
      position: "absolute",
      left: "10px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "var(--pitch-400)"
    }}
  />
                <input
    type="text"
    placeholder="Search team or league..."
    value={liveSearchQuery}
    onChange={(e) => setLiveSearchQuery(e.target.value)}
    style={{
      width: "100%",
      padding: "8px 12px 8px 34px",
      background: "var(--pitch-900)",
      border: "1px solid var(--pitch-700)",
      borderRadius: "6px",
      color: "var(--pitch-100)",
      fontSize: "13px"
    }}
  />
              </div>

              {
    /* League Filter */
  }
              <select
    value={liveLeagueFilter}
    onChange={(e) => setLiveLeagueFilter(e.target.value)}
    style={{
      padding: "8px 12px",
      background: "var(--pitch-900)",
      border: "1px solid var(--pitch-700)",
      borderRadius: "6px",
      color: "var(--pitch-100)",
      fontSize: "13px",
      maxWidth: "200px"
    }}
  >
                <option value="ALL">All Competitions ({liveData?.leagues.length || 0})</option>
                {(liveData?.leagues || []).map((lg) => <option key={lg} value={lg}>
                    {lg}
                  </option>)}
              </select>

              {
    /* Status Pills */
  }
              <div style={{ display: "flex", gap: "4px" }}>
                {["ALL", "LIVE", "FINISHED", "UPCOMING"].map((st) => <button
    key={st}
    type="button"
    onClick={() => setLiveStatusFilter(st)}
    style={{
      padding: "6px 12px",
      borderRadius: "4px",
      fontSize: "11px",
      fontWeight: 600,
      border: "none",
      cursor: "pointer",
      background: liveStatusFilter === st ? "var(--bright-green)" : "var(--pitch-800)",
      color: liveStatusFilter === st ? "#0A1410" : "var(--pitch-300)"
    }}
  >
                    {st === "LIVE" ? "\u{1F534} In-Play" : st}
                  </button>)}
              </div>
            </div>

            {
    /* Auto Refresh Toggle */
  }
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label
    style={{
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "12px",
      color: "var(--pitch-300)",
      cursor: "pointer"
    }}
  >
                <input
    type="checkbox"
    checked={autoRefresh}
    onChange={(e) => setAutoRefresh(e.target.checked)}
  />
                Auto-sync (15s)
              </label>
            </div>
          </div>

          {
    /* In-between live syncing banner */
  }
          {isLiveLoading && <div
    style={{
      background: "rgba(74, 222, 128, 0.08)",
      border: "1px solid rgba(74, 222, 128, 0.25)",
      borderRadius: "8px",
      padding: "10px 16px",
      marginBottom: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      color: "var(--bright-green)",
      fontSize: "12px"
    }}
  >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <RefreshCw size={14} className="spin" />
                <span>Connecting to LiveScore.com API & syncing in-play fixtures...</span>
              </div>
              <span className="mono" style={{ fontSize: "11px", opacity: 0.8 }}>Live Scraper Active</span>
            </div>}

          {
    /* Live Matches Feed Grid */
  }
          <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
      gap: "16px"
    }}
  >
            {isLiveLoading && (!liveData || liveData.matches.length === 0) ? Array.from({ length: 6 }).map((_, idx) => <SkeletonMatchCard key={`live-skel-${idx}`} />) : (liveData?.matches || []).map((match) => {
    const isLive = match.statusType === "LIVE";
    const isFinished = match.statusType === "FINISHED";
    return <div
      key={match.id}
      className="card"
      style={{
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        border: isLive ? "1px solid rgba(34, 197, 94, 0.4)" : "1px solid var(--pitch-700)"
      }}
    >
                  {isLive && <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "2px",
        background: "var(--bright-green)"
      }}
    />}

                  {
      /* Top Bar: League & Minute */
    }
                  <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px",
        fontSize: "11px"
      }}
    >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--pitch-300)" }}>
                      <LeagueBadge leagueName={match.league} size={15} />
                      <span style={{ fontWeight: 600, color: "var(--pitch-200)" }}>{match.league}</span>
                      {match.country && <span>&bull; {match.country}</span>}
                    </div>

                    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "11px",
        fontWeight: 700,
        background: isLive ? "rgba(34, 197, 94, 0.15)" : isFinished ? "rgba(148, 163, 184, 0.15)" : "rgba(245, 158, 11, 0.15)",
        color: isLive ? "var(--bright-green)" : isFinished ? "#94A3B8" : "#FBBF24"
      }}
    >
                      {isLive && <span
      style={{
        width: "5px",
        height: "5px",
        borderRadius: "50%",
        background: "var(--bright-green)"
      }}
    />}
                      {match.status}
                    </span>
                  </div>

                  {
      /* Score Board */
    }
                  <div
      style={{
        background: "var(--pitch-900)",
        padding: "14px 16px",
        borderRadius: "8px",
        marginBottom: "14px"
      }}
    >
                    {
      /* Home Team */
    }
                    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px"
      }}
    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <TeamBadge teamName={match.homeTeam} size={22} />
                        <span style={{ fontSize: "14px", fontWeight: 600 }}>{match.homeTeam}</span>
                      </div>

                      <span
      style={{
        fontSize: "18px",
        fontWeight: 800,
        color: isLive ? "var(--bright-green)" : "inherit"
      }}
    >
                        {match.statusType === "UPCOMING" ? "-" : match.homeScore}
                      </span>
                    </div>

                    {/* Away Team */}
                    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <TeamBadge teamName={match.awayTeam} size={22} />
                        <span style={{ fontSize: "14px", fontWeight: 600 }}>{match.awayTeam}</span>
                      </div>

                      <span
      style={{
        fontSize: "18px",
        fontWeight: 800,
        color: isLive ? "var(--bright-green)" : "inherit"
      }}
    >
                        {match.statusType === "UPCOMING" ? "-" : match.awayScore}
                      </span>
                    </div>

                    {
      /* Half-Time Score detail */
    }
                    {match.homeScoreHT !== null && match.homeScoreHT !== void 0 && <div
      style={{
        marginTop: "8px",
        paddingTop: "6px",
        borderTop: "1px dashed var(--pitch-800)",
        fontSize: "11px",
        color: "var(--pitch-400)",
        display: "flex",
        justifyContent: "space-between"
      }}
    >
                        <span>Half-Time Score:</span>
                        <span>
                          {match.homeScoreHT} - {match.awayScoreHT ?? 0}
                        </span>
                      </div>}
                  </div>

                  {
      /* Actions Bar */
    }
                  <div style={{ display: "flex", gap: "8px" }}>
                    {isLive ? <button
      type="button"
      className="btn btn-primary"
      onClick={() => onSelectMatchForLivePredict(
        match.homeTeam,
        match.awayTeam,
        match.minute ?? 45,
        match.homeScore,
        match.awayScore
      )}
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        fontSize: "12px",
        padding: "8px"
      }}
    >
                        <Zap size={14} />
                        <span>Predict Live Outcome</span>
                      </button> : <button
      type="button"
      className="btn btn-secondary"
      onClick={() => onSelectMatchForPreMatchPredict(match.homeTeam, match.awayTeam)}
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        fontSize: "12px",
        padding: "8px"
      }}
    >
                        <Trophy size={14} />
                        <span>Simulate Match</span>
                      </button>}
                  </div>
                </div>;
  })}
          </div>

          {liveData && liveData.matches.length === 0 && <div
    className="card"
    style={{
      textAlign: "center",
      padding: "48px 20px",
      color: "var(--pitch-400)"
    }}
  >
              <AlertCircle size={32} style={{ margin: "0 auto 12px auto", opacity: 0.6 }} />
              <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--pitch-200)" }}>
                No matches found matching your filter criteria
              </div>
              <p style={{ fontSize: "13px", marginTop: "4px" }}>
                Try resetting your search query or choosing &quot;All Competitions&quot;.
              </p>
            </div>}
        </div>}

      {
    /* ========================================================================= */
  }
      {
    /* 2. HISTORICAL MATCH SCORES ARCHIVE TAB                                    */
  }
      {
    /* ========================================================================= */
  }
      {activeSubTab === "historical" && <div id="livescore-historical-content">
          {
    /* Historical Date Picker & Control Bar */
  }
          <div
    className="card"
    style={{
      padding: "16px 20px",
      marginBottom: "20px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "16px"
    }}
  >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label
    htmlFor="historical-date-picker"
    style={{ fontSize: "12px", fontWeight: 600, color: "var(--pitch-300)" }}
  >
                  Select Date:
                </label>
                <input
    id="historical-date-picker"
    type="date"
    value={selectedDate}
    onChange={(e) => {
      setSelectedDate(e.target.value);
      fetchHistoricalScores(e.target.value);
    }}
    style={{
      padding: "7px 10px",
      background: "var(--pitch-900)",
      border: "1px solid var(--pitch-700)",
      borderRadius: "6px",
      color: "var(--pitch-100)",
      fontSize: "13px"
    }}
  />
              </div>

              {
    /* Quick Date Shortcuts */
  }
              <div style={{ display: "flex", gap: "6px" }}>
                {[
    { label: "Yesterday", days: 1 },
    { label: "2 Days Ago", days: 2 },
    { label: "3 Days Ago", days: 3 }
  ].map((item) => {
    const targetD = /* @__PURE__ */ new Date();
    targetD.setDate(targetD.getDate() - item.days);
    const str = targetD.toISOString().substring(0, 10);
    const isActive = selectedDate === str;
    return <button
      key={item.label}
      type="button"
      onClick={() => {
        setSelectedDate(str);
        fetchHistoricalScores(str);
      }}
      style={{
        padding: "6px 10px",
        fontSize: "11px",
        borderRadius: "4px",
        border: "none",
        cursor: "pointer",
        background: isActive ? "var(--bright-green)" : "var(--pitch-800)",
        color: isActive ? "#0A1410" : "var(--pitch-300)",
        fontWeight: 600
      }}
    >
                      {item.label}
                    </button>;
  })}
              </div>
            </div>

            {
    /* Ingestion Button into ML Engine */
  }
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
    type="button"
    id="ingest-historical-btn"
    className="btn btn-primary"
    onClick={handleIngestHistoricalScores}
    disabled={isIngesting || !historicalData || historicalData.matches.length === 0}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "12px",
      padding: "8px 16px"
    }}
  >
                <Database size={14} />
                <span>
                  {isIngesting ? "Ingesting & Retraining..." : `Ingest ${historicalData?.totalMatches ?? 0} Scores into ML Engine`}
                </span>
              </button>
            </div>
          </div>

          {
    /* Ingestion Success Feedback Banner */
  }
          {ingestResult && <div
    className="card"
    style={{
      background: "rgba(34, 197, 94, 0.08)",
      border: "1px solid rgba(34, 197, 94, 0.3)",
      padding: "16px 20px",
      marginBottom: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "16px"
    }}
  >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <CheckCircle2 size={24} style={{ color: "var(--bright-green)", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--bright-green)" }}>
                    Dataset Successfully Enriched from LiveScore.com
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--pitch-200)", marginTop: "2px" }}>
                    {ingestResult.message}
                  </div>
                </div>
              </div>

              <button
    type="button"
    className="btn btn-secondary"
    onClick={onNavigateToTrainingHub}
    style={{ fontSize: "12px", whiteSpace: "nowrap" }}
  >
                <span>View Models Hub</span>
                <ChevronRight size={14} />
              </button>
            </div>}

          {
    /* Historical Filter Bar */
  }
          <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "16px",
      flexWrap: "wrap"
    }}
  >
            <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
              <Search
    size={14}
    style={{
      position: "absolute",
      left: "10px",
      top: "50%",
      transform: "translateY(-50)",
      color: "var(--pitch-400)"
    }}
  />
              <input
    type="text"
    placeholder="Search historical teams or leagues..."
    value={histSearchQuery}
    onChange={(e) => setHistSearchQuery(e.target.value)}
    style={{
      width: "100%",
      padding: "7px 10px 7px 32px",
      background: "var(--pitch-900)",
      border: "1px solid var(--pitch-700)",
      borderRadius: "6px",
      color: "var(--pitch-100)",
      fontSize: "13px"
    }}
  />
            </div>

            <select
    value={histLeagueFilter}
    onChange={(e) => setHistLeagueFilter(e.target.value)}
    style={{
      padding: "7px 12px",
      background: "var(--pitch-900)",
      border: "1px solid var(--pitch-700)",
      borderRadius: "6px",
      color: "var(--pitch-100)",
      fontSize: "13px"
    }}
  >
              <option value="ALL">All Leagues ({historicalData?.leagues.length || 0})</option>
              {(historicalData?.leagues || []).map((lg) => <option key={lg} value={lg}>
                  {lg}
                </option>)}
            </select>
          </div>

          {
    /* Historical Scores Table */
  }
          <div className="card" style={{ padding: "0", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "var(--pitch-900)", borderBottom: "1px solid var(--pitch-700)" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", color: "var(--pitch-400)" }}>Competition</th>
                    <th style={{ padding: "12px 16px", textAlign: "right", color: "var(--pitch-400)" }}>Home Team</th>
                    <th style={{ padding: "12px 16px", textAlign: "center", color: "var(--pitch-400)" }}>Final Score</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", color: "var(--pitch-400)" }}>Away Team</th>
                    <th style={{ padding: "12px 16px", textAlign: "center", color: "var(--pitch-400)" }}>HT</th>
                    <th style={{ padding: "12px 16px", textAlign: "center", color: "var(--pitch-400)" }}>Outcome</th>
                    <th style={{ padding: "12px 16px", textAlign: "right", color: "var(--pitch-400)" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isHistLoading ? Array.from({ length: 6 }).map((_, idx) => <tr key={`hist-skel-${idx}`}>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ height: "12px", width: "100px", background: "var(--pitch-800)", borderRadius: "4px" }} />
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ height: "12px", width: "120px", background: "var(--pitch-800)", borderRadius: "4px" }} />
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "center" }}>
                          <div style={{ height: "14px", width: "36px", margin: "0 auto", background: "var(--pitch-800)", borderRadius: "4px" }} />
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ height: "12px", width: "120px", background: "var(--pitch-800)", borderRadius: "4px" }} />
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ height: "12px", width: "40px", background: "var(--pitch-800)", borderRadius: "4px" }} />
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ height: "12px", width: "32px", background: "var(--pitch-800)", borderRadius: "4px" }} />
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                          <div style={{ height: "24px", width: "60px", marginLeft: "auto", background: "var(--pitch-800)", borderRadius: "4px" }} />
                        </td>
                      </tr>) : (historicalData?.matches || []).map((m, idx) => <tr
    key={m.id || idx}
    style={{
      borderBottom: "1px solid var(--pitch-800)",
      transition: "background 0.1s ease"
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "transparent";
    }}
  >
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 600 }}>{m.league}</div>
                        {m.country && <div style={{ fontSize: "11px", color: "var(--pitch-400)" }}>{m.country}</div>}
                      </td>

                      <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600 }}>
                        {m.homeTeam}
                      </td>

                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <span
    style={{
      padding: "3px 8px",
      borderRadius: "4px",
      fontWeight: 800,
      background: "var(--pitch-900)",
      border: "1px solid var(--pitch-700)"
    }}
  >
                          {m.fthg} - {m.ftag}
                        </span>
                      </td>

                      <td style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>
                        {m.awayTeam}
                      </td>

                      <td style={{ padding: "12px 16px", textAlign: "center", color: "var(--pitch-400)", fontSize: "12px" }}>
                        {m.hthg !== null ? `${m.hthg} - ${m.htag ?? 0}` : "-"}
                      </td>

                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <span
    style={{
      fontSize: "11px",
      fontWeight: 700,
      padding: "2px 6px",
      borderRadius: "4px",
      background: m.ftr === "H" ? "rgba(34, 197, 94, 0.15)" : m.ftr === "A" ? "rgba(59, 130, 246, 0.15)" : "rgba(148, 163, 184, 0.15)",
      color: m.ftr === "H" ? "var(--bright-green)" : m.ftr === "A" ? "#60A5FA" : "#94A3B8"
    }}
  >
                          {m.ftr === "H" ? "Home Win" : m.ftr === "A" ? "Away Win" : "Draw"}
                        </span>
                      </td>

                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <button
    type="button"
    className="btn btn-secondary"
    onClick={() => onSelectMatchForPreMatchPredict(m.homeTeam, m.awayTeam)}
    style={{ fontSize: "11px", padding: "4px 8px" }}
  >
                          Simulate Rematch
                        </button>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>

            {historicalData && historicalData.matches.length === 0 && <div style={{ textAlign: "center", padding: "40px", color: "var(--pitch-400)" }}>
                No historical match scores found for {selectedDate}. Try selecting another date.
              </div>}
          </div>
        </div>}
    </div>;
};
