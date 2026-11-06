import { ArrowUp, ArrowDown, Minus } from "lucide-react";
export const TeamTrendIndicator = ({
  form,
  trend: explicitTrend,
  record: explicitRecord,
  points: explicitPoints,
  badges: explicitBadges,
  size = "sm",
  showRecord = false,
  showBadges = false,
  showLabel = false,
  className = "",
  style
}) => {
  const trend = explicitTrend || form?.trend || "flat";
  const record = explicitRecord || form?.record || "";
  const points = explicitPoints !== void 0 ? explicitPoints : form?.points;
  const badges = explicitBadges || form?.badges || [];
  const iconSizes = {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18
  };
  const currentIconSize = iconSizes[size];
  const config = {
    up: {
      color: "var(--bright-green, #4ade80)",
      bg: "rgba(74, 222, 128, 0.12)",
      border: "rgba(74, 222, 128, 0.3)",
      label: "Upward Trend",
      description: "Strong form over last 5 matches",
      icon: <ArrowUp size={currentIconSize} strokeWidth={2.5} />
    },
    down: {
      color: "var(--red, #f87171)",
      bg: "rgba(248, 113, 113, 0.12)",
      border: "rgba(248, 113, 113, 0.3)",
      label: "Downward Trend",
      description: "Struggling form over last 5 matches",
      icon: <ArrowDown size={currentIconSize} strokeWidth={2.5} />
    },
    flat: {
      color: "var(--amber, #fbbf24)",
      bg: "rgba(251, 191, 36, 0.12)",
      border: "rgba(251, 191, 36, 0.3)",
      label: "Stable / Flat Trend",
      description: "Mixed or balanced form over last 5 matches",
      icon: <Minus size={currentIconSize} strokeWidth={2.5} />
    }
  }[trend];
  const tooltipText = [
    `Form Trend: ${config.label}`,
    record ? `Last 5 games: ${record}` : "",
    points !== void 0 ? `(${points}/15 pts)` : "",
    badges.length > 0 ? `[${badges.join(" ")}]` : ""
  ].filter(Boolean).join(" \u2022 ");
  return <span
    className={`team-trend-indicator ${className}`}
    title={tooltipText}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: size === "xs" ? "3px" : "5px",
      verticalAlign: "middle",
      ...style
    }}
  >
      {
    /* Arrow Icon Badge */
  }
      <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size === "xs" ? "18px" : size === "sm" ? "22px" : size === "md" ? "26px" : "32px",
      height: size === "xs" ? "18px" : size === "sm" ? "22px" : size === "md" ? "26px" : "32px",
      borderRadius: "4px",
      background: config.bg,
      color: config.color,
      border: `1px solid ${config.border}`,
      flexShrink: 0,
      transition: "transform 0.15s ease"
    }}
  >
        {config.icon}
      </span>

      {
    /* Optional Record / Label */
  }
      {showRecord && record && <span
    className="mono"
    style={{
      fontSize: size === "xs" ? "10.5px" : size === "sm" ? "11.5px" : "13px",
      fontWeight: 600,
      color: config.color,
      letterSpacing: "0.2px"
    }}
  >
          {record}
        </span>}

      {showLabel && <span
    style={{
      fontSize: size === "xs" ? "10.5px" : "12px",
      fontWeight: 500,
      color: "var(--chalk-dim)"
    }}
  >
          {config.label}
        </span>}

      {
    /* Optional Recent 5 Match Badges */
  }
      {showBadges && badges.length > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: "2px", marginLeft: "2px" }}>
          {badges.map((b, idx) => {
    const bColor = b === "W" ? "var(--bright-green, #4ade80)" : b === "D" ? "var(--amber, #fbbf24)" : "var(--red, #f87171)";
    const bBg = b === "W" ? "rgba(74, 222, 128, 0.15)" : b === "D" ? "rgba(251, 191, 36, 0.15)" : "rgba(248, 113, 113, 0.15)";
    return <span
      key={idx}
      className="mono"
      style={{
        fontSize: "9px",
        fontWeight: 700,
        width: "14px",
        height: "14px",
        lineHeight: "14px",
        textAlign: "center",
        borderRadius: "2px",
        color: bColor,
        background: bBg
      }}
    >
                {b}
              </span>;
  })}
        </span>}
    </span>;
};
