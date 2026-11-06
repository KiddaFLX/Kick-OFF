import React from "react";

import eplLogo from "../images/epl.png";
import laligaLogo from "../images/laliga.png";
import serieaLogo from "../images/seriea.png";
import bundesligaLogo from "../images/bundesliga.png";
import ligue1Logo from "../images/ligue1.png";
import pslLogo from "../images/psl.png";

/**
 * League badges using the PNG logo files in src/images.
 */
export const LEAGUE_CONFIG = {
  "Premier League": {
    name: "Premier League",
    shortName: "EPL",
    country: "England",
    primaryColor: "#38003c",
    accentColor: "#00ff85",
    textColor: "#ffffff",
    logo: eplLogo,
  },
  "La Liga": {
    name: "La Liga",
    shortName: "ESP",
    country: "Spain",
    primaryColor: "#ee2624",
    accentColor: "#f59e0b",
    textColor: "#ffffff",
    logo: laligaLogo,
  },
  "Serie A": {
    name: "Serie A",
    shortName: "ITA",
    country: "Italy",
    primaryColor: "#002878",
    accentColor: "#008fd7",
    textColor: "#ffffff",
    logo: serieaLogo,
  },
  "Bundesliga": {
    name: "Bundesliga",
    shortName: "GER",
    country: "Germany",
    primaryColor: "#d20515",
    accentColor: "#ffffff",
    textColor: "#ffffff",
    logo: bundesligaLogo,
  },
  "Ligue 1": {
    name: "Ligue 1",
    shortName: "FRA",
    country: "France",
    primaryColor: "#091c3e",
    accentColor: "#dae812",
    textColor: "#ffffff",
    logo: ligue1Logo,
  },
  "PSL": {
    name: "PSL",
    shortName: "RSA",
    country: "South Africa",
    primaryColor: "#000000",
    accentColor: "#f59e0b",
    textColor: "#ffffff",
    logo: pslLogo,
  },
};

const FALLBACK = {
  name: "League",
  shortName: "LGE",
  primaryColor: "#22c55e",
  accentColor: "#15803d",
  logo: null,
};

const FallbackIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="15" fill="#18181b" stroke="#22c55e" strokeWidth="1.5" />
    <circle cx="16" cy="16" r="8" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 3" />
  </svg>
);

export const LeagueBadge = ({
  leagueName,
  size = 20,
  showName = false,
  className = "",
  style = {},
}) => {
  const cfg =
    LEAGUE_CONFIG[leagueName] || { ...FALLBACK, name: leagueName || FALLBACK.name };

  return (
    <span
      className={`league-badge ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        verticalAlign: "middle",
        ...style,
      }}
      title={`${cfg.name} (${cfg.country || "Football"})`}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: `${size}px`,
          height: `${size}px`,
          flexShrink: 0,
        }}
      >
        {cfg.logo ? (
          <img
            src={cfg.logo}
            alt={`${cfg.name} logo`}
            width={size}
            height={size}
            style={{ objectFit: "contain", display: "block" }}
            loading="lazy"
          />
        ) : (
          <FallbackIcon size={size} />
        )}
      </span>
      {showName && (
        <span
          style={{
            fontSize: `${Math.max(11, size * 0.65)}px`,
            fontWeight: 600,
            color: "var(--chalk, #ffffff)",
            letterSpacing: "0.2px",
          }}
        >
          {cfg.name}
        </span>
      )}
    </span>
  );
};

export default LeagueBadge;