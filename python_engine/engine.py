import sys
import json
import math
import random
from datetime import datetime, timedelta

# League Team Ratings
LEAGUE_TEAMS = {
    "Premier League": [
        ("Arsenal", 1.85), ("Manchester City", 1.95), ("Liverpool", 1.75),
        ("Aston Villa", 1.40), ("Tottenham Hotspur", 1.45), ("Chelsea", 1.40),
        ("Newcastle United", 1.35), ("Manchester United", 1.30), ("West Ham United", 1.15),
        ("Brighton", 1.20), ("Bournemouth", 1.05), ("Crystal Palace", 1.05),
        ("Wolverhampton Wanderers", 1.00), ("Fulham", 0.95), ("Everton", 0.95),
        ("Brentford", 1.00), ("Nottingham Forest", 0.90)
    ],
    "La Liga": [
        ("Real Madrid", 1.90), ("Barcelona", 1.85), ("Atletico Madrid", 1.50),
        ("Athletic Bilbao", 1.20), ("Real Sociedad", 1.20), ("Villarreal", 1.20),
        ("Real Betis", 1.15), ("Girona", 1.10), ("Sevilla", 1.05),
        ("Valencia", 1.00), ("Celta Vigo", 0.95), ("Osasuna", 0.95),
        ("Getafe", 0.90), ("Mallorca", 0.90), ("Rayo Vallecano", 0.95), ("Las Palmas", 0.85)
    ],
    "Serie A": [
        ("Inter Milan", 1.80), ("AC Milan", 1.55), ("Juventus", 1.50),
        ("Napoli", 1.50), ("Atalanta", 1.35), ("AS Roma", 1.30),
        ("Lazio", 1.20), ("Fiorentina", 1.15), ("Bologna", 1.15),
        ("Torino", 1.00), ("Monza", 0.90), ("Genoa", 0.90), ("Udinese", 0.90)
    ],
    "Bundesliga": [
        ("Bayern Munich", 1.95), ("Bayer Leverkusen", 1.60), ("Borussia Dortmund", 1.55),
        ("RB Leipzig", 1.50), ("Eintracht Frankfurt", 1.15), ("Stuttgart", 1.15),
        ("Freiburg", 1.10), ("Union Berlin", 1.05), ("Wolfsburg", 1.00),
        ("Hoffenheim", 1.00), ("Werder Bremen", 0.95), ("Mainz 05", 0.95)
    ],
    "Ligue 1": [
        ("Paris Saint-Germain", 1.95), ("Monaco", 1.45), ("Marseille", 1.40),
        ("Lille", 1.35), ("Lens", 1.25), ("Lyon", 1.30), ("Rennes", 1.20), ("Nice", 1.15)
    ],
    "PSL": [
        ("Mamelodi Sundowns", 1.70), ("Orlando Pirates", 1.40), ("Kaizer Chiefs", 1.30),
        ("Stellenbosch FC", 1.25), ("Sekhukhune United", 1.10), ("Cape Town City", 1.10),
        ("SuperSport United", 1.15), ("Golden Arrows", 0.95)
    ]
}

def poisson_prob(k: int, lamb: float) -> float:
    """Calculates Poisson probability P(X = k) for expected value lamb."""
    if lamb <= 0:
        return 1.0 if k == 0 else 0.0
    return (math.exp(-lamb) * (lamb ** k)) / math.factorial(k)

class PythonPredictionEngine:
    def __init__(self, seed: int = 42):
        self.rng = random.Random(seed)
        self.team_ratings = {}
        self.team_leagues = {}
        self.matches = []
        self._build_dataset()

    def _build_dataset(self):
        match_id = 1
        base_date = datetime(2024, 1, 5)

        for league, teams in LEAGUE_TEAMS.items():
            for name, rating in teams:
                self.team_ratings[name] = rating
                self.team_leagues[name] = league

            team_names = [t[0] for t in teams]
            curr_date = base_date

            for _ in range(450):
                h, a = self.rng.sample(team_names, 2)
                h_rating = self.team_ratings.get(h, 1.0)
                a_rating = self.team_ratings.get(a, 1.0)

                # Goal expectancies with home advantage
                lam_h = max(0.3, h_rating * 1.35)
                lam_a = max(0.25, a_rating * 0.95)

                # Poisson sample
                fthg = min(7, int(self.rng.expovariate(1.0 / max(0.5, lam_h))))
                ftag = min(6, int(self.rng.expovariate(1.0 / max(0.5, lam_a))))

                ftr = "H" if fthg > ftag else "A" if ftag > fthg else "D"
                curr_date += timedelta(days=self.rng.randint(1, 4))
                if curr_date > datetime(2026, 9, 20):
                    curr_date = datetime(2024, 2, 10)

                self.matches.append({
                    "id": match_id,
                    "date": curr_date.strftime("%Y-%m-%d"),
                    "league": league,
                    "homeTeam": h,
                    "awayTeam": a,
                    "fthg": fthg,
                    "ftag": ftag,
                    "ftr": ftr,
                })
                match_id += 1

    def compute_team_form(self, team_name: str):
        """Computes team form over last 5 matches and assigns trend arrow (up/flat/down)."""
        team_matches = [
            m for m in self.matches
            if m["homeTeam"] == team_name or m["awayTeam"] == team_name
        ]
        team_matches.sort(key=lambda m: m["date"], reverse=True)
        last5 = team_matches[:5]

        badges = []
        total_points = 0
        wins, draws, losses = 0, 0, 0

        for m in last5:
            is_home = m["homeTeam"] == team_name
            gf = m["fthg"] if is_home else m["ftag"]
            ga = m["ftag"] if is_home else m["fthg"]
            opp = m["awayTeam"] if is_home else m["homeTeam"]

            if gf > ga:
                res = "W"
                pts = 3
                wins += 1
            elif gf == ga:
                res = "D"
                pts = 1
                draws += 1
            else:
                res = "L"
                pts = 0
                losses += 1

            total_points += pts
            badges.append({
                "date": m["date"],
                "opponent": opp,
                "isHome": is_home,
                "score": f"{gf} - {ga}",
                "result": res,
                "points": pts,
            })

        # Trend direction rule
        # >= 9 pts or 3+ wins: Upward trend
        # <= 5 pts or 3+ losses: Downward trend
        # 6-8 pts: Flat / stable
        if total_points >= 9 or (wins >= 3 and wins > losses):
            trend = "up"
        elif total_points <= 5 or (losses >= 3 and losses > wins):
            trend = "down"
        else:
            trend = "flat"

        momentum = round(min(10.0, max(-10.0, (total_points / 15.0) * 10.0 + (1.5 if wins >= 3 else 0.0) - (2.0 if losses >= 3 else 0.0))), 1)

        return {
            "name": team_name,
            "trend": trend,
            "points": total_points,
            "record": f"{wins}W {draws}D {losses}L",
            "badges": [b["result"] for b in badges],
            "momentum": momentum,
            "matches": badges,
        }

    def predict(self, home_team: str, away_team: str):
        """Generates statistical probabilities using bivariate Poisson distribution matrix."""
        h_rating = self.team_ratings.get(home_team, 1.0)
        a_rating = self.team_ratings.get(away_team, 1.0)
        league = self.team_leagues.get(home_team, "Football League")

        lambda_h = max(0.4, h_rating * 1.30)
        lambda_a = max(0.3, a_rating * 0.95)

        prob_h = 0.0
        prob_d = 0.0
        prob_a = 0.0

        for i in range(8):
            for j in range(8):
                p = poisson_prob(i, lambda_h) * poisson_prob(j, lambda_a)
                if i > j:
                    prob_h += p
                elif i == j:
                    prob_d += p
                else:
                    prob_a += p

        total = prob_h + prob_d + prob_a
        prob_h = round(prob_h / total, 3)
        prob_d = round(prob_d / total, 3)
        prob_a = round(1.0 - prob_h - prob_d, 3)

        predicted = "H" if prob_h >= max(prob_d, prob_a) else "A" if prob_a >= prob_d else "D"
        confidence = "High" if abs(prob_h - prob_a) >= 0.25 else "Medium" if abs(prob_h - prob_a) >= 0.12 else "Low"

        home_form = self.compute_team_form(home_team)
        away_form = self.compute_team_form(away_team)

        return {
            "engine": "Python 3.10 Statistical Model",
            "home_team": home_team,
            "away_team": away_team,
            "league": league,
            "confidence": confidence,
            "probs": {
                "H": prob_h,
                "D": prob_d,
                "A": prob_a,
            },
            "predicted": predicted,
            "expected_goals": {
                "home": round(lambda_h, 2),
                "away": round(lambda_a, 2),
            },
            "team_form": {
                "home": home_form,
                "away": away_form,
                "form_differential": home_form["points"] - away_form["points"],
            },
            "runtime": f"Python {sys.version.split()[0]}",
        }

if __name__ == "__main__":
    engine = PythonPredictionEngine()
    if len(sys.argv) >= 3:
        h = sys.argv[1]
        a = sys.argv[2]
        res = engine.predict(h, a)
        print(json.dumps(res, indent=2))
    elif len(sys.argv) == 2:
        team = sys.argv[1]
        res = engine.compute_team_form(team)
        print(json.dumps(res, indent=2))
    else:
        # Default run
        res = engine.predict("Arsenal", "Chelsea")
        print(json.dumps(res, indent=2))
