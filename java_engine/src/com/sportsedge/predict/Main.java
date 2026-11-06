package com.sportsedge.predict;

public class Main {
    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("  SportsEdge Football Prediction Engine (Java)");
        System.out.println("==================================================");

        PredictionEngine engine = new PredictionEngine();

        String home = (args.length >= 1) ? args[0] : "Arsenal";
        String away = (args.length >= 2) ? args[1] : "Chelsea";

        PredictionEngine.PredictionResult result = engine.predict(home, away);
        System.out.println(result);
        System.out.println("==================================================");
    }
}
