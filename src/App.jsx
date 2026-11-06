import { useEffect, useState } from "react";
import { ModernHeader } from "./components/ModernHeader.jsx";
import { FixtureRibbon } from "./components/FixtureRibbon.jsx";
import { MatchPredictionView } from "./components/MatchPredictionView.jsx";
import { PredictionResultView } from "./components/PredictionResultView.jsx";
import { LiveScorePredictionView } from "./components/LiveScorePredictionView.jsx";
import { LiveScoreScraperView } from "./components/LiveScoreScraperView.jsx";
import { ModelTrainingHubView } from "./components/ModelTrainingHubView.jsx";
import { ModelComparisonView } from "./components/ModelComparisonView.jsx";
import { FeatureImportanceView } from "./components/FeatureImportanceView.jsx";
import { TopLoadingBar } from "./components/TopLoadingBar.jsx";
import { ViewTransitionLoader } from "./components/ViewTransitionLoader.jsx";
export default function App() {
  const [currentTab, setCurrentTab] = useState("livescore");
  const [isNavigating, setIsNavigating] = useState(false);
  const [teamsByLeague, setTeamsByLeague] = useState({});
  const [teamForms, setTeamForms] = useState({});
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [models, setModels] = useState([]);
  const [confusionMatrices, setConfusionMatrices] = useState([]);
  const [importances, setImportances] = useState([]);
  const [predictionResult, setPredictionResult] = useState(null);
  const [totalMatches, setTotalMatches] = useState(2700);
  const [liveCount, setLiveCount] = useState(0);
  const [selectedLiveFixture, setSelectedLiveFixture] = useState(void 0);
  const [isLoading, setIsLoading] = useState(false);
  const [flashMessage, setFlashMessage] = useState(null);
  const [isProDensity, setIsProDensity] = useState(false);
  const loadInitialData = async () => {
    try {
      const res = await fetch("/api/initial-data");
      if (res.ok) {
        const data = await res.json();
        setTeamsByLeague(data.teamsByLeague || {});
        if (data.teamForms) {
          setTeamForms(data.teamForms);
        }
        setRecentPredictions(data.recent || []);
        setModels(data.models || []);
      }
      const modelsRes = await fetch("/api/models");
      if (modelsRes.ok) {
        const mData = await modelsRes.json();
        setModels(mData.models || []);
        setConfusionMatrices(mData.confusionMatrices || []);
      }
      const featRes = await fetch("/api/feature-importance");
      if (featRes.ok) {
        const fData = await featRes.json();
        setImportances(fData.importances || []);
      }
      const statsRes = await fetch("/api/dataset-stats");
      if (statsRes.ok) {
        const sData = await statsRes.json();
        if (sData.totalMatches) {
          setTotalMatches(sData.totalMatches);
        }
      }
      const liveRes = await fetch("/api/livescore/live");
      if (liveRes.ok) {
        const lData = await liveRes.json();
        if (lData.inPlayCount !== void 0) {
          setLiveCount(lData.inPlayCount);
        }
      }
    } catch (err) {
      console.warn("Failed loading initial data:", err);
    }
  };
  useEffect(() => {
    loadInitialData();
  }, []);
  const handleSelectTab = (tab) => {
    if (tab === currentTab) return;
    setFlashMessage(null);
    setIsNavigating(true);
    setCurrentTab(tab);
    setTimeout(() => {
      setIsNavigating(false);
    }, 150);
  };
  const handlePredict = async (homeTeam, awayTeam, engine = "python") => {
    setIsLoading(true);
    setFlashMessage(null);
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          home_team: homeTeam,
          away_team: awayTeam,
          engine
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Prediction request failed");
      }
      const result = await res.json();
      setPredictionResult(result);
      setCurrentTab("result");
      const newPred = {
        predictionId: Date.now(),
        homeTeam: result.home_team,
        awayTeam: result.away_team,
        league: result.league,
        modelName: result.recommended.model_name,
        homeWinProb: result.recommended.probs.H,
        drawProb: result.recommended.probs.D,
        awayWinProb: result.recommended.probs.A,
        predictedOutcome: result.recommended.predicted,
        predictionDate: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19)
      };
      setRecentPredictions((prev) => [newPred, ...prev.slice(0, 9)]);
    } catch (err) {
      console.error("Prediction error:", err);
      setFlashMessage(err instanceof Error ? err.message : "Prediction failed.");
    } finally {
      setIsLoading(false);
    }
  };
  const rfModel = models.find((m) => m.modelName === "Random Forest");
  return <div className="app-shell-modern" id="app-root-shell">
      {
    /* Top Loading Progress Line */
  }
      <TopLoadingBar active={isNavigating || isLoading} />

      {
    /* Modern Minimalist Sticky Header */
  }
      <ModernHeader
    currentTab={currentTab}
    liveMatchCount={liveCount}
    totalMatches={totalMatches}
    onSelectTab={handleSelectTab}
  />

      {
    /* Minimalist Fixture Ribbon */
  }
      <FixtureRibbon
    onSelectFixtureForPredict={(home, away) => {
      handlePredict(home, away);
    }}
    onSelectFixtureForLive={(home, away, min, hG, aG) => {
      setSelectedLiveFixture({ home, away, minute: min, homeScore: hG, awayScore: aG });
      handleSelectTab("live");
    }}
    isProDensity={isProDensity}
    onToggleProDensity={() => setIsProDensity((prev) => !prev)}
  />

      {
    /* Main Viewport Content */
  }
      <main className="modern-content-wrap" id="app-main-content">
        {flashMessage && <div className="flash-bar" id="app-flash-bar">
            <div className="flash">{flashMessage}</div>
          </div>}

        <ViewTransitionLoader viewKey={currentTab}>
          {currentTab === "livescore" && <LiveScoreScraperView
    onSelectMatchForLivePredict={(home, away, minute, homeScore, awayScore) => {
      setSelectedLiveFixture({ home, away, minute, homeScore, awayScore });
      handleSelectTab("live");
    }}
    onSelectMatchForPreMatchPredict={(home, away) => {
      handlePredict(home, away);
    }}
    onNavigateToTrainingHub={() => handleSelectTab("train")}
  />}

          {currentTab === "predict" && <MatchPredictionView
    teamsByLeague={teamsByLeague}
    teamForms={teamForms}
    recentPredictions={recentPredictions}
    onPredict={handlePredict}
    isLoading={isLoading}
  />}

          {currentTab === "result" && predictionResult && <PredictionResultView
    result={predictionResult}
    onNewPrediction={() => handleSelectTab("predict")}
  />}

          {currentTab === "live" && <LiveScorePredictionView
    teamsByLeague={teamsByLeague}
    initialFixture={selectedLiveFixture}
  />}

          {currentTab === "train" && <ModelTrainingHubView
    totalMatches={totalMatches}
    models={models}
    confusionMatrices={confusionMatrices}
    onTrainingComplete={() => {
      loadInitialData();
    }}
    onNavigateToPredict={() => handleSelectTab("predict")}
    onNavigateToModels={() => handleSelectTab("models")}
  />}

          {currentTab === "models" && <ModelComparisonView
    models={models}
    confusionMatrices={confusionMatrices}
  />}

          {currentTab === "features" && <FeatureImportanceView
    importances={importances}
    rfModel={rfModel}
  />}
        </ViewTransitionLoader>
      </main>
    </div>;
}
