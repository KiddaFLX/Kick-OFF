export const SkeletonMatchCard = () => {
  return <div
    className="card skeleton-card"
    style={{
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      minHeight: "180px",
      position: "relative",
      overflow: "hidden",
      background: "var(--pitch-900)",
      border: "1px solid var(--pitch-700)"
    }}
  >
      <div className="shimmer-sweep" />

      {
    /* Header bar */
  }
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <div style={{ width: "90px", height: "14px", background: "var(--pitch-800)", borderRadius: "4px" }} />
        <div style={{ width: "60px", height: "14px", background: "var(--pitch-800)", borderRadius: "4px" }} />
      </div>

      {
    /* Teams area */
  }
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "10px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "20px", height: "20px", borderRadius: "4px", background: "var(--pitch-800)" }} />
            <div style={{ width: "120px", height: "14px", background: "var(--pitch-800)", borderRadius: "4px" }} />
          </div>
          <div style={{ width: "24px", height: "18px", background: "var(--pitch-800)", borderRadius: "4px" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "20px", height: "20px", borderRadius: "4px", background: "var(--pitch-800)" }} />
            <div style={{ width: "100px", height: "14px", background: "var(--pitch-800)", borderRadius: "4px" }} />
          </div>
          <div style={{ width: "24px", height: "18px", background: "var(--pitch-800)", borderRadius: "4px" }} />
        </div>
      </div>

      {
    /* Bottom action bar */
  }
      <div style={{ display: "flex", gap: "8px", marginTop: "12px", paddingTop: "10px", borderTop: "1px solid var(--pitch-800)" }}>
        <div style={{ flex: 1, height: "30px", background: "var(--pitch-800)", borderRadius: "6px" }} />
      </div>
    </div>;
};
