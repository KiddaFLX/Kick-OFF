import { jsPDF } from "jspdf";
export function exportPredictionToPdf(data) {
  const {
    result,
    dynamicProbs,
    dynamicWinner,
    homeXG,
    awayXG,
    marketOdds,
    ev,
    kelly,
    aiAnalysisText,
    h2hSummary
  } = data;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2;
  const bottomLimit = pageHeight - 18;
  let currentY = 14;
  const outcomeLabels = {
    H: `${result.home_team} Win`,
    D: "Draw",
    A: `${result.away_team} Win`
  };
  const predictedOutcome = outcomeLabels[dynamicWinner] || "Uncertain";
  const ensureSpace = (neededHeight) => {
    if (currentY + neededHeight > bottomLimit) {
      doc.addPage();
      currentY = 16;
      renderPageHeaderMarker();
    }
  };
  const renderPageHeaderMarker = () => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 145, 155);
    doc.text(
      `Kickoff Analytics &middot; Match Prediction Report: ${result.home_team} vs ${result.away_team}`,
      marginX,
      currentY
    );
    currentY += 4;
    doc.setDrawColor(230, 233, 238);
    doc.setLineWidth(0.2);
    doc.line(marginX, currentY, marginX + contentWidth, currentY);
    currentY += 6;
  };
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, pageWidth, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(17, 24, 39);
  doc.text("KICKOFF ANALYTICS", marginX, currentY + 3);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(107, 114, 128);
  doc.text("PREDICTIVE INTELLIGENCE & EXPECTED VALUE REPORT", marginX, currentY + 7.5);
  const generationDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  doc.text(`Report Date: ${generationDate}`, pageWidth - marginX, currentY + 3, { align: "right" });
  doc.text(`Competition: ${result.league}`, pageWidth - marginX, currentY + 7.5, { align: "right" });
  currentY += 12;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.line(marginX, currentY, marginX + contentWidth, currentY);
  currentY += 5;
  const heroHeight = 27;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, currentY, contentWidth, heroHeight, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text(`${result.home_team} vs ${result.away_team}`, marginX + 5, currentY + 7.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Recommended Classifier:", marginX + 5, currentY + 14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`${result.recommended.model_name}`, marginX + 41, currentY + 14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(
    `(${(result.recommended.accuracy * 100).toFixed(1)}% historical accuracy &middot; ${result.confidence} Statistical Confidence)`,
    marginX + 43 + doc.getTextWidth(result.recommended.model_name),
    currentY + 14
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Model Projected Outcome:", marginX + 5, currentY + 20.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 185, 129);
  const primaryOutcomeStr = `${predictedOutcome} (${(dynamicProbs[dynamicWinner] * 100).toFixed(1)}%)`;
  doc.text(primaryOutcomeStr, marginX + 43, currentY + 20.5);
  currentY += heroHeight + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text("CALIBRATED OUTCOME PROBABILITIES & VALUE FINDER", marginX, currentY);
  currentY += 3.5;
  const cardGap = 4;
  const cardWidth = (contentWidth - cardGap * 2) / 3;
  const cardHeight = 35;
  const outcomes = [
    {
      key: "H",
      title: `${result.home_team} (Home)`,
      prob: dynamicProbs.H,
      marketOdds: marketOdds.home,
      ev: ev.home,
      kelly: kelly.home,
      isWinner: dynamicWinner === "H"
    },
    {
      key: "D",
      title: "Draw (X)",
      prob: dynamicProbs.D,
      marketOdds: marketOdds.draw,
      ev: ev.draw,
      kelly: kelly.draw,
      isWinner: dynamicWinner === "D"
    },
    {
      key: "A",
      title: `${result.away_team} (Away)`,
      prob: dynamicProbs.A,
      marketOdds: marketOdds.away,
      ev: ev.away,
      kelly: kelly.away,
      isWinner: dynamicWinner === "A"
    }
  ];
  outcomes.forEach((item, index) => {
    const cardX = marginX + index * (cardWidth + cardGap);
    if (item.isWinner) {
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(187, 247, 208);
    } else {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
    }
    doc.setLineWidth(0.3);
    doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 1.5, 1.5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    let title = item.title;
    if (doc.getTextWidth(title) > cardWidth - 8) {
      title = `${title.slice(0, 16)}...`;
    }
    doc.text(title, cardX + 3.5, currentY + 5.5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(item.isWinner ? 16 : 30, item.isWinner ? 185 : 41, item.isWinner ? 129 : 59);
    doc.text(`${(item.prob * 100).toFixed(1)}%`, cardX + 3.5, currentY + 12);
    const barWidth = cardWidth - 7;
    doc.setFillColor(235, 238, 242);
    doc.rect(cardX + 3.5, currentY + 14.5, barWidth, 1.8, "F");
    doc.setFillColor(item.isWinner ? 16 : 100, item.isWinner ? 185 : 116, item.isWinner ? 129 : 139);
    doc.rect(cardX + 3.5, currentY + 14.5, barWidth * item.prob, 1.8, "F");
    const fairOdds = (1 / Math.max(0.01, item.prob)).toFixed(2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("Model Fair Odds:", cardX + 3.5, currentY + 20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(fairOdds, cardX + cardWidth - 3.5, currentY + 20, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Market Odds:", cardX + 3.5, currentY + 24.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(item.marketOdds.toFixed(2), cardX + cardWidth - 3.5, currentY + 24.5, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Expected Value:", cardX + 3.5, currentY + 29);
    doc.setFont("helvetica", "bold");
    if (item.ev > 0) {
      doc.setTextColor(16, 185, 129);
      doc.text(`+${(item.ev * 100).toFixed(1)}% (+EV)`, cardX + cardWidth - 3.5, currentY + 29, { align: "right" });
    } else {
      doc.setTextColor(239, 68, 68);
      doc.text(`${(item.ev * 100).toFixed(1)}%`, cardX + cardWidth - 3.5, currentY + 29, { align: "right" });
    }
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Kelly Sizing:", cardX + 3.5, currentY + 33);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(item.kelly > 0 ? 16 : 100, item.kelly > 0 ? 185 : 116, item.kelly > 0 ? 129 : 139);
    doc.text(item.kelly > 0 ? `${item.kelly}%` : "0%", cardX + cardWidth - 3.5, currentY + 33, { align: "right" });
  });
  currentY += cardHeight + 6;
  const panelHeight = 36;
  const colWidth = (contentWidth - 4) / 2;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, currentY, colWidth, panelHeight, 1.5, 1.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text("EXPECTED GOALS & GOAL EXPECTANCY", marginX + 4, currentY + 5.5);
  const drawRow = (label, val1, val2, y) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(label, marginX + 4, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(`${val1} / ${val2}`, marginX + colWidth - 4, y, { align: "right" });
  };
  drawRow(
    "Projected Match xG (H / A):",
    `${homeXG.toFixed(2)}`,
    `${awayXG.toFixed(2)}`,
    currentY + 12
  );
  drawRow(
    "Combined Total Match xG:",
    `${(homeXG + awayXG).toFixed(2)} xG`,
    "",
    currentY + 18
  );
  drawRow(
    "Rolling Scored Avg (H / A):",
    `${result.features.home_goals_scored_avg.toFixed(2)}`,
    `${result.features.away_goals_scored_avg.toFixed(2)}`,
    currentY + 24
  );
  drawRow(
    "Rolling Conceded Avg (H / A):",
    `${result.features.home_goals_conceded_avg.toFixed(2)}`,
    `${result.features.away_goals_conceded_avg.toFixed(2)}`,
    currentY + 30
  );
  const rightPanelX = marginX + colWidth + 4;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightPanelX, currentY, colWidth, panelHeight, 1.5, 1.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text("FORM & HISTORICAL ENCOUNTERS", rightPanelX + 4, currentY + 5.5);
  const homeFormText = result.team_form?.home?.last5_record || `${result.features.home_form_last5.toFixed(1)} pts`;
  const awayFormText = result.team_form?.away?.last5_record || `${result.features.away_form_last5.toFixed(1)} pts`;
  const drawRowRight = (label, value, y) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(label, rightPanelX + 4, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(value, rightPanelX + colWidth - 4, y, { align: "right" });
  };
  drawRowRight("Recent Form (Last 5):", `${result.home_team}: ${homeFormText}`, currentY + 12);
  drawRowRight("Away Form (Last 5):", `${result.away_team}: ${awayFormText}`, currentY + 18);
  const h2hText = h2hSummary ? `${h2hSummary.homeWins}W - ${h2hSummary.draws}D - ${h2hSummary.awayWins}W (${h2hSummary.total} Gms)` : `${result.head_to_head?.length || 0} fixtures on record`;
  drawRowRight("Head-to-Head Record:", h2hText, currentY + 24);
  const momentumText = result.team_form ? `H: ${result.team_form.home.momentum_score > 0 ? "+" : ""}${result.team_form.home.momentum_score} / A: ${result.team_form.away.momentum_score > 0 ? "+" : ""}${result.team_form.away.momentum_score}` : "Calibrated to historical form";
  drawRowRight("Team Momentum Index:", momentumText, currentY + 30);
  currentY += panelHeight + 6;
  if (result.match_factors) {
    const factorsHeight = 19;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(marginX, currentY, contentWidth, factorsHeight, 1.5, 1.5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text("EXOGENOUS MATCH FACTORS & DISCIPLINARY ENVIRONMENT", marginX + 4, currentY + 4.5);
    const factColWidth = (contentWidth - 8) / 4;
    const renderFactorItem = (title, val, index) => {
      const fx = marginX + 4 + index * factColWidth;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.8);
      doc.setTextColor(100, 116, 139);
      doc.text(title, fx, currentY + 9.5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      let truncated = val;
      if (doc.getTextWidth(truncated) > factColWidth - 4) {
        truncated = `${truncated.slice(0, 18)}...`;
      }
      doc.text(truncated, fx, currentY + 14.5);
    };
    renderFactorItem(
      "Rest & Fatigue",
      `H: ${result.match_factors.rest_days.home}d / A: ${result.match_factors.rest_days.away}d`,
      0
    );
    renderFactorItem(
      "Weather Condition",
      `${result.match_factors.weather.condition}, ${result.match_factors.weather.temperatureC}\xB0C`,
      1
    );
    renderFactorItem(
      "Rivalry / Derby",
      result.match_factors.rivalry.isDerby ? result.match_factors.rivalry.derbyName || "High Rivalry" : "Standard League Match",
      2
    );
    renderFactorItem(
      "Match Referee",
      `${result.match_factors.referee.name} (${result.match_factors.referee.strictness})`,
      3
    );
    currentY += factorsHeight + 6;
  }
  const analysisHeading = "TACTICAL SCOUTING SYNTHESIS & MATCH INSIGHTS";
  ensureSpace(24);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(analysisHeading, marginX, currentY);
  currentY += 4;
  const narrativeText = aiAnalysisText && aiAnalysisText.trim().length > 0 ? aiAnalysisText.trim() : `The ${result.recommended.model_name} statistical classifier projects an analytical advantage towards ${predictedOutcome.toLowerCase()} based on rolling offensive efficiency and defensive baseline metrics.`;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const textLines = doc.splitTextToSize(narrativeText, contentWidth - 8);
  const narrativeBoxHeight = textLines.length * 4.2 + 8;
  ensureSpace(narrativeBoxHeight);
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, currentY, contentWidth, narrativeBoxHeight, 1.5, 1.5, "FD");
  let textY = currentY + 5.5;
  for (let i = 0; i < textLines.length; i++) {
    if (textY > bottomLimit) {
      doc.addPage();
      textY = 20;
      renderPageHeaderMarker();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
    }
    doc.text(textLines[i], marginX + 4, textY);
    textY += 4.2;
  }
  currentY = textY + 6;
  if (result.models && result.models.length > 0) {
    const tableHeaderHeight = 6;
    const rowHeight = 4.8;
    const totalTableHeight = tableHeaderHeight + result.models.length * rowHeight + 8;
    ensureSpace(totalTableHeight);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text("ALGORITHMIC BENCHMARK COMPARISON", marginX, currentY);
    currentY += 3.5;
    doc.setFillColor(241, 245, 249);
    doc.rect(marginX, currentY, contentWidth, tableHeaderHeight, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text("CLASSIFIER MODEL", marginX + 3, currentY + 4.2);
    doc.text("ACCURACY", marginX + 62, currentY + 4.2);
    doc.text("PRECISION", marginX + 86, currentY + 4.2);
    doc.text("HOME WIN %", marginX + 112, currentY + 4.2);
    doc.text("DRAW %", marginX + 138, currentY + 4.2);
    doc.text("AWAY WIN %", marginX + 160, currentY + 4.2);
    currentY += tableHeaderHeight;
    result.models.forEach((m, idx) => {
      if (currentY + rowHeight > bottomLimit) {
        doc.addPage();
        currentY = 20;
        renderPageHeaderMarker();
      }
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(marginX, currentY, contentWidth, rowHeight, "F");
      }
      const isRecommended = m.model_id === result.recommended.model_id;
      doc.setFont("helvetica", isRecommended ? "bold" : "normal");
      doc.setFontSize(7);
      doc.setTextColor(isRecommended ? 16 : 51, isRecommended ? 185 : 65, isRecommended ? 129 : 85);
      const modelDisplayName = isRecommended ? `${m.model_name} [RECOMMENDED]` : m.model_name;
      doc.text(modelDisplayName, marginX + 3, currentY + 3.4);
      doc.setTextColor(51, 65, 85);
      doc.text(`${(m.accuracy * 100).toFixed(1)}%`, marginX + 62, currentY + 3.4);
      doc.text(`${(m.precision * 100).toFixed(1)}%`, marginX + 86, currentY + 3.4);
      doc.text(`${(m.probs.H * 100).toFixed(1)}%`, marginX + 112, currentY + 3.4);
      doc.text(`${(m.probs.D * 100).toFixed(1)}%`, marginX + 138, currentY + 3.4);
      doc.text(`${(m.probs.A * 100).toFixed(1)}%`, marginX + 160, currentY + 3.4);
      currentY += rowHeight;
    });
    currentY += 4;
  }
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.2);
    doc.line(marginX, pageHeight - 12, marginX + contentWidth, pageHeight - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      "Kickoff Analytics Computational Football Dossier &middot; Calibrated Out-of-Sample Predictions",
      marginX,
      pageHeight - 7.5
    );
    doc.text(`Page ${i} of ${totalPages}`, marginX + contentWidth, pageHeight - 7.5, { align: "right" });
  }
  const safeHome = result.home_team.replace(/[^a-zA-Z0-9]/g, "_");
  const safeAway = result.away_team.replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `${safeHome}_vs_${safeAway}_Prediction_Report.pdf`;
  doc.save(filename);
}
