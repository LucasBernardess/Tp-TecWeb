from __future__ import annotations

import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from app.search_service import SearchService  # noqa: E402


def main() -> None:
    t0 = time.time()
    print("Construindo indice BM25 a partir do dataset...")
    service = SearchService()
    path = service.save()
    elapsed = time.time() - t0
    size_mb = path.stat().st_size / 1e6
    print(f"OK: {service.n} jogadores indexados em {elapsed:.1f}s | vocabulario: {len(service.idf)} termos")
    print(f"Indice salvo em {path} ({size_mb:.1f} MB)")


if __name__ == "__main__":
    main()
