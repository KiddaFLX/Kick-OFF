import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Trash2,
  Download
} from "lucide-react";
const DEFAULT_ENTRIES = [
  {
    id: "j-1",
    date: "2026-09-15",
    fixture: "Arsenal vs Chelsea",
    league: "Premier League",
    pick: "Home Win",
    odds: 1.75,
    modelProbability: 0.615,
    stake: 100,
    status: "won",
    profit: 75,
    notes: "High attack differential and +12% value bet threshold"
  },
  {
    id: "j-2",
    date: "2026-09-14",
    fixture: "Real Madrid vs Barcelona",
    league: "La Liga",
    pick: "Over 2.5",
    odds: 1.85,
    modelProbability: 0.582,
    stake: 100,
    status: "won",
    profit: 85,
    notes: "Both sides averaging > 2.1 xG in last 5 fixtures"
  },
  {
    id: "j-3",
    date: "2026-09-12",
    fixture: "Inter Milan vs Juventus",
    league: "Serie A",
    pick: "Draw",
    odds: 3.4,
    modelProbability: 0.285,
    stake: 50,
    status: "lost",
    profit: -50,
    notes: "High defensive resilience on both sides"
  },
  {
    id: "j-4",
    date: "2026-09-11",
    fixture: "Bayern Munich vs Dortmund",
    league: "Bundesliga",
    pick: "Home Win",
    odds: 1.62,
    modelProbability: 0.648,
    stake: 150,
    status: "won",
    profit: 93,
    notes: "Random Forest and Ensemble both identified +EV"
  },
  {
    id: "j-5",
    date: "2026-09-10",
    fixture: "Mamelodi Sundowns vs Kaizer Chiefs",
    league: "PSL",
    pick: "Home Win",
    odds: 1.55,
    modelProbability: 0.68,
    stake: 100,
    status: "won",
    profit: 55,
    notes: "Sundowns dominant at home (13 pts from 15)"
  }
];
const STORAGE_KEY = "sportsedge_prediction_journal_v1";
export const PredictionJournalView = () => {
  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
    }
    return DEFAULT_ENTRIES;
  });
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [fixture, setFixture] = useState("");
  const [league, setLeague] = useState("Premier League");
  const [pick, setPick] = useState("Home Win");
  const [odds, setOdds] = useState(1.85);
  const [stake, setStake] = useState(100);
  const [modelProb, setModelProb] = useState(0.58);
  const [notes, setNotes] = useState("");
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
    }
  }, [entries]);
  const settled = entries.filter((e) => e.status === "won" || e.status === "lost");
  const wonCount = entries.filter((e) => e.status === "won").length;
  const lostCount = entries.filter((e) => e.status === "lost").length;
  const pendingCount = entries.filter((e) => e.status === "pending").length;
  const totalStaked = settled.reduce((sum, e) => sum + e.stake, 0);
  const totalProfit = settled.reduce((sum, e) => sum + (e.profit || 0), 0);
  const roi = totalStaked > 0 ? totalProfit / totalStaked * 100 : 0;
  const winRate = settled.length > 0 ? wonCount / settled.length * 100 : 0;
  const brierScore = settled.length > 0 ? settled.reduce((sum, e) => {
    const actualOutcome = e.status === "won" ? 1 : 0;
    return sum + Math.pow(e.modelProbability - actualOutcome, 2);
  }, 0) / settled.length : 0.182;
  const handleAddEntry = (e) => {
    e.preventDefault();
    if (!fixture.trim()) return;
    const newEntry = {
      id: `j-${Date.now()}`,
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      fixture: fixture.trim(),
      league,
      pick,
      odds: Number(odds),
      stake: Number(stake),
      modelProbability: Number(modelProb),
      status: "pending",
      notes: notes.trim()
    };
    setEntries([newEntry, ...entries]);
    setShowAddModal(false);
    setFixture("");
    setNotes("");
  };
  const handleSettle = (id, status) => {
    setEntries(
      entries.map((item) => {
        if (item.id !== id) return item;
        let profit = 0;
        if (status === "won") {
          profit = item.stake * (item.odds - 1);
        } else if (status === "lost") {
          profit = -item.stake;
        } else {
          profit = 0;
        }
        return { ...item, status, profit };
      })
    );
  };
  const handleDelete = (id) => {
    setEntries(entries.filter((e) => e.id !== id));
  };
  const exportCSV = () => {
    const headers = ["Date", "Fixture", "League", "Pick", "Odds", "Model Prob", "Stake", "Status", "Profit", "Notes"];
    const rows = entries.map((e) => [
      e.date,
      `"${e.fixture}"`,
      e.league,
      e.pick,
      e.odds,
      (e.modelProbability * 100).toFixed(1) + "%",
      e.stake,
      e.status,
      e.profit || 0,
      `"${e.notes || ""}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `prediction_portfolio_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const filteredEntries = filterStatus === "ALL" ? entries : entries.filter((e) => e.status === filterStatus.toLowerCase());
  return <div id="prediction-journal-container">
      <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
      flexWrap: "wrap",
      gap: "14px"
    }}
  >
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>
            Prediction Journal & P&L Portfolio
          </h1>
          <p className="page-sub" style={{ margin: "4px 0 0 0" }}>
            Track machine learning picks, measure calibrated returns, and verify edge against bookmaker lines.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
    type="button"
    className="btn secondary"
    onClick={exportCSV}
    style={{ display: "flex", alignItems: "center", gap: "6px" }}
  >
            <Download size={15} /> Export CSV
          </button>
          <button
    type="button"
    className="btn primary"
    onClick={() => setShowAddModal(true)}
    style={{ display: "flex", alignItems: "center", gap: "6px" }}
  >
            <Plus size={15} /> Log Position
          </button>
        </div>
      </div>

      {
    /* KPI Cards */
  }
      <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "16px",
      marginBottom: "24px"
    }}
  >
        <div className="card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "12px", color: "var(--chalk-dim)", marginBottom: "4px", textTransform: "uppercase" }}>
            Cumulative Net P&L
          </div>
          <div
    className="mono"
    style={{
      fontSize: "26px",
      fontWeight: 800,
      color: totalProfit >= 0 ? "var(--bright-green)" : "#ef4444"
    }}
  >
            {totalProfit >= 0 ? `+$${totalProfit.toFixed(2)}` : `-$${Math.abs(totalProfit).toFixed(2)}`}
          </div>
          <div style={{ fontSize: "12px", color: "var(--chalk-dim)", marginTop: "4px" }}>
            From ${totalStaked.toFixed(0)} total volume
          </div>
        </div>

        <div className="card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "12px", color: "var(--chalk-dim)", marginBottom: "4px", textTransform: "uppercase" }}>
            Portfolio ROI
          </div>
          <div
    className="mono"
    style={{
      fontSize: "26px",
      fontWeight: 800,
      color: roi >= 0 ? "var(--bright-green)" : "#ef4444"
    }}
  >
            {roi >= 0 ? `+${roi.toFixed(1)}%` : `${roi.toFixed(1)}%`}
          </div>
          <div style={{ fontSize: "12px", color: "var(--chalk-dim)", marginTop: "4px" }}>
            Expected value edge maintained
          </div>
        </div>

        <div className="card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "12px", color: "var(--chalk-dim)", marginBottom: "4px", textTransform: "uppercase" }}>
            Model Strike Rate
          </div>
          <div className="mono" style={{ fontSize: "26px", fontWeight: 800, color: "var(--chalk)" }}>
            {winRate.toFixed(1)}%
          </div>
          <div style={{ fontSize: "12px", color: "var(--chalk-dim)", marginTop: "4px" }}>
            {wonCount} Won &middot; {lostCount} Lost &middot; {pendingCount} Open
          </div>
        </div>

        <div className="card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "12px", color: "var(--chalk-dim)", marginBottom: "4px", textTransform: "uppercase" }}>
            Calibration (Brier Score)
          </div>
          <div className="mono" style={{ fontSize: "26px", fontWeight: 800, color: "var(--bright-green)" }}>
            {brierScore.toFixed(3)}
          </div>
          <div style={{ fontSize: "12px", color: "var(--chalk-dim)", marginTop: "4px" }}>
            Lower is better (0.00 = perfect)
          </div>
        </div>
      </div>

      {
    /* Filter Tabs */
  }
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
        <div style={{ display: "flex", gap: "8px" }}>
          {["ALL", "PENDING", "WON", "LOST"].map((st) => <button
    key={st}
    type="button"
    onClick={() => setFilterStatus(st)}
    style={{
      background: filterStatus === st ? "rgba(74, 222, 128, 0.18)" : "var(--pitch-800)",
      border: filterStatus === st ? "1px solid var(--bright-green)" : "1px solid var(--pitch-700)",
      color: filterStatus === st ? "var(--bright-green)" : "var(--chalk-dim)",
      borderRadius: "6px",
      padding: "6px 14px",
      fontSize: "12px",
      fontWeight: 600,
      cursor: "pointer"
    }}
  >
              {st}
            </button>)}
        </div>

        <span style={{ fontSize: "12px", color: "var(--chalk-dim)" }}>
          Showing {filteredEntries.length} of {entries.length} logged positions
        </span>
      </div>

      {
    /* Entries Table */
  }
      <div className="card" style={{ padding: "0", overflow: "hidden" }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Fixture</th>
                <th>Pick</th>
                <th>Model Prob</th>
                <th>Market Odds</th>
                <th>Stake</th>
                <th>Status</th>
                <th>P&L</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((item) => <tr key={item.id}>
                  <td className="mono" style={{ fontSize: "12px" }}>
                    {item.date}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--chalk)" }}>{item.fixture}</div>
                    <div style={{ fontSize: "11px", color: "var(--chalk-dim)" }}>{item.league}</div>
                  </td>
                  <td>
                    <span
    style={{
      padding: "3px 8px",
      background: "rgba(255,255,255,0.06)",
      borderRadius: "4px",
      fontWeight: 600,
      fontSize: "12px"
    }}
  >
                      {item.pick}
                    </span>
                  </td>
                  <td className="mono" style={{ color: "var(--bright-green)" }}>
                    {(item.modelProbability * 100).toFixed(1)}%
                  </td>
                  <td className="mono" style={{ fontWeight: 600 }}>
                    {item.odds.toFixed(2)}
                  </td>
                  <td className="mono">${item.stake}</td>
                  <td>
                    {item.status === "won" ? <span
    className="badge recommended"
    style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
  >
                        <CheckCircle2 size={12} /> WON
                      </span> : item.status === "lost" ? <span
    style={{
      background: "rgba(239, 68, 68, 0.15)",
      color: "#ef4444",
      border: "1px solid #ef4444",
      borderRadius: "4px",
      padding: "2px 8px",
      fontSize: "11px",
      fontWeight: 700,
      display: "inline-flex",
      alignItems: "center",
      gap: "4px"
    }}
  >
                        <XCircle size={12} /> LOST
                      </span> : <span
    style={{
      background: "rgba(234, 179, 8, 0.15)",
      color: "var(--amber)",
      border: "1px solid var(--amber)",
      borderRadius: "4px",
      padding: "2px 8px",
      fontSize: "11px",
      fontWeight: 700,
      display: "inline-flex",
      alignItems: "center",
      gap: "4px"
    }}
  >
                        <Clock size={12} /> OPEN
                      </span>}
                  </td>
                  <td
    className="mono"
    style={{
      fontWeight: 700,
      color: item.profit && item.profit > 0 ? "var(--bright-green)" : item.profit && item.profit < 0 ? "#ef4444" : "var(--chalk-dim)"
    }}
  >
                    {item.profit !== void 0 ? item.profit > 0 ? `+$${item.profit.toFixed(2)}` : item.profit < 0 ? `-$${Math.abs(item.profit).toFixed(2)}` : "$0.00" : "\u2014"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {item.status === "pending" && <>
                          <button
    type="button"
    title="Mark as Won"
    onClick={() => handleSettle(item.id, "won")}
    style={{
      background: "rgba(74, 222, 128, 0.12)",
      border: "1px solid var(--bright-green)",
      color: "var(--bright-green)",
      borderRadius: "4px",
      padding: "2px 6px",
      fontSize: "10px",
      fontWeight: 700,
      cursor: "pointer"
    }}
  >
                            WON
                          </button>
                          <button
    type="button"
    title="Mark as Lost"
    onClick={() => handleSettle(item.id, "lost")}
    style={{
      background: "rgba(239, 68, 68, 0.12)",
      border: "1px solid #ef4444",
      color: "#ef4444",
      borderRadius: "4px",
      padding: "2px 6px",
      fontSize: "10px",
      fontWeight: 700,
      cursor: "pointer"
    }}
  >
                            LOST
                          </button>
                        </>}
                      <button
    type="button"
    title="Delete entry"
    onClick={() => handleDelete(item.id)}
    style={{
      background: "transparent",
      border: "none",
      color: "var(--chalk-dim)",
      cursor: "pointer",
      padding: "2px 4px"
    }}
  >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {
    /* Add Entry Modal */
  }
      {showAddModal && <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.75)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1e3,
      padding: "20px"
    }}
  >
          <div
    className="card"
    style={{
      maxWidth: "500px",
      width: "100%",
      background: "var(--pitch-850)",
      border: "1px solid var(--pitch-700)",
      padding: "24px"
    }}
  >
            <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Log Prediction Position</h3>
            <form onSubmit={handleAddEntry}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "var(--chalk-dim)", marginBottom: "4px" }}>
                  Fixture
                </label>
                <input
    type="text"
    required
    placeholder="e.g. Arsenal vs Chelsea"
    value={fixture}
    onChange={(e) => setFixture(e.target.value)}
    style={{
      width: "100%",
      background: "var(--pitch-900)",
      border: "1px solid var(--pitch-700)",
      padding: "8px 12px",
      color: "var(--chalk)",
      borderRadius: "6px"
    }}
  />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--chalk-dim)", marginBottom: "4px" }}>
                    League
                  </label>
                  <select
    value={league}
    onChange={(e) => setLeague(e.target.value)}
    style={{
      width: "100%",
      background: "var(--pitch-900)",
      border: "1px solid var(--pitch-700)",
      padding: "8px 12px",
      color: "var(--chalk)",
      borderRadius: "6px"
    }}
  >
                    <option value="Premier League">Premier League</option>
                    <option value="La Liga">La Liga</option>
                    <option value="Serie A">Serie A</option>
                    <option value="Bundesliga">Bundesliga</option>
                    <option value="Ligue 1">Ligue 1</option>
                    <option value="PSL">PSL</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--chalk-dim)", marginBottom: "4px" }}>
                    Selection / Pick
                  </label>
                  <select
    value={pick}
    onChange={(e) => setPick(e.target.value)}
    style={{
      width: "100%",
      background: "var(--pitch-900)",
      border: "1px solid var(--pitch-700)",
      padding: "8px 12px",
      color: "var(--chalk)",
      borderRadius: "6px"
    }}
  >
                    <option value="Home Win">Home Win</option>
                    <option value="Draw">Draw</option>
                    <option value="Away Win">Away Win</option>
                    <option value="Over 2.5">Over 2.5</option>
                    <option value="Under 2.5">Under 2.5</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--chalk-dim)", marginBottom: "4px" }}>
                    Odds (Decimal)
                  </label>
                  <input
    type="number"
    step="0.01"
    min="1.01"
    value={odds}
    onChange={(e) => setOdds(parseFloat(e.target.value) || 1.01)}
    style={{
      width: "100%",
      background: "var(--pitch-900)",
      border: "1px solid var(--pitch-700)",
      padding: "8px",
      color: "var(--chalk)",
      borderRadius: "6px"
    }}
  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--chalk-dim)", marginBottom: "4px" }}>
                    Model Prob (0-1)
                  </label>
                  <input
    type="number"
    step="0.01"
    min="0.01"
    max="0.99"
    value={modelProb}
    onChange={(e) => setModelProb(parseFloat(e.target.value) || 0.5)}
    style={{
      width: "100%",
      background: "var(--pitch-900)",
      border: "1px solid var(--pitch-700)",
      padding: "8px",
      color: "var(--chalk)",
      borderRadius: "6px"
    }}
  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--chalk-dim)", marginBottom: "4px" }}>
                    Stake ($)
                  </label>
                  <input
    type="number"
    step="5"
    min="1"
    value={stake}
    onChange={(e) => setStake(parseFloat(e.target.value) || 10)}
    style={{
      width: "100%",
      background: "var(--pitch-900)",
      border: "1px solid var(--pitch-700)",
      padding: "8px",
      color: "var(--chalk)",
      borderRadius: "6px"
    }}
  />
                </div>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "var(--chalk-dim)", marginBottom: "4px" }}>
                  Analytical Notes
                </label>
                <input
    type="text"
    placeholder="Key model drivers, team news, or EV reasoning"
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    style={{
      width: "100%",
      background: "var(--pitch-900)",
      border: "1px solid var(--pitch-700)",
      padding: "8px 12px",
      color: "var(--chalk)",
      borderRadius: "6px"
    }}
  />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
    type="button"
    className="btn secondary"
    onClick={() => setShowAddModal(false)}
  >
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Save Position
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
};
