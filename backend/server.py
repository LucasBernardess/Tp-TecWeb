from __future__ import annotations

import json
import os
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from app.search_service import SearchService, INDEX_PATH  

PORT = int(os.environ.get("PORT", "8000"))
SERVICE: SearchService | None = None


class Handler(BaseHTTPRequestHandler):
    def _send(self, code: int, payload: dict | None) -> None:
        body = b"" if payload is None else json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if body:
            self.wfile.write(body)

    def do_OPTIONS(self) -> None:  
        self._send(204, None)

    def do_GET(self) -> None:
        if self.path.rstrip("/") == "/health":
            self._send(200, {"status": "ok", "players": SERVICE.n})
        else:
            self._send(404, {"error": "not found"})

    def do_POST(self) -> None:
        if self.path.rstrip("/") != "/search":
            self._send(404, {"error": "not found"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length) or b"{}")
            query = str(payload.get("query", "")).strip()
            top_k = int(payload.get("top_k", 10))
        except (ValueError, json.JSONDecodeError):
            self._send(400, {"error": "JSON invalido"})
            return
        if not query:
            self._send(400, {"error": "query vazia"})
            return
        results = SERVICE.search(query, top_k)
        self._send(200, {"query": query, "top_k": top_k, "results": results})

    def log_message(self, fmt: str, *args) -> None:  
        sys.stderr.write("[ml] %s\n" % (fmt % args))


def main() -> None:
    global SERVICE
    if INDEX_PATH.exists():
        print(f"Carregando indice BM25 ja treinado ({INDEX_PATH.name})...")
        SERVICE = SearchService.load()
    else:
        print("Indice nao encontrado; construindo na memoria. Rode train.py para salvar e acelerar o boot.")
        SERVICE = SearchService()
    print(f"Indice pronto: {SERVICE.n} jogadores indexados.")
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"ml-service ouvindo em http://localhost:{PORT}  (rotas: POST /search, GET /health)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nEncerrando.")
        server.shutdown()


if __name__ == "__main__":
    main()
