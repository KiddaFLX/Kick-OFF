import sys
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from engine import PythonPredictionEngine

engine = PythonPredictionEngine()

class PredictionHandler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, data: dict):
        self.send_response(status)
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
            self._send_json(200, {"status": "ok", "engine": "Python 3.10"})
        elif parsed.path == "/api/predict":
            home = params.get("home", ["Arsenal"])[0]
            away = params.get("away", ["Chelsea"])[0]
            res = engine.predict(home, away)
            self._send_json(200, res)
        elif parsed.path == "/api/team-form":
            team = params.get("team", ["Arsenal"])[0]
            res = engine.compute_team_form(team)
            self._send_json(200, res)
        else:
            self._send_json(404, {"error": "Endpoint not found"})

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
        elif parsed.path == "/api/team-form":
            team = payload.get("team") or "Arsenal"
            res = engine.compute_team_form(team)
            self._send_json(200, res)
        else:
            self._send_json(404, {"error": "Endpoint not found"})

def run_server(port: int = 5000):
    server = HTTPServer(("0.0.0.0", port), PredictionHandler)
    print(f"SportsEdge Python API running on http://0.0.0.0:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        server.server_close()

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5000
    run_server(port)
