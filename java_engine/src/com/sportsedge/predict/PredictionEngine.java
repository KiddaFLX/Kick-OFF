package com.sportsedge.predict;
import java.util.*;
public class PredictionEngine {

    private final Map<String, Double> teamRatings = new HashMap<>();
    private final Map<String, String> teamLeagues = new HashMap<>();

    public PredictionEngine() {
        initializeTeams();
    }

    private void initializeTeams() {
        // Premier League
        addTeam("Arsenal", 1.85, "Premier League");
        addTeam("Manchester City", 1.95, "Premier League");
        addTeam("Liverpool", 1.75, "Premier League");
        addTeam("Chelsea", 1.40, "Premier League");
        addTeam("Tottenham Hotspur", 1.45, "Premier League");
        addTeam("Aston Villa", 1.40, "Premier League");
        addTeam("Manchester United", 1.30, "Premier League");
        addTeam("Newcastle United", 1.35, "Premier League");
        addTeam("Brighton", 1.20, "Premier League");
        addTeam("West Ham United", 1.15, "Premier League");
        addTeam("Everton", 0.95, "Premier League");
        addTeam("Brentford", 1.00, "Premier League");

        // La Liga
        addTeam("Real Madrid", 1.90, "La Liga");
        addTeam("Barcelona", 1.85, "La Liga");
        addTeam("Atletico Madrid", 1.50, "La Liga");
        addTeam("Athletic Bilbao", 1.20, "La Liga");
        addTeam("Real Sociedad", 1.20, "La Liga");
        addTeam("Villarreal", 1.20, "La Liga");
        addTeam("Sevilla", 1.05, "La Liga");
        addTeam("Girona", 1.10, "La Liga");

        // Bundesliga
        addTeam("Bayern Munich", 1.95, "Bundesliga");
        addTeam("Bayer Leverkusen", 1.60, "Bundesliga");
        addTeam("Borussia Dortmund", 1.55, "Bundesliga");
        addTeam("RB Leipzig", 1.50, "Bundesliga");

        // Serie A
        addTeam("Inter Milan", 1.80, "Serie A");
        addTeam("AC Milan", 1.55, "Serie A");
        addTeam("Juventus", 1.50, "Serie A");
        addTeam("Napoli", 1.50, "Serie A");

        // Ligue 1
        addTeam("Paris Saint-Germain", 1.95, "Ligue 1");
        addTeam("Monaco", 1.45, "Ligue 1");
        addTeam("Marseille", 1.40, "Ligue 1");
    }

    private void addTeam(String name, double rating, String league) {
        teamRatings.put(name, rating);
        teamLeagues.put(name, league);
    }

    public static class PredictionResult {
        public String homeTeam;
        public String awayTeam;
        public String league;
        public double lambdaHome;
        public double lambdaAway;
        public Map<String, Double> probabilities;
        public String predictedOutcome; // "H", "D", "A"
        public String confidence; // "High", "Medium", "Low"
        public TeamFormTracker.FormResult homeForm;
        public TeamFormTracker.FormResult awayForm;

        @Override
        public String toString() {
            return String.format(
                "Prediction: %s vs %s (%s)\n" +
                "  Expected Goals: Home %.2f - Away %.2f\n" +
                "  Probabilities: Home Win %.1f%% | Draw %.1f%% | Away Win %.1f%%\n" +
                "  Recommended Outcome: %s (Confidence: %s)\n" +
                "  Form: Home %s | Away %s",
                homeTeam, awayTeam, league,
                lambdaHome, lambdaAway,
                probabilities.get("H") * 100, probabilities.get("D") * 100, probabilities.get("A") * 100,
                predictedOutcome, confidence,
                homeForm.toString(), awayForm.toString()
            );
        }
    }

    public PredictionResult predict(String homeTeam, String awayTeam) {
        double hRating = teamRatings.getOrDefault(homeTeam, 1.10);
        double aRating = teamRatings.getOrDefault(awayTeam, 1.00);
        String league = teamLeagues.getOrDefault(homeTeam, "Football League");

        // Goal expectancies with home field advantage
        double lambdaHome = Math.max(0.4, hRating * 1.30);
        double lambdaAway = Math.max(0.3, aRating * 0.95);

        Map<String, Double> probs = PoissonDistribution.computeMatchProbabilities(lambdaHome, lambdaAway);

        double pH = probs.get("H");
        double pD = probs.get("D");
        double pA = probs.get("A");

        String predicted = (pH >= Math.max(pD, pA)) ? "H" : (pA >= pD ? "A" : "D");
        String conf = (Math.abs(pH - pA) >= 0.25) ? "High" : (Math.abs(pH - pA) >= 0.12) ? "Medium" : "Low";

        // Simulated Last 5 badges for demonstration
        List<String> homeBadges = Arrays.asList("W", "W", "D", "W", "L");
        List<String> awayBadges = Arrays.asList("L", "D", "W", "L", "D");

        PredictionResult res = new PredictionResult();
        res.homeTeam = homeTeam;
        res.awayTeam = awayTeam;
        res.league = league;
        res.lambdaHome = lambdaHome;
        res.lambdaAway = lambdaAway;
        res.probabilities = probs;
        res.predictedOutcome = predicted;
        res.confidence = conf;
        res.homeForm = TeamFormTracker.calculateForm(homeTeam, homeBadges);
        res.awayForm = TeamFormTracker.calculateForm(awayTeam, awayBadges);

        return res;
    }
}
