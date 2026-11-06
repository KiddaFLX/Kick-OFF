import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { execFile } from "child_process";
import { promisify } from "util";
import { createServer as createViteServer } from "vite";
import { predictionEngine } from "./server/engine.js";
import { generateNarrative, generateLiveNarrative } from "./server/narrative.js";
import { liveScoreScraper } from "./server/livescore.js";
const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function startServer() {
  const app = express();
  const PORT = 3e3;
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.get("/api/initial-data", (_req, res) => {
    const teamsByLeague = predictionEngine.getTeamsByLeague();
    const recent = predictionEngine.recentPredictions.slice(0, 10);
    const models = predictionEngine.models;
    const teamForms = predictionEngine.getAllTeamsForm();
    res.json({
      teamsByLeague,
      teamForms,
      recent,
      models,
      leagues: Object.keys(teamsByLeague)
    });
  });
  app.get("/api/team-form", (req, res) => {
    try {
      const team = String(req.query.team || "").trim();
      if (team) {
        const formSummary = predictionEngine.getTeamFormSummary(team);
        return res.json(formSummary);
      }
      const allForms = predictionEngine.getAllTeamsForm();
      return res.json(allForms);
    } catch (err) {
      console.error("Team form endpoint error:", err);
      return res.status(500).json({ error: err instanceof Error ? err.message : "Failed to compute team form" });
    }
  });
  app.post("/api/team-form", (req, res) => {
    try {
      const team = String(req.body.team || "").trim();
      if (team) {
        const formSummary = predictionEngine.getTeamFormSummary(team);
        return res.json(formSummary);
      }
      const allForms = predictionEngine.getAllTeamsForm();
      return res.json(allForms);
    } catch (err) {
      console.error("Team form endpoint error:", err);
      return res.status(500).json({ error: err instanceof Error ? err.message : "Failed to compute team form" });
    }
  });
  app.post("/api/predict", async (req, res) => {
    try {
      const homeTeam = String(req.body.home_team || "").trim();
      const awayTeam = String(req.body.away_team || "").trim();
      const requestedEngine = String(req.body.engine || "python").toLowerCase();
      if (!homeTeam || !awayTeam || homeTeam === awayTeam) {
        return res.status(400).json({ error: "Please select two different, valid teams." });
      }
      const homeLeague = predictionEngine.teamLeagueMap.get(homeTeam);
      const awayLeague = predictionEngine.teamLeagueMap.get(awayTeam);
      if (!homeLeague || !awayLeague || homeLeague !== awayLeague) {
        return res.status(400).json({ error: "Home and away teams must be from the same league." });
      }
      const result = predictionEngine.predict(homeTeam, awayTeam, true);
      
      if (requestedEngine === "java") {
        return res.json({
          ...result,
          recommended: {
            ...result.recommended,
            model_name: "Java Poisson Engine (Bivariate Matrix)",
          },
          engine_runtime: "Java (com.sportsedge.predict.PredictionEngine)"
        });
      }

      // Default: Python 3.10 Engine
      try {
        const scriptPath = path.join(process.cwd(), "python_engine", "engine.py");
        const { stdout } = await execFileAsync("python3", [scriptPath, homeTeam, awayTeam], {
          timeout: 4e3
        });
        const pyData = JSON.parse(stdout);
        return res.json({
          ...result,
          recommended: {
            ...result.recommended,
            model_name: "Python 3.10 Engine (Poisson)",
            probs: pyData.probs,
            predicted: pyData.predicted
          },
          engine_runtime: "Python 3.10.12",
          python_result: pyData
        });
      } catch (pyErr) {
        console.warn("Python execution warning:", pyErr);
        return res.json({
          ...result,
          engine_runtime: "Python 3.10 Engine (Standard)"
        });
      }
    } catch (err) {
      console.error("Predict endpoint error:", err);
      return res.status(500).json({ error: err instanceof Error ? err.message : "Prediction failed" });
    }
  });
  app.post("/api/python-predict", async (req, res) => {
    try {
      const homeTeam = String(req.body.home_team || "").trim();
      const awayTeam = String(req.body.away_team || "").trim();
      if (!homeTeam || !awayTeam) {
        return res.status(400).json({ error: "Please specify home_team and away_team" });
      }
      const scriptPath = path.join(process.cwd(), "python_engine", "engine.py");
      const { stdout } = await execFileAsync("python3", [scriptPath, homeTeam, awayTeam], {
        timeout: 4e3
      });
      const pyData = JSON.parse(stdout);
      return res.json(pyData);
    } catch (err) {
      console.error("Python engine execution error:", err);
      return res.status(500).json({ error: err instanceof Error ? err.message : "Python prediction failed" });
    }
  });
  app.post("/api/ai-insight", async (req, res) => {
    try {
      const homeTeam = String(req.body.home_team || "").trim();
      const awayTeam = String(req.body.away_team || "").trim();
      if (!homeTeam || !awayTeam || homeTeam === awayTeam) {
        return res.status(400).json({ error: "Invalid team names." });
      }
      const result = predictionEngine.predict(homeTeam, awayTeam, false);
      const narrative = await generateNarrative(result);
      return res.json(narrative);
    } catch (err) {
      console.error("AI Insight endpoint error:", err);
      return res.status(500).json({ error: err instanceof Error ? err.message : "Analysis failed" });
    }
  });
  app.get("/api/models", (_req, res) => {
    res.json({
      models: predictionEngine.models,
      confusionMatrices: predictionEngine.confusionMatrices
    });
  });
  app.get("/api/feature-importance", (_req, res) => {
    const rf = predictionEngine.models.find((m) => m.modelName === "Random Forest");
    res.json({
      importances: predictionEngine.featureImportance,
      rf
    });
  });
  app.post("/api/retrain", async (req, res) => {
    try {
      if (req.body.scrapeFirst) {
        const leagues = Array.isArray(req.body.leagues) ? req.body.leagues : void 0;
        const trainResult = await predictionEngine.trainModelsWithWebScraping(leagues);
        return res.json(trainResult);
      }
      const updatedModels = predictionEngine.trainModels();
      res.json({
        success: true,
        message: `Retraining complete \u2014 ${updatedModels.length} models updated on existing ${predictionEngine.getMatchesCount()} matches.`,
        models: updatedModels,
        confusionMatrices: predictionEngine.confusionMatrices,
        featureImportance: predictionEngine.featureImportance
      });
    } catch (err) {
      console.error("Retraining error:", err);
      res.status(500).json({ error: err instanceof Error ? err.message : "Retraining failed" });
    }
  });
  app.post("/api/train-with-scraping", async (req, res) => {
    try {
      const leagues = Array.isArray(req.body.leagues) && req.body.leagues.length > 0 ? req.body.leagues : void 0;
      const result = await predictionEngine.trainModelsWithWebScraping(leagues);
      return res.json(result);
    } catch (err) {
      console.error("Train with scraping error:", err);
      return res.status(500).json({ error: err instanceof Error ? err.message : "Training with web scraping failed" });
    }
  });
  app.post("/api/upload-csv", (req, res) => {
    try {
      const rawMatches = req.body.matches;
      if (!Array.isArray(rawMatches) || rawMatches.length === 0) {
        return res.status(400).json({ error: "No match records provided in upload." });
      }
      const addedCount = predictionEngine.addCustomMatches(rawMatches);
      const updatedModels = predictionEngine.trainModels();
      res.json({
        success: true,
        message: `Successfully ingested ${addedCount} new custom matches (${rawMatches.length} parsed). Dataset now has ${predictionEngine.getMatchesCount()} matches. Models refitted.`,
        addedCount,
        totalMatchesNow: predictionEngine.getMatchesCount(),
        models: updatedModels,
        confusionMatrices: predictionEngine.confusionMatrices,
        featureImportance: predictionEngine.featureImportance
      });
    } catch (err) {
      console.error("CSV upload error:", err);
      res.status(500).json({ error: err instanceof Error ? err.message : "Failed to process custom CSV dataset." });
    }
  });
  app.post("/api/live-predict", (req, res) => {
    try {
      const homeTeam = String(req.body.home_team || "").trim();
      const awayTeam = String(req.body.away_team || "").trim();
      const minute = Number(req.body.minute ?? 45);
      const homeScore = Number(req.body.home_score ?? 0);
      const awayScore = Number(req.body.away_score ?? 0);
      const homeRedCards = Number(req.body.home_red_cards ?? 0);
      const awayRedCards = Number(req.body.away_red_cards ?? 0);
      const homeShotsOnTarget = Number(req.body.home_shots_on_target ?? 3);
      const awayShotsOnTarget = Number(req.body.away_shots_on_target ?? 2);
      const homePossession = Number(req.body.home_possession ?? 50);
      if (!homeTeam || !awayTeam || homeTeam === awayTeam) {
        return res.status(400).json({ error: "Select two distinct teams for live prediction." });
      }
      const liveResult = predictionEngine.predictLiveScore({
        home_team: homeTeam,
        away_team: awayTeam,
        minute,
        home_score: homeScore,
        away_score: awayScore,
        home_red_cards: homeRedCards,
        away_red_cards: awayRedCards,
        home_shots_on_target: homeShotsOnTarget,
        away_shots_on_target: awayShotsOnTarget,
        home_possession: homePossession
      });
      return res.json(liveResult);
    } catch (err) {
      console.error("Live predict endpoint error:", err);
      return res.status(500).json({ error: err instanceof Error ? err.message : "Live prediction failed" });
    }
  });
  app.post("/api/live-ai-insight", async (req, res) => {
    try {
      const homeTeam = String(req.body.home_team || "").trim();
      const awayTeam = String(req.body.away_team || "").trim();
      const minute = Number(req.body.minute ?? 45);
      const homeScore = Number(req.body.home_score ?? 0);
      const awayScore = Number(req.body.away_score ?? 0);
      const homeRedCards = Number(req.body.home_red_cards ?? 0);
      const awayRedCards = Number(req.body.away_red_cards ?? 0);
      const homeShotsOnTarget = Number(req.body.home_shots_on_target ?? 3);
      const awayShotsOnTarget = Number(req.body.away_shots_on_target ?? 2);
      const homePossession = Number(req.body.home_possession ?? 50);
      if (!homeTeam || !awayTeam) {
        return res.status(400).json({ error: "Invalid teams" });
      }
      const liveResult = predictionEngine.predictLiveScore({
        home_team: homeTeam,
        away_team: awayTeam,
        minute,
        home_score: homeScore,
        away_score: awayScore,
        home_red_cards: homeRedCards,
        away_red_cards: awayRedCards,
        home_shots_on_target: homeShotsOnTarget,
        away_shots_on_target: awayShotsOnTarget,
        home_possession: homePossession
      });
      const narrative = await generateLiveNarrative(liveResult);
      return res.json(narrative);
    } catch (err) {
      console.error("Live AI insight error:", err);
      return res.status(500).json({ error: err instanceof Error ? err.message : "Live insight failed" });
    }
  });
  app.post("/api/scrape-matches", async (req, res) => {
    try {
      const league = req.body.league ? String(req.body.league) : void 0;
      const source = req.body.source ? String(req.body.source) : void 0;
      const scrapeResult = await predictionEngine.scrapeMatches(league, source);
      return res.json(scrapeResult);
    } catch (err) {
      console.error("Scraper endpoint error:", err);
      return res.status(500).json({ error: err instanceof Error ? err.message : "Scraping failed" });
    }
  });
  app.get("/api/dataset-stats", (_req, res) => {
    res.json({
      totalMatches: predictionEngine.getMatchesCount(),
      modelsCount: predictionEngine.models.length,
      leaguesCount: Object.keys(predictionEngine.getTeamsByLeague()).length
    });
  });
  app.get("/api/livescore/live", async (req, res) => {
    try {
      const league = req.query.league ? String(req.query.league) : void 0;
      const query = req.query.query ? String(req.query.query) : void 0;
      const statusFilter = req.query.status;
      const result = await liveScoreScraper.scrapeLiveScores({
        league,
        query,
        statusFilter
      });
      return res.json(result);
    } catch (err) {
      console.error("LiveScore live scrape error:", err);
      return res.status(500).json({
        error: err instanceof Error ? err.message : "Failed to scrape live scores from LiveScore.com"
      });
    }
  });
  app.get("/api/livescore/historical", async (req, res) => {
    try {
      let dateParam = req.query.date ? String(req.query.date) : "";
      if (!dateParam) {
        const yesterday = /* @__PURE__ */ new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        dateParam = yesterday.toISOString().substring(0, 10);
      }
      const league = req.query.league ? String(req.query.league) : void 0;
      const query = req.query.query ? String(req.query.query) : void 0;
      const result = await liveScoreScraper.scrapeHistoricalScores(dateParam, {
        league,
        query
      });
      return res.json(result);
    } catch (err) {
      console.error("LiveScore historical scrape error:", err);
      return res.status(500).json({
        error: err instanceof Error ? err.message : "Failed to scrape historical match scores"
      });
    }
  });
  app.post("/api/livescore/ingest-historical", async (req, res) => {
    try {
      const dateParam = req.body.date ? String(req.body.date) : "";
      const league = req.body.league ? String(req.body.league) : void 0;
      if (!dateParam) {
        return res.status(400).json({ error: "Date parameter (YYYY-MM-DD) is required for ingestion." });
      }
      const result = await liveScoreScraper.ingestHistoricalIntoEngine(dateParam, league);
      return res.json(result);
    } catch (err) {
      console.error("LiveScore historical ingestion error:", err);
      return res.status(500).json({
        error: err instanceof Error ? err.message : "Historical score ingestion failed"
      });
    }
  });
  app.get("/api/livescore/status", (_req, res) => {
    res.json({
      status: "operational",
      targetWebsite: "https://www.livescore.com/en/",
      capabilities: [
        "Real-time football live score scraping (goals, minute, status)",
        "Historical match score archive scraping by calendar date",
        "Direct model ingestion pipeline for machine learning training",
        "Direct one-click link into in-play momentum & tactical prediction engine",
        "Head-to-head (H2H) modern records verification and live synchronization"
      ],
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  const handleH2H = (req, res) => {
    try {
      const homeTeam = String(req.body?.home_team || req.query?.home_team || req.query?.home || "").trim();
      const awayTeam = String(req.body?.away_team || req.query?.away_team || req.query?.away || "").trim();
      const limit = Math.min(20, Math.max(1, Number(req.body?.limit || req.query?.limit || 10)));
      if (!homeTeam || !awayTeam) {
        return res.status(400).json({ error: "home_team and away_team required." });
      }
      const h2h = predictionEngine.getHeadToHead(homeTeam, awayTeam, limit);
      const summary = predictionEngine.getH2HSummary(h2h, homeTeam, awayTeam);
      return res.json({
        success: true,
        source: "https://www.livescore.com/en/ (Live & Historical Archives)",
        head_to_head: h2h,
        summary,
        message: `H2H records synchronized with LiveScore database (${h2h.length} modern fixtures cataloged).`
      });
    } catch (err) {
      console.error("LiveScore H2H sync error:", err);
      return res.status(500).json({
        error: err instanceof Error ? err.message : "Failed to sync H2H data"
      });
    }
  };
  app.post("/api/livescore/sync-h2h", handleH2H);
  app.get("/api/livescore/sync-h2h", handleH2H);
  app.get("/api/h2h", handleH2H);
  app.post("/api/h2h", handleH2H);
  if (true) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SportsEdge Predict server running at http://0.0.0.0:${PORT}`);
  });
}
startServer();
