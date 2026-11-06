import { ArrowRight, Radio, Globe } from "lucide-react";
export const MinimalistHero = ({
  onPredictClick,
  onLiveClick,
  onLiveScoresClick
}) => {
  return <section
    id="minimalist-hero-section"
    style={{
      textAlign: "center",
      padding: "48px 20px 40px 20px",
      maxWidth: "920px",
      margin: "0 auto 32px auto",
      position: "relative",
      zIndex: 1
    }}
  >
      {
    /* Editorial Category Eyebrow / Tag */
  }
      <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "16px",
      padding: "4px 14px",
      borderRadius: "9999px",
      border: "1px solid rgba(15, 23, 42, 0.12)",
      background: "rgba(255, 255, 255, 0.75)",
      backdropFilter: "blur(8px)",
      fontSize: "11.5px",
      fontWeight: 600,
      color: "#0F172A",
      letterSpacing: "0.5px",
      textTransform: "uppercase"
    }}
  >
        <span
    style={{
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      background: "#059669",
      display: "inline-block"
    }}
  />
        Machine Learning Match Analytics
      </div>

      {
    /* Hero Display Heading (Exact style from reference image) */
  }
      <h1
    style={{
      fontFamily: "var(--font-display)",
      fontSize: "clamp(2.8rem, 6.5vw, 5.2rem)",
      fontWeight: 800,
      letterSpacing: "-0.04em",
      lineHeight: 0.95,
      color: "#0F172A",
      margin: "0 0 10px 0",
      textTransform: "uppercase"
    }}
  >
        MINIMALISM
      </h1>

      {
    /* Subheading (Exact style from reference image) */
  }
      <div
    style={{
      fontFamily: "var(--font-display)",
      fontSize: "clamp(1.4rem, 3.2vw, 2.3rem)",
      fontWeight: 400,
      letterSpacing: "-0.02em",
      color: "#0F172A",
      marginBottom: "20px"
    }}
  >
        in Match Intelligence
      </div>

      {
    /* Body Copy (Clean centered text matching reference image) */
  }
      <p
    style={{
      fontFamily: "var(--font-body)",
      fontSize: "14.5px",
      lineHeight: 1.65,
      color: "#64748B",
      maxWidth: "600px",
      margin: "0 auto 28px auto"
    }}
  >
        Bivariate Poisson goal distributions, ensemble classifiers, and live in-play momentum
        scraped and synthesized with strict typographic clarity and effortless precision.
      </p>

      {
    /* Signature Connected Dual-Capsule Button (Exact style from reference image) */
  }
      <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "12px",
      flexWrap: "wrap"
    }}
  >
        <div className="dual-capsule-wrap" id="hero-dual-capsule">
          <button
    type="button"
    className="dual-capsule-btn primary"
    onClick={onPredictClick}
    style={{ fontWeight: 600 }}
  >
            <span>Predict Match</span>
            <ArrowRight size={14} />
          </button>
          <button
    type="button"
    className="dual-capsule-btn"
    onClick={onLiveClick}
  >
            <Radio size={13} style={{ color: "#059669" }} />
            <span>Live In-Play</span>
          </button>
        </div>

        <button
    type="button"
    onClick={onLiveScoresClick}
    style={{
      background: "transparent",
      border: "1.5px solid rgba(15, 23, 42, 0.16)",
      color: "#0F172A",
      padding: "8px 18px",
      borderRadius: "9999px",
      fontSize: "13px",
      fontWeight: 500,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      transition: "all 0.15s ease"
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = "#0F172A";
      e.currentTarget.style.background = "rgba(15, 23, 42, 0.04)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "rgba(15, 23, 42, 0.16)";
      e.currentTarget.style.background = "transparent";
    }}
  >
          <Globe size={13} />
          <span>Live Scores Feed</span>
        </button>
      </div>
    </section>;
};
