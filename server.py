#!/usr/bin/env python3
"""
SportsEdge Pure Python Application Server.
Provides full REST API and static file serving on port 3000.
Usage:
    python3 server.py [port]
"""

import sys
import os
import json
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Add python_engine to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "python_engine"))
from engine import PythonPredictionEngine, LEAGUE_TEAMS

engine = PythonPredictionEngine()

class SportsEdgeServerHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Serve from dist if available, else root
        dist_dir = os.path.join(os.path.dirname(__file__), "dist")
        if os.path.exists(dist_dir):
            super().__init__(*args, directory=dist_dir, **kwargs)
        else:
            super().__init__(*args, directory=os.path.dirname(__file__), **kwargs)

    def _send_json(self, status_code: int, data: dict):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def do_OPTIONS(self):
        self._send_json(200, {"status": "ok"})

    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)

        if parsed.path == "/api/health":
            self._send_json(200, {
                "status": "ok",
                "engine": "Python 3.10 Prediction Server",
                "runtimes": ["Python 3.10", "Java 17/21"],
                "typescript_removed": True
            })
            return

        if parsed.path == "/api/initial-data":
            teams_by_league = {
                league: [{"name": name, "rating": rating} for name, rating in teams]
                for league, teams in LEAGUE_TEAMS.items()
            }
            # Pre-compute all team forms
            all_forms = {}
            for league, teams in LEAGUE_TEAMS.items():
                for name, _ in teams:
                    all_forms[name] = engine.compute_team_form(name)

            self._send_json(200, {
                "teamsByLeague": teams_by_league,
                "teamForms": all_forms,
                "recent": [],
                "leagues": list(LEAGUE_TEAMS.keys()),
                "engine": "Python 3.10.12"
            })
            return

        if parsed.path == "/api/team-form":
            team = params.get("team", [""])[0].strip()
            if team:
                self._send_json(200, engine.compute_team_form(team))
            else:
                all_forms = {}
                for league, teams in LEAGUE_TEAMS.items():
                    for name, _ in teams:
                        all_forms[name] = engine.compute_team_form(name)
                self._send_json(200, all_forms)
            return

        if parsed.path.startswith("/api/"):
            self._send_json(404, {"error": "API route not found"})
            return

        # Fallback to static file serving
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length) if length > 0 else b"{}"
        try:
            payload = json.loads(body.decode("utf-8"))
        except Exception:
            payload = {}

        if parsed.path == "/api/predict":
            home = payload.get("home_team") or payload.get("home") or "Arsenal"
            away = payload.get("away_team") or payload.get("away") or "Chelsea"
            res = engine.predict(home, away)
            self._send_json(200, res)
            return

        if parsed.path == "/api/team-form":
            team = payload.get("team", "Arsenal")
            res = engine.compute_team_form(team)
            self._send_json(200, res)
            return

        self._send_json(404, {"error": "Endpoint not found"})

def run(port: int = 3000):
    server = HTTPServer(("0.0.0.0", port), SportsEdgeServerHandler)
    print(f"SportsEdge Python Server listening at http://0.0.0.0:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down Python server.")
        server.server_close()

if __name__ == "__main__":
    p = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    run(p)
