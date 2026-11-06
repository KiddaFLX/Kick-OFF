import React from "react";

/**
 * Authentic visual club badges & crests for all football clubs across all leagues.
 */
export const TEAM_BRAND_CONFIG = {
  // --- PREMIER LEAGUE ---
  "Arsenal": {
    primary: "#EF0107",
    secondary: "#063672",
    accent: "#9C824A",
    short: "ARS",
    renderCrest: (s) => (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <path d="M16 2L27 6V18C27 24.5 16 30 16 30C16 30 5 24.5 5 18V6L16 2Z" fill="#EF0107" stroke="#9C824A" strokeWidth="1.2" />
        <path d="M16 4L25 7.5V17C25 22.5 16 27.5 16 27.5C16 27.5 7 22.5 7 17V7.5L16 4Z" fill="#EF0107" />
        {/* Iconic Cannon */}
        <rect x="9" y="16" width="14" height="3.5" rx="1.5" fill="#9C824A" />
        <circle cx="12" cy="18" r="3.2" fill="#063672" stroke="#9C824A" strokeWidth="1" />
        <circle cx="12" cy="18" r="1.2" fill="#FFFFFF" />
        <path d="M16 14L22 17.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
        <text x="16" y="11" textAnchor="middle" fill="#FFFFFF" fontSize="6" fontWeight="bold" fontFamily="sans-serif">ARS</text>
      </svg>
    ),
  },
  "Manchester City": {
    primary: "#6CABDD",
    secondary: "#1C2C5B",
    accent: "#DA291C",
    short: "MCI",
    renderCrest: (s) => (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="15" fill="#1C2C5B" stroke="#6CABDD" strokeWidth="1.5" />
        <circle cx="16" cy="16" r="12" fill="#6CABDD" />
        <circle cx="16" cy="16" r="8.5" fill="#FFFFFF" stroke="#1C2C5B" strokeWidth="0.8" />
        {/* Ship on Waves */}
        <path d="M11 15L16 12L21 15L20 18H12L11 15Z" fill="#1C2C5B" />
        <path d="M11 19C13 20 19 20 21 19" stroke="#DA291C" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  "Liverpool": {
    primary: "#C8102E",
    secondary: "#00B2A9",
    accent: "#F6EB61",
    short: "LIV",
    renderCrest: (s) => (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <path d="M16 2L26 6V18C26 24 16 30 16 30C16 30 6 24 6 18V6L16 2Z" fill="#C8102E" stroke="#00B2A9" strokeWidth="1.2" />
        {/* Liver Bird Silhouette */}
        <circle cx="16" cy="10" r="2.2" fill="#F6EB61" />
        <path d="M16 12C14 14 13 18 16 22C19 18 18 14 16 12Z" fill="#F6EB61" />
        <path d="M13 14C11 16 10 19 12 21" stroke="#F6EB61" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M19 14C21 16 22 19 20 21" stroke="#F6EB61" strokeWidth="1.2" strokeLinecap="round" />
        <text x="16" y="27" textAnchor="middle" fill="#FFFFFF" fontSize="5" fontWeight="bold">LFC</text>
      </svg>
    ),
  },
  "Chelsea": {
    primary: "#034694",
    secondary: "#DBA111",
    accent: "#EE242C",
    short: "CHE",
    renderCrest: (s) => (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="15" fill="#034694" stroke="#DBA111" strokeWidth="1.5" />
        <circle cx="16" cy="16" r="11" fill="#FFFFFF" />
        {/* Lion Rampant Silhouette */}
        <path d="M14 9C15 8 18 8 18 10C18 11.5 16 12 16 13C16 14 19 15 18 18C17 21 13 22 13 22L12 18C13 17 14 15 13 13C12 11 13 10 14 9Z" fill="#034694" />
        <path d="M18 11L21 10L20 13" stroke="#EE242C" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="16" cy="16" r="14.5" stroke="#FFFFFF" strokeWidth="0.5" strokeDasharray="1.5 2" />
      </svg>
    ),
  },
  "Manchester United": {
    primary: "#DA291C",
    secondary: "#FBE122",
    accent: "#000000",
    short: "MUN",
    renderCrest: (s) => (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="15" fill="#DA291C" stroke="#FBE122" strokeWidth="1.5" />
        <path d="M6 11H26V21H6V11Z" fill="#FBE122" />
        {/* Red Devil with Pitchfork */}
        <circle cx="16" cy="14" r="2.5" fill="#DA291C" />
        <path d="M14 16H18V20H14V16Z" fill="#DA291C" />
        <path d="M12 13L10 11M20 13L22 11" stroke="#DA291C" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M19 12V20M17 13H21" stroke="#DA291C" strokeWidth="0.8" />
        <text x="16" y="8.5" textAnchor="middle" fill="#FFFFFF" fontSize="5" fontWeight="bold">MAN</text>
        <text x="16" y="27" textAnchor="middle" fill="#FFFFFF" fontSize="5" fontWeight="bold">UTD</text>
      </svg>
    ),
  },
  "Tottenham Hotspur": {
    primary: "#132257",
    secondary: "#FFFFFF",
    accent: "#A0A0A0",
    short: "TOT",
    renderCrest: (s) => (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <path d="M16 2L26 6V18C26 24 16 30 16 30C16 30 6 24 6 18V6L16 2Z" fill="#132257" stroke="#FFFFFF" strokeWidth="1.2" />
        {/* Cockerel on Ball */}
        <circle cx="16" cy="22" r="3.5" fill="#FFFFFF" stroke="#132257" strokeWidth="0.8" />
        <path d="M15 11C16 9 17 9 18 10C18 12 16 13 16 15C17 16 18 18 16 19H15C14 17 14 14 15 11Z" fill="#FFFFFF" />
        <path d="M18 10L20 9" stroke="#DA291C" strokeWidth="1" strokeLinecap="round" />
      </svg>
    ),
  },
  "Aston Villa": {
    primary: "#670E36",
    secondary: "#95BFE5",
    accent: "#FEE12B",
    short: "AVL",
    renderCrest: (s) => (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <path d="M16 2L26 6V18C26 24 16 30 16 30C16 30 6 24 6 18V6L16 2Z" fill="#670E36" stroke="#95BFE5" strokeWidth="1.5" />
        <polygon points="16,5 17.5,9 22,9 18.5,12 20,16 16,13.5 12,16 13.5,12 10,9 14.5,9" fill="#FEE12B" />
        <text x="16" y="24" textAnchor="middle" fill="#95BFE5" fontSize="6.5" fontWeight="bold">AVFC</text>
      </svg>
    ),
  },
  "Newcastle United": {
    primary: "#241F20",
    secondary: "#FFFFFF",
    accent: "#41B6E6",
    short: "NEW",
    renderCrest: (s) => (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="15" fill="#241F20" stroke="#41B6E6" strokeWidth="1.5" />
        {/* Black & White vertical stripes */}
        <clipPath id="newcastle-clip">
          <circle cx="16" cy="16" r="12" />
        </clipPath>
        <g clipPath="url(#newcastle-clip)">
          <rect x="4" y="4" width="24" height="24" fill="#FFFFFF" />
          <rect x="7" y="4" width="3.5" height="24" fill="#241F20" />
          <rect x="14" y="4" width="4" height="24" fill="#241F20" />
          <rect x="21" y="4" width="3.5" height="24" fill="#241F20" />
        </g>
        <circle cx="16" cy="16" r="5" fill="#41B6E6" stroke="#FFFFFF" strokeWidth="1" />
        <text x="16" y="18" textAnchor="middle" fill="#FFFFFF" fontSize="5" fontWeight="bold">NUFC</text>
      </svg>
    ),
  },

  // --- LA LIGA ---
  "Real Madrid": {
    primary: "#FFFFFF",
    secondary: "#FEBE10",
    accent: "#00529F",
    short: "RMA",
    renderCrest: (s) => (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="18" r="12" fill="#FFFFFF" stroke="#FEBE10" strokeWidth="1.8" />
        {/* Purple diagonal sash */}
        <clipPath id="rma-clip">
          <circle cx="16" cy="18" r="11" />
        </clipPath>
        <g clipPath="url(#rma-clip)">
          <line x1="8" y1="8" x2="24" y2="28" stroke="#00529F" strokeWidth="4" />
          <text x="16" y="21" textAnchor="middle" fill="#FEBE10" fontSize="7" fontWeight="bold">MFC</text>
        </g>
        {/* Royal Crown on Top */}
        <path d="M10 9L12 4L16 6.5L20 4L22 9H10Z" fill="#FEBE10" stroke="#DA291C" strokeWidth="0.8" />
        <circle cx="16" cy="3" r="1" fill="#FEBE10" />
      </svg>
    ),
  },
  "Barcelona": {
    primary: "#A50044",
    secondary: "#004D98",
    accent: "#EDBB00",
    short: "BAR",
    renderCrest: (s) => (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <path d="M5 6C5 6 16 3 16 3C16 3 27 6 27 6V17C27 24 16 29 16 29C16 29 5 24 5 17V6Z" fill="#A50044" stroke="#EDBB00" strokeWidth="1.5" />
        <clipPath id="barca-clip">
          <path d="M6 7C6 7 16 4 16 4C16 4 26 7 26 7V16.5C26 23 16 28 16 28C16 28 6 23 6 16.5V7Z" />
        </clipPath>
        <g clipPath="url(#barca-clip)">
          {/* Top Left: St George Cross */}
          <rect x="6" y="4" width="10" height="9" fill="#FFFFFF" />
          <rect x="10" y="4" width="2" height="9" fill="#DA291C" />
          <rect x="6" y="7.5" width="10" height="2" fill="#DA291C" />
          {/* Top Right: Senyera Red & Gold */}
          <rect x="16" y="4" width="10" height="9" fill="#EDBB00" />
          <line x1="18.5" y1="4" x2="18.5" y2="13" stroke="#DA291C" strokeWidth="1.5" />
          <line x1="22.5" y1="4" x2="22.5" y2="13" stroke="#DA291C" strokeWidth="1.5" />
          {/* Horizontal Golden Ribbon */}
          <rect x="6" y="13" width="20" height="2.5" fill="#EDBB00" />
          {/* Bottom: Blaugrana Vertical Stripes */}
          <rect x="6" y="15.5" width="20" height="13" fill="#A50044" />
          <rect x="9.5" y="15.5" width="3.5" height="13" fill="#004D98" />
          <rect x="16.5" y="15.5" width="3.5" height="13" fill="#004D98" />
          {/* Football in center */}
          <circle cx="16" cy="21" r="3" fill="#EDBB00" stroke="#18181b" strokeWidth="0.8" />
        </g>
      </svg>
    ),
  },
  "Atletico Madrid": {
    primary: "#CB3524",
    secondary: "#003B71",
    accent: "#FFFFFF",
    short: "ATM",
    renderCrest: (s) => (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <path d="M6 5C6 5 16 2 16 2C16 2 26 5 26 5V18C26 24 16 30 16 30C16 30 6 24 6 18V5Z" fill="#CB3524" stroke="#003B71" strokeWidth="1.5" />
        <clipPath id="atm-clip">
          <path d="M7 6C7 6 16 3.5 16 3.5C16 3.5 25 6 25 6V17.5C25 23 16 28.5 16 28.5C16 28.5 7 23 7 17.5V6Z" />
        </clipPath>
        <g clipPath="url(#atm-clip)">
          {/* Red & White stripes */}
          <rect x="7" y="3" width="18" height="26" fill="#FFFFFF" />
          <rect x="10" y="3" width="3" height="26" fill="#CB3524" />
          <rect x="16" y="3" width="3" height="26" fill="#CB3524" />
          <rect x="22" y="3" width="3" height="26" fill="#CB3524" />
          {/* Blue triangle top with tree */}
          <path d="M7 6L16 3.5L16 14H7V6Z" fill="#003B71" />
          <circle cx="11.5" cy="8.5" r="2" fill="#10b981" />
          <rect x="11" y="9.5" width="1" height="2" fill="#78350f" />
        </g>
      </svg>
    ),
  },

  // --- BUNDESLIGA ---
  "Bayern Munich": {
    primary: "#DC052D",
    secondary: "#0066B2",
    accent: "#FFFFFF",
    short: "BAY",
    renderCrest: (s) => (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="15" fill="#DC052D" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="16" cy="16" r="11" fill="#FFFFFF" stroke="#0066B2" strokeWidth="1.2" />
        {/* Bavarian Blue & White Diamond Lozenge Checkers */}
        <clipPath id="fcb-clip">
          <circle cx="16" cy="16" r="7.5" />
        </clipPath>
        <g clipPath="url(#fcb-clip)">
          <rect x="8" y="8" width="16" height="16" fill="#0066B2" />
          <line x1="8" y1="12" x2="24" y2="20" stroke="#FFFFFF" strokeWidth="2.5" />
          <line x1="12" y1="8" x2="24" y2="14" stroke="#FFFFFF" strokeWidth="2.5" />
          <line x1="8" y1="18" x2="20" y2="24" stroke="#FFFFFF" strokeWidth="2.5" />
        </g>
        <text x="16" y="7.5" textAnchor="middle" fill="#FFFFFF" fontSize="4.5" fontWeight="bold">FCB</text>
      </svg>
    ),
  },
  "Borussia Dortmund": {
    primary: "#FDE100",
    secondary: "#000000",
    accent: "#FFFFFF",
    short: "BVB",
    renderCrest: (s) => (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="15" fill="#FDE100" stroke="#000000" strokeWidth="2" />
        <circle cx="16" cy="16" r="13" stroke="#000000" strokeWidth="0.8" />
        <text x="16" y="18" textAnchor="middle" fill="#000000" fontSize="8" fontWeight="900" fontFamily="sans-serif">BVB</text>
        <text x="16" y="24" textAnchor="middle" fill="#000000" fontSize="5" fontWeight="bold">09</text>
      </svg>
    ),
  },
  "Bayer Leverkusen": {
    primary: "#E32221",
    secondary: "#000000",
    accent: "#FEE12B",
    short: "B04",
    renderCrest: (s) => (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="15" fill="#000000" stroke="#E32221" strokeWidth="1.5" />
        <circle cx="16" cy="16" r="12" fill="#E32221" />
        {/* Bayer Cross */}
        <circle cx="16" cy="16" r="8" fill="#FFFFFF" />
        <rect x="14.5" y="10" width="3" height="12" fill="#000000" />
        <rect x="10" y="14.5" width="12" height="3" fill="#000000" />
      </svg>
    ),
  },

  // --- SERIE A ---
  "Inter Milan": {
    primary: "#0068A8",
    secondary: "#000000",
    accent: "#FFFFFF",
    short: "INT",
    renderCrest: (s) => (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="15" fill="#0068A8" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="16" cy="16" r="12" fill="#000000" stroke="#0068A8" strokeWidth="1.2" />
        <text x="16" y="21" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="900">IM</text>
      </svg>
    ),
  },
  "AC Milan": {
    primary: "#AC1F2D",
    secondary: "#000000",
    accent: "#FFFFFF",
    short: "ACM",
    renderCrest: (s) => (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        {/* Oval shape */}
        <ellipse cx="16" cy="16" rx="11" ry="15" fill="#FFFFFF" stroke="#AC1F2D" strokeWidth="1.5" />
        <clipPath id="acm-clip">
          <ellipse cx="16" cy="16" rx="10" ry="14" />
        </clipPath>
        <g clipPath="url(#acm-clip)">
          {/* Left half: Red & Black Stripes */}
          <rect x="5" y="2" width="11" height="28" fill="#AC1F2D" />
          <rect x="8" y="2" width="2.5" height="28" fill="#000000" />
          <rect x="13.5" y="2" width="2.5" height="28" fill="#000000" />
          {/* Right half: St Ambrose Red Cross on White */}
          <rect x="16" y="2" width="11" height="28" fill="#FFFFFF" />
          <rect x="16" y="14.5" width="11" height="3" fill="#AC1F2D" />
          <rect x="20" y="2" width="3" height="28" fill="#AC1F2D" />
        </g>
        <text x="16" y="6" textAnchor="middle" fill="#000000" fontSize="4" fontWeight="bold">ACM</text>
      </svg>
    ),
  },
  "Juventus": {
    primary: "#000000",
    secondary: "#FFFFFF",
    accent: "#DA291C",
    short: "JUV",
    renderCrest: (s) => (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <path d="M16 2L26 6V18C26 24 16 30 16 30C16 30 6 24 6 18V6L16 2Z" fill="#000000" stroke="#FFFFFF" strokeWidth="1.5" />
        {/* Double J Icon */}
        <path d="M13 10V18C13 19.5 12 21 10.5 21C9 21 8.5 20 8.5 19H6C6 21.5 8 23.5 11 23.5C14.5 23.5 15.5 20.5 15.5 18V10H13Z" fill="#FFFFFF" />
        <path d="M21 10V18C21 21 19 23.5 16 23.5V21C17.5 21 18.5 19.5 18.5 18V10H21Z" fill="#FFFFFF" />
      </svg>
    ),
  },

  // --- LIGUE 1 ---
  "Paris Saint-Germain": {
    primary: "#004170",
    secondary: "#DA291C",
    accent: "#FFFFFF",
    short: "PSG",
    renderCrest: (s) => (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="15" fill="#004170" stroke="#DA291C" strokeWidth="1.5" />
        <circle cx="16" cy="16" r="11.5" fill="#FFFFFF" stroke="#004170" strokeWidth="1" />
        {/* Eiffel Tower Silhouette in Red */}
        <polygon points="16,8 19,23 13,23" fill="#DA291C" />
        <polygon points="16,16 18,23 14,23" fill="#FFFFFF" />
        <polygon points="16,18 17.5,23 14.5,23" fill="#004170" />
        {/* Fleur-de-lis in White */}
        <circle cx="16" cy="19" r="1.2" fill="#DA291C" />
        <text x="16" y="6" textAnchor="middle" fill="#FFFFFF" fontSize="4.5" fontWeight="bold">PSG</text>
      </svg>
    ),
  },

  // --- PSL ---
  "Mamelodi Sundowns": {
    primary: "#FDB913",
    secondary: "#007A3D",
    accent: "#005BAA",
    short: "SUN",
    renderCrest: (s) => (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="15" fill="#FDB913" stroke="#007A3D" strokeWidth="1.8" />
        <circle cx="16" cy="16" r="11" fill="#007A3D" />
        {/* Sunburst Star */}
        <polygon points="16,7 18,12 23,13 19,17 20,22 16,19 12,22 13,17 9,13 14,12" fill="#FDB913" />
        <circle cx="16" cy="16" r="2.5" fill="#005BAA" />
      </svg>
    ),
  },
  "Orlando Pirates": {
    primary: "#000000",
    secondary: "#FFFFFF",
    accent: "#DA291C",
    short: "PIR",
    renderCrest: (s) => (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="15" fill="#000000" stroke="#FFFFFF" strokeWidth="1.5" />
        {/* Skull and Crossbones */}
        <line x1="8" y1="8" x2="24" y2="24" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="24" y1="8" x2="8" y2="24" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="16" cy="14" r="5" fill="#000000" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="14" cy="13.5" r="1" fill="#FFFFFF" />
        <circle cx="18" cy="13.5" r="1" fill="#FFFFFF" />
        <rect x="14" y="17" width="4" height="2" fill="#000000" stroke="#FFFFFF" strokeWidth="0.8" />
      </svg>
    ),
  },
  "Kaizer Chiefs": {
    primary: "#FDB913",
    secondary: "#000000",
    accent: "#FFFFFF",
    short: "KAI",
    renderCrest: (s) => (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="15" fill="#000000" stroke="#FDB913" strokeWidth="1.8" />
        <circle cx="16" cy="16" r="11" fill="#FDB913" />
        {/* Native American Head Profile */}
        <circle cx="16" cy="15" r="4.5" fill="#000000" />
        <path d="M12 11C13 8 16 7 19 8" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 13L8 11M9 15L7 14" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
        <text x="16" y="25" textAnchor="middle" fill="#FFFFFF" fontSize="4.5" fontWeight="bold">CHIEFS</text>
      </svg>
    ),
  },
};

/**
 * Deterministic color palette generator for clubs not explicitly specified.
 */
function getProceduralTeamTheme(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const palettes = [
    { primary: "#1E3A8A", secondary: "#3B82F6", accent: "#93C5FD" }, // Deep Navy
    { primary: "#991B1B", secondary: "#EF4444", accent: "#FCA5A5" }, // Crimson Red
    { primary: "#065F46", secondary: "#10B981", accent: "#6EE7B7" }, // Emerald Green
    { primary: "#78350F", secondary: "#D97706", accent: "#FDE68A" }, // Amber Gold
    { primary: "#4C1D95", secondary: "#8B5CF6", accent: "#DDD6FE" }, // Royal Violet
    { primary: "#0F172A", secondary: "#64748B", accent: "#CBD5E1" }, // Slate Charcoal
    { primary: "#831843", secondary: "#EC4899", accent: "#FBCFE8" }, // Claret Berry
    { primary: "#164E63", secondary: "#06B6D4", accent: "#A5F3FC" }, // Teal Cyan
  ];
  const idx = Math.abs(hash) % palettes.length;
  return palettes[idx];
}

export const TeamBadge = ({
  teamName = "Team",
  size = 24,
  showName = false,
  className = "",
  style = {},
}) => {
  const brand = TEAM_BRAND_CONFIG[teamName];

  // Render authentic SVG crest if registered
  if (brand?.renderCrest) {
    return (
      <span
        className={`team-badge ${className}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          verticalAlign: "middle",
          ...style,
        }}
        title={teamName}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: `${size}px`,
            height: `${size}px`,
            flexShrink: 0,
            filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4))",
          }}
        >
          {brand.renderCrest(size)}
        </span>
        {showName && (
          <span
            style={{
              fontSize: `${Math.max(12, size * 0.55)}px`,
              fontWeight: 600,
              color: "var(--chalk, #ffffff)",
              whiteSpace: "nowrap",
            }}
          >
            {teamName}
          </span>
        )}
      </span>
    );
  }

  // Procedural club crest for all other teams with shield & initials
  const theme = getProceduralTeamTheme(teamName);
  const initials = teamName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .substring(0, 3)
    .toUpperCase();

  return (
    <span
      className={`team-badge ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        verticalAlign: "middle",
        ...style,
      }}
      title={teamName}
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
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          {/* Crest Shield */}
          <path
            d="M16 2L26 6V18C26 24 16 30 16 30C16 30 6 24 6 18V6L16 2Z"
            fill={theme.primary}
            stroke={theme.secondary}
            strokeWidth="1.5"
          />
          {/* Diagonal Ribbon Sash */}
          <path
            d="M6 10L26 20V24L6 14V10Z"
            fill={theme.secondary}
            fillOpacity="0.4"
          />
          {/* Club Initial Monogram */}
          <text
            x="16"
            y={initials.length > 2 ? "19" : "19.5"}
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize={initials.length > 2 ? "7.5" : "9"}
            fontWeight="bold"
            fontFamily="system-ui, -apple-system, sans-serif"
            style={{ letterSpacing: "-0.5px" }}
          >
            {initials}
          </text>
        </svg>
      </span>
      {showName && (
        <span
          style={{
            fontSize: `${Math.max(12, size * 0.55)}px`,
            fontWeight: 600,
            color: "var(--chalk, #ffffff)",
            whiteSpace: "nowrap",
          }}
        >
          {teamName}
        </span>
      )}
    </span>
  );
};

export default TeamBadge;
