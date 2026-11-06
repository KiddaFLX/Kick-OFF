import { useState } from "react";
import { Play, ArrowUpRight } from "lucide-react";
import { TeamBadge } from "./TeamBadge.jsx";
import { LeagueBadge } from "./LeagueBadge.jsx";
const DEFAULT_TICKER_FIXTURES = [
  {
    id: "fix-1",
    home: "Arsenal",
    away: "Chelsea",
    league: "Premier League",
    status: "LIVE",
    minute: 68,
    score: { home: 2, away: 1 }
  },
  {
    id: "fix-2",
    home: "Real Madrid",
    away: "Barcelona",
    league: "La Liga",
    status: "LIVE",
    minute: 34,
    score: { home: 1, away: 1 }
  },
  {
    id: "fix-3",
    home: "Inter Milan",
    away: "Juventus",
    league: "Serie A",
    status: "UPCOMING",
    time: "Today 20:00"
  },
  {
    id: "fix-4",
    home: "Bayern Munich",
    away: "Borussia Dortmund",
    league: "Bundesliga",
    status: "UPCOMING",
    time: "Today 20:30"
  },
  {
    id: "fix-5",
    home: "PSG",
    away: "Marseille",
    league: "Ligue 1",
    status: "LIVE",
    minute: 52,
    score: { home: 0, away: 0 }
  },
  {
    id: "fix-6",
    home: "Liverpool",
    away: "Man City",
    league: "Premier League",
    status: "UPCOMING",
    time: "Tomorrow 16:30"
  }
];
export const FixtureRibbon = ({
  onSelectFixtureForPredict,
  onSelectFixtureForLive
}) => {
  const [filterLeague, setFilterLeague] = useState("ALL");
  const filteredFixtures = filterLeague === "ALL" ? DEFAULT_TICKER_FIXTURES : DEFAULT_TICKER_FIXTURES.filter((f) => f.league.toLowerCase().includes(filterLeague.toLowerCase()));
  return <div
    id="marquee-fixture-ribbon"
    style={{
      background: "var(--pitch-900)",
      borderBottom: "1px solid var(--pitch-700)",
      padding: "6px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "14px",
      overflowX: "auto"
    }}
  >
      {
    /* League Filter */
  }
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
        <span
    style={{
      fontSize: "11px",
      fontWeight: 600,
      color: "var(--chalk-muted)",
      marginRight: "4px"
    }}
  >
          Fixtures
        </span>

        {["ALL", "Premier", "La Liga", "Serie A"].map((lg) => <button
    key={lg}
    type="button"
    onClick={() => setFilterLeague(lg)}
    style={{
      background: filterLeague === lg ? "var(--pitch-800)" : "transparent",
      border: filterLeague === lg ? "1px solid var(--pitch-600)" : "1px solid transparent",
      color: filterLeague === lg ? "var(--chalk)" : "var(--chalk-dim)",
      borderRadius: "4px",
      padding: "2px 8px",
      fontSize: "11px",
      fontWeight: 500,
      cursor: "pointer"
    }}
  >
            {lg}
          </button>)}
      </div>

      {
    /* Horizontal Scrolling Fixture Strip */
  }
      <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      overflowX: "auto",
      scrollbarWidth: "none",
      flex: 1
    }}
  >
        {filteredFixtures.map((f) => {
    const isLive = f.status === "LIVE";
    return <div
      key={f.id}
      style={{
        background: "var(--pitch-850)",
        border: "1px solid var(--pitch-700)",
        borderRadius: "5px",
        padding: "3px 9px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexShrink: 0,
        fontSize: "12px"
      }}
    >
              <LeagueBadge leagueName={f.league} size={13} />
              {isLive ? (
                <span
                  style={{
                    color: "var(--bright-green)",
                    fontSize: "10.5px",
                    fontWeight: 600
                  }}
                >
                  {f.minute}&apos;
                </span>
              ) : (
                <span style={{ fontSize: "10.5px", color: "var(--chalk-muted)" }}>{f.time}</span>
              )}

              <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontWeight: 500, color: "var(--chalk)", whiteSpace: "nowrap" }}>
                <TeamBadge teamName={f.home} size={14} />
                <span>{f.home}</span>{" "}
                {isLive && f.score ? (
                  <span className="mono" style={{ color: "var(--bright-green)", margin: "0 2px", fontWeight: 600 }}>
                    {f.score.home}-{f.score.away}
                  </span>
                ) : (
                  <span style={{ color: "var(--chalk-muted)", margin: "0 2px" }}>v</span>
                )}{" "}
                <TeamBadge teamName={f.away} size={14} />
                <span>{f.away}</span>
              </div>

              {
      /* Action */
    }
              {isLive ? <button
      type="button"
      title="Simulate In-Play"
      onClick={() => onSelectFixtureForLive(
        f.home,
        f.away,
        f.minute || 45,
        f.score?.home || 0,
        f.score?.away || 0
      )}
      style={{
        background: "transparent",
        border: "none",
        color: "var(--bright-green)",
        cursor: "pointer",
        padding: "1px",
        display: "flex",
        alignItems: "center"
      }}
    >
                  <Play size={10} />
                </button> : <button
      type="button"
      title="Predict Match"
      onClick={() => onSelectFixtureForPredict(f.home, f.away)}
      style={{
        background: "transparent",
        border: "none",
        color: "var(--chalk-muted)",
        cursor: "pointer",
        padding: "1px",
        display: "flex",
        alignItems: "center"
      }}
    >
                  <ArrowUpRight size={11} />
                </button>}
            </div>;
  })}
      </div>
    </div>;
};
