package com.sportsedge.predict;
import java.util.*;
public class TeamFormTracker {

    public static class FormResult {
        public String teamName;
        public String trend; // "up", "flat", "down"
        public int points;
        public String record; // e.g. "3W 1D 1L"
        public List<String> badges; // ["W", "D", "L", ...]
        public double momentum;

        @Override
        public String toString() {
            return String.format("%s [Trend: %s | %d pts | Record: %s | Momentum: %.1f]",
                    teamName, trend.toUpperCase(), points, record, momentum);
        }
    }

    public static FormResult calculateForm(String teamName, List<String> resultsLast5) {
        FormResult fr = new FormResult();
        fr.teamName = teamName;
        fr.badges = new ArrayList<>(resultsLast5);

        int wins = 0;
        int draws = 0;
        int losses = 0;
        int totalPts = 0;

        for (String r : resultsLast5) {
            if ("W".equalsIgnoreCase(r)) {
                wins++;
                totalPts += 3;
            } else if ("D".equalsIgnoreCase(r)) {
                draws++;
                totalPts += 1;
            } else {
                losses++;
            }
        }

        fr.points = totalPts;
        fr.record = String.format("%dW %dD %dL", wins, draws, losses);

        // Trend rule
        if (totalPts >= 9 || (wins >= 3 && wins > losses)) {
            fr.trend = "up";
        } else if (totalPts <= 5 || (losses >= 3 && losses > wins)) {
            fr.trend = "down";
        } else {
            fr.trend = "flat";
        }

        double rawMom = (totalPts / 15.0) * 10.0 + (wins >= 3 ? 1.5 : 0.0) - (losses >= 3 ? 2.0 : 0.0);
        fr.momentum = Math.round(Math.min(10.0, Math.max(-10.0, rawMom)) * 10.0) / 10.0;

        return fr;
    }
}
