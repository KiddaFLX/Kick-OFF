package com.sportsedge.predict;
import java.util.*;

public class PoissonDistribution {

    public static double probability(int k, double lambda) {
        if (lambda <= 0) {
            return (k == 0) ? 1.0 : 0.0;
        }
        return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
    }

    private static double factorial(int n) {
        if (n <= 1) return 1.0;
        double res = 1.0;
        for (int i = 2; i <= n; i++) {
            res *= i;
        }
        return res;
    }

    public static Map<String, Double> computeMatchProbabilities(double lambdaHome, double lambdaAway) {
        double probHome = 0.0;
        double probDraw = 0.0;
        double probAway = 0.0;

        for (int i = 0; i <= 7; i++) {
            for (int j = 0; j <= 7; j++) {
                double p = probability(i, lambdaHome) * probability(j, lambdaAway);
                if (i > j) {
                    probHome += p;
                } else if (i == j) {
                    probDraw += p;
                } else {
                    probAway += p;
                }
            }
        }

        double total = probHome + probDraw + probAway;
        Map<String, Double> result = new LinkedHashMap<>();
        result.put("H", Math.round((probHome / total) * 1000.0) / 1000.0);
        result.put("D", Math.round((probDraw / total) * 1000.0) / 1000.0);
        result.put("A", Math.round((1.0 - (probHome / total) - (probDraw / total)) * 1000.0) / 1000.0);
        return result;
    }
}
