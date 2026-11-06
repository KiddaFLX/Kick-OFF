import { GoogleGenAI } from "@google/genai";
const OUTCOME_LABELS = {
  H: "a home win",
  D: "a draw",
  A: "an away win"
};
let genAIClient = null;
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}
const CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash"
];
async function generateWithFallbackModels(prompt) {
  const ai = getGenAI();
  if (!ai) return null;
  for (const modelName of CANDIDATE_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt
        });
        const text = response.text?.trim();
        if (text && text.length > 20) {
          return text;
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        const isTemporary = errMsg.includes("503") || errMsg.includes("high demand") || errMsg.includes("UNAVAILABLE") || errMsg.includes("429");
        if (isTemporary && attempt === 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          continue;
        }
        break;
      }
    }
  }
  return null;
}
export async function generateNarrative(result) {
  const rec = result.recommended;
  const features = result.features;
  const homeTeam = result.home_team;
  const awayTeam = result.away_team;
  const prompt = `You are a football (soccer) data analyst writing a short pre-match note for a paying client of a sports analytics firm.

Fixture: ${homeTeam} (home) vs ${awayTeam} (away), ${result.league || ""}.
Model used: ${rec.model_name} (test-set accuracy ${(rec.accuracy * 100).toFixed(1)}%).
Predicted probabilities: home win ${(rec.probs.H * 100).toFixed(1)}%, draw ${(rec.probs.D * 100).toFixed(1)}%, away win ${(rec.probs.A * 100).toFixed(1)}%.

Computed statistics used by the model:
- ${homeTeam} average goals scored at home (last 5): ${features.home_goals_scored_avg.toFixed(2)}
- ${homeTeam} average goals conceded at home (last 5): ${features.home_goals_conceded_avg.toFixed(2)}
- ${awayTeam} average goals scored away (last 5): ${features.away_goals_scored_avg.toFixed(2)}
- ${awayTeam} average goals conceded away (last 5): ${features.away_goals_conceded_avg.toFixed(2)}
- ${homeTeam} home form points (last 5): ${features.home_form_last5.toFixed(0)}
- ${awayTeam} away form points (last 5): ${features.away_form_last5.toFixed(0)}

Write a concise, 80-120 word analysis in plain English explaining what these numbers suggest about the likely outcome. Reference the actual figures above. Do not invent statistics that were not given to you. Do not use markdown headings. Write it as a single paragraph a client would read in a report.`;
  const aiText = await generateWithFallbackModels(prompt);
  if (aiText) {
    return {
      text: aiText,
      source: "ai",
      error: null
    };
  }
  return templateFallback(result);
}
function templateFallback(result) {
  const rec = result.recommended;
  const features = result.features;
  const home = result.home_team;
  const away = result.away_team;
  const outcomePhrase = OUTCOME_LABELS[rec.predicted] || "an unclear outcome";
  let formComment = `${home} have accumulated ${features.home_form_last5.toFixed(
    0
  )} points from their last five home matches, compared to ${features.away_form_last5.toFixed(
    0
  )} for ${away} away from home.`;
  if (features.home_form_last5 > features.away_form_last5) {
    formComment += ` That gap in recent form favours ${home}.`;
  } else if (features.home_form_last5 < features.away_form_last5) {
    formComment += ` That gap in recent form favours ${away}.`;
  } else {
    formComment += ` Recent form is evenly matched between the two sides.`;
  }
  const attackComment = `${home} have averaged ${features.home_goals_scored_avg.toFixed(
    2
  )} goals scored and ${features.home_goals_conceded_avg.toFixed(
    2
  )} conceded at home, while ${away} have averaged ${features.away_goals_scored_avg.toFixed(
    2
  )} scored and ${features.away_goals_conceded_avg.toFixed(2)} conceded away from home.`;
  const text = `The ${rec.model_name} model gives ${home} a ${(rec.probs.H * 100).toFixed(
    1
  )}% chance of winning, a ${(rec.probs.D * 100).toFixed(1)}% chance of a draw, and ${away} a ${(rec.probs.A * 100).toFixed(1)}% chance of winning, favouring ${outcomePhrase}. ${formComment} ${attackComment}`;
  return {
    text,
    source: "template",
    error: null
  };
}
export async function generateLiveNarrative(live) {
  const prompt = `You are a live in-play football match analyst providing commentary for in-running sports traders.

Match Context:
- Fixture: ${live.home_team} (${live.current_score.home}) vs ${live.away_team} (${live.current_score.away}), ${live.league}
- Match Minute: ${live.minute}'
- In-play Win Probabilities: Home Win ${(live.live_probs.H * 100).toFixed(1)}%, Draw ${(live.live_probs.D * 100).toFixed(1)}%, Away Win ${(live.live_probs.A * 100).toFixed(1)}%
- Most Likely Final Scoreline: ${live.most_likely_score.home}-${live.most_likely_score.away} (${(live.most_likely_score.probability * 100).toFixed(1)}% probability)
- Next Goal Market: ${live.home_team} ${(live.next_goal_probs.home_next * 100).toFixed(1)}%, ${live.away_team} ${(live.next_goal_probs.away_next * 100).toFixed(1)}%, No more goals ${(live.next_goal_probs.no_more_goals * 100).toFixed(1)}%
- Over 2.5 Goals Probability: ${(live.over_under_probs.over_2_5 * 100).toFixed(1)}%
- Momentum Index: ${live.momentum_index.home > 0 ? `${live.home_team} +${live.momentum_index.home}` : `${live.away_team} +${Math.abs(live.momentum_index.home)}`}

Write a punchy, 60-90 word live in-play tactical note describing the match dynamic at minute ${live.minute}'. Mention the current score, which side holds momentum, the most probable final scoreline, and the probability of further goals. Write strictly 1 concise paragraph in plain text without markdown headings.`;
  const aiText = await generateWithFallbackModels(prompt);
  if (aiText) {
    return {
      text: aiText,
      source: "ai",
      error: null
    };
  }
  const leader = live.current_score.home > live.current_score.away ? `${live.home_team} maintain control leading ${live.current_score.home}-${live.current_score.away}` : live.current_score.home < live.current_score.away ? `${live.away_team} lead ${live.current_score.away}-${live.current_score.home}` : `The match remains level at ${live.current_score.home}-${live.current_score.away}`;
  const text = `At the ${live.minute}th minute mark, ${leader}. In-play modeling estimates a ${(live.live_probs.H * 100).toFixed(1)}% chance for a ${live.home_team} win, ${(live.live_probs.D * 100).toFixed(1)}% for a draw, and ${(live.live_probs.A * 100).toFixed(1)}% for a ${live.away_team} victory. The most probable final outcome is ${live.most_likely_score.home}-${live.most_likely_score.away} with a ${(live.most_likely_score.probability * 100).toFixed(1)}% likelihood, and the odds of over 2.5 total goals sit at ${(live.over_under_probs.over_2_5 * 100).toFixed(1)}%.`;
  return {
    text,
    source: "template",
    error: null
  };
}
